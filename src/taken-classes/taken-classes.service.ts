import { Injectable, NotFoundException, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DateTime } from 'luxon';

import { TakenClass } from './entities';
import { CreateTakenClassDto, UpdateTakenClassDto } from './dto';
import { ErrorHandlerInterceptor } from '@/decorators';
import { SystemHistory } from '@/system-history';
import { User, Auth, GetUser } from '@/auth';
import { CourseClass } from '@/course-classes';

@Injectable()
export class TakenClassesService {

  constructor(
    @InjectRepository( TakenClass )
    private readonly takenClassRepository: Repository<TakenClass>,

    @InjectRepository( SystemHistory )
    private readonly systemHistoryRepository: Repository<SystemHistory>,

    @InjectRepository( CourseClass )
    private readonly courseClassRepository: Repository<CourseClass>,
  ) { }

  private getBuenosAiresTime(): string {
    return DateTime.now().setZone( 'America/Argentina/Buenos_Aires' ).toFormat( 'dd/MM/yyyy HH:mm:ss' );
  }

  private async saveHistory( title: string, description: string, user: User, idRegister: string ): Promise<void> {
    const historyEntry = this.systemHistoryRepository.create( {
      createdBy: user,
      creationDate: this.getBuenosAiresTime(),
      description,
      idRegister,
      title,
    } );
    await this.systemHistoryRepository.save( historyEntry );
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async create( createTakenClassDto: CreateTakenClassDto, @GetUser() user: User ): Promise<TakenClass> {
    const courseClass = await this.courseClassRepository.findOne( {
      where: { id: createTakenClassDto.courseClassId, status: true },
    } );
    if ( !courseClass ) {
      throw new NotFoundException( `La clase de curso con ID "${ createTakenClassDto.courseClassId }" no fue encontrada o está inactiva.` );
    }

    const newTakenClass = this.takenClassRepository.create( {
      ...createTakenClassDto,
      courseClass,
      user,
      creationDate: this.getBuenosAiresTime(),
    } );
    const savedTakenClass = await this.takenClassRepository.save( newTakenClass );

    await this.saveHistory(
      'Clase tomada',
      `La clase "${ courseClass.title }" fue tomada por el usuario "${ user.username }".`,
      user,
      savedTakenClass.id
    );

    return savedTakenClass;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findAll(): Promise<TakenClass[]> {
    return await this.takenClassRepository.find( { relations: [ 'courseClass', 'user' ] } );
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findOne( id: string ): Promise<TakenClass> {
    const takenClass = await this.takenClassRepository.findOne( {
      where: { id, status: true },
      relations: [ 'courseClass', 'user' ]
    } );
    if ( !takenClass ) {
      throw new NotFoundException( `La clase tomada con ID "${ id }" no fue encontrada o está inactiva.` );
    }
    return takenClass;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async update( id: string, updateTakenClassDto: UpdateTakenClassDto, @GetUser() user: User ): Promise<TakenClass> {
    const takenClass = await this.findOne( id );
    const updatedTakenClass = { ...takenClass, ...updateTakenClassDto };
    const savedTakenClass = await this.takenClassRepository.save( updatedTakenClass );

    await this.saveHistory(
      'Clase tomada actualizada',
      `La clase tomada ID "${ id }" fue actualizada por el usuario "${ user.username }".`,
      user,
      savedTakenClass.id
    );

    return savedTakenClass;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async remove( id: string, @GetUser() user: User ): Promise<void> {
    const takenClass = await this.findOne( id );
    await this.takenClassRepository.remove( takenClass );

    await this.saveHistory(
      'Clase tomada eliminada',
      `La clase tomada ID "${ id }" fue eliminada por el usuario "${ user.username }".`,
      user,
      id
    );
  }
}