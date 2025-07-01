import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { CourseClass } from '@/course-classes';
import { User } from '@/auth';


@Entity()
export class ClassContent {
  @PrimaryGeneratedColumn( 'uuid' )
  id: string;

  @Column( 'boolean', { default: true } )
  status: boolean;

  @Column( 'text', { nullable: false } )
  creationDate: string;

  @ManyToOne(
    () => User,
    user => user.course,
    { eager: true }
  )
  createdBy: User;

  @ManyToOne(
    () => CourseClass,
    courseClass => courseClass.ClassContent
  )
  courseClass: CourseClass;

  @Column( {
    type: 'enum',
    enum: [ 'text', 'video', 'slides' ],
    default: 'text'
  } )
  contentType: string;

  @Column( 'text', { nullable: false } )
  content: string;
}