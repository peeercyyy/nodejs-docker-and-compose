import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  @IsOptional()
  @Length(1, 250)
  name: string;

  @IsString()
  @IsOptional()
  @Length(0, 1500)
  description: string;

  @IsUrl()
  @IsOptional()
  image: string;

  @IsArray()
  @IsNumber()
  @IsOptional()
  itemsId: number[];
}
