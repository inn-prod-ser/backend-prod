import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

import { CreateVideoDto } from './create-video.dto';

export class UpdateVideoDto extends PartialType( CreateVideoDto ) {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  url?: string;
}
