import { PartialType } from '@nestjs/swagger';

import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { CreateCategoryDto } from './create-category.dto';


export class UpdateCategoryDto extends PartialType( CreateCategoryDto ) {

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBoolean()
  visible?: boolean;

}