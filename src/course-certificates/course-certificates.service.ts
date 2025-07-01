import { Injectable, NotFoundException, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DateTime } from 'luxon';

import { Course } from '@/courses';
import { CourseCertificate } from './entities';
import { CreateCourseCertificateDto, UpdateCourseCertificateDto } from './dto';
import { ErrorHandlerInterceptor } from '@/decorators';
import { SystemHistory } from '@/system-history';
import { User } from '@/auth';

@Injectable()
export class CourseCertificatesService {

  constructor(
    @InjectRepository( CourseCertificate )
    private readonly courseCertificateRepository: Repository<CourseCertificate>,

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
  async create( createCourseCertificateDto: CreateCourseCertificateDto, user: User ): Promise<CourseCertificate> {
    const course = await this.courseRepository.findOne( {
      where: { id: createCourseCertificateDto.courseId, status: true },
    } );
    if ( !course ) {
      throw new NotFoundException( `El curso con ID "${ createCourseCertificateDto.courseId }" no fue encontrado o está inactivo.` );
    }

    const newCourseCertificate = this.courseCertificateRepository.create( {
      ...createCourseCertificateDto,
      course,
      user,
      creationDate: this.getBuenosAiresTime(),
    } );
    const savedCourseCertificate = await this.courseCertificateRepository.save( newCourseCertificate );

    await this.saveHistory(
      'Certificado de curso creado',
      `Un certificado de curso para "${ course.title }" fue creado por el usuario "${ user.username }".`,
      user,
      savedCourseCertificate.id
    );

    return savedCourseCertificate;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findAll(): Promise<CourseCertificate[]> {
    return await this.courseCertificateRepository.find( { relations: [ 'course', 'user' ] } );
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findOne( id: string ): Promise<CourseCertificate> {
    const courseCertificate = await this.courseCertificateRepository.findOne( {
      where: { id, isActive: true },
      relations: [ 'course', 'user' ]
    } );
    if ( !courseCertificate ) {
      throw new NotFoundException( `El certificado de curso con ID "${ id }" no fue encontrado o está inactivo.` );
    }
    return courseCertificate;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async update( id: string, updateCourseCertificateDto: UpdateCourseCertificateDto, user: User ): Promise<CourseCertificate> {
    const courseCertificate = await this.findOne( id );
    const updatedCourseCertificate = { ...courseCertificate, ...updateCourseCertificateDto };
    const savedCourseCertificate = await this.courseCertificateRepository.save( updatedCourseCertificate );

    await this.saveHistory(
      'Certificado de curso actualizado',
      `El certificado de curso ID "${ id }" fue actualizado por el usuario "${ user.username }".`,
      user,
      savedCourseCertificate.id
    );

    return savedCourseCertificate;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async remove( id: string, user: User ): Promise<void> {
    const courseCertificate = await this.findOne( id );
    await this.courseCertificateRepository.remove( courseCertificate );

    await this.saveHistory(
      'Certificado de curso eliminado',
      `El certificado de curso ID "${ id }" fue eliminado por el usuario "${ user.username }".`,
      user,
      id
    );
  }
}