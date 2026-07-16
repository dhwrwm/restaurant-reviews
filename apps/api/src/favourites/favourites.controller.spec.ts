import { Test, TestingModule } from '@nestjs/testing';
import { FavouritesController } from './favourites.controller';
import { FavouritesService } from './favourites.service';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { Role } from 'types';

describe('FavouritesController', () => {
  let controller: FavouritesController;

  const favouritesServiceMock = {
    create: jest.fn(),
    remove: jest.fn(),
    getFavourites: jest.fn(),
  };

  const req = {
    user: {
      id: 'user-1',
      email: 'user@example.com',
      role: Role.REVIEWER,
    },
  } as AuthenticatedRequest;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavouritesController],
      providers: [
        { provide: FavouritesService, useValue: favouritesServiceMock },
      ],
    }).compile();

    controller = module.get<FavouritesController>(FavouritesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getFavourites delegates to the service with the user id and query', async () => {
    favouritesServiceMock.getFavourites.mockResolvedValue({
      data: [{ id: 'favourite-1' }],
      pagination: { page: 1, pageSize: 12, total: 1, totalPages: 1 },
    });

    const query = { page: 1, pageSize: 12 };
    const result = await controller.getFavourites(req, query);

    expect(favouritesServiceMock.getFavourites).toHaveBeenCalledWith(
      'user-1',
      query,
    );
    expect(result).toEqual({
      data: [{ id: 'favourite-1' }],
      pagination: { page: 1, pageSize: 12, total: 1, totalPages: 1 },
    });
  });

  it('createFavourite delegates to the service with the authenticated user id and restaurant id', async () => {
    favouritesServiceMock.create.mockResolvedValue({ id: 'favourite-1' });

    const result = await controller.createFavourite(req, {
      restaurantId: 'restaurant-1',
    });

    expect(favouritesServiceMock.create).toHaveBeenCalledWith(
      'user-1',
      'restaurant-1',
    );
    expect(result).toEqual({ id: 'favourite-1' });
  });

  it('removeFavourite delegates to the service with the authenticated user id and favourite id', async () => {
    favouritesServiceMock.remove.mockResolvedValue({ id: 'favourite-1' });

    const result = await controller.removeFavourite(req, 'favourite-1');

    expect(favouritesServiceMock.remove).toHaveBeenCalledWith(
      'user-1',
      'favourite-1',
    );
    expect(result).toEqual({ id: 'favourite-1' });
  });
});
