import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { Video } from './entities';
import { AuthModule } from '@/auth';
import { SystemHistory } from '@/system-history';

@Module( {
  controllers: [ VideosController ],
  providers: [ VideosService ],
  imports: [
    TypeOrmModule.forFeature( [
      Video,
      SystemHistory
    ] ),
    AuthModule,
  ],
  exports: [ TypeOrmModule ],
} )
export class VideosModule { }
