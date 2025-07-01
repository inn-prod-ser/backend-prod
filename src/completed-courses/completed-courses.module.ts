// completed-courses.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/auth';
import { CompletedCourse } from './entities';
import { CompletedCoursesController } from './completed-courses.controller';
import { CompletedCoursesService } from './completed-courses.service';
import { SystemHistory } from '@/system-history';
import { CoursesModule } from '@/courses/courses.module';

@Module( {
  controllers: [
    CompletedCoursesController
  ],
  providers: [
    CompletedCoursesService
  ],
  imports: [
    TypeOrmModule.forFeature( [
      CompletedCourse,
      SystemHistory
    ] ),
    AuthModule,
    CoursesModule
  ],
  exports: [ TypeOrmModule ],
} )
export class CompletedCoursesModule { }