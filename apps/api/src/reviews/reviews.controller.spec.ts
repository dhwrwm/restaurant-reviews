import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { Role } from 'types';
import { CreateReviewDto } from './dto/create-review.dto';

describe('ReviewsController', () => {
  let controller: ReviewsController;

  const reviewsServiceMock = {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findAllForRestaurant: jest.fn(),
  };

  const req = {
    user: {
      id: 'reviewer-1',
      email: 'reviewer@example.com',
      role: Role.REVIEWER,
    },
  } as AuthenticatedRequest;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [{ provide: ReviewsService, useValue: reviewsServiceMock }],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllForRestaurant delegates to the service with the slug and query', async () => {
    reviewsServiceMock.findAllForRestaurant.mockResolvedValue({
      items: [{ id: '1' }],
      nextCursor: null,
    });

    const query = { limit: 10 };
    const result = await controller.findAllForRestaurant(
      'my-restaurant',
      query,
    );

    expect(reviewsServiceMock.findAllForRestaurant).toHaveBeenCalledWith(
      'my-restaurant',
      query,
    );
    expect(result).toEqual({ items: [{ id: '1' }], nextCursor: null });
  });

  it('createReview delegates to the service with the authenticated reviewer id and slug', async () => {
    const dto: CreateReviewDto = { rating: 5, comment: 'Great food!' };
    reviewsServiceMock.create.mockResolvedValue({ id: '1' });

    const result = await controller.createReview(req, 'my-restaurant', dto);

    expect(reviewsServiceMock.create).toHaveBeenCalledWith(
      'reviewer-1',
      'my-restaurant',
      dto,
    );
    expect(result).toEqual({ id: '1' });
  });

  it('updateReview delegates to the service with the id and reviewer id', async () => {
    const dto = { comment: 'Updated review' };
    reviewsServiceMock.update.mockResolvedValue({ id: '1' });

    const result = await controller.updateReview(req, '1', dto);

    expect(reviewsServiceMock.update).toHaveBeenCalledWith(
      'reviewer-1',
      '1',
      dto,
    );
    expect(result).toEqual({ id: '1' });
  });

  it('removeReview delegates to the service with the id and reviewer id', async () => {
    reviewsServiceMock.remove.mockResolvedValue({ id: '1' });

    const result = await controller.removeReview(req, '1');

    expect(reviewsServiceMock.remove).toHaveBeenCalledWith('reviewer-1', '1');
    expect(result).toEqual({ id: '1' });
  });
});
