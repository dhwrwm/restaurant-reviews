import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { FavouritesService } from './favourites.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

describe('FavouritesService', () => {
  let service: FavouritesService;

  const txMock = {
    favourite: {
      create: jest.fn(),
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
      favourite: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn((callback: (tx: typeof txMock) => unknown) =>
        callback(txMock),
      ),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    txMock.favourite.aggregate.mockResolvedValue({ _count: 3 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavouritesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<FavouritesService>(FavouritesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('throws NotFoundException when the restaurant does not exist', async () => {
      prismaMock.client.restaurant.findUnique.mockResolvedValue(null);

      await expect(
        service.create('user-1', 'restaurant-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prismaMock.client.$transaction).not.toHaveBeenCalled();
    });

    it('creates the favourite and syncs the restaurant aggregates', async () => {
      prismaMock.client.restaurant.findUnique.mockResolvedValue({
        id: 'restaurant-1',
      });
      txMock.favourite.create.mockResolvedValue({ id: 'favourite-1' });

      const result = await service.create('user-1', 'restaurant-1');

      expect(txMock.favourite.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', restaurantId: 'restaurant-1' },
      });
      expect(txMock.favourite.aggregate).toHaveBeenCalledWith({
        where: { restaurantId: 'restaurant-1' },
        _count: true,
      });
      expect(txMock.restaurant.update).toHaveBeenCalledWith({
        where: { id: 'restaurant-1' },
        data: { favouriteCount: 3 },
      });
      expect(result).toEqual({ id: 'favourite-1' });
    });

    it('throws ConflictException when the user already favourited the restaurant', async () => {
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
        service.create('user-1', 'restaurant-1'),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rethrows unrelated errors', async () => {
      prismaMock.client.restaurant.findUnique.mockResolvedValue({
        id: 'restaurant-1',
      });
      const error = new Error('boom');
      prismaMock.client.$transaction.mockImplementationOnce(() => {
        throw error;
      });

      await expect(service.create('user-1', 'restaurant-1')).rejects.toBe(
        error,
      );
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when the favourite does not exist', async () => {
      prismaMock.client.favourite.findUnique.mockResolvedValue(null);

      await expect(
        service.remove('user-1', 'favourite-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prismaMock.client.$transaction).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when the requester does not own the favourite', async () => {
      prismaMock.client.favourite.findUnique.mockResolvedValue({
        id: 'favourite-1',
        userId: 'someone-else',
        restaurantId: 'restaurant-1',
      });

      await expect(
        service.remove('user-1', 'favourite-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prismaMock.client.$transaction).not.toHaveBeenCalled();
    });

    it('deletes the favourite and syncs the restaurant aggregates', async () => {
      prismaMock.client.favourite.findUnique.mockResolvedValue({
        id: 'favourite-1',
        userId: 'user-1',
        restaurantId: 'restaurant-1',
      });
      txMock.favourite.delete.mockResolvedValue({
        id: 'favourite-1',
        restaurantId: 'restaurant-1',
      });

      const result = await service.remove('user-1', 'favourite-1');

      expect(txMock.favourite.delete).toHaveBeenCalledWith({
        where: { id: 'favourite-1' },
      });
      expect(txMock.favourite.aggregate).toHaveBeenCalledWith({
        where: { restaurantId: 'restaurant-1' },
        _count: true,
      });
      expect(txMock.restaurant.update).toHaveBeenCalledWith({
        where: { id: 'restaurant-1' },
        data: { favouriteCount: 3 },
      });
      expect(result).toEqual({
        id: 'favourite-1',
        restaurantId: 'restaurant-1',
      });
    });
  });

  describe('getFavourites', () => {
    it('returns a page of favourites with pagination metadata', async () => {
      prismaMock.client.favourite.findMany.mockResolvedValue([
        { id: 'favourite-1' },
      ]);
      prismaMock.client.favourite.count.mockResolvedValue(13);

      const result = await service.getFavourites('user-1', {
        page: 2,
        pageSize: 12,
      });

      expect(prismaMock.client.favourite.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        skip: 12,
        take: 12,
      });
      expect(prismaMock.client.favourite.count).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(result).toEqual({
        data: [{ id: 'favourite-1' }],
        pagination: {
          page: 2,
          pageSize: 12,
          total: 13,
          totalPages: 2,
        },
      });
    });
  });
});
