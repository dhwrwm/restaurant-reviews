import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { CreateReviewDto } from './dto/create-review.dto';

describe('ReviewsService', () => {
  let service: ReviewsService;

  const txMock = {
    review: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
    },
    restaurant: {
      update: jest.fn(),
    },
  };

  const prismaMock = {
    client: {
      restaurant: {
        findUnique: jest.fn(),
      },
      review: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn((callback: (tx: typeof txMock) => unknown) =>
        callback(txMock),
      ),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    txMock.review.aggregate.mockResolvedValue({
      _avg: { rating: 4.5 },
      _count: 2,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto: CreateReviewDto = { rating: 5, comment: 'Great food!' };

    it('throws NotFoundException when the restaurant does not exist', async () => {
      prismaMock.client.restaurant.findUnique.mockResolvedValue(null);

      await expect(
        service.create('reviewer-1', 'my-restaurant', dto),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prismaMock.client.$transaction).not.toHaveBeenCalled();
    });

    it('creates the review and syncs the restaurant aggregates', async () => {
      prismaMock.client.restaurant.findUnique.mockResolvedValue({
        id: 'restaurant-1',
      });
      txMock.review.create.mockResolvedValue({ id: 'review-1' });

      const result = await service.create('reviewer-1', 'my-restaurant', dto);

      expect(txMock.review.create).toHaveBeenCalledWith({
        data: {
          restaurantId: 'restaurant-1',
          reviewerId: 'reviewer-1',
          rating: dto.rating,
          comment: dto.comment,
        },
        include: {
          reviewer: { select: { id: true, email: true, name: true } },
        },
      });
      expect(txMock.review.aggregate).toHaveBeenCalledWith({
        where: { restaurantId: 'restaurant-1' },
        _avg: { rating: true },
        _count: true,
      });
      expect(txMock.restaurant.update).toHaveBeenCalledWith({
        where: { id: 'restaurant-1' },
        data: { averageRating: 4.5, reviewCount: 2 },
      });
      expect(result).toEqual({ id: 'review-1' });
    });

    it('throws ConflictException when the reviewer already reviewed the restaurant', async () => {
      prismaMock.client.restaurant.findUnique.mockResolvedValue({
        id: 'restaurant-1',
      });
      prismaMock.client.$transaction.mockImplementationOnce(() => {
        throw new Prisma.PrismaClientKnownRequestError('duplicate', {
          code: 'P2002',
          clientVersion: 'test',
        });
      });

      await expect(
        service.create('reviewer-1', 'my-restaurant', dto),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('findAllForRestaurant', () => {
    it('throws NotFoundException when the restaurant does not exist', async () => {
      prismaMock.client.restaurant.findUnique.mockResolvedValue(null);

      await expect(
        service.findAllForRestaurant('my-restaurant', { limit: 10 }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns a page of reviews with no next cursor when there are no more results', async () => {
      prismaMock.client.restaurant.findUnique.mockResolvedValue({
        id: 'restaurant-1',
      });
      prismaMock.client.review.findMany.mockResolvedValue([{ id: '1' }]);

      const result = await service.findAllForRestaurant('my-restaurant', {
        limit: 10,
      });

      expect(prismaMock.client.review.findMany).toHaveBeenCalledWith({
        where: { restaurantId: 'restaurant-1' },
        include: {
          reviewer: { select: { id: true, email: true, name: true } },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 11,
      });
      expect(result).toEqual({ items: [{ id: '1' }], nextCursor: null });
    });

    it('returns a nextCursor and trims the extra lookahead row when there are more results', async () => {
      prismaMock.client.restaurant.findUnique.mockResolvedValue({
        id: 'restaurant-1',
      });
      prismaMock.client.review.findMany.mockResolvedValue([
        { id: '1' },
        { id: '2' },
      ]);

      const result = await service.findAllForRestaurant('my-restaurant', {
        limit: 1,
      });

      expect(prismaMock.client.review.findMany).toHaveBeenCalledWith({
        where: { restaurantId: 'restaurant-1' },
        include: {
          reviewer: { select: { id: true, email: true, name: true } },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 2,
      });
      expect(result).toEqual({ items: [{ id: '1' }], nextCursor: '1' });
    });

    it('passes the cursor through to prisma when provided', async () => {
      prismaMock.client.restaurant.findUnique.mockResolvedValue({
        id: 'restaurant-1',
      });
      prismaMock.client.review.findMany.mockResolvedValue([]);

      await service.findAllForRestaurant('my-restaurant', {
        cursor: 'review-1',
        limit: 10,
      });

      expect(prismaMock.client.review.findMany).toHaveBeenCalledWith({
        where: { restaurantId: 'restaurant-1' },
        include: {
          reviewer: { select: { id: true, email: true, name: true } },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 11,
        cursor: { id: 'review-1' },
        skip: 1,
      });
    });
  });

  describe('update', () => {
    const reviewerId = 'reviewer-1';
    const id = 'review-1';

    it('throws NotFoundException when the review does not exist', async () => {
      prismaMock.client.review.findUnique.mockResolvedValue(null);

      await expect(
        service.update(reviewerId, id, { comment: 'Updated' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ForbiddenException when the requester does not own the review', async () => {
      prismaMock.client.review.findUnique.mockResolvedValue({
        id,
        reviewerId: 'someone-else',
        restaurantId: 'restaurant-1',
      });

      await expect(
        service.update(reviewerId, id, { comment: 'Updated' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws BadRequestException when no fields are provided', async () => {
      prismaMock.client.review.findUnique.mockResolvedValue({
        id,
        reviewerId,
        restaurantId: 'restaurant-1',
      });

      await expect(service.update(reviewerId, id, {})).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('updates the review and syncs the restaurant aggregates', async () => {
      prismaMock.client.review.findUnique.mockResolvedValue({
        id,
        reviewerId,
        restaurantId: 'restaurant-1',
      });
      txMock.review.update.mockResolvedValue({ id });

      const dto = { comment: 'Updated review' };
      const result = await service.update(reviewerId, id, dto);

      expect(txMock.review.update).toHaveBeenCalledWith({
        where: { id },
        data: dto,
        include: {
          reviewer: { select: { id: true, email: true, name: true } },
        },
      });
      expect(txMock.restaurant.update).toHaveBeenCalledWith({
        where: { id: 'restaurant-1' },
        data: { averageRating: 4.5, reviewCount: 2 },
      });
      expect(result).toEqual({ id });
    });
  });

  describe('remove', () => {
    const reviewerId = 'reviewer-1';
    const id = 'review-1';

    it('throws NotFoundException when the review does not exist', async () => {
      prismaMock.client.review.findUnique.mockResolvedValue(null);

      await expect(service.remove(reviewerId, id)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when the requester does not own the review', async () => {
      prismaMock.client.review.findUnique.mockResolvedValue({
        id,
        reviewerId: 'someone-else',
        restaurantId: 'restaurant-1',
      });

      await expect(service.remove(reviewerId, id)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('deletes the review and syncs the restaurant aggregates', async () => {
      prismaMock.client.review.findUnique.mockResolvedValue({
        id,
        reviewerId,
        restaurantId: 'restaurant-1',
      });
      txMock.review.delete.mockResolvedValue({ id });

      const result = await service.remove(reviewerId, id);

      expect(txMock.review.delete).toHaveBeenCalledWith({ where: { id } });
      expect(txMock.restaurant.update).toHaveBeenCalledWith({
        where: { id: 'restaurant-1' },
        data: { averageRating: 4.5, reviewCount: 2 },
      });
      expect(result).toEqual({ id });
    });
  });
});
