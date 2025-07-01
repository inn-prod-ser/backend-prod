import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Course } from '@/courses/entities/course.entity';
import { User } from '@/auth/entities/user.entity';

@Entity('completed_courses')
export class CompletedCourse {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('text', { nullable: false })
  creationDate: string;

  @ManyToOne(
    () => Course,
    course => course.completedCourses,
    { eager: true }
  )
  course: Course;

  @ManyToOne(
    () => User,
    user => user.completedCourses,
    { eager: true }
  )
  user: User;
}