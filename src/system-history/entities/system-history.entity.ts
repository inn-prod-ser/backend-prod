import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from 'src/auth/entities/user.entity';

@Entity()
export class SystemHistory {

  @PrimaryGeneratedColumn( 'uuid' )
  id: string;

  @Column( 'text', { nullable: false } )
  creationDate: string;

  @Column( 'boolean', { default: true, nullable: false } )
  isActive: boolean;

  @ManyToOne(
    () => User,
    ( user ) => user.systemHistory,
    { eager: true }
  )
  createdBy: User;

  @Column( 'text', { nullable: false } )
  title: string;

  @Column( 'text', { nullable: false } )
  description: string;

  @Column( 'text', { nullable: false } )
  idRegister: string;
}