import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { Auth } from '@/auth';
import { CourseInstructorsService } from './course-instructors.service';
import { CreateCourseInstructorDto, UpdateCourseInstructorDto } from './dto';

@Controller( 'course-instructors' )
export class CourseInstructorsController {

  constructor(
    private readonly courseInstructorsService: CourseInstructorsService
  ) { }

  @Auth()
  @Post()
  create( @Body() createCourseInstructorDto: CreateCourseInstructorDto ) {
    return this.courseInstructorsService.create( createCourseInstructorDto );
  }

  @Auth()
  @Post( ':courseId/add/:instructorId' )
  addInstructorToCourse(
    @Param( 'courseId' ) courseId: string,
    @Param( 'instructorId' ) instructorId: string
  ) {
    return this.courseInstructorsService.addInstructorToCourse( courseId, instructorId );
  }

  @Auth()
  @Delete( ':courseId/remove/:instructorId' )
  removeInstructorFromCourse(
    @Param( 'courseId' ) courseId: string,
    @Param( 'instructorId' ) instructorId: string
  ) {
    return this.courseInstructorsService.removeInstructorFromCourse( courseId, instructorId );
  }

  @Auth()
  @Get()
  findAll() {
    return this.courseInstructorsService.findAll();
  }

  @Auth()
  @Get( ':id' )
  findOne( @Param( 'id' ) id: string ) {
    return this.courseInstructorsService.findOne( id );
  }

  @Auth()
  @Get( 'by-course/:courseId' )
  getInstructorsByCourseId( @Param( 'courseId' ) courseId: string ) {
    return this.courseInstructorsService.getInstructorsByCourseId( courseId );
  }

  @Auth()
  @Patch( ':id' )
  update(
    @Param( 'id' ) id: string,
    @Body() updateCourseInstructorDto: UpdateCourseInstructorDto
  ) {
    return this.courseInstructorsService.update( id, updateCourseInstructorDto );
  }

  @Auth()
  @Post( 'set-to-course/:courseId' )
  setInstructorsToCourse(
    @Param( 'courseId' ) courseId: string,
    @Body( 'instructorIds' ) instructorIds: string[]
  ) {
    return this.courseInstructorsService.setInstructorsToCourse( courseId, instructorIds );
  }

  @Auth()
  @Delete( ':id' )
  remove( @Param( 'id' ) id: string ) {
    return this.courseInstructorsService.remove( id );
  }

}
