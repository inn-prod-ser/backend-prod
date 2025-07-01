import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Course } from '@/courses';
import { User } from '@/auth';

@Entity()
export class PurchasedCourse {

  @PrimaryGeneratedColumn( 'uuid' )
  id: string;

  @Column( 'boolean', { default: true } )
  status: boolean;

  @Column( 'text', { nullable: false } )
  creationDate: string;

  @ManyToOne(
    () => Course,
    course => course.purchasedCourses,
    { eager: true }
  )
  course: Course;

  @ManyToOne(
    () => User,
    user => user.purchasedCourses,
    { eager: true }
  )
  user: User;

}