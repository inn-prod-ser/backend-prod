import { Injectable, NotFoundException, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DateTime } from 'luxon';

import { TakenCourse } from './entities';
import { CreateTakenCourseDto, UpdateTakenCourseDto } from './dto';
import { ErrorHandlerInterceptor } from '@/decorators';
import { SystemHistory } from '@/system-history';
import { User, Auth, GetUser } from '@/auth';
import { Course } from '@/courses';

@Injectable()
export class TakenCoursesService {

  constructor(
    @InjectRepository( TakenCourse )
    private readonly takenCourseRepository: Repository<TakenCourse>,

    @InjectRepository( SystemHistory )
    private readonly systemHistoryRepository: Repository<SystemHistory>,

    @InjectRepository( Course )
    private readonly courseRepository: Repository<Course>,
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
  async create( createTakenCourseDto: CreateTakenCourseDto, @GetUser() user: User ): Promise<TakenCourse> {
    const course = await this.courseRepository.findOne( {
      where: { id: createTakenCourseDto.courseId, status: true },
    } );
    if ( !course ) {
      throw new NotFoundException( `El curso con ID "${ createTakenCourseDto.courseId }" no fue encontrado o está inactivo.` );
    }

    const newTakenCourse = this.takenCourseRepository.create( {
      ...createTakenCourseDto,
      course,
      user,
      creationDate: this.getBuenosAiresTime(),
    } );
    const savedTakenCourse = await this.takenCourseRepository.save( newTakenCourse );

    await this.saveHistory(
      'Curso tomado',
      `El curso "${ course.title }" fue tomado por el usuario "${ user.username }".`,
      user,
      savedTakenCourse.id
    );

    return savedTakenCourse;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findAll(): Promise<TakenCourse[]> {
    return await this.takenCourseRepository.find( { relations: [ 'course', 'user' ] } );
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findOne( id: string ): Promise<TakenCourse> {
    const takenCourse = await this.takenCourseRepository.findOne( {
      where: { id, status: true },
      relations: [ 'course', 'user' ]
    } );
    if ( !takenCourse ) {
      throw new NotFoundException( `El curso tomado con ID "${ id }" no fue encontrado o está inactivo.` );
    }
    return takenCourse;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async update( id: string, updateTakenCourseDto: UpdateTakenCourseDto, @GetUser() user: User ): Promise<TakenCourse> {
    const takenCourse = await this.findOne( id );
    const updatedTakenCourse = { ...takenCourse, ...updateTakenCourseDto };
    const savedTakenCourse = await this.takenCourseRepository.save( updatedTakenCourse );

    await this.saveHistory(
      'Curso tomado actualizado',
      `El curso tomado ID "${ id }" fue actualizado por el usuario "${ user.username }".`,
      user,
      savedTakenCourse.id
    );

    return savedTakenCourse;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async remove( id: string, @GetUser() user: User ): Promise<void> {
    const takenCourse = await this.findOne( id );
    await this.takenCourseRepository.remove( takenCourse );

    await this.saveHistory(
      'Curso tomado eliminado',
      `El curso tomado ID "${ id }" fue eliminado por el usuario "${ user.username }".`,
      user,
      id
    );
  }
}