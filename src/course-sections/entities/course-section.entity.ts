import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Course } from '@/courses/entities/course.entity';
import { CourseClass } from '@/course-classes/entities/course-class.entity';
import { User } from '@/auth/entities/user.entity';

@Entity( 'course_sections' )
export class CourseSection {

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
  slug: string;

  @Column( 'text', { nullable: false } )
  description: string;

  @OneToMany(
    () => CourseClass,
    courseClass => courseClass.courseSection
  )
  courseClasses: CourseClass[];

  @ManyToOne(
    () => Course,
    course => course.courseSections,
    { eager: true }
  )
  course: Course;

  @Column( 'integer', { nullable: false } )
  positionOrder: number;
}
