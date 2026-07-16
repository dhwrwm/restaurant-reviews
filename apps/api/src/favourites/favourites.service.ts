import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { GetFavouritesQueryDto } from './dto/get-favourites-query.dto';

@Injectable()
export class FavouritesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userId: string, restaurantId: string) {
    await this.ensureRestaurantExists(restaurantId);

    try {
      return await this.prismaService.client.$transaction(async (tx) => {
        const favourite = await tx.favourite.create({
          data: {
            userId,
            restaurantId,
          },
        });

        await this.syncRestaurantAggregates(tx, restaurantId);
        return favourite;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'You have already added this restaurant to your favourite',
        );
      }
      throw error;
    }
  }

  async remove(userId: string, favouriteId: string) {
    const favourite = await this.ensureFavouriteExists(favouriteId);

    if (favourite.userId !== userId) {
      throw new ForbiddenException("You don't own this favourte");
    }

    return await this.prismaService.client.$transaction(async (tx) => {
      const deleted = await tx.favourite.delete({ where: { id: favouriteId } });

      await this.syncRestaurantAggregates(tx, deleted.restaurantId);

      return deleted;
    });
  }

  async getFavourites(userId: string, query: GetFavouritesQueryDto) {
    const { page, pageSize } = query;
    const [data, total] = await Promise.all([
      this.prismaService.client.favourite.findMany({
        where: {
          userId,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prismaService.client.favourite.count({ where: { userId } }),
    ]);

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  private async ensureRestaurantExists(restaurantId: string) {
    const restaurant = await this.prismaService.client.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('restaurant not found');
    }

    return restaurant;
  }

  private async ensureFavouriteExists(id: string) {
    const favourite = await this.prismaService.client.favourite.findUnique({
      where: { id },
    });

    if (!favourite) {
      throw new NotFoundException('favourite not found');
    }

    return favourite;
  }

  private async syncRestaurantAggregates(
    tx: Prisma.TransactionClient,
    restaurantId: string,
  ) {
    const { _count } = await tx.favourite.aggregate({
      where: {
        restaurantId,
      },
      _count: true,
    });

    await tx.restaurant.update({
      where: { id: restaurantId },
      data: {
        favouriteCount: _count,
      },
    });
  }
}
