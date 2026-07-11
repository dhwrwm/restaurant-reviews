import { randomUUID } from 'crypto';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RefreshTokenPayload } from './interfaces/refresh-token-payload.interface';
import { Prisma, User, RefreshToken } from '../generated/prisma/client';
import { Role } from 'types';

type SafeUser = Omit<User, 'passwordHash'>;

interface RefreshSession {
  token: string;
  jti: string;
}

interface TokenSubject {
  id: string;
  email: string;
  role: Role;
}

const REFRESH_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      passwordHash: await this.hashPassword(dto.password),
      role: dto.role,
    });

    return this.login(this.excludePassword(user));
  }

  async login(user: SafeUser) {
    const refreshSession = await this.createRefreshSession(user);
    const accessToken = await this.generateAccessToken(user);

    return {
      accessToken,
      refreshToken: refreshSession.token,
      user,
    };
  }

  async me(userId: string): Promise<SafeUser> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.excludePassword(user);
  }

  async validateUser(email: string, password: string): Promise<SafeUser> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.excludePassword(user);
  }

  async refresh(refreshToken: string) {
    const { record, payload } = await this.validateRefreshToken(refreshToken);
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    const safeUser = this.excludePassword(user);
    const newRefreshToken = await this.rotateRefreshToken(record, safeUser);
    const accessToken = await this.generateAccessToken(safeUser);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: safeUser,
    };
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const payload = await this.verifyRefreshToken(refreshToken);

    if (!payload) {
      return;
    }

    await this.prisma.client.refreshToken.deleteMany({
      where: { jti: payload.jti, userId: payload.sub },
    });
  }

  async revokeAllRefreshTokens(userId: string): Promise<void> {
    await this.prisma.client.refreshToken.deleteMany({ where: { userId } });
  }

  private async validateRefreshToken(
    refreshToken: string,
  ): Promise<{ record: RefreshToken; payload: RefreshTokenPayload }> {
    const payload = await this.verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const record = await this.prisma.client.refreshToken.findUnique({
      where: { jti: payload.jti },
    });

    if (!record || record.userId !== payload.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (record.expiresAt.getTime() < Date.now()) {
      await this.prisma.client.refreshToken.delete({
        where: { id: record.id },
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    const matches = await argon2.verify(record.tokenHash, refreshToken);

    if (!matches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return { record, payload };
  }

  private rotateRefreshToken(
    record: RefreshToken,
    user: SafeUser,
  ): Promise<string> {
    return this.prisma.client.$transaction(async (tx) => {
      const session = await this.createRefreshSession(user, tx);
      await tx.refreshToken.delete({ where: { id: record.id } });

      return session.token;
    });
  }

  private async createRefreshSession(
    user: TokenSubject,
    client: Prisma.TransactionClient = this.prisma.client,
  ): Promise<RefreshSession> {
    const session = await this.generateRefreshToken(user);
    const tokenHash = await argon2.hash(session.token);

    await client.refreshToken.create({
      data: {
        jti: session.jti,
        tokenHash,
        userId: user.id,
        expiresAt: this.getRefreshTokenExpiry(),
      },
    });

    return session;
  }

  private generateAccessToken(user: TokenSubject): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload);
  }

  private async generateRefreshToken(
    user: TokenSubject,
  ): Promise<RefreshSession> {
    const jti = randomUUID();
    const payload: RefreshTokenPayload = {
      sub: user.id,
      role: user.role,
      jti,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_REFRESH_EXPIRES_IN',
        '7d',
      ) as JwtSignOptions['expiresIn'],
    });

    return { token, jti };
  }

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenPayload | null> {
    try {
      return await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        { secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET') },
      );
    } catch {
      return null;
    }
  }

  private getRefreshTokenExpiry(): Date {
    return new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  }

  private hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  private excludePassword(user: User): SafeUser {
    const { passwordHash, ...safeUser } = user;
    void passwordHash;
    return safeUser;
  }
}
