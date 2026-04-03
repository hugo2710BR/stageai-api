import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateStagingDto {
  @IsString()
  image: string;

  @IsString()
  mask: string;

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
}
