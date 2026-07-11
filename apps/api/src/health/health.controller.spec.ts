import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;

  const prismaMock = {
    client: {
      $queryRaw: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: prismaMock }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('reports the database as up when the query succeeds', async () => {
      prismaMock.client.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await controller.check();

      expect(result).toMatchObject({ status: 'ok', database: 'up' });
      expect(typeof result.timestamp).toBe('string');
    });

    it('reports a 503 when the database query fails', async () => {
      expect.assertions(3);
      prismaMock.client.$queryRaw.mockRejectedValue(
        new Error('connection refused'),
      );

      try {
        await controller.check();
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        const httpError = error as HttpException;
        expect(httpError.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
        expect(httpError.getResponse()).toMatchObject({
          status: 'error',
          database: 'down',
        });
      }
    });
  });
});
