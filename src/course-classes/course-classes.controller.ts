import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { User, Auth, GetUser } from '@/auth';

import { CourseClassesService } from './course-classes.service';
import { CreateCourseClassDto, UpdateCourseClassDto } from './dto';



@Controller( 'course-classes' )
export class CourseClassesController {

  constructor(
    private readonly courseClassesService: CourseClassesService
  ) { }

  @Auth()
  @Post()
  create( @Body() createCourseClassDto: CreateCourseClassDto, @GetUser() user: User ) {
    return this.courseClassesService.create( createCourseClassDto, user );
  }

  @Get()
  findAll() {
    return this.courseClassesService.findAll();
  }

  @Get( ':id' )
  findOne( @Param( 'id' ) id: string ) {
    return this.courseClassesService.findOne( id );
  }

  @Get( 'section/:sectionId' )
  findBySection( @Param( 'sectionId' ) sectionId: string ) {
    return this.courseClassesService.findBySection( sectionId );
  }

  @Auth()
  @Patch( ':id' )
  update( @Param( 'id' ) id: string, @Body() updateCourseClassDto: UpdateCourseClassDto, @GetUser() user: User ) {
    return this.courseClassesService.update( id, updateCourseClassDto, user );
  }

  @Auth()
  @Delete( ':id' )
  remove( @Param( 'id' ) id: string, @GetUser() user: User ) {
    return this.courseClassesService.remove( id, user );
  }

  @Auth()
  @Patch( 'order/:id' )
  updateOrder( @Param( 'id' ) id: string, @Body( 'positionOrder' ) positionOrder: number, @GetUser() user: User ) {
    return this.courseClassesService.updateOrder( id, positionOrder, user );
  }
}