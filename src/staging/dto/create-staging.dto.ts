import { IsString, IsOptional } from "class-validator";

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
}
