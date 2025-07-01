import { Injectable, NotFoundException, UseInterceptors } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DateTime } from 'luxon';

import { CreateVideoDto, UpdateVideoDto } from './dto';
import { ErrorHandlerInterceptor } from '@/decorators';
import { SystemHistory } from '@/system-history';
import { User } from '@/auth';
import { Video } from './entities';


@Injectable()
export class VideosService {
  
  constructor(
    @InjectRepository( Video )
    private readonly videoRepository: Repository<Video>,

    @InjectRepository( SystemHistory )
    private readonly systemHistoryRepository: Repository<SystemHistory>,
  ) { }

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

  private getBuenosAiresTime(): string {
    return DateTime.now().setZone( 'America/Argentina/Buenos_Aires' ).toFormat( 'dd/MM/yyyy HH:mm:ss' );
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async create( createVideoDto: CreateVideoDto, user: User ): Promise<Video> {
    const video = this.videoRepository.create( {
      ...createVideoDto,
      createdBy: user,
      creationDate: this.getBuenosAiresTime(),
    } );

    const savedVideo = await this.videoRepository.save( video );

    await this.saveHistory(
      'Creación de video',
      `El video "${ savedVideo.title }" fue creado por el usuario "${ user.username }".`,
      user,
      savedVideo.id,
    );

    return savedVideo;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findAll(): Promise<Video[]> {
    return this.videoRepository.find( {
      where: { status: true },
      order: { creationDate: 'DESC' },
    } );
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async findOne( id: string ): Promise<Video> {
    const video = await this.videoRepository.findOne( {
      where: { id, status: true },
    } );

    if ( !video ) {
      throw new NotFoundException( `El video con ID "${ id }" no fue encontrado o está inactivo.` );
    }

    return video;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async update( id: string, updateVideoDto: UpdateVideoDto, user: User ): Promise<Video> {
    const video = await this.findOne( id );

    const updatedVideo = await this.videoRepository.save( {
      ...video,
      ...updateVideoDto,
    } );

    await this.saveHistory(
      'Actualización de video',
      `El video ID "${ updatedVideo.id }" fue actualizado por el usuario "${ user.username }".`,
      user,
      updatedVideo.id,
    );

    return updatedVideo;
  }

  @UseInterceptors( ErrorHandlerInterceptor )
  async remove( id: string, user: User ): Promise<void> {
    const video = await this.findOne( id );

    await this.videoRepository.update( id, { status: false } );

    await this.saveHistory(
      'Eliminación de video',
      `El video ID "${ video.id }" fue marcado como inactivo por el usuario "${ user.username }".`,
      user,
      video.id,
    );
  }
}
