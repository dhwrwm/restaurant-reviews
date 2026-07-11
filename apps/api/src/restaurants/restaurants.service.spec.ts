import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { PrismaService } from '../prisma/prisma.service';
import { Cuisine } from 'types';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

describe('RestaurantsService', () => {
  let service: RestaurantsService;

  const prismaMock = {
    client: {
      restaurant: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<RestaurantsService>(RestaurantsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto: CreateRestaurantDto = {
      name: 'My Restaurant!',
      address: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      country: 'USA',
      cuisine: Cuisine.AMERICAN,
    };

    it('creates a restaurant with a slugified, unique slug', async () => {
      let receivedData: Record<string, unknown> | undefined;
      prismaMock.client.restaurant.create.mockImplementation(
        (args: { data: Record<string, unknown> }) => {
          receivedData = args.data;
          return Promise.resolve({ id: '1' });
        },
      );

      await service.create('owner-1', dto);

      const data = receivedData!;

      expect(data).toMatchObject({
        ownerId: 'owner-1',
        name: dto.name,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        country: dto.country,
        cuisine: dto.cuisine,
      });
      expect(data.slug).toMatch(/^my-restaurant-[0-9a-f]{8}$/);
    });
  });

  describe('update', () => {
    const ownerId = 'owner-1';
    const id = 'restaurant-1';

    it('throws NotFoundException when the restaurant does not exist', async () => {
      prismaMock.client.restaurant.findUnique.mockResolvedValue(null);

      await expect(
        service.update(ownerId, id, { name: 'New name' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws ForbiddenException when the requester does not own the restaurant', async () => {
      prismaMock.client.restaurant.findUnique.mockResolvedValue({
        id,
        ownerId: 'someone-else',
      });

      await expect(
        service.update(ownerId, id, { name: 'New name' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('throws BadRequestException when no fields are provided', async () => {
      prismaMock.client.restaurant.findUnique.mockResolvedValue({
        id,
        ownerId,
      });

      await expect(service.update(ownerId, id, {})).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('updates the restaurant when the requester is the owner', async () => {
      prismaMock.client.restaurant.findUnique.mockResolvedValue({
        id,
        ownerId,
      });
      prismaMock.client.restaurant.update.mockResolvedValue({ id });

      const dto = { name: 'New name' };
      await service.update(ownerId, id, dto);

      expect(prismaMock.client.restaurant.update).toHaveBeenCalledWith({
        where: { id },
        data: dto,
      });
    });
  });

  describe('remove', () => {
    const ownerId = 'owner-1';
    const id = 'restaurant-1';

    it('throws NotFoundException when the restaurant does not exist', async () => {
      prismaMock.client.restaurant.findUnique.mockResolvedValue(null);

      await expect(service.remove(ownerId, id)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when the requester does not own the restaurant', async () => {
      prismaMock.client.restaurant.findUnique.mockResolvedValue({
        id,
        ownerId: 'someone-else',
      });

      await expect(service.remove(ownerId, id)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('deletes the restaurant when the requester is the owner', async () => {
      prismaMock.client.restaurant.findUnique.mockResolvedValue({
        id,
        ownerId,
      });
      prismaMock.client.restaurant.delete.mockResolvedValue({ id });

      await service.remove(ownerId, id);

      expect(prismaMock.client.restaurant.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });

  describe('findAll', () => {
    it('returns the first page of restaurants with pagination metadata', async () => {
      prismaMock.client.restaurant.findMany.mockResolvedValue([{ id: '1' }]);
      prismaMock.client.restaurant.count.mockResolvedValue(1);

      const result = await service.findAll({
        page: 1,
        pageSize: 12,
        sort: 'desc',
      });

      expect(prismaMock.client.restaurant.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ averageRating: 'desc' }, { name: 'asc' }],
        skip: 0,
        take: 12,
      });
      expect(prismaMock.client.restaurant.count).toHaveBeenCalledWith({
        where: {},
      });
      expect(result).toEqual({
        data: [{ id: '1' }],
        pagination: { page: 1, pageSize: 12, total: 1, totalPages: 1 },
      });
    });

    it('skips past prior pages and computes totalPages', async () => {
      prismaMock.client.restaurant.findMany.mockResolvedValue([{ id: '3' }]);
      prismaMock.client.restaurant.count.mockResolvedValue(25);

      const result = await service.findAll({
        page: 3,
        pageSize: 10,
        sort: 'desc',
      });

      expect(prismaMock.client.restaurant.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [{ averageRating: 'desc' }, { name: 'asc' }],
        skip: 20,
        take: 10,
      });
      expect(result).toEqual({
        data: [{ id: '3' }],
        pagination: { page: 3, pageSize: 10, total: 25, totalPages: 3 },
      });
    });

    it('applies city, cuisine, minRating filters and honors the sort direction', async () => {
      prismaMock.client.restaurant.findMany.mockResolvedValue([]);
      prismaMock.client.restaurant.count.mockResolvedValue(0);

      await service.findAll({
        page: 1,
        pageSize: 12,
        city: 'Springfield',
        cuisine: Cuisine.ITALIAN,
        minRating: 4,
        sort: 'asc',
      });

      const expectedWhere = {
        city: 'Springfield',
        cuisine: Cuisine.ITALIAN,
        averageRating: { gte: 4 },
      };
      expect(prismaMock.client.restaurant.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        orderBy: [{ averageRating: 'asc' }, { name: 'asc' }],
        skip: 0,
        take: 12,
      });
      expect(prismaMock.client.restaurant.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
    });
  });

  describe('findMine', () => {
    it('returns only the owner restaurants with pagination metadata', async () => {
      prismaMock.client.restaurant.findMany.mockResolvedValue([{ id: '1' }]);
      prismaMock.client.restaurant.count.mockResolvedValue(1);

      const result = await service.findMine('owner-1', {
        page: 1,
        pageSize: 10,
      });

      expect(prismaMock.client.restaurant.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'owner-1' },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: 0,
        take: 10,
      });
      expect(prismaMock.client.restaurant.count).toHaveBeenCalledWith({
        where: { ownerId: 'owner-1' },
      });
      expect(result).toEqual({
        data: [{ id: '1' }],
        pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
      });
    });
  });

  describe('findCities', () => {
    it('returns the distinct list of cities in ascending order', async () => {
      prismaMock.client.restaurant.findMany.mockResolvedValue([
        { city: 'Chicago' },
        { city: 'Springfield' },
      ]);

      const result = await service.findCities();

      expect(prismaMock.client.restaurant.findMany).toHaveBeenCalledWith({
        distinct: ['city'],
        select: { city: true },
        orderBy: { city: 'asc' },
      });
      expect(result).toEqual(['Chicago', 'Springfield']);
    });
  });

  describe('findUsingSlug', () => {
    it('returns the restaurant with a limited owner selection, excluding passwordHash', async () => {
      prismaMock.client.restaurant.findUnique.mockResolvedValue({ id: '1' });

      const result = await service.findUsingSlug('my-restaurant');

      expect(prismaMock.client.restaurant.findUnique).toHaveBeenCalledWith({
        where: { slug: 'my-restaurant' },
        include: { owner: { select: { id: true, name: true } } },
      });
      expect(result).toEqual({ id: '1' });
    });
  });
});
