import {
  IsUUID,
  IsString,
  IsNumber,
  IsPositive,
  IsBoolean,
  IsOptional,
  Length,
} from 'class-validator';

export class CreateProductDto {
  @IsUUID()
  stallId: string;

  @IsString()
  @Length(1, 255)  
  name: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsString()
  @Length(1, 100)  
  category: string;

  @IsNumber()
  @IsPositive()
  stock: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean = true;
}
