import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { Auth, GetUser } from 'src/auth/decorators';
import { CreateSystemHistoryDto, UpdateSystemHistoryDto } from './dto';
import { SystemHistoryService } from './system-history.service';
import { User } from 'src/auth/entities/user.entity';
import { ValidRoles } from 'src/auth/interfaces';


@Controller( 'system-history' )
export class SystemHistoryController {

  constructor(
    private readonly systemHistoryService: SystemHistoryService
  ) { }

  @Auth()
  @Post()
  create( @Body() createSystemHistoryDto: CreateSystemHistoryDto, @GetUser() user: User ) {
    return this.systemHistoryService.create( createSystemHistoryDto, user );
  }

  @Auth()
  @Get()
  findAll() {
    return this.systemHistoryService.findAll();
  }

  @Auth()
  @Get( ':id' )
  findOne( @Param( 'id' ) id: string ) {
    return this.systemHistoryService.findOne( id );
  }

  @Auth()
  @Auth( ValidRoles.admin )
  @Patch( ':id' )
  update(
    @Param( 'id' ) id: string,
    @Body() updateSystemHistoryDto: UpdateSystemHistoryDto,
    @GetUser() user: User
  ) {
    return this.systemHistoryService.update( id, updateSystemHistoryDto, user );
  }

  @Auth()
  @Auth( ValidRoles.admin )
  @Delete( ':id' )
  remove( @Param( 'id' ) id: string, @GetUser() user: User ) {
    return this.systemHistoryService.remove( id, user );
  }
}
