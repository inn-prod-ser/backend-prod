import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { DifficultyLevelEnum } from '../entities/course.entity';

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsBoolean()
  isPublic: boolean;

  @IsBoolean()
  @IsOptional()
  courseUnderConstruction?: boolean;

  @IsArray()
  @IsUUID( 4, { each: true } )
  categoryIds: string[];

  @IsEnum( DifficultyLevelEnum )
  @IsOptional()
  difficultyLevel?: DifficultyLevelEnum;

  @IsString()
  @IsOptional()
  estimatedDuration?: string;
}
