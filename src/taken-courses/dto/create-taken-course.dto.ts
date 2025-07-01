import { IsString } from 'class-validator';

export class CreateTakenCourseDto {
  @IsString()
  courseId: string;
}