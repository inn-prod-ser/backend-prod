import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { User, Auth, GetUser } from '@/auth';

import { CourseSectionsService } from './course-sections.service';
import { CreateCourseSectionDto, UpdateCourseSectionDto } from './dto';

@Controller( 'course-sections' )
export class CourseSectionsController {

  constructor(
    private readonly courseSectionsService: CourseSectionsService
  ) { }

  @Auth()
  @Post()
  create( @Body() createCourseSectionDto: CreateCourseSectionDto, @GetUser() user: User ) {
    return this.courseSectionsService.create( createCourseSectionDto, user );
  }

  @Get()
  findAll() {
    return this.courseSectionsService.findAll();
  }

  @Get( ':id' )
  findOne( @Param( 'id' ) id: string ) {
    return this.courseSectionsService.findOne( id );
  }

  @Get( 'course/:courseId' )
  findByCourseId( @Param( 'courseId' ) courseId: string ) {
    return this.courseSectionsService.findByCourseId( courseId );
  }

  @Auth()
  @Patch( ':id' )
  update( @Param( 'id' ) id: string, @Body() updateCourseSectionDto: UpdateCourseSectionDto, @GetUser() user: User ) {
    return this.courseSectionsService.update( id, updateCourseSectionDto, user );
  }

  @Auth()
  @Delete( ':id' )
  remove( @Param( 'id' ) id: string, @GetUser() user: User ) {
    return this.courseSectionsService.remove( id, user );
  }

  @Auth()
  @Patch( 'order/:id' )
  updateOrder( @Param( 'id' ) id: string, @Body( 'positionOrder' ) positionOrder: number, @GetUser() user: User ) {
    return this.courseSectionsService.updateOrder( id, positionOrder, user );
  }
}