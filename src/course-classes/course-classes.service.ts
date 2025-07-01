import { Injectable, NotFoundException, UseInterceptors, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

import { CourseClass } from './entities';
import { CourseSection } from '@/course-sections';
import { CreateCourseClassDto, UpdateCourseClassDto } from './dto';
import { ErrorHandlerInterceptor } from '@/decorators';
import { SystemHistory } from '@/system-history';
import { User } from '@/auth';

@Injectable()
export class CourseClassesService {
  constructor(
    @InjectRepository( CourseClass )
    private readonly courseClassRepository: Repository<CourseClass>,

    @InjectRepository( SystemHistory )
    private readonly systemHistoryRepository: Repository<SystemHistory>,

    @InjectRepository( CourseSection )
    private readonly courseSectionRepository: Repository<CourseSection>,
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

  private sanitizeText( text: string ): string {
    return text
      .normalize( 'NFD' )
      .replace( /[\u0300-\u036f]/g, '' )
      .replace( /[^\w\s-]/g, '' )
      .trim();
  }

  private async generateSlug( text: string, courseSection: CourseSection, existingId?: string ): Promise<string> {
    const sanitizedText = this.sanitizeText( text )
      .replace( /\s+/g, '-' )
      .toLowerCase();

    return this.ensureUniqueSlug( sanitizedText, courseSection, existingId );
  }

  private async ensureUniqueSlug( baseSlug: string, courseSection: CourseSection, existingId?: string ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while ( await this.isSlugTaken( slug, courseSection, existingId ) ) {
      slug = `${ baseSlug }-${ counter }`;
      counter++;
    }

    return slug;
  }

  private async isSlugTaken( slug: string, courseSection: CourseSection, existingId?: string ): Promise<boolean> {
    const where = existingId
      ? {
        slug,
        status: true,
        courseSection: { id: courseSection.id },
        id: Not( existingId ),
      }
      : {
        slug,
        status: true,
        courseSection: { id: courseSection.id },
      };

    const existingCourseClass = await this.courseClassRepository.findOne( {
      where,
    } );

    return !!existingCourseClass;
  }

  private async reorderClasses( sectionId: string ): Promise<void> {
    const classes = await this.courseClassRepository.find( {
      where: { courseSection: { id: sectionId }, status: true },
      order: { positionOrder: 'ASC' },
    } );

    for ( let i = 0; i < classes.length; i++ ) {
      await this.courseClassRepository.update( classes[ i ].id, { positionOrder: i } );
    }
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async create( createCourseClassDto: CreateCourseClassDto, user: User ): Promise<CourseClass> {
    const courseSection = await this.courseSectionRepository.findOne( {
      where: { id: createCourseClassDto.courseSectionId, status: true },
    } );

    if ( !courseSection ) {
      throw new NotFoundException( `La sección de curso con ID "${ createCourseClassDto.courseSectionId }" no fue encontrada o está inactiva.` );
    }

    const classes = await this.courseClassRepository.find( {
      where: { courseSection: { id: createCourseClassDto.courseSectionId }, status: true },
      order: { positionOrder: 'ASC' },
    } );

    const newPositionOrder = classes.length;
    const sanitizedTitle = this.sanitizeText( createCourseClassDto.title );
    const sanitizedDescription = this.sanitizeText( createCourseClassDto.description );
    const slug = await this.generateSlug( sanitizedTitle, courseSection );

    const newCourseClass = this.courseClassRepository.create( {
      title: sanitizedTitle,
      description: sanitizedDescription,
      slug,
      courseSection,
      createdBy: user,
      creationDate: this.getBuenosAiresTime(),
      positionOrder: newPositionOrder,
    } );

    const savedCourseClass = await this.courseClassRepository.save( newCourseClass );

    await this.saveHistory(
      'Clase de curso creada',
      `Una nueva clase de curso "${ savedCourseClass.title }" fue creada por el usuario "${ user.username }".`,
      user,
      savedCourseClass.id
    );

    return savedCourseClass;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findAll(): Promise<CourseClass[]> {
    return await this.courseClassRepository.find( {
      where: { status: true },
      relations: [ 'courseSection', 'createdBy' ],
      order: { positionOrder: 'ASC' },
    } );
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findOne( id: string ): Promise<CourseClass> {
    const courseClass = await this.courseClassRepository.findOne( {
      where: { id, status: true },
      relations: [ 'courseSection', 'createdBy' ]
    } );

    if ( !courseClass ) {
      throw new NotFoundException( `La clase de curso con ID "${ id }" no fue encontrada o está inactiva.` );
    }

    return courseClass;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findBySection( sectionId: string ): Promise<CourseClass[]> {
    const courseSection = await this.courseSectionRepository.findOne( {
      where: { id: sectionId, status: true },
    } );

    if ( !courseSection ) {
      throw new NotFoundException( `La sección de curso con ID "${ sectionId }" no fue encontrada o está inactiva.` );
    }

    return await this.courseClassRepository.find( {
      where: { courseSection: { id: sectionId }, status: true },
      relations: [ 'courseSection', 'createdBy' ],
      order: { positionOrder: 'ASC' },
    } );
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async update( id: string, updateCourseClassDto: UpdateCourseClassDto, user: User ): Promise<CourseClass> {
    const courseClass = await this.findOne( id );

    const sanitizedTitle = updateCourseClassDto.title
      ? this.sanitizeText( updateCourseClassDto.title )
      : courseClass.title;

    const sanitizedDescription = updateCourseClassDto.description
      ? this.sanitizeText( updateCourseClassDto.description )
      : courseClass.description;

    const slug = await this.generateSlug(
      updateCourseClassDto.slug || sanitizedTitle,
      courseClass.courseSection,
      id
    );

    const updatedCourseClass = {
      ...courseClass,
      title: sanitizedTitle,
      description: sanitizedDescription,
      slug,
    };

    const savedCourseClass = await this.courseClassRepository.save( updatedCourseClass );

    await this.saveHistory(
      'Clase de curso actualizada',
      `La clase de curso ID "${ id }" fue actualizada por el usuario "${ user.username }".`,
      user,
      savedCourseClass.id
    );

    return savedCourseClass;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async remove( id: string, user: User ): Promise<void> {
    const courseClass = await this.findOne( id );
    const sectionId = courseClass.courseSection.id;

    await this.courseClassRepository.update( id, { status: false, slug: uuidv4() } );
    await this.reorderClasses( sectionId );

    await this.saveHistory(
      'Clase de curso eliminada',
      `La clase de curso ID "${ id }" fue eliminada por el usuario "${ user.username }".`,
      user,
      id
    );
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async updateOrder( id: string, newOrder: number, user: User ): Promise<CourseClass> {
    const courseClass = await this.findOne( id );

    const totalClasses = await this.courseClassRepository.count( {
      where: { courseSection: { id: courseClass.courseSection.id }, status: true },
    } );

    if ( newOrder < 0 || newOrder >= totalClasses ) {
      throw new ConflictException( `El orden debe estar entre 0 y ${ totalClasses - 1 }` );
    }

    const currentOrder = courseClass.positionOrder;

    if ( newOrder > currentOrder ) {
      await this.courseClassRepository
        .createQueryBuilder()
        .update( CourseClass )
        .set( { positionOrder: () => 'positionOrder - 1' } )
        .where( 'courseSectionId = :sectionId', { sectionId: courseClass.courseSection.id } )
        .andWhere( 'status = :status', { status: true } )
        .andWhere( 'positionOrder > :currentOrder', { currentOrder } )
        .andWhere( 'positionOrder <= :newOrder', { newOrder } )
        .execute();
    } else if ( newOrder < currentOrder ) {
      await this.courseClassRepository
        .createQueryBuilder()
        .update( CourseClass )
        .set( { positionOrder: () => 'positionOrder + 1' } )
        .where( 'courseSectionId = :sectionId', { sectionId: courseClass.courseSection.id } )
        .andWhere( 'status = :status', { status: true } )
        .andWhere( 'positionOrder >= :newOrder', { newOrder } )
        .andWhere( 'positionOrder < :currentOrder', { currentOrder } )
        .execute();
    }

    courseClass.positionOrder = newOrder;
    const savedCourseClass = await this.courseClassRepository.save( courseClass );

    await this.saveHistory(
      'Orden de clase actualizado',
      `El orden de la clase ID "${ id }" fue actualizado por el usuario "${ user.username }".`,
      user,
      savedCourseClass.id
    );

    return savedCourseClass;
  }
}