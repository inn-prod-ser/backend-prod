import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/auth';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from './entities';
import { Course } from '@/courses/entities/course.entity';
import { SystemHistory } from '@/system-history';

@Module( {
  controllers: [
    CategoriesController
  ],
  providers: [
    CategoriesService
  ],
  imports: [
    TypeOrmModule.forFeature( [
      Category,
      Course,
      SystemHistory
    ] ),
    AuthModule,
  ],
  exports: [ TypeOrmModule ],
} )
export class CategoriesModule { }
