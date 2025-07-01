import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Course } from '@/courses/entities/course.entity';
import { User } from '@/auth/entities/user.entity';

@Entity('course_certificates')
export class CourseCertificate {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('text', { nullable: false })
  creationDate: string;

  @ManyToOne(
    () => Course,
    course => course.courseCertificates,
    { eager: true }
  )
  course: Course;

  @ManyToOne(
    () => User,
    user => user.courseCertificates,
    { eager: true }
  )
  user: User;

}