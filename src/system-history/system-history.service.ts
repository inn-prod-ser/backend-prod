import { Injectable, NotFoundException, BadRequestException, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DateTime } from 'luxon';

import { SystemHistory } from './entities/system-history.entity';
import { CreateSystemHistoryDto, UpdateSystemHistoryDto } from './dto';
import { User } from 'src/auth/entities/user.entity';
import { ErrorHandlerInterceptor } from 'src/decorators';


@Injectable()
export class SystemHistoryService {

  constructor(
    @InjectRepository( SystemHistory )
    private readonly systemHistoryRepository: Repository<SystemHistory>
  ) { }

  private getBuenosAiresTime(): string {
    return DateTime.now()
      .setZone( 'America/Argentina/Buenos_Aires' )
      .toFormat( 'dd/MM/yyyy HH:mm:ss' );
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async create( createSystemHistoryDto: CreateSystemHistoryDto, user: User ): Promise<SystemHistory> {
    if ( !user ) {
      throw new BadRequestException( 'User is required to create a system history entry.' );
    }
    const history = this.systemHistoryRepository.create( {
      ...createSystemHistoryDto,
      createdBy: user,
      creationDate: this.getBuenosAiresTime(),
    } );
    return this.systemHistoryRepository.save( history );
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findAll(): Promise<SystemHistory[]> {
    return this.systemHistoryRepository.find( { where: { isActive: true } } );
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findOne( id: string ): Promise<SystemHistory> {
    const history = await this.systemHistoryRepository.findOne( {
      where: { id, isActive: true },
    } );
    if ( !history ) {
      throw new NotFoundException( `SystemHistory entry with ID "${ id }" not found or inactive.` );
    }
    return history;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async update(
    id: string,
    updateSystemHistoryDto: UpdateSystemHistoryDto,
    user: User
  ): Promise<SystemHistory> {
    const history = await this.findOne( id );
    history.title = updateSystemHistoryDto.title || history.title;
    history.description = updateSystemHistoryDto.description || history.description;
    history.createdBy = user;
    history.creationDate = this.getBuenosAiresTime();
    return this.systemHistoryRepository.save( history );
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async remove( id: string, user: User ): Promise<void> {
    const history = await this.findOne( id );
    history.isActive = false;
    history.createdBy = user;
    await this.systemHistoryRepository.save( history );
  }
}
