import { IsString } from 'class-validator';

export class CreateCourseClassDto {

  @IsString()
  courseSectionId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

}