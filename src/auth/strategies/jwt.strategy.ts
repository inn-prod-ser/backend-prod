import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { JwtUserPayload } from '../interfaces/jwt-user-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {

  constructor(
    @InjectRepository( User )
    private readonly userRepository: Repository<User>,

    configService: ConfigService
  ) {
    super( {
      secretOrKey: configService.get( 'JWT_SECRET' ),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    } );
  }

  async validate( payload: JwtPayload | JwtUserPayload ): Promise<User> {
    try {
      let user: User | null = null;

      if ( 'id' in payload && !( 'firstName' in payload ) ) {
        user = await this.userRepository.findOneBy( { id: payload.id } );
      }
      
      else if ( 'id' in payload && 'firstName' in payload ) {
        user = await this.userRepository.findOneBy( { clerkId: payload.id } );
      }

      if ( !user )
        throw new UnauthorizedException( 'Token not valid' );

      if ( !user.isActive )
        throw new UnauthorizedException( 'User is inactive, talk with an admin' );

      return user;
    } catch ( error ) {
      console.error( 'JWT validation error:', error );
      throw new UnauthorizedException( 'Token validation failed' );
    }
  }
}