import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { Cuisine, Role } from 'types';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

describe('RestaurantsController', () => {
  let controller: RestaurantsController;

  const restaurantServiceMock = {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findAll: jest.fn(),
    findMine: jest.fn(),
    findCities: jest.fn(),
    findUsingSlug: jest.fn(),
  };

  const req = {
    user: { id: 'owner-1', email: 'owner@example.com', role: Role.OWNER },
  } as AuthenticatedRequest;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantsController],
      providers: [
        { provide: RestaurantsService, useValue: restaurantServiceMock },
      ],
    }).compile();

    controller = module.get<RestaurantsController>(RestaurantsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll delegates to the service with the query', async () => {
    const query = { page: 1, pageSize: 12, sort: 'desc' as const };
    restaurantServiceMock.findAll.mockResolvedValue({
      data: [{ id: '1' }],
      pagination: { page: 1, pageSize: 12, total: 1, totalPages: 1 },
    });

    const result = await controller.findAll(query);

    expect(restaurantServiceMock.findAll).toHaveBeenCalledWith(query);
    expect(result).toEqual({
      data: [{ id: '1' }],
      pagination: { page: 1, pageSize: 12, total: 1, totalPages: 1 },
    });
  });

  it('findMine delegates to the service with the authenticated owner id and query', async () => {
    const query = { page: 1, pageSize: 10 };
    restaurantServiceMock.findMine.mockResolvedValue({
      data: [{ id: '1' }],
      pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
    });

    const result = await controller.findMine(req, query);

    expect(restaurantServiceMock.findMine).toHaveBeenCalledWith(
      'owner-1',
      query,
    );
    expect(result).toEqual({
      data: [{ id: '1' }],
      pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
    });
  });

  it('findCities delegates to the service', async () => {
    restaurantServiceMock.findCities.mockResolvedValue(['Chicago', 'NYC']);

    const result = await controller.findCities();

    expect(restaurantServiceMock.findCities).toHaveBeenCalledWith();
    expect(result).toEqual(['Chicago', 'NYC']);
  });

  it('findOne delegates to the service with the slug', async () => {
    restaurantServiceMock.findUsingSlug.mockResolvedValue({ id: '1' });

    const result = await controller.findOne('my-restaurant');

    expect(restaurantServiceMock.findUsingSlug).toHaveBeenCalledWith(
      'my-restaurant',
    );
    expect(result).toEqual({ id: '1' });
  });

  it('createResatuarant delegates to the service with the authenticated owner id', async () => {
    const dto: CreateRestaurantDto = {
      name: 'My Restaurant',
      address: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      country: 'USA',
      cuisine: Cuisine.AMERICAN,
    };
    restaurantServiceMock.create.mockResolvedValue({ id: '1' });

    const result = await controller.createResatuarant(req, dto);

    expect(restaurantServiceMock.create).toHaveBeenCalledWith('owner-1', dto);
    expect(result).toEqual({ id: '1' });
  });

  it('updateResatuarant delegates to the service with the id and owner id', async () => {
    const dto = { name: 'New name' };
    restaurantServiceMock.update.mockResolvedValue({ id: '1' });

    const result = await controller.updateResatuarant(req, '1', dto);

    expect(restaurantServiceMock.update).toHaveBeenCalledWith(
      'owner-1',
      '1',
      dto,
    );
    expect(result).toEqual({ id: '1' });
  });

  it('removeResatuarant delegates to the service with the id and owner id', async () => {
    restaurantServiceMock.remove.mockResolvedValue({ id: '1' });

    const result = await controller.removeResatuarant(req, '1');

    expect(restaurantServiceMock.remove).toHaveBeenCalledWith('owner-1', '1');
    expect(result).toEqual({ id: '1' });
  });
});
