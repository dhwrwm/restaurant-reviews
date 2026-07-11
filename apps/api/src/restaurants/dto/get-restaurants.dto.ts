import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Prisma } from '../../generated/prisma/client';
import { Cuisine } from 'types';

export class GetRestaurantsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize: number = 12;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(Cuisine, { message: 'Please select a valid cuisine.' })
  cuisine?: Cuisine;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort: Prisma.SortOrder = 'desc';
}
