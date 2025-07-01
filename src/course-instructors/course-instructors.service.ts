import { ConflictException, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DateTime } from 'luxon';

import { CreateCourseInstructorDto, UpdateCourseInstructorDto } from './dto';
import { CourseInstructor } from './entities/course-instructor.entity';
import { Course } from '@/courses/entities/course.entity';

@Injectable()
export class CourseInstructorsService {

  constructor(
    @InjectRepository( CourseInstructor )
    private readonly courseInstructorRepository: Repository<CourseInstructor>,
    @InjectRepository( Course )
    private readonly courseRepository: Repository<Course>
  ) { }

  private getBuenosAiresTime(): string {
    return DateTime.now()
      .setZone( 'America/Argentina/Buenos_Aires' )
      .toFormat( 'dd/MM/yyyy HH:mm:ss' );
  }

  async create( createCourseInstructorDto: CreateCourseInstructorDto ): Promise<CourseInstructor> {
    const instructor = this.courseInstructorRepository.create( {
      ...createCourseInstructorDto,
      creationDate: this.getBuenosAiresTime(),
      isActive: true
    } );
    try {
      return await this.courseInstructorRepository.save( instructor );
    } catch ( error ) {
      throw new InternalServerErrorException( 'Ocurrió un error al crear el instructor.' );
    }
  }

  async findAll(): Promise<CourseInstructor[]> {
    return await this.courseInstructorRepository.find( {
      where: { isActive: true },
      order: { creationDate: 'DESC' }
    } );
  }

  async findOne( id: string ): Promise<CourseInstructor> {
    const instructor = await this.courseInstructorRepository.findOne( {
      where: { id, isActive: true }
    } );
    if ( !instructor ) {
      throw new NotFoundException( `El instructor con ID "${ id }" no fue encontrado o está inactivo.` );
    }
    return instructor;
  }

  async update( id: string, updateCourseInstructorDto: UpdateCourseInstructorDto ): Promise<CourseInstructor> {
    const instructor = await this.findOne( id );
    Object.assign( instructor, updateCourseInstructorDto );
    try {
      return await this.courseInstructorRepository.save( instructor );
    } catch ( error ) {
      throw new InternalServerErrorException( 'Ocurrió un error al actualizar el instructor.' );
    }
  }

  async remove( id: string ): Promise<void> {
    const instructor = await this.findOne( id );
    try {
      await this.courseInstructorRepository.update( id, { isActive: false } );
    } catch ( error ) {
      throw new InternalServerErrorException( 'Ocurrió un error al eliminar el instructor.' );
    }
  }

  async getInstructorsByCourseId( courseId: string ): Promise<CourseInstructor[]> {
    const course = await this.courseRepository.findOne( {
      where: { id: courseId, status: true },
      relations: [ 'instructors' ]
    } );
    if ( !course ) {
      throw new NotFoundException( `El curso con ID "${ courseId }" no fue encontrado o está inactivo.` );
    }
    return course.instructors.filter( instructor => instructor.isActive );
  }

  async setInstructorsToCourse( courseId: string, instructorIds: string[] ): Promise<Course> {
    const course = await this.courseRepository.findOne( {
      where: { id: courseId, status: true },
      relations: [ 'instructors' ]
    } );
    if ( !course ) {
      throw new NotFoundException( `El curso con ID "${ courseId }" no fue encontrado o está inactivo.` );
    }
    const instructors = await this.courseInstructorRepository.findByIds( instructorIds );
    course.instructors = instructors;
    try {
      return await this.courseRepository.save( course );
    } catch ( error ) {
      throw new InternalServerErrorException( 'Ocurrió un error al asociar los instructores al curso.' );
    }
  }

  async addInstructorToCourse( courseId: string, instructorId: string ): Promise<Course> {
    const course = await this.courseRepository.findOne( {
      where: { id: courseId, status: true },
      relations: [ 'instructors' ]
    } );
    if ( !course ) {
      throw new NotFoundException( `El curso con ID "${ courseId }" no fue encontrado o está inactivo.` );
    }
    const instructor = await this.courseInstructorRepository.findOne( {
      where: { id: instructorId, isActive: true }
    } );
    if ( !instructor ) {
      throw new NotFoundException( `El instructor con ID "${ instructorId }" no fue encontrado o está inactivo.` );
    }
    if ( course.instructors.some( i => i.id === instructorId ) ) {
      throw new ConflictException( 'El instructor ya está agregado a este curso.' );
    }
    course.instructors.push( instructor );
    try {
      return await this.courseRepository.save( course );
    } catch ( error ) {
      throw new InternalServerErrorException( 'Ocurrió un error al agregar el instructor al curso.' );
    }
  }

  async removeInstructorFromCourse( courseId: string, instructorId: string ): Promise<Course> {
    const course = await this.courseRepository.findOne( {
      where: { id: courseId, status: true },
      relations: [ 'instructors' ]
    } );
    if ( !course ) {
      throw new NotFoundException( `El curso con ID "${ courseId }" no fue encontrado o está inactivo.` );
    }
    const exists = course.instructors.some( i => i.id === instructorId );
    if ( !exists ) {
      throw new NotFoundException( 'El instructor no está asignado a este curso.' );
    }
    course.instructors = course.instructors.filter( i => i.id !== instructorId );
    try {
      return await this.courseRepository.save( course );
    } catch ( error ) {
      throw new InternalServerErrorException( 'Ocurrió un error al quitar el instructor del curso.' );
    }
  }

}
