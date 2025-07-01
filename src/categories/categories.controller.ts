import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { Auth, GetUser } from '@/auth/decorators';
import { User } from '@/auth/entities/user.entity';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Controller( 'categories' )
export class CategoriesController {

  constructor(
    private readonly categoriesService: CategoriesService
  ) { }

  @Get( 'public/with-courses' )
  findAllVisibleWithCourses() {
    return this.categoriesService.findAllVisibleWithCourses();
  }

  @Auth()
  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @GetUser() user: User
  ) {
    return this.categoriesService.create( createCategoryDto, user );
  }

  @Auth()
  @Get()
  findAll(
    @GetUser() user: User
  ) {
    return this.categoriesService.findAll( user );
  }

  @Auth()
  @Get( ':id' )
  findOne(
    @Param( 'id' ) id: string,
    @GetUser() user: User
  ) {
    return this.categoriesService.findOne( id, user );
  }

  @Auth()
  @Patch( ':id' )
  update(
    @Param( 'id' ) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @GetUser() user: User
  ) {
    return this.categoriesService.update( id, updateCategoryDto, user );
  }

  @Auth()
  @Delete( ':id' )
  remove(
    @Param( 'id' ) id: string,
    @GetUser() user: User
  ) {
    return this.categoriesService.remove( id, user );
  }
}
