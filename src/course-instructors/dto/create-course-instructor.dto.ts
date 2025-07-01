import { IsString, IsOptional } from 'class-validator';

export class CreateCourseInstructorDto {

  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  profilePictureUrl?: string;

  @IsOptional()
  @IsString()
  profesionalTitle?: string;
}
