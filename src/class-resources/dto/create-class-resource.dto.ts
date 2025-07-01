import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateClassResourceDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  formatResource: string;

  @IsNotEmpty()
  @IsUrl()
  url: string;
}