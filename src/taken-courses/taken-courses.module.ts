// taken-courses.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/auth';
import { SystemHistory } from '@/system-history';
import { TakenCourse } from './entities';
import { TakenCoursesController } from './taken-courses.controller';
import { TakenCoursesService } from './taken-courses.service';
import { CoursesModule } from '@/courses/courses.module'; 

@Module( {
  controllers: [
    TakenCoursesController
  ],
  providers: [
    TakenCoursesService
  ],
  imports: [
    TypeOrmModule.forFeature( [
      TakenCourse,
      SystemHistory
    ] ),
    AuthModule,
    CoursesModule,
  ],
  exports: [ TypeOrmModule ],
} )
export class TakenCoursesModule { }