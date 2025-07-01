import { Injectable, NotFoundException, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DateTime } from 'luxon';

import { CreateCompletedCourseDto, UpdateCompletedCourseDto } from './dto';
import { CompletedCourse } from './entities/completed-course.entity';
import { SystemHistory } from '@/system-history/entities/system-history.entity';
import { User } from '@/auth/entities/user.entity';
import { Course } from '@/courses/entities/course.entity';
import { ErrorHandlerInterceptor } from '@/decorators';

@Injectable()
export class CompletedCoursesService {

  constructor(
    @InjectRepository( CompletedCourse )
    private readonly completedCourseRepository: Repository<CompletedCourse>,

    @InjectRepository( SystemHistory )
    private readonly systemHistoryRepository: Repository<SystemHistory>,

    @InjectRepository( Course )
    private readonly courseRepository: Repository<Course>
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
  async create( createCompletedCourseDto: CreateCompletedCourseDto, user: User ): Promise<CompletedCourse> {
    const course = await this.courseRepository.findOne( {
      where: { id: createCompletedCourseDto.courseId, status: true },
    } );
    if ( !course ) {
      throw new NotFoundException( `El curso con ID "${ createCompletedCourseDto.courseId }" no fue encontrado o está inactivo.` );
    }

    const newCompletedCourse = this.completedCourseRepository.create( {
      ...createCompletedCourseDto,
      course,
      user,
      creationDate: this.getBuenosAiresTime(),
    } );
    const savedCompletedCourse = await this.completedCourseRepository.save( newCompletedCourse );

    await this.saveHistory(
      'Curso completado creado',
      `El curso "${ course.title }" fue marcado como completado por el usuario "${ user.username }".`,
      user,
      savedCompletedCourse.id
    );

    return savedCompletedCourse;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findAll(): Promise<CompletedCourse[]> {
    return await this.completedCourseRepository.find( { relations: [ 'course', 'user' ] } );
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findOne( id: string ): Promise<CompletedCourse> {
    const completedCourse = await this.completedCourseRepository.findOne( {
      where: { id, isActive: true },
      relations: [ 'course', 'user' ]
    } );
    if ( !completedCourse ) {
      throw new NotFoundException( `El curso completado con ID "${ id }" no fue encontrado o está inactivo.` );
    }
    return completedCourse;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async update( id: string, updateCompletedCourseDto: UpdateCompletedCourseDto, user: User ): Promise<CompletedCourse> {
    const completedCourse = await this.findOne( id );
    const updatedCompletedCourse = { ...completedCourse, ...updateCompletedCourseDto };
    const savedCompletedCourse = await this.completedCourseRepository.save( updatedCompletedCourse );

    await this.saveHistory(
      'Curso completado actualizado',
      `El curso completado ID "${ id }" fue actualizado por el usuario "${ user.username }".`,
      user,
      savedCompletedCourse.id
    );

    return savedCompletedCourse;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async remove( id: string, user: User ): Promise<void> {
    const completedCourse = await this.findOne( id );
    await this.completedCourseRepository.remove( completedCourse );

    await this.saveHistory(
      'Curso completado eliminado',
      `El curso completado ID "${ id }" fue eliminado por el usuario "${ user.username }".`,
      user,
      id
    );
  }
}