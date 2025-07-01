// class-content.service.ts
import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { User } from '@/auth/entities/user.entity';
import { CourseClass } from '@/course-classes';

import { CreateClassContentDto, UpdateClassContentDto } from './dto';
import { ClassContent } from './entities/class-content.entity';


@Injectable()
export class ClassContentService {

  constructor(
    @InjectRepository( ClassContent )
    private readonly classContentRepository: Repository<ClassContent>,
    @InjectRepository( CourseClass )
    private readonly courseClassRepository: Repository<CourseClass>
  ) { }

  private getBuenosAiresTime(): string {
    const date = new Date();

    return date.toLocaleString( 'es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    } ).replace( /\//g, '/' );
  }

  async create(
    createClassContentDto: CreateClassContentDto,
    user: User
  ) {
    const courseClass = await this.courseClassRepository.findOneBy( {
      id: createClassContentDto.courseClassId
    } );

    if ( !courseClass ) {
      throw new ConflictException( `La clase del curso con ID "${ createClassContentDto.courseClassId }" no existe.` );
    }

    const existingContent = await this.classContentRepository.findOne( {
      where: {
        courseClass: { id: courseClass.id },
        contentType: createClassContentDto.contentType,
        status: true
      }
    } );

    if ( existingContent ) {
      throw new ConflictException( `Ya existe un contenido de tipo "${ createClassContentDto.contentType }" activo para esta clase.` );
    }

    const classContent = this.classContentRepository.create( {
      ...createClassContentDto,
      createdBy: user,
      creationDate: this.getBuenosAiresTime(),
      status: true,
      courseClass
    } );

    try {
      return await this.classContentRepository.save( classContent );
    } catch ( error ) {
      throw new InternalServerErrorException( 'Ocurrió un error interno al crear el contenido de clase.' );
    }
  }

  async findAll() {
    return await this.classContentRepository.find( {
      where: { status: true },
      order: { creationDate: 'DESC' }
    } );
  }

  async findOne( id: string ) {
    const classContent = await this.classContentRepository.findOne( {
      where: { id, status: true },
      relations: [ 'courseClass' ]
    } );

    if ( !classContent ) {
      throw new NotFoundException( `El contenido de clase con ID "${ id }" no existe o está inactivo.` );
    }

    return classContent;
  }

  async update(
    id: string,
    updateClassContentDto: UpdateClassContentDto,
    user: User
  ) {
    const classContentToUpdate = await this.findOne( id );

    const newContentTypeFromDto = updateClassContentDto.contentType;
    const newCourseClassIdFromDto = updateClassContentDto.courseClassId;

    let targetCourseClassId = classContentToUpdate.courseClass.id;
    let targetCourseClassEntity = classContentToUpdate.courseClass;

    const courseClassIsPotentiallyChanging = newCourseClassIdFromDto && newCourseClassIdFromDto !== classContentToUpdate.courseClass.id;

    if ( courseClassIsPotentiallyChanging ) {
      const newCourseClass = await this.courseClassRepository.findOneBy( { id: newCourseClassIdFromDto } );
      if ( !newCourseClass ) {
        throw new NotFoundException( `La clase del curso con ID "${ newCourseClassIdFromDto }" no existe.` );
      }
      targetCourseClassId = newCourseClass.id;
      targetCourseClassEntity = newCourseClass;
    }

    const targetContentType = newContentTypeFromDto || classContentToUpdate.contentType;

    if ( newContentTypeFromDto || courseClassIsPotentiallyChanging ) {
      const existingContent = await this.classContentRepository.findOne( {
        where: {
          courseClass: { id: targetCourseClassId },
          contentType: targetContentType,
          status: true,
          id: Not( id )
        }
      } );

      if ( existingContent ) {
        throw new ConflictException( `Ya existe un contenido de tipo "${ targetContentType }" activo para la clase del curso con ID "${ targetCourseClassId }".` );
      }
    }

    const { courseClassId, ...restOfDto } = updateClassContentDto;
    const dataToMerge: Partial<ClassContent> = { ...restOfDto };

    if ( courseClassIsPotentiallyChanging ) {
      dataToMerge.courseClass = targetCourseClassEntity;
    } else if ( newCourseClassIdFromDto && !courseClassIsPotentiallyChanging ) {
      dataToMerge.courseClass = classContentToUpdate.courseClass;
    }

    const updatedClassContent = this.classContentRepository.merge(
      classContentToUpdate,
      dataToMerge
    );

    try {
      return await this.classContentRepository.save( updatedClassContent );
    } catch ( error ) {
      throw new InternalServerErrorException( 'Ocurrió un error interno al actualizar el contenido de clase.' );
    }
  }

  async remove( id: string, user: User ) {
    const classContent = await this.findOne( id );

    try {
      await this.classContentRepository.update( id, {
        status: false
      } );
    } catch ( error ) {
      throw new InternalServerErrorException( 'Ocurrió un error interno al eliminar (desactivar) el contenido de clase.' );
    }
  }

  async findAllByCourseClassId( courseClassId: string ) {
    const courseClass = await this.courseClassRepository.findOneBy( {
      id: courseClassId
    } );

    if ( !courseClass ) {
      throw new NotFoundException( `La clase del curso con ID "${ courseClassId }" no existe.` );
    }

    return await this.classContentRepository.find( {
      where: {
        courseClass: { id: courseClassId },
        status: true
      },
      order: {
        creationDate: 'DESC'
      },
      relations: [ 'courseClass' ]
    } );
  }
}