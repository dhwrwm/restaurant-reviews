import { IsString } from 'class-validator';

export class CreaeteFavouriteDto {
  @IsString()
  restaurantId!: string;
}
