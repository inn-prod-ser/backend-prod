import { Column, Entity, ManyToOne, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '@/auth';
import { Course } from '@/courses/entities/course.entity';

@Entity()
export class Category {

  @PrimaryGeneratedColumn( 'uuid' )
  id: string;

  @Column( 'boolean', { default: true } )
  status: boolean;

  @Column( 'boolean', { default: false } )
  visible: boolean;

  @Column( 'text', { nullable: false } )
  creationDate: string;

  @Column( 'text', { nullable: false, unique: true } )
  title: string;

  @Column( 'text', { nullable: false, unique: true } )
  slug: string;

  @ManyToOne(
    () => User,
    user => user.category,
    { eager: true }
  )
  createdBy: User;

  @ManyToMany( () => Course, course => course.categories )
  courses: Course[];
}