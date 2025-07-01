import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { Auth, GetUser, User } from '@/auth';

import { TakenCoursesService } from './taken-courses.service';
import { CreateTakenCourseDto, UpdateTakenCourseDto } from './dto';

@Controller( 'taken-courses' )
export class TakenCoursesController {

  constructor(
    private readonly takenCoursesService: TakenCoursesService
  ) { }

  @Auth()
  @Post()
  create( @Body() createTakenCourseDto: CreateTakenCourseDto, @GetUser() user: User ) {
    return this.takenCoursesService.create( createTakenCourseDto, user );
  }

  @Get()
  findAll() {
    return this.takenCoursesService.findAll();
  }

  @Get( ':id' )
  findOne( @Param( 'id' ) id: string ) {
    return this.takenCoursesService.findOne( id );
  }

  @Auth()
  @Patch( ':id' )
  update( @Param( 'id' ) id: string, @Body() updateTakenCourseDto: UpdateTakenCourseDto, @GetUser() user: User ) {
    return this.takenCoursesService.update( id, updateTakenCourseDto, user );
  }

  @Auth()
  @Delete( ':id' )
  remove( @Param( 'id' ) id: string, @GetUser() user: User ) {
    return this.takenCoursesService.remove( id, user );
  }
}