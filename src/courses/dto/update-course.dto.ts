import { PartialType } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateCourseDto } from './create-course.dto';
import { DifficultyLevelEnum } from '../entities/course.entity';

export class UpdateCourseDto extends PartialType( CreateCourseDto ) {
  @IsOptional()
  @IsArray()
  @IsUUID( 4, { each: true } )
  categoryIds?: string[];

  @IsBoolean()
  @IsOptional()
  courseUnderConstruction?: boolean;

  @IsEnum( DifficultyLevelEnum )
  @IsOptional()
  difficultyLevel?: DifficultyLevelEnum;

  @IsString()
  @IsOptional()
  estimatedDuration?: string;
}
