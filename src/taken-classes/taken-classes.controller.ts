import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { Auth, GetUser, User } from '@/auth';

import { TakenClassesService } from './taken-classes.service';
import { CreateTakenClassDto, UpdateTakenClassDto } from './dto';

@Controller('taken-classes')
export class TakenClassesController {
  constructor(private readonly takenClassesService: TakenClassesService) {}

  @Auth()
  @Post()
  create(@Body() createTakenClassDto: CreateTakenClassDto, @GetUser() user: User) {
    return this.takenClassesService.create(createTakenClassDto, user);
  }

  @Get()
  findAll() {
    return this.takenClassesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.takenClassesService.findOne(id);
  }

  @Auth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTakenClassDto: UpdateTakenClassDto, @GetUser() user: User) {
    return this.takenClassesService.update(id, updateTakenClassDto, user);
  }

  @Auth()
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.takenClassesService.remove(id, user);
  }
}