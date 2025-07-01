import { ConflictException, Injectable, NotFoundException, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { Category } from './entities';
import { SystemHistory } from '@/system-history/entities/system-history.entity';
import { User } from '@/auth/entities/user.entity';
import { ErrorHandlerInterceptor } from '@/decorators';
import { Course } from '@/courses/entities/course.entity';

@Injectable()
export class CategoriesService {

  constructor(
    @InjectRepository( Category )
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository( SystemHistory )
    private readonly systemHistoryRepository: Repository<SystemHistory>,

    @InjectRepository( Course )
    private readonly courseRepository: Repository<Course>
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

  private generateSlug( title: string ): string {
    return title.normalize( 'NFD' )
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

  @UseInterceptors( ErrorHandlerInterceptor )
  async create( createCategoryDto: CreateCategoryDto, user: User ): Promise<Category> {

    const sanitizedTitle = this.sanitizeText( createCategoryDto.title );
    const slug = this.generateSlug( sanitizedTitle );

    const existingCategory = await this.categoryRepository.findOne( {
      where: [
        { title: sanitizedTitle, status: true },
        { slug, status: true }
      ]
    } );

    if ( existingCategory ) {
      throw new ConflictException( 'Ya existe una categoria con este titulo o slug.' );
    }

    const category = this.categoryRepository.create( {
      ...createCategoryDto,
      title: sanitizedTitle,
      slug,
      createdBy: user,
      creationDate: this.getBuenosAiresTime(),
      status: true,
      visible: false
    } );

    const savedCategory = await this.categoryRepository.save( category );

    await this.saveHistory(
      'Creacion de categoria',
      `La categoria "${ savedCategory.title }" fue creada por el usuario "${ user.username }".`,
      user,
      savedCategory.id
    );

    return savedCategory;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findAll( user: User ): Promise<Category[]> {
    const whereCondition = { status: true };

    if ( !user || user.roles.indexOf( 'admin' ) === -1 ) {
      whereCondition[ 'visible' ] = true;
    }

    return await this.categoryRepository.find( {
      where: whereCondition,
      order: { creationDate: 'DESC' }
    } );
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findOne( id: string, user: User ): Promise<Category> {
    const whereCondition: any = { id, status: true };

    if ( !user || user.roles.indexOf( 'admin' ) === -1 ) {
      whereCondition.visible = true;
    }

    const category = await this.categoryRepository.findOne( {
      where: whereCondition
    } );

    if ( !category ) {
      throw new NotFoundException(
        `La categoria con ID "${ id }" no fue encontrada o esta inactiva.`
      );
    }

    return category;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    user: User
  ): Promise<Category> {
    const category = await this.findOne( id, user );

    let sanitizedTitle = category.title;
    let newSlug = category.slug;

    if ( updateCategoryDto.title ) {
      sanitizedTitle = this.sanitizeText( updateCategoryDto.title );
      newSlug = this.generateSlug( sanitizedTitle );

      const existingCategory = await this.categoryRepository.findOne( {
        where: [
          { title: sanitizedTitle, status: true, id: Not( id ) },
          { slug: newSlug, status: true, id: Not( id ) }
        ]
      } );

      if ( existingCategory ) {
        throw new ConflictException( 'Ya existe una categoria con este titulo o slug.' );
      }
    }

    const updatedCategory = await this.categoryRepository.save( {
      ...category,
      ...updateCategoryDto,
      title: sanitizedTitle,
      slug: newSlug
    } );

    await this.saveHistory(
      'Actualizacion de categoria',
      `La categoria "${ updatedCategory.title }" fue actualizada por el usuario "${ user.username }".`,
      user,
      updatedCategory.id
    );

    return updatedCategory;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async remove( id: string, user: User ): Promise<void> {
    const category = await this.findOne( id, user );

    await this.categoryRepository.update( id, {
      status: false,
      slug: uuidv4()
    } );

    await this.saveHistory(
      'Eliminacion de categoria',
      `La categoria "${ category.title }" fue marcada como inactiva por el usuario "${ user.username }".`,
      user,
      category.id
    );
  }

  async findAllVisibleWithCourses() {
    const categories = await this.categoryRepository.find( {
      where: {
        status: true,
        visible: true,
        slug: Not( 'top-cursos' )
      },
      relations: [ 'courses' ],
      order: {
        creationDate: 'DESC'
      }
    } );

    const result = await Promise.all(
      categories.map( async category => {
        const courses = await this.courseRepository
          .createQueryBuilder( 'course' )
          .leftJoin( 'course.categories', 'category' )
          .where( 'course.status = :status', { status: true } )
          .andWhere( 'course.isPublic = :isPublic', { isPublic: true } )
          .andWhere( 'category.id = :catId', { catId: category.id } )
          .orderBy( 'RANDOM()' )
          .getMany();

        if ( !courses || courses.length === 0 ) {
          return null;
        }

        const mappedCourses = courses.map( course => ( {
          id: course.id,
          status: course.status,
          creationDate: course.creationDate,
          createdBy: course.createdBy,
          title: course.title,
          estimatedDuration: course.estimatedDuration,
          hasCertificate: course.hasCertificate,
          slug: course.slug,
          description: course.description,
          price: course.price,
          isPublic: course.isPublic,
          courseUnderConstruction: course.courseUnderConstruction,
          categories: undefined,
          difficultyLevel: course.difficultyLevel,
          instructors: course.instructors
        } ) );

        return {
          id: category.id,
          status: category.status,
          visible: category.visible,
          creationDate: category.creationDate,
          title: category.title,
          slug: category.slug,
          createdBy: category.createdBy,
          courses: mappedCourses
        };
      } )
    );

    return result.filter( cat => cat !== null ).sort( () => Math.random() - 0.5 );
  }

}
