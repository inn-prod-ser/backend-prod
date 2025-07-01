import { Injectable, NotFoundException, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DateTime } from 'luxon';

import { ClassResource } from './entities';
import { CreateClassResourceDto, UpdateClassResourceDto } from './dto';
import { ErrorHandlerInterceptor } from 'src/decorators';
import { SystemHistory } from '@/system-history';
import { User } from '@/auth';

@Injectable()
export class ClassResourcesService {
  constructor(
    @InjectRepository( ClassResource )
    private readonly classResourceRepository: Repository<ClassResource>,

    @InjectRepository( SystemHistory )
    private readonly systemHistoryRepository: Repository<SystemHistory>
  ) { }

  private getBuenosAiresTime(): string {
    return DateTime.now().setZone( 'America/Argentina/Buenos_Aires' ).toFormat( 'dd/MM/yyyy HH:mm:ss' );
  }

  private async saveHistory(
    title: string,
    description: string,
    user: User,
    idRegister: string
  ): Promise<void> {
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
  async create(
    createClassResourceDto: CreateClassResourceDto,
    user: User
  ): Promise<ClassResource> {
    const classResource = this.classResourceRepository.create( {
      ...createClassResourceDto,
      createdBy: user,
      creationDate: this.getBuenosAiresTime(),
      isActive: true
    } );

    const savedClassResource = await this.classResourceRepository.save( classResource );

    await this.saveHistory(
      'Creación de recurso de clase',
      `Se creó un recurso de clase "${ savedClassResource.title }" por el usuario "${ user.username }"`,
      user,
      savedClassResource.id
    );

    return savedClassResource;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findAll(): Promise<ClassResource[]> {
    return this.classResourceRepository.find( {
      where: { isActive: true },
      order: { creationDate: 'DESC' }
    } );
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findOne( id: string ): Promise<ClassResource> {
    const classResource = await this.classResourceRepository.findOne( {
      where: { id, isActive: true }
    } );

    if ( !classResource ) {
      throw new NotFoundException( `El recurso de clase con ID "${ id }" no fue encontrado o está inactivo.` );
    }

    return classResource;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async update(
    id: string,
    updateClassResourceDto: UpdateClassResourceDto,
    user: User
  ): Promise<ClassResource> {
    const classResource = await this.findOne( id );

    const updatedClassResource = await this.classResourceRepository.save( {
      ...classResource,
      ...updateClassResourceDto
    } );

    await this.saveHistory(
      'Actualización de recurso de clase',
      `El recurso de clase ID "${ id }" fue actualizado por el usuario "${ user.username }"`,
      user,
      id
    );

    return updatedClassResource;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async remove( id: string, user: User ): Promise<void> {
    const classResource = await this.findOne( id );

    await this.classResourceRepository
      .createQueryBuilder()
      .update( ClassResource )
      .set( { isActive: false } )
      .where( 'id = :id', { id } )
      .execute();

    await this.saveHistory(
      'Eliminación de recurso de clase',
      `El recurso de clase ID "${ id }" fue marcado como inactivo por el usuario "${ user.username }"`,
      user,
      id
    );
  }
}