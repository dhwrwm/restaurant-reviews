import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FavouritesController } from './favourites.controller';
import { FavouritesService } from './favourites.service';

@Module({
  imports: [PrismaModule],
  providers: [FavouritesService],
  controllers: [FavouritesController],
})
export class FavouritesModule {}
