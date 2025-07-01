import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { Auth, GetUser, User } from '@/auth';

import { PurchasedCoursesService } from './purchased-courses.service';
import { CreatePurchasedCourseDto, UpdatePurchasedCourseDto } from './dto';


@Controller('purchased-courses')
export class PurchasedCoursesController {

  constructor(
    private readonly purchasedCoursesService: PurchasedCoursesService
  ) {}

  @Auth()
  @Post()
  create(@Body() createPurchasedCourseDto: CreatePurchasedCourseDto, @GetUser() user: User) {
    return this.purchasedCoursesService.create(createPurchasedCourseDto, user);
  }

  @Get()
  findAll() {
    return this.purchasedCoursesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchasedCoursesService.findOne(id);
  }

  @Auth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePurchasedCourseDto: UpdatePurchasedCourseDto, @GetUser() user: User) {
    return this.purchasedCoursesService.update(id, updatePurchasedCourseDto, user);
  }

  @Auth()
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.purchasedCoursesService.remove(id, user);
  }
}