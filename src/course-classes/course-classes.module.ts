import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/auth';
import { CourseClass } from './entities';
import { CourseClassesController } from './course-classes.controller';
import { CourseClassesService } from './course-classes.service';
import { CourseSectionsModule } from '@/course-sections/course-sections.module';
import { SystemHistory } from '@/system-history';

@Module( {
  controllers: [
    CourseClassesController
  ],
  providers: [
    CourseClassesService
  ],
  imports: [
    TypeOrmModule.forFeature( [
      CourseClass,
      SystemHistory
    ] ),
    AuthModule,
    CourseSectionsModule,
  ],
  exports: [ TypeOrmModule ],
} )
export class CourseClassesModule { }