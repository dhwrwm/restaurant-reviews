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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsQueryDto } from './dto/reviews-query.dto';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('restaurants/:slug/reviews')
  findAllForRestaurant(
    @Param('slug') slug: string,
    @Query() query: ReviewsQueryDto,
  ) {
    return this.reviewsService.findAllForRestaurant(slug, query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.REVIEWER)
  @Post('restaurants/:slug/reviews')
  async createReview(
    @Req() req: AuthenticatedRequest,
    @Param('slug') slug: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(req.user.id, slug, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.REVIEWER)
  @Patch('reviews/:id')
  async updateReview(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(req.user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.REVIEWER)
  @Delete('reviews/:id')
  async removeReview(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.reviewsService.remove(req.user.id, id);
  }
}
