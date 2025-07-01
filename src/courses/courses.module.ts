import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/auth';
import { Category } from '@/categories';
import { Course } from './entities';
import { CourseClass } from '@/course-classes/entities/course-class.entity';
import { CourseInstructor } from '@/course-instructors/entities/course-instructor.entity';
import { CourseSection } from '@/course-sections/entities/course-section.entity';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { SystemHistory } from '@/system-history';

@Module( {
  controllers: [
    CoursesController
  ],
  providers: [
    CoursesService
  ],
  imports: [
    TypeOrmModule.forFeature( [
      Category,
      Course,
      CourseClass,
      CourseInstructor,
      CourseSection,
      SystemHistory
    ] ),
    AuthModule,
  ],
  exports: [ TypeOrmModule ],
} )
export class CoursesModule { }
