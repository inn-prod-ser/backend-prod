// taken-classes.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/auth';
import { SystemHistory } from '@/system-history';
import { TakenClass } from './entities';
import { TakenClassesController } from './taken-classes.controller';
import { TakenClassesService } from './taken-classes.service';
import { CourseClassesModule } from '@/course-classes/course-classes.module';

@Module( {
  controllers: [
    TakenClassesController
  ],
  providers: [
    TakenClassesService
  ],
  imports: [
    TypeOrmModule.forFeature( [
      TakenClass,
      SystemHistory
    ] ),
    AuthModule,
    CourseClassesModule,
  ],
  exports: [ TypeOrmModule ],
} )
export class TakenClassesModule { }