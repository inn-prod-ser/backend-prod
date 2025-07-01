import { PartialType } from '@nestjs/swagger';
import { CreateCourseInstructorDto } from './create-course-instructor.dto';

export class UpdateCourseInstructorDto extends PartialType( CreateCourseInstructorDto ) { }
