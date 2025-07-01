import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { User, Auth, GetUser } from '@/auth';

import { CourseCertificatesService } from './course-certificates.service';
import { CreateCourseCertificateDto, UpdateCourseCertificateDto } from './dto';



@Controller( 'course-certificates' )
export class CourseCertificatesController {

  constructor(
    private readonly courseCertificatesService: CourseCertificatesService
  ) { }

  @Auth()
  @Post()
  create( @Body() createCourseCertificateDto: CreateCourseCertificateDto, @GetUser() user: User ) {
    return this.courseCertificatesService.create( createCourseCertificateDto, user );
  }

  @Get()
  findAll() {
    return this.courseCertificatesService.findAll();
  }

  @Get( ':id' )
  findOne( @Param( 'id' ) id: string ) {
    return this.courseCertificatesService.findOne( id );
  }

  @Auth()
  @Patch( ':id' )
  update( @Param( 'id' ) id: string, @Body() updateCourseCertificateDto: UpdateCourseCertificateDto, @GetUser() user: User ) {
    return this.courseCertificatesService.update( id, updateCourseCertificateDto, user );
  }

  @Auth()
  @Delete( ':id' )
  remove( @Param( 'id' ) id: string, @GetUser() user: User ) {
    return this.courseCertificatesService.remove( id, user );
  }
}