import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FavouritesService } from './favourites.service';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from 'types';
import { CreaeteFavouriteDto } from './dto/create-favourite.dto';
import { GetFavouritesQueryDto } from './dto/get-favourites-query.dto';

@Controller('favourites')
export class FavouritesController {
  constructor(private readonly favouriteService: FavouritesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/')
  getFavourites(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetFavouritesQueryDto,
  ) {
    return this.favouriteService.getFavourites(req.user.id, query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.REVIEWER)
  @Post('/')
  createFavourite(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreaeteFavouriteDto,
  ) {
    return this.favouriteService.create(req.user.id, body.restaurantId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  removeFavourite(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.favouriteService.remove(req.user.id, id);
  }
}
