import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { AuthenticatedRequest } from './interfaces/authenticated-request.interface';
import { Role } from 'types';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    register: jest.fn(),
    login: jest.fn(),
    me: jest.fn(),
    refresh: jest.fn(),
    revokeRefreshToken: jest.fn(),
    revokeAllRefreshTokens: jest.fn(),
    validateUser: jest.fn(),
  };

  const safeUser = {
    id: 'user-1',
    email: 'jane@example.com',
    name: 'Jane Doe',
    role: Role.REVIEWER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createRes = () => {
    const cookie = jest.fn();
    const clearCookie = jest.fn();
    const res = { cookie, clearCookie } as unknown as Response;

    return { res, cookie, clearCookie };
  };

  const createReq = (cookies: Record<string, string> = {}) =>
    ({ cookies, user: { id: safeUser.id } }) as AuthenticatedRequest;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('registers the user, sets both cookies and returns the user', async () => {
      const dto: RegisterDto = {
        email: safeUser.email,
        name: safeUser.name,
        password: 'Passw0rd!',
        role: Role.REVIEWER,
      };
      authServiceMock.register.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: safeUser,
      });
      const { res, cookie } = createRes();

      const result = await controller.register(dto, res);

      expect(authServiceMock.register).toHaveBeenCalledWith(dto);
      expect(cookie).toHaveBeenCalledWith(
        'auth',
        'access-token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(cookie).toHaveBeenCalledWith(
        'refresh',
        'refresh-token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result).toEqual({ user: safeUser });
    });
  });

  describe('login', () => {
    it('validates the credentials, sets both cookies and returns the user', async () => {
      const dto: LoginDto = { email: safeUser.email, password: 'Passw0rd!' };
      authServiceMock.validateUser.mockResolvedValue(safeUser);
      authServiceMock.login.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: safeUser,
      });
      const { res, cookie } = createRes();

      const result = await controller.login(dto, res);

      expect(authServiceMock.validateUser).toHaveBeenCalledWith(
        dto.email,
        dto.password,
      );
      expect(authServiceMock.login).toHaveBeenCalledWith(safeUser);
      expect(cookie).toHaveBeenCalledWith(
        'auth',
        'access-token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(cookie).toHaveBeenCalledWith(
        'refresh',
        'refresh-token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result).toEqual({ user: safeUser });
    });
  });

  describe('me', () => {
    it('returns the authenticated user', async () => {
      authServiceMock.me.mockResolvedValue(safeUser);
      const req = { user: { id: safeUser.id } } as AuthenticatedRequest;

      const result = await controller.me(req);

      expect(authServiceMock.me).toHaveBeenCalledWith(safeUser.id);
      expect(result).toEqual(safeUser);
    });
  });

  describe('refresh', () => {
    it('rotates the refresh session and sets both cookies', async () => {
      authServiceMock.refresh.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: safeUser,
      });
      const { res, cookie } = createRes();
      const req = {
        cookies: { refresh: 'old-refresh-token' },
      } as unknown as Request;

      const result = await controller.refresh(req, res);

      expect(authServiceMock.refresh).toHaveBeenCalledWith('old-refresh-token');
      expect(cookie).toHaveBeenCalledWith(
        'auth',
        'new-access-token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(cookie).toHaveBeenCalledWith(
        'refresh',
        'new-refresh-token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result).toEqual({ message: 'Token refreshed successfully' });
    });

    it('throws UnauthorizedException when the refresh cookie is missing', async () => {
      const { res } = createRes();
      const req = { cookies: {} } as unknown as Request;

      await expect(controller.refresh(req, res)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(authServiceMock.refresh).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('revokes the current session and clears both cookies', async () => {
      const { res, clearCookie } = createRes();
      const req = createReq({ refresh: 'refresh-token' });

      const result = await controller.logout(req, res);

      expect(authServiceMock.revokeRefreshToken).toHaveBeenCalledWith(
        'refresh-token',
      );
      expect(clearCookie).toHaveBeenCalledWith(
        'auth',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(clearCookie).toHaveBeenCalledWith(
        'refresh',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('clears cookies without revoking when no refresh cookie is present', async () => {
      const { res, clearCookie } = createRes();
      const req = createReq();

      const result = await controller.logout(req, res);

      expect(authServiceMock.revokeRefreshToken).not.toHaveBeenCalled();
      expect(clearCookie).toHaveBeenCalledWith(
        'auth',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('logoutAll', () => {
    it('revokes every session for the user and clears both cookies', async () => {
      const { res, clearCookie } = createRes();
      const req = createReq();

      const result = await controller.logoutAll(req, res);

      expect(authServiceMock.revokeAllRefreshTokens).toHaveBeenCalledWith(
        safeUser.id,
      );
      expect(clearCookie).toHaveBeenCalledWith(
        'auth',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(clearCookie).toHaveBeenCalledWith(
        'refresh',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result).toEqual({ message: 'Logged out of all sessions' });
    });
  });
});
