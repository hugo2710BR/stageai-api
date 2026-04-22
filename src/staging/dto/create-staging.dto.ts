import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateStagingDto {
  @IsString()
  image: string;

  @IsString()
  @IsOptional()
  mask?: string;

  @IsString()
  style: string;

  @IsString()
  @IsOptional()
  prompt?: string;

  @IsNumber()
  @IsOptional()
  width?: number;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsNumber()
  @IsOptional()
  seed?: number;
}
