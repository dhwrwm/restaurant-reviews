import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsQueryDto } from './dto/reviews-query.dto';

const reviewerSelect = {
  id: true,
  email: true,
  name: true,
} as const;

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(reviewerId: string, slug: string, dto: CreateReviewDto) {
    const restaurant = await this.prisma.client.restaurant.findUnique({
      where: { slug },
    });

    if (!restaurant) {
      throw new NotFoundException('restaurant not found');
    }

    try {
      return await this.prisma.client.$transaction(async (tx) => {
        const review = await tx.review.create({
          data: {
            restaurantId: restaurant.id,
            reviewerId,
            rating: dto.rating,
            comment: dto.comment,
          },
          include: { reviewer: { select: reviewerSelect } },
        });

        await this.syncRestaurantAggregates(tx, restaurant.id);

        return review;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'You have already reviewed this restaurant',
        );
      }
      throw error;
    }
  }

  async findAllForRestaurant(slug: string, { cursor, limit }: ReviewsQueryDto) {
    const restaurant = await this.prisma.client.restaurant.findUnique({
      where: { slug },
    });

    if (!restaurant) {
      throw new NotFoundException('restaurant not found');
    }

    const reviews = await this.prisma.client.review.findMany({
      where: { restaurantId: restaurant.id },
      include: { reviewer: { select: reviewerSelect } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasNextPage = reviews.length > limit;
    const items = hasNextPage ? reviews.slice(0, limit) : reviews;

    return {
      items,
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    };
  }

  async update(reviewerId: string, id: string, dto: UpdateReviewDto) {
    const review = await this.ensureReviewExists(id);

    if (review.reviewerId !== reviewerId) {
      throw new ForbiddenException('You do not own this review');
    }

    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'At least one field must be provided to update the review.',
      );
    }

    return this.prisma.client.$transaction(async (tx) => {
      const updated = await tx.review.update({
        where: { id },
        data: dto,
        include: { reviewer: { select: reviewerSelect } },
      });

      await this.syncRestaurantAggregates(tx, review.restaurantId);

      return updated;
    });
  }

  async remove(reviewerId: string, id: string) {
    const review = await this.ensureReviewExists(id);

    if (review.reviewerId !== reviewerId) {
      throw new ForbiddenException('You do not own this review');
    }

    return this.prisma.client.$transaction(async (tx) => {
      const deleted = await tx.review.delete({ where: { id } });

      await this.syncRestaurantAggregates(tx, review.restaurantId);

      return deleted;
    });
  }

  private async ensureReviewExists(id: string) {
    const review = await this.prisma.client.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('review not found');
    }

    return review;
  }

  private async syncRestaurantAggregates(
    tx: Prisma.TransactionClient,
    restaurantId: string,
  ) {
    const { _avg, _count } = await tx.review.aggregate({
      where: { restaurantId },
      _avg: { rating: true },
      _count: true,
    });

    await tx.restaurant.update({
      where: { id: restaurantId },
      data: {
        averageRating: _avg.rating ?? 0,
        reviewCount: _count,
      },
    });
  }
}
