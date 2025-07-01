import { IsString } from 'class-validator';

export class CreatePurchasedCourseDto {
  @IsString()
  courseId: string;
}