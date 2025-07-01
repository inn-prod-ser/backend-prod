import { ConflictException, Injectable, NotFoundException, UseInterceptors, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

import { CreateCourseDto, UpdateCourseDto } from './dto';
import { Course } from './entities';

import { ErrorHandlerInterceptor } from '@/decorators';
import { User, GetUser } from '@/auth';
import { SystemHistory } from '@/system-history';
import { Category } from '@/categories/entities/category.entity';
import { CourseSection } from '@/course-sections/entities/course-section.entity';
import { CourseClass } from '@/course-classes/entities/course-class.entity';
import { CourseInstructor } from '@/course-instructors/entities/course-instructor.entity';

@Injectable()
export class CoursesService {

  constructor(
    @InjectRepository( Category )
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository( Course )
    private readonly courseRepository: Repository<Course>,

    @InjectRepository( SystemHistory )
    private readonly systemHistoryRepository: Repository<SystemHistory>,

    @InjectRepository( CourseSection )
    private readonly courseSectionRepository: Repository<CourseSection>,

    @InjectRepository( CourseClass )
    private readonly courseClassRepository: Repository<CourseClass>,

    @InjectRepository( CourseInstructor )
    private readonly courseInstructorRepository: Repository<CourseInstructor>
  ) { }

  private getBuenosAiresTime(): string {
    return DateTime.now()
      .setZone( 'America/Argentina/Buenos_Aires' )
      .toFormat( 'dd/MM/yyyy HH:mm:ss' );
  }

  private async saveHistory(
    title: string,
    description: string,
    user: User,
    idRegister: string
  ): Promise<void> {
    const sanitizedDescription = this.sanitizeText( description );

    const historyEntry = this.systemHistoryRepository.create( {
      createdBy: user,
      creationDate: this.getBuenosAiresTime(),
      description: sanitizedDescription,
      idRegister,
      title,
    } );

    await this.systemHistoryRepository.save( historyEntry );
  }

  private generateSlug( text: string ): string {
    return text.normalize( 'NFD' )
      .replace( /[\u0300-\u036f]/g, '' )
      .replace( /ñ/g, 'n' )
      .replace( /[^a-zA-Z0-9 -]/g, '' )
      .replace( /\s+/g, '-' )
      .toLowerCase();
  }

  private sanitizeText( text: string ): string {
    return text.normalize( 'NFD' )
      .replace( /[\u0300-\u036f]/g, '' )
      .replace( /ñ/g, 'n' )
      .replace( /[^\x00-\x7F]/g, '' )
      .trim();
  }

  private async validateUniqueSlug( slug: string, courseId?: string ): Promise<void> {
    const existingCourse = await this.courseRepository.findOne( {
      where: { slug, status: true, id: courseId ? Not( courseId ) : undefined },
    } );

    if ( existingCourse ) {
      throw new ConflictException( `Ya existe un curso con el slug "${ slug }".` );
    }
  }

  private isAdmin( user: User ): boolean {
    return user && user.roles && user.roles.includes( 'admin' );
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async create( createCourseDto: CreateCourseDto, @GetUser() user: User ): Promise<Course> {

    const sanitizedTitle = this.sanitizeText( createCourseDto.title );
    const sanitizedSlug = this.generateSlug( createCourseDto.slug );
    const sanitizedDescription = createCourseDto.description
      ? this.sanitizeText( createCourseDto.description )
      : null;

    await this.validateUniqueSlug( sanitizedSlug );

    const categories = await this.categoryRepository.findByIds( createCourseDto.categoryIds );

    if ( categories.length !== createCourseDto.categoryIds.length ) {
      throw new NotFoundException( 'Una o más categorías no fueron encontradas.' );
    }

    const newCourse = this.courseRepository.create( {
      ...createCourseDto,
      title: sanitizedTitle,
      slug: sanitizedSlug,
      description: sanitizedDescription,
      categories,
      createdBy: user,
      creationDate: this.getBuenosAiresTime(),
      status: true,
      courseUnderConstruction: createCourseDto.courseUnderConstruction !== undefined ? createCourseDto.courseUnderConstruction : true,
    } );

    const savedCourse = await this.courseRepository.save( newCourse );

    await this.saveHistory(
      'Curso creado',
      `Un nuevo curso "${ savedCourse.title }" fue creado por el usuario "${ user.username }".`,
      user,
      savedCourse.id,
    );

    return await this.courseRepository.findOne( {
      where: { id: savedCourse.id },
      relations: [ 'categories', 'createdBy', 'instructors' ]
    } );
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findAll( user: User ): Promise<Course[]> {
    const whereCondition: any = { status: true };

    if ( !this.isAdmin( user ) ) {
      whereCondition.isPublic = true;
    }

    return await this.courseRepository.find( {
      where: whereCondition,
      relations: [ 'categories', 'createdBy', 'instructors' ],
      order: { creationDate: 'DESC' }
    } );
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findOne( id: string, user: User ): Promise<Course> {
    const whereCondition: any = { id, status: true };

    if ( !this.isAdmin( user ) ) {
      whereCondition.isPublic = true;
    }

    const course = await this.courseRepository.findOne( {
      where: whereCondition,
      relations: [ 'categories', 'createdBy', 'instructors' ]
    } );

    if ( !course ) {
      throw new NotFoundException( `El curso con ID "${ id }" no fue encontrado o está inactivo.` );
    }

    return course;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findBySlug( slug: string, user: User ): Promise<Course> {
    const whereCondition: any = { slug, status: true };

    if ( !this.isAdmin( user ) ) {
      whereCondition.isPublic = true;
    }

    const course = await this.courseRepository.findOne( {
      where: whereCondition,
      relations: [ 'categories', 'createdBy', 'instructors' ]
    } );

    if ( !course ) {
      throw new NotFoundException( `El curso con slug "${ slug }" no fue encontrado o está inactivo.` );
    }

    return course;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findCoursesByCategory( categorySlug: string, user: User ): Promise<Course[]> {
    const category = await this.categoryRepository.findOne( {
      where: { slug: categorySlug, status: true, visible: this.isAdmin( user ) ? undefined : true },
    } );

    if ( !category ) {
      throw new NotFoundException( `La categoría con slug "${ categorySlug }" no fue encontrada o está inactiva.` );
    }

    const whereCondition: any = { status: true };

    if ( !this.isAdmin( user ) ) {
      whereCondition.isPublic = true;
    }

    const courses = await this.courseRepository.find( {
      where: whereCondition,
      relations: [ 'categories', 'createdBy', 'instructors' ],
    } );

    return courses.filter( course => course.categories.some( cat => cat.id === category.id ) );
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async update( id: string, updateCourseDto: UpdateCourseDto, @GetUser() user: User ): Promise<Course> {
    const course = await this.findOne( id, user );

    let sanitizedSlug = course.slug;
    let sanitizedTitle = course.title;
    let sanitizedDescription = course.description;

    if ( updateCourseDto.slug && updateCourseDto.slug !== course.slug ) {
      sanitizedSlug = this.generateSlug( updateCourseDto.slug );
      await this.validateUniqueSlug( sanitizedSlug, id );
    }

    if ( updateCourseDto.title ) {
      sanitizedTitle = this.sanitizeText( updateCourseDto.title );
    }

    if ( updateCourseDto.description ) {
      sanitizedDescription = this.sanitizeText( updateCourseDto.description );
    }

    if ( updateCourseDto.categoryIds ) {
      const categories = await this.categoryRepository.findByIds( updateCourseDto.categoryIds );
      if ( categories.length !== updateCourseDto.categoryIds.length ) {
        throw new NotFoundException( 'Una o más categorías no fueron encontradas.' );
      }
      course.categories = categories;
    }

    const updatedCourse = await this.courseRepository.save( {
      ...course,
      ...updateCourseDto,
      title: sanitizedTitle,
      slug: sanitizedSlug,
      description: sanitizedDescription,
      courseUnderConstruction: updateCourseDto.courseUnderConstruction !== undefined ? updateCourseDto.courseUnderConstruction : course.courseUnderConstruction,
    } );

    await this.saveHistory(
      'Curso actualizado',
      `El curso "${ updatedCourse.title }" fue actualizado por el usuario "${ user.username }".`,
      user,
      updatedCourse.id,
    );

    return await this.courseRepository.findOne( {
      where: { id: updatedCourse.id },
      relations: [ 'categories', 'createdBy', 'instructors' ]
    } );
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async remove( id: string, @GetUser() user: User ): Promise<void> {
    const course = await this.findOne( id, user );

    await this.courseRepository.update( id, { status: false, slug: uuidv4() } );

    await this.saveHistory(
      'Curso eliminado',
      `El curso "${ course.title }" fue marcado como inactivo por el usuario "${ user.username }".`,
      user,
      id,
    );
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async togglePublicStatus( id: string, @GetUser() user: User ): Promise<Course> {
    const course = await this.findOne( id, user );
    course.isPublic = !course.isPublic;

    const updatedCourse = await this.courseRepository.save( course );

    await this.saveHistory(
      'Estado de publicacion cambiado',
      `El curso "${ course.title }" fue cambiado a ${ updatedCourse.isPublic ? 'publico' : 'privado' } por el usuario "${ user.username }".`,
      user,
      updatedCourse.id,
    );

    return await this.courseRepository.findOne( {
      where: { id: updatedCourse.id },
      relations: [ 'categories', 'createdBy', 'instructors' ]
    } );
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async toggleCourseUnderConstructionStatus( id: string, @GetUser() user: User ): Promise<Course> {
    const course = await this.findOne( id, user );
    course.courseUnderConstruction = !course.courseUnderConstruction;

    const updatedCourse = await this.courseRepository.save( course );

    await this.saveHistory(
      'Estado de construccion cambiado',
      `El curso "${ course.title }" fue cambiado a ${ updatedCourse.courseUnderConstruction ? 'en construcción' : 'publicado' } por el usuario "${ user.username }".`,
      user,
      updatedCourse.id,
    );

    return await this.courseRepository.findOne( {
      where: { id: updatedCourse.id },
      relations: [ 'categories', 'createdBy', 'instructors' ]
    } );
  }

  async findAllPublic() {
    try {
      const courses = await this.courseRepository.find( {
        where: { status: true, isPublic: true },
        relations: [ 'categories', 'createdBy', 'instructors' ],
        order: { creationDate: 'DESC' }
      } );

      return courses;
    } catch ( error ) {
      throw new InternalServerErrorException( 'Ocurrió un error al buscar los cursos públicos.' );
    }
  }

  async findPublicCoursesByCategory( categorySlug: string ) {
    try {
      const category = await this.categoryRepository.findOne( {
        where: { slug: categorySlug, status: true, visible: true }
      } );

      if ( !category ) {
        throw new NotFoundException( `La categoría con slug "${ categorySlug }" no fue encontrada o está inactiva.` );
      }

      const courses = await this.courseRepository.find( {
        where: { status: true, isPublic: true },
        relations: [ 'categories', 'createdBy', 'instructors' ],
        order: { creationDate: 'DESC' }
      } );

      return courses
        .filter( course => course.categories.some( cat => cat.id === category.id ) );
    } catch ( error ) {
      if ( error instanceof NotFoundException ) {
        throw error;
      }
      throw new InternalServerErrorException( 'Ocurrió un error al buscar los cursos por categoría.' );
    }
  }

  async findOnePublicBySlug( slug: string ) {
    try {
      const course = await this.courseRepository.findOne( {
        where: { slug, status: true, isPublic: true },
        relations: [ 'categories', 'createdBy', 'instructors' ]
      } );

      if ( !course ) {
        throw new NotFoundException( `El curso con slug "${ slug }" no fue encontrado o está inactivo.` );
      }

      const sections = await this.courseSectionRepository.find( {
        where: { course: { id: course.id }, status: true },
        order: { positionOrder: 'ASC' },
        relations: [ 'courseClasses', 'createdBy' ]
      } );

      const courseWithSections = {
        ...course,
        courseSections: await Promise.all(
          sections.map( async section => {
            const classes = await this.courseClassRepository.find( {
              where: { courseSection: { id: section.id }, status: true },
              order: { positionOrder: 'ASC' },
              relations: [ 'createdBy' ]
            } );
            const classesWithoutContent = classes.map( cls => {
              const { ClassContent, ...rest } = cls;
              return rest;
            } );
            return { ...section, courseClasses: classesWithoutContent };
          } )
        )
      };

      return courseWithSections;
    } catch ( error ) {
      if ( error instanceof NotFoundException ) {
        throw error;
      }
      throw new InternalServerErrorException( 'Ocurrió un error al buscar el curso público por slug.' );
    }
  }

  async searchPublicCourses( query: string ) {
    try {
      const courses = await this.courseRepository.find( {
        where: { status: true, isPublic: true },
        relations: [ 'categories', 'createdBy', 'instructors' ],
        order: { creationDate: 'DESC' }
      } );

      const sections = await this.courseSectionRepository.find( {
        where: { status: true },
        relations: [ 'course', 'courseClasses', 'createdBy' ]
      } );

      const classes = await this.courseClassRepository.find( {
        where: { status: true },
        relations: [ 'courseSection', 'createdBy' ]
      } );

      const queryLower = query.trim().toLowerCase();

      const filteredCourses = courses.filter( course => {
        if (
          course.title.toLowerCase().includes( queryLower ) ||
          course.description.toLowerCase().includes( queryLower ) ||
          course.slug.toLowerCase().includes( queryLower ) ||
          course.price.toString().includes( queryLower ) ||
          ( course.courseUnderConstruction ? 'en construccion' : 'publicado' ).includes( queryLower ) ||
          course.categories.some( cat => cat.title.toLowerCase().includes( queryLower ) || cat.slug.toLowerCase().includes( queryLower ) )
        ) {
          return true;
        }

        const courseSections = sections.filter( section => section.course.id === course.id );
        if ( courseSections.some( section =>
          section.title.toLowerCase().includes( queryLower ) ||
          section.description.toLowerCase().includes( queryLower ) ||
          section.slug.toLowerCase().includes( queryLower )
        ) ) {
          return true;
        }

        const courseClasses = classes.filter( cls =>
          courseSections.some( section => section.id === cls.courseSection.id )
        );
        if ( courseClasses.some( cls =>
          cls.title.toLowerCase().includes( queryLower ) ||
          cls.description.toLowerCase().includes( queryLower ) ||
          cls.slug.toLowerCase().includes( queryLower )
        ) ) {
          return true;
        }

        return false;
      } );

      const result = await Promise.all(
        filteredCourses.map( async course => {
          const courseSections = sections
            .filter( section => section.course.id === course.id )
            .sort( ( a, b ) => a.positionOrder - b.positionOrder );

          const fullSections = await Promise.all(
            courseSections.map( async section => {
              const sectionClasses = classes
                .filter( cls => cls.courseSection.id === section.id )
                .sort( ( a, b ) => a.positionOrder - b.positionOrder )
                .map( cls => {
                  const { ClassContent, ...rest } = cls;
                  return rest;
                } );
              return { ...section, courseClasses: sectionClasses };
            } )
          );

          return { ...course, courseSections: fullSections };
        } )
      );

      return result;
    } catch ( error ) {
      throw new InternalServerErrorException( 'Ocurrió un error al buscar los cursos públicos.' );
    }
  }

  async getInstructorsOfCourse( courseId: string ): Promise<CourseInstructor[]> {
    const course = await this.courseRepository.findOne( {
      where: { id: courseId, status: true },
      relations: [ 'instructors' ]
    } );
    if ( !course ) {
      throw new NotFoundException( `Course with id "${ courseId }" not found` );
    }
    return course.instructors.filter( instr => instr.isActive );
  }

}
