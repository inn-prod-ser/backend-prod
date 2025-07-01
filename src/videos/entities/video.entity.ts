import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '@/auth';
import { CourseClass } from '@/course-classes';

@Entity()
export class Video {

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

  @Column( 'text', { nullable: false } )
  title: string;

  @Column( 'text', { nullable: false } )
  description: string;

  @Column( 'text', { nullable: false } )
  url: string;

  @OneToOne(
    () => CourseClass,
    courseClass => courseClass.video,
    { nullable: true }
  )
  courseClass: CourseClass;
}
