import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClassResourcesService } from './class-resources.service';
import { ClassResourcesController } from './class-resources.controller';
import { AuthModule } from '@/auth';
import { SystemHistory } from '@/system-history';
import { ClassResource } from './entities';


@Module( {
  controllers: [
    ClassResourcesController
  ],
  providers: [
    ClassResourcesService
  ],
  imports: [
    TypeOrmModule.forFeature( [
      ClassResource,
      SystemHistory
    ] ),
    AuthModule,
  ],
  exports: [ TypeOrmModule ],
} )
export class ClassResourcesModule { }
