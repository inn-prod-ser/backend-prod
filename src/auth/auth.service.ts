import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DateTime } from 'luxon';
import * as bcrypt from 'bcryptjs';

import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtUserPayload } from './interfaces/jwt-user-payload.interface';
import { LoginUserDto, CreateUserDto } from './dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { SystemHistory } from '../system-history/entities/system-history.entity';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository( User )
    private readonly userRepository: Repository<User>,

    @InjectRepository( SystemHistory )
    private readonly systemHistoryRepository: Repository<SystemHistory>,

    private readonly jwtService: JwtService,
  ) { }

  private getBuenosAiresTime(): string {
    return DateTime.now()
      .setZone( 'America/Argentina/Buenos_Aires' )
      .toFormat( 'dd/MM/yyyy HH:mm:ss' );
  }

  private async saveHistory(
    title: string,
    description: string,
    user: User,
    idRegister: string
  ): Promise<void> {
    try {
      const sanitizedDescription = description
        .normalize( 'NFD' )
        .replace( /[\u0300-\u036f]/g, '' )
        .replace( /[^\x00-\x7F]/g, '' );

      const historyEntry = this.systemHistoryRepository.create( {
        title,
        description: sanitizedDescription,
        createdBy: user,
        creationDate: this.getBuenosAiresTime(),
        idRegister,
      } );

      await this.systemHistoryRepository.save( historyEntry );
    } catch ( error ) {
      console.error( 'Error saving history:', error );
    }
  }

  async create( createUserDto: CreateUserDto ) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create( {
        ...userData,
        password: bcrypt.hashSync( password, 10 ),
        creationDate: this.getBuenosAiresTime()
      } );

      const savedUser = await this.userRepository.save( user );

      await this.saveHistory(
        'Creacion de usuario',
        `El usuario "${ savedUser.username }" fue creado.`,
        savedUser,
        savedUser.id
      );

      delete savedUser.password;
      return {
        ...savedUser,
        token: this.getJwtToken( { id: savedUser.id } )
      };
    } catch ( error ) {
      this.handleDBErrors( error );
    }
  }

  async login( loginUserDto: LoginUserDto ) {
    const { password, username } = loginUserDto;
    const user = await this.userRepository.findOne( {
      where: { username },
      select: {
        id: true,
        name: true,
        lastName: true,
        username: true,
        password: true,
        roles: true,
        lastActivity: true,
        isActive: true
      }
    } );

    if ( !user )
      throw new UnauthorizedException( 'Credentials are not valid (email)' );

    if ( !bcrypt.compareSync( password, user.password ) )
      throw new UnauthorizedException( 'Credentials are not valid (password)' );

    user.lastActivity = this.getBuenosAiresTime();
    await this.userRepository.save( user );

    await this.saveHistory(
      'Inicio de sesion',
      `El usuario "${ user.username }" ha iniciado sesion.`,
      user,
      user.id
    );

    delete user.password;

    return {
      user: { ...user },
      token: this.getJwtToken( { id: user.id } )
    };
  }

  async checkAuthStatus( user: User ) {
    return {
      ...user,
      token: this.getJwtToken( { id: user.id } )
    };
  }

  async getUser( id: string ) {
    const user = await this.userRepository.findOne( {
      where: { id },
      select: {
        id: true,
        name: true,
        lastName: true,
        username: true,
        phone: true,
        roles: true,
        lastActivity: true,
        isActive: true,
      }
    } );

    if ( !user )
      throw new NotFoundException( `User with id ${ id } not found` );

    return user;
  }

  async update( id: string, updateUserDto: UpdateUserDto ) {
    const user = await this.userRepository.preload( {
      id: id,
      ...updateUserDto
    } );

    if ( !user ) throw new NotFoundException( `User with id ${ id } not found` );

    try {
      const updatedUser = await this.userRepository.save( user );

      await this.saveHistory(
        'Actualizacion de usuario',
        `El usuario "${ updatedUser.username }" fue actualizado.`,
        updatedUser,
        updatedUser.id
      );

      return updatedUser;
    } catch ( error ) {
      this.handleDBErrors( error );
    }
  }

  async findAllActive() {
    return this.userRepository.find( {
      where: { isActive: true }
    } );
  }

  async remove( id: string ) {
    const user = await this.userRepository.findOne( { where: { id } } );
    if ( !user ) throw new NotFoundException( `User with id ${ id } not found` );

    user.isActive = false;
    const deactivatedUser = await this.userRepository.save( user );

    await this.saveHistory(
      'Desactivacion de usuario',
      `El usuario "${ deactivatedUser.username }" fue desactivado.`,
      deactivatedUser,
      deactivatedUser.id
    );

    return deactivatedUser;
  }

  async validateToken( token: string ) {
    try {
      const payload = this.jwtService.verify( token, {
        secret: process.env.JWT_SECRET
      } );

      if ( !payload || !payload.id ) {
        throw new UnauthorizedException( 'Invalid token structure' );
      }

      let user = await this.userRepository.findOne( {
        where: { clerkId: payload.id },
        select: {
          id: true,
          name: true,
          lastName: true,
          username: true,
          roles: true,
          lastActivity: true,
          isActive: true,
          clerkId: true,
          phone: true
        }
      } );

      if ( !user ) {
        const randomPassword = Math.random().toString( 36 ).slice( -8 );

        const userEmail = payload.email || `user_${ payload.id.slice( -8 ) }@example.com`;

        const newUser = this.userRepository.create( {
          clerkId: payload.id,
          username: userEmail,
          name: payload.firstName || 'User',
          lastName: payload.lastName || '',
          password: bcrypt.hashSync( randomPassword, 10 ),
          roles: [ 'user' ],
          creationDate: this.getBuenosAiresTime(),
          isActive: true
        } );

        const savedUser = await this.userRepository.save( newUser );

        user = await this.userRepository.findOne( {
          where: { id: savedUser.id },
          select: {
            id: true,
            name: true,
            lastName: true,
            username: true,
            roles: true,
            lastActivity: true,
            isActive: true,
            clerkId: true,
            phone: true,
            creationDate: true
          }
        } );

        await this.saveHistory(
          'Creacion de usuario por Clerk',
          `El usuario "${ user.username }" fue creado automaticamente desde Clerk.`,
          user,
          user.id
        );
      } else if ( !user.isActive ) {
        throw new UnauthorizedException( 'User is inactive' );
      }

      user.lastActivity = this.getBuenosAiresTime();
      await this.userRepository.save( user );

      await this.saveHistory(
        'Inicio de sesion con Clerk',
        `El usuario "${ user.username }" ha iniciado sesion mediante Clerk.`,
        user,
        user.id
      );

      const userPayload: JwtUserPayload = {
        id: payload.id,
        firstName: payload.firstName || user.name,
        lastName: payload.lastName || user.lastName,
        email: payload.email || user.username
      };

      return {
        user: { ...user },
        token: this.getJwtUserToken( userPayload, '24h' )
      };
    } catch ( error ) {
      console.error( 'Token validation error:', error );
      return {
        isValid: false,
        message: 'Invalid token',
        error: error.message
      };
    }
  }

  private getJwtToken( payload: JwtPayload, expiresIn: string = '4h' ) {
    const token = this.jwtService.sign( payload, { expiresIn } );
    return token;
  }

  private getJwtUserToken( payload: JwtUserPayload, expiresIn: string = '4h' ) {
    const token = this.jwtService.sign(
      {
        id: payload.id,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email
      },
      { expiresIn }
    );
    return token;
  }

  private handleDBErrors( error: any ): never {
    if ( error.code === '23505' )
      throw new BadRequestException( error.detail );

    console.log( error );

    throw new InternalServerErrorException( 'Please check server logs' );
  }
}