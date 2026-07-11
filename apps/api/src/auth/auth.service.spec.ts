import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import type { User, RefreshToken } from '../generated/prisma/client';
import { Role } from 'types';

jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;

  const usersServiceMock = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
  };

  const jwtServiceMock = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const configServiceMock = {
    getOrThrow: jest.fn(),
    get: jest.fn(),
  };

  const txMock = {
    refreshToken: {
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  const prismaServiceMock = {
    client: {
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn((callback: (tx: typeof txMock) => unknown) =>
        callback(txMock),
      ),
    },
  };

  const user: User = {
    id: 'user-1',
    email: 'jane@example.com',
    name: 'Jane Doe',
    passwordHash: 'hashed-password',
    role: Role.REVIEWER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const safeUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  const refreshTokenRecord: RefreshToken = {
    id: 'session-1',
    jti: 'jti-1',
    tokenHash: 'hashed-refresh-token',
    userId: user.id,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    configServiceMock.getOrThrow.mockImplementation((key: string) => {
      if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
      throw new Error(`Unexpected config key: ${key}`);
    });
    configServiceMock.get.mockReturnValue('7d');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: PrismaService, useValue: prismaServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const dto = {
      email: user.email,
      name: user.name,
      password: 'Passw0rd!',
      role: Role.REVIEWER,
    };

    it('throws ConflictException when the email is already registered', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(user);

      await expect(service.register(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(usersServiceMock.create).not.toHaveBeenCalled();
    });

    it('hashes the password, creates the user and returns a login result', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);
      usersServiceMock.create.mockResolvedValue(user);
      jwtServiceMock.signAsync.mockResolvedValue('access-token');
      prismaServiceMock.client.refreshToken.create.mockResolvedValue(
        refreshTokenRecord,
      );
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.register(dto);

      expect(argon2.hash).toHaveBeenCalledWith(dto.password);
      expect(usersServiceMock.create).toHaveBeenCalledWith({
        email: dto.email,
        name: dto.name,
        passwordHash: 'hashed-password',
        role: dto.role,
      });
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'access-token',
        user: safeUser,
      });
    });
  });

  describe('login', () => {
    it('creates a refresh session and returns both tokens alongside the user', async () => {
      jwtServiceMock.signAsync.mockResolvedValue('signed-token');
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-refresh-token');
      prismaServiceMock.client.refreshToken.create.mockResolvedValue(
        refreshTokenRecord,
      );

      const result = await service.login(safeUser);

      expect(prismaServiceMock.client.refreshToken.create).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'signed-token',
        refreshToken: 'signed-token',
        user: safeUser,
      });
    });
  });

  describe('me', () => {
    it('throws UnauthorizedException when the user no longer exists', async () => {
      usersServiceMock.findById.mockResolvedValue(null);

      await expect(service.me(user.id)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('returns the user without the password hash', async () => {
      usersServiceMock.findById.mockResolvedValue(user);

      const result = await service.me(user.id);

      expect(result).toEqual(safeUser);
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('validateUser', () => {
    it('throws UnauthorizedException when no user matches the email', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);

      await expect(
        service.validateUser(user.email, 'wrong-password'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException when the password does not match', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser(user.email, 'wrong-password'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('returns the user without the password hash on success', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(user.email, 'Passw0rd!');

      expect(argon2.verify).toHaveBeenCalledWith(
        user.passwordHash,
        'Passw0rd!',
      );
      expect(result).toEqual(safeUser);
    });
  });

  describe('refresh', () => {
    it('throws UnauthorizedException when the JWT is invalid', async () => {
      jwtServiceMock.verifyAsync.mockRejectedValue(new Error('bad token'));

      await expect(service.refresh('bad-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when no matching session exists', async () => {
      jwtServiceMock.verifyAsync.mockResolvedValue({
        sub: user.id,
        role: user.role,
        jti: refreshTokenRecord.jti,
      });
      prismaServiceMock.client.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refresh('some-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('deletes and rejects an expired session', async () => {
      jwtServiceMock.verifyAsync.mockResolvedValue({
        sub: user.id,
        role: user.role,
        jti: refreshTokenRecord.jti,
      });
      prismaServiceMock.client.refreshToken.findUnique.mockResolvedValue({
        ...refreshTokenRecord,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.refresh('some-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(prismaServiceMock.client.refreshToken.delete).toHaveBeenCalledWith(
        { where: { id: refreshTokenRecord.id } },
      );
    });

    it('rejects when the token does not match the stored hash', async () => {
      jwtServiceMock.verifyAsync.mockResolvedValue({
        sub: user.id,
        role: user.role,
        jti: refreshTokenRecord.jti,
      });
      prismaServiceMock.client.refreshToken.findUnique.mockResolvedValue(
        refreshTokenRecord,
      );
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.refresh('some-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rotates the session and returns new tokens on success', async () => {
      jwtServiceMock.verifyAsync.mockResolvedValue({
        sub: user.id,
        role: user.role,
        jti: refreshTokenRecord.jti,
      });
      prismaServiceMock.client.refreshToken.findUnique.mockResolvedValue(
        refreshTokenRecord,
      );
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      usersServiceMock.findById.mockResolvedValue(user);
      jwtServiceMock.signAsync.mockResolvedValue('new-token');
      (argon2.hash as jest.Mock).mockResolvedValue('new-hashed-refresh-token');
      txMock.refreshToken.create.mockResolvedValue({
        ...refreshTokenRecord,
        id: 'session-2',
        jti: 'jti-2',
      });

      const result = await service.refresh('some-token');

      expect(prismaServiceMock.client.$transaction).toHaveBeenCalled();
      expect(txMock.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: refreshTokenRecord.id },
      });
      expect(txMock.refreshToken.create).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'new-token',
        refreshToken: 'new-token',
        user: safeUser,
      });
    });
  });

  describe('revokeRefreshToken', () => {
    it('does nothing when the token cannot be verified', async () => {
      jwtServiceMock.verifyAsync.mockRejectedValue(new Error('bad token'));

      await service.revokeRefreshToken('bad-token');

      expect(
        prismaServiceMock.client.refreshToken.deleteMany,
      ).not.toHaveBeenCalled();
    });

    it('deletes only the matching session for the token owner', async () => {
      jwtServiceMock.verifyAsync.mockResolvedValue({
        sub: user.id,
        role: user.role,
        jti: refreshTokenRecord.jti,
      });

      await service.revokeRefreshToken('some-token');

      expect(
        prismaServiceMock.client.refreshToken.deleteMany,
      ).toHaveBeenCalledWith({
        where: { jti: refreshTokenRecord.jti, userId: user.id },
      });
    });
  });

  describe('revokeAllRefreshTokens', () => {
    it('deletes every session belonging to the user', async () => {
      await service.revokeAllRefreshTokens(user.id);

      expect(
        prismaServiceMock.client.refreshToken.deleteMany,
      ).toHaveBeenCalledWith({ where: { userId: user.id } });
    });
  });
});
