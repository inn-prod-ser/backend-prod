import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { Auth, GetUser } from '@/auth/decorators';
import { User } from '@/auth/entities/user.entity';

import { CompletedCoursesService } from './completed-courses.service';
import { CreateCompletedCourseDto, UpdateCompletedCourseDto } from './dto';

@Controller('completed-courses')
export class CompletedCoursesController {

  constructor(
    private readonly completedCoursesService: CompletedCoursesService
  ) {}

  @Auth()
  @Post()
  create(@Body() createCompletedCourseDto: CreateCompletedCourseDto, @GetUser() user: User) {
    return this.completedCoursesService.create(createCompletedCourseDto, user);
  }

  @Get()
  findAll() {
    return this.completedCoursesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.completedCoursesService.findOne(id);
  }

  @Auth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompletedCourseDto: UpdateCompletedCourseDto, @GetUser() user: User) {
    return this.completedCoursesService.update(id, updateCompletedCourseDto, user);
  }

  @Auth()
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.completedCoursesService.remove(id, user);
  }
}