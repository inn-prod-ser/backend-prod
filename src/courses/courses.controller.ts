import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { Auth, GetUser, User } from '@/auth';

import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';

@Controller( 'courses' )
export class CoursesController {

  constructor(
    private readonly coursesService: CoursesService
  ) { }

  @Get( 'public/all' )
  findAllPublic() {
    return this.coursesService.findAllPublic();
  }

  @Get( 'public/slug/:slug' )
  findOnePublicBySlug( @Param( 'slug' ) slug: string ) {
    return this.coursesService.findOnePublicBySlug( slug );
  }

  @Get( 'public/category/:categorySlug' )
  findPublicCoursesByCategory( @Param( 'categorySlug' ) categorySlug: string ) {
    return this.coursesService.findPublicCoursesByCategory( categorySlug );
  }

  @Get( 'public/search/:query' )
  searchPublicCourses( @Param( 'query' ) query: string ) {
    return this.coursesService.searchPublicCourses( query );
  }

  @Auth()
  @Post()
  create( @Body() createCourseDto: CreateCourseDto, @GetUser() user: User ) {
    return this.coursesService.create( createCourseDto, user );
  }

  @Auth()
  @Get()
  findAll( @GetUser() user: User ) {
    return this.coursesService.findAll( user );
  }

  @Auth()
  @Get( ':id' )
  findOne( @Param( 'id' ) id: string, @GetUser() user: User ) {
    return this.coursesService.findOne( id, user );
  }

  @Auth()
  @Get( 'slug/:slug' )
  findBySlug( @Param( 'slug' ) slug: string, @GetUser() user: User ) {
    return this.coursesService.findBySlug( slug, user );
  }

  @Auth()
  @Get( 'category/:categorySlug' )
  findCoursesByCategory( @Param( 'categorySlug' ) categorySlug: string, @GetUser() user: User ) {
    return this.coursesService.findCoursesByCategory( categorySlug, user );
  }

  @Auth()
  @Patch( ':id' )
  update( @Param( 'id' ) id: string, @Body() updateCourseDto: UpdateCourseDto, @GetUser() user: User ) {
    return this.coursesService.update( id, updateCourseDto, user );
  }

  @Auth()
  @Delete( ':id' )
  remove( @Param( 'id' ) id: string, @GetUser() user: User ) {
    return this.coursesService.remove( id, user );
  }

  @Auth()
  @Patch( 'toggle-public/:id' )
  togglePublicStatus( @Param( 'id' ) id: string, @GetUser() user: User ) {
    return this.coursesService.togglePublicStatus( id, user );
  }

  @Auth()
  @Patch( 'toggle-under-construction/:id' )
  toggleCourseUnderConstructionStatus( @Param( 'id' ) id: string, @GetUser() user: User ) {
    return this.coursesService.toggleCourseUnderConstructionStatus( id, user );
  }


  @Auth()
  @Get( ':id/instructors' )
  getInstructorsOfCourse( @Param( 'id' ) id: string ) {
    return this.coursesService.getInstructorsOfCourse( id );
  }
}
