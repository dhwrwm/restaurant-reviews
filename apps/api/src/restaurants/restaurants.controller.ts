import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { Role } from 'types';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { RestaurantsQueryDto } from './dto/restaurants-query.dto';
import { GetRestaurantsDto } from './dto/get-restaurants.dto';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantService: RestaurantsService) {}

  @Get('/')
  findAll(@Query() query: GetRestaurantsDto) {
    return this.restaurantService.findAll(query);
  }

  @Get('cities')
  findCities() {
    return this.restaurantService.findCities();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Get('mine')
  findMine(
    @Req() req: AuthenticatedRequest,
    @Query() query: RestaurantsQueryDto,
  ) {
    return this.restaurantService.findMine(req.user.id, query);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.restaurantService.findUsingSlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Post('/')
  async createResatuarant(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateRestaurantDto,
  ) {
    return this.restaurantService.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Patch('/:id')
  async updateResatuarant(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateRestaurantDto,
  ) {
    return this.restaurantService.update(req.user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Delete('/:id')
  async removeResatuarant(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.restaurantService.remove(req.user.id, id);
  }
}
