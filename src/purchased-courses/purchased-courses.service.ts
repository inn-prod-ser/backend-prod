import { Injectable, NotFoundException, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DateTime } from 'luxon';

import { PurchasedCourse } from './entities';
import { CreatePurchasedCourseDto, UpdatePurchasedCourseDto } from './dto';
import { ErrorHandlerInterceptor } from '@/decorators';
import { SystemHistory } from '@/system-history';
import { User, Auth, GetUser } from '@/auth';
import { Course } from '@/courses';

@Injectable()
export class PurchasedCoursesService {

  constructor(
    @InjectRepository( PurchasedCourse )
    private readonly purchasedCourseRepository: Repository<PurchasedCourse>,

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
  async create( createPurchasedCourseDto: CreatePurchasedCourseDto, @GetUser() user: User ): Promise<PurchasedCourse> {
    const course = await this.courseRepository.findOne( {
      where: { id: createPurchasedCourseDto.courseId, status: true },
    } );
    if ( !course ) {
      throw new NotFoundException( `El curso con ID "${ createPurchasedCourseDto.courseId }" no fue encontrado o está inactivo.` );
    }

    const newPurchasedCourse = this.purchasedCourseRepository.create( {
      ...createPurchasedCourseDto,
      course,
      user,
      creationDate: this.getBuenosAiresTime(),
    } );
    const savedPurchasedCourse = await this.purchasedCourseRepository.save( newPurchasedCourse );

    await this.saveHistory(
      'Curso comprado',
      `El curso "${ course.title }" fue comprado por el usuario "${ user.username }".`,
      user,
      savedPurchasedCourse.id
    );

    return savedPurchasedCourse;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findAll(): Promise<PurchasedCourse[]> {
    return await this.purchasedCourseRepository.find( { relations: [ 'course', 'user' ] } );
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findOne( id: string ): Promise<PurchasedCourse> {
    const purchasedCourse = await this.purchasedCourseRepository.findOne( {
      where: { id, status: true },
      relations: [ 'course', 'user' ]
    } );
    if ( !purchasedCourse ) {
      throw new NotFoundException( `El curso comprado con ID "${ id }" no fue encontrado o está inactivo.` );
    }
    return purchasedCourse;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async update( id: string, updatePurchasedCourseDto: UpdatePurchasedCourseDto, @GetUser() user: User ): Promise<PurchasedCourse> {
    const purchasedCourse = await this.findOne( id );
    const updatedPurchasedCourse = { ...purchasedCourse, ...updatePurchasedCourseDto };
    const savedPurchasedCourse = await this.purchasedCourseRepository.save( updatedPurchasedCourse );

    await this.saveHistory(
      'Curso comprado actualizado',
      `El curso comprado ID "${ id }" fue actualizado por el usuario "${ user.username }".`,
      user,
      savedPurchasedCourse.id
    );

    return savedPurchasedCourse;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async remove( id: string, @GetUser() user: User ): Promise<void> {
    const purchasedCourse = await this.findOne( id );
    await this.purchasedCourseRepository.remove( purchasedCourse );

    await this.saveHistory(
      'Curso comprado eliminado',
      `El curso comprado ID "${ id }" fue eliminado por el usuario "${ user.username }".`,
      user,
      id
    );
  }
}