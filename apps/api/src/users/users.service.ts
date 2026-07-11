import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateUserDto) {
    return this.prisma.client.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash: dto.passwordHash,
        role: dto.role,
      },
    });
  }

  findByEmail(email: string) {
    return this.prisma.client.user.findUnique({
      where: { email },
    });
  }

  findById(id: string) {
    return this.prisma.client.user.findUnique({
      where: { id },
    });
  }
}
