import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCourseSectionDto {
  @IsString()
  courseId: string;

  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  positionOrder?: number;
}