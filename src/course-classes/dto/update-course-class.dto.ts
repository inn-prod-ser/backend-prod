import { PartialType } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

import { CreateCourseClassDto } from './create-course-class.dto';

export class UpdateCourseClassDto extends PartialType( CreateCourseClassDto ) {
  @IsOptional()
  @IsString()
  slug?: string;
}