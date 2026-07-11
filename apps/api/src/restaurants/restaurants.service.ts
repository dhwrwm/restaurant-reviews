import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RestaurantsQueryDto } from './dto/restaurants-query.dto';
import { GetRestaurantsDto } from './dto/get-restaurants.dto';

@Injectable()
export class RestaurantsService {
  constructor(private readonly prisma: PrismaService) {}

  create(ownerId: string, dto: CreateRestaurantDto) {
    return this.prisma.client.restaurant.create({
      data: {
        ownerId,
        slug: this.buildSlug(dto.name),
        name: dto.name,
        description: dto.description,
        previewImageUrl: dto.previewImageUrl,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        country: dto.country,
        cuisine: dto.cuisine,
      },
    });
  }

  async update(ownerId: string, id: string, dto: UpdateRestaurantDto) {
    const restaurant = await this.ensureRestaurantExists(id);

    if (restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this restaurant');
    }

    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'At least one field must be provided to update the restaurant.',
      );
    }

    return await this.prisma.client.restaurant.update({
      where: { id },
      data: dto,
    });
  }

  async remove(ownerId: string, id: string) {
    const restaurant = await this.ensureRestaurantExists(id);

    if (restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this restaurant');
    }

    return this.prisma.client.restaurant.delete({
      where: { id },
    });
  }

  async findAll(query: GetRestaurantsDto) {
    const { page, pageSize, sort } = query;
    const where = this.buildWhere(query);

    const [data, total] = await Promise.all([
      this.prisma.client.restaurant.findMany({
        where,
        orderBy: [{ averageRating: sort }, { name: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.client.restaurant.count({ where }),
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

  private buildWhere({
    city,
    cuisine,
    minRating,
  }: GetRestaurantsDto): Prisma.RestaurantWhereInput {
    return {
      ...(city && { city }),
      ...(cuisine && { cuisine }),
      ...(minRating !== undefined && { averageRating: { gte: minRating } }),
    };
  }

  async findMine(ownerId: string, { page, pageSize }: RestaurantsQueryDto) {
    const [data, total] = await Promise.all([
      this.prisma.client.restaurant.findMany({
        where: { ownerId },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.client.restaurant.count({ where: { ownerId } }),
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

  async findCities() {
    const rows = await this.prisma.client.restaurant.findMany({
      distinct: ['city'],
      select: { city: true },
      orderBy: { city: 'asc' },
    });

    return rows.map((row) => row.city);
  }

  findUsingSlug(slug: string) {
    return this.prisma.client.restaurant.findUnique({
      where: { slug },
      include: {
        owner: {
          select: { id: true, name: true },
        },
      },
    });
  }

  private buildSlug(name: string) {
    const base = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return `${base}-${randomBytes(4).toString('hex')}`;
  }

  private async ensureRestaurantExists(id: string) {
    const restaurant = await this.prisma.client.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      throw new NotFoundException('restaurant not found');
    }

    return restaurant;
  }
}
