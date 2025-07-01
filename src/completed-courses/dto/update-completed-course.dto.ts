import { PartialType } from '@nestjs/swagger';
import { CreateCompletedCourseDto } from './create-completed-course.dto';

export class UpdateCompletedCourseDto extends PartialType(CreateCompletedCourseDto) {}