import { PartialType } from '@nestjs/swagger';

import { CreateTakenCourseDto } from './create-taken-course.dto';

export class UpdateTakenCourseDto extends PartialType( CreateTakenCourseDto ) { }