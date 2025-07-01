import { Controller, Post, Body, Get, UseGuards, Param, Patch, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUser, Auth } from './decorators';
import { User } from './entities/user.entity';
import { ValidRoles } from './interfaces';

@Controller( 'auth' )
export class AuthController {
  constructor( private readonly authService: AuthService ) { }

  @Post( 'register' )
  createUser( @Body() createUserDto: CreateUserDto ) {
    return this.authService.create( createUserDto );
  }

  @Post( 'login' )
  loginUser( @Body() loginUserDto: LoginUserDto ) {
    return this.authService.login( loginUserDto );
  }

  @Get( 'check-status' )
  @UseGuards( AuthGuard() )
  checkAuthStatus(
    @GetUser() user: User,
  ) {
    return this.authService.checkAuthStatus( user );
  }

  @Get( 'user/:id' )
  @Auth( ValidRoles.admin )
  getUser( @Param( 'id' ) id: string ) {
    return this.authService.getUser( id );
  }

  @Patch( 'user/:id' )
  @Auth( ValidRoles.admin )
  updateUser(
    @Param( 'id' ) id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.authService.update( id, updateUserDto );
  }

  @Delete( 'user/:id' )
  @Auth( ValidRoles.admin )
  removeUser( @Param( 'id' ) id: string ) {
    return this.authService.remove( id );
  }

  @Get( 'users' )
  @Auth( ValidRoles.admin )
  findAllActiveUsers() {
    return this.authService.findAllActive();
  }

  @Post( 'validate-token' )
  validateToken( @Body() body: { token: string; } ) {
    return this.authService.validateToken( body.token );
  }
}