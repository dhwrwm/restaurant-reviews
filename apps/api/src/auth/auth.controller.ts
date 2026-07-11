import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedRequest } from './interfaces/authenticated-request.interface';
import {
  REFRESH_TOKEN_COOKIE,
  clearAuthCookies,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from './utils/cookies';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.register(dto);
    this.setAuthCookies(res, accessToken, refreshToken);

    return {
      user,
    };
  }

  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const safeUser = await this.authService.validateUser(
      dto.email,
      dto.password,
    );
    const { accessToken, refreshToken, user } =
      await this.authService.login(safeUser);
    this.setAuthCookies(res, accessToken, refreshToken);

    return {
      user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return this.authService.me(req.user.id);
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = this.getRefreshTokenCookie(req);

    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refresh(refreshToken);
    this.setAuthCookies(res, accessToken, newRefreshToken);

    return {
      message: 'Token refreshed successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = this.getRefreshTokenCookie(req);

    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }

    clearAuthCookies(res);

    return {
      message: 'Logged out successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  async logoutAll(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.revokeAllRefreshTokens(req.user.id);
    clearAuthCookies(res);

    return {
      message: 'Logged out of all sessions',
    };
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);
  }

  private getRefreshTokenCookie(req: Request): string | null {
    const token: unknown = req.cookies?.[REFRESH_TOKEN_COOKIE];
    return typeof token === 'string' ? token : null;
  }
}
