import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from 'types';
import type { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;

  const prismaMock = {
    client: {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a user with the given email, name, password hash and role', async () => {
      const dto: CreateUserDto = {
        email: 'jane@example.com',
        name: 'Jane Doe',
        passwordHash: 'hashed-password',
        role: Role.REVIEWER,
      };
      prismaMock.client.user.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto);

      expect(prismaMock.client.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          name: dto.name,
          passwordHash: dto.passwordHash,
          role: dto.role,
        },
      });
      expect(result).toEqual({ id: '1', ...dto });
    });
  });

  describe('findByEmail', () => {
    it('looks up a user by email', async () => {
      prismaMock.client.user.findUnique.mockResolvedValue({ id: '1' });

      const result = await service.findByEmail('jane@example.com');

      expect(prismaMock.client.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'jane@example.com' },
      });
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('findById', () => {
    it('looks up a user by id', async () => {
      prismaMock.client.user.findUnique.mockResolvedValue({ id: '1' });

      const result = await service.findById('1');

      expect(prismaMock.client.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual({ id: '1' });
    });
  });
});
