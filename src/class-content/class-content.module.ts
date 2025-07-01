import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/auth';
import { ClassContent } from './entities/class-content.entity';
import { ClassContentController } from './class-content.controller';
import { ClassContentService } from './class-content.service';
import { CourseClassesModule } from '@/course-classes/course-classes.module';


@Module( {
  controllers: [
    ClassContentController
  ],
  providers: [
    ClassContentService
  ],
  imports: [
    TypeOrmModule.forFeature( [
      ClassContent
    ] ),
    AuthModule,
    CourseClassesModule
  ],
  exports: [ TypeOrmModule ],
} )
export class ClassContentModule { }
