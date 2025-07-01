import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '@/auth';
import { Course } from '@/courses';

@Entity( 'taken_courses' )
export class TakenCourse {

  @PrimaryGeneratedColumn( 'uuid' )
  id: string;

  @Column( 'boolean', { default: true } )
  status: boolean;

  @Column( 'text', { nullable: false } )
  creationDate: string;

  @ManyToOne(
    () => User,
    user => user.takenCourses,
    { eager: true }
  )
  user: User;

  @ManyToOne(
    () => Course,
    course => course.takenCourses,
    { eager: true }
  )
  course: Course;
}