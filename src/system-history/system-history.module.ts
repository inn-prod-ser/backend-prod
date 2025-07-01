import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/auth';
import { SystemHistory } from './entities';
import { SystemHistoryController } from './system-history.controller';
import { SystemHistoryService } from './system-history.service';


@Module( {
  controllers: [
    SystemHistoryController
  ],
  providers: [
    SystemHistoryService
  ],
  imports: [
    TypeOrmModule.forFeature( [ SystemHistory ] ),
    AuthModule
  ],
  exports: [
    TypeOrmModule
  ]
} )
export class SystemHistoryModule { }
