// purchased-courses.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/auth';
import { PurchasedCourse } from './entities';
import { PurchasedCoursesController } from './purchased-courses.controller';
import { PurchasedCoursesService } from './purchased-courses.service';
import { SystemHistory } from '@/system-history';
import { CoursesModule } from '@/courses/courses.module';

@Module({
  controllers: [
    PurchasedCoursesController
  ],
  providers: [
    PurchasedCoursesService
  ],
  imports: [
    TypeOrmModule.forFeature([
      PurchasedCourse,
      SystemHistory
    ]),
    AuthModule,
    CoursesModule,
  ],
  exports: [TypeOrmModule],
})
export class PurchasedCoursesModule {}