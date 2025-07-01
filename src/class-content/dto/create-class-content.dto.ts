import { IsString } from 'class-validator';

export class CreateClassContentDto {
  @IsString()
  content: string;

  @IsString()
  courseClassId: string;

  @IsString()
  contentType: 'text' | 'video' | 'slides';
}