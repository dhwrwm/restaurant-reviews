import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Cuisine } from 'types';

export class CreateRestaurantDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsUrl(
    {
      require_protocol: true,
    },
    {
      message: 'Preview image URL must be a valid URL.',
    },
  )
  previewImageUrl?: string;

  @IsString()
  @MaxLength(255)
  address!: string;

  @IsString()
  @MaxLength(100)
  city!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @IsString()
  @MaxLength(100)
  country!: string;

  @IsEnum(Cuisine, {
    message: 'Please select a valid cuisine.',
  })
  cuisine!: Cuisine;
}
