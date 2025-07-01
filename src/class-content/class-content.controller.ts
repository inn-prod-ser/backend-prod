import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClassContentService } from './class-content.service';
import { CreateClassContentDto, UpdateClassContentDto } from './dto';

import { Auth, GetUser } from '@/auth/decorators';
import { User } from '@/auth/entities/user.entity';
import { ValidRoles } from '@/auth/interfaces';


@Controller( 'class-content' )
export class ClassContentController {
  constructor(
    private readonly classContentService: ClassContentService
  ) { }

  @Auth( ValidRoles.admin )
  @Post()
  create(
    @Body() createClassContentDto: CreateClassContentDto,
    @GetUser() user: User
  ) {
    return this.classContentService.create( createClassContentDto, user );
  }

  @Get()
  findAll() {
    return this.classContentService.findAll();
  }

  @Get( ':id' )
  findOne( @Param( 'id' ) id: string ) {
    return this.classContentService.findOne( id );
  }

  @Auth( ValidRoles.admin )
  @Patch( ':id' )
  update(
    @Param( 'id' ) id: string,
    @Body() updateClassContentDto: UpdateClassContentDto,
    @GetUser() user: User
  ) {
    return this.classContentService.update( id, updateClassContentDto, user );
  }

  @Auth( ValidRoles.admin )
  @Delete( ':id' )
  remove(
    @Param( 'id' ) id: string,
    @GetUser() user: User
  ) {
    return this.classContentService.remove( id, user );
  }

  @Auth( ValidRoles.admin )
  @Get( 'by-class/:courseClassId' )
  findAllByCourseClassId( @Param( 'courseClassId' ) courseClassId: string ) {
    return this.classContentService.findAllByCourseClassId( courseClassId );
  }
}