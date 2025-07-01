import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { VideosService } from './videos.service';
import { CreateVideoDto, UpdateVideoDto } from './dto';
import { Auth, GetUser } from '@/auth';
import { User } from '@/auth';

@Controller( 'videos' )
export class VideosController {
  constructor( private readonly videosService: VideosService ) { }

  @Auth()
  @Post()
  create( @Body() createVideoDto: CreateVideoDto, @GetUser() user: User ) {
    return this.videosService.create( createVideoDto, user );
  }

  @Get()
  findAll() {
    return this.videosService.findAll();
  }

  @Get( ':id' )
  findOne( @Param( 'id' ) id: string ) {
    return this.videosService.findOne( id );
  }

  @Auth()
  @Patch( ':id' )
  update( @Param( 'id' ) id: string, @Body() updateVideoDto: UpdateVideoDto, @GetUser() user: User ) {
    return this.videosService.update( id, updateVideoDto, user );
  }

  @Auth()
  @Delete( ':id' )
  remove( @Param( 'id' ) id: string, @GetUser() user: User ) {
    return this.videosService.remove( id, user );
  }
}
