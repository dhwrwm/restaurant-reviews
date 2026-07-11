import {
  INestApplication,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { prisma } from '../lib/prisma';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly client = prisma;

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }

  enableShutdownHooks(app: INestApplication): void {
    const shutdown = () => {
      void app.close();
    };

    process.once('beforeExit', shutdown);
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  }
}
