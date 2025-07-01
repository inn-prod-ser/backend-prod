import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/auth';
import { Course } from '@/courses/entities/course.entity';
import { CourseInstructor } from './entities/course-instructor.entity';
import { CourseInstructorsController } from './course-instructors.controller';
import { CourseInstructorsService } from './course-instructors.service';
import { SystemHistory } from '@/system-history';

@Module( {
  controllers: [
    CourseInstructorsController
  ],
  providers: [
    CourseInstructorsService
  ],
  imports: [
    TypeOrmModule.forFeature( [
      CourseInstructor,
      Course,
      SystemHistory
    ] ),
    AuthModule,
  ],
  exports: [ TypeOrmModule ],
} )
export class CourseInstructorsModule { }
