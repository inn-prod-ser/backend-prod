import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { Auth, GetUser } from '@/auth';
import { ClassResourcesService } from './class-resources.service';
import { CreateClassResourceDto, UpdateClassResourceDto } from './dto';

@Controller( 'class-resources' )
export class ClassResourcesController {
  constructor(
    private readonly classResourcesService: ClassResourcesService
  ) { }

  @Auth()
  @Post()
  create(
    @Body() createClassResourceDto: CreateClassResourceDto,
    @GetUser() user
  ) {
    return this.classResourcesService.create( createClassResourceDto, user );
  }

  @Get()
  findAll() {
    return this.classResourcesService.findAll();
  }

  @Get( ':id' )
  findOne( @Param( 'id' ) id: string ) {
    return this.classResourcesService.findOne( id );
  }

  @Auth()
  @Patch( ':id' )
  update(
    @Param( 'id' ) id: string,
    @Body() updateClassResourceDto: UpdateClassResourceDto,
    @GetUser() user
  ) {
    return this.classResourcesService.update( id, updateClassResourceDto, user );
  }

  @Auth()
  @Delete( ':id' )
  remove(
    @Param( 'id' ) id: string,
    @GetUser() user
  ) {
    return this.classResourcesService.remove( id, user );
  }
}