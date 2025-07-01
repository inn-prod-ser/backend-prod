import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '@/auth';

@Entity()
export class ClassResource {
  @PrimaryGeneratedColumn( 'uuid' )
  id: string;

  @Column( 'boolean', { default: true } )
  isActive: boolean;

  @Column( 'text', { nullable: false } )
  creationDate: string;

  @ManyToOne(
    () => User,
    user => user.classResources,
    { eager: true }
  )
  createdBy: User;

  @Column( 'text', { nullable: false } )
  title: string;

  @Column( 'text', { nullable: false } )
  description: string;

  @Column( 'text', { nullable: false } )
  formatResource: string;

  @Column( 'text', { nullable: false } )
  url: string;
}