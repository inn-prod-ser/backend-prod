import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/auth';
import { CourseSection } from './entities';
import { CourseSectionsController } from './course-sections.controller';
import { CourseSectionsService } from './course-sections.service';
import { SystemHistory } from '@/system-history';
import { Course } from '@/courses';

@Module( {
  controllers: [
    CourseSectionsController
  ],
  providers: [
    CourseSectionsService
  ],
  imports: [
    TypeOrmModule.forFeature( [
      CourseSection,
      SystemHistory,
      Course
    ] ),
    AuthModule,
  ],
  exports: [ TypeOrmModule ]
} )
export class CourseSectionsModule { }