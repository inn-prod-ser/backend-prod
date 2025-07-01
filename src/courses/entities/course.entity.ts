import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Category } from '@/categories/entities/category.entity';
import { CompletedCourse } from '@/completed-courses';
import { CourseCertificate } from '@/course-certificates';
import { CourseInstructor } from '@/course-instructors/entities/course-instructor.entity';
import { CourseSection } from '@/course-sections';
import { PurchasedCourse } from '@/purchased-courses';
import { TakenCourse } from '@/taken-courses';
import { User } from '@/auth';

export enum DifficultyLevelEnum {
  Basica = 'Básica',
  Intermedia = 'Intermedia',
  Avanzada = 'Avanzada'
}

@Entity( 'courses' )
export class Course {

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

  @Column( 'text', { default: '1hs', nullable: false } )
  estimatedDuration: string;

  @Column( 'boolean', { default: true } )
  hasCertificate: boolean;

  @Column( 'text', { nullable: false } )
  slug: string;

  @Column( 'text', { nullable: false } )
  description: string;

  @Column( 'float', { nullable: false } )
  price: number;

  @Column( 'boolean', { default: false, nullable: false } )
  isPublic: boolean;

  @Column( 'boolean', { default: true, nullable: false } )
  courseUnderConstruction: boolean;

  @ManyToMany( () => Category, category => category.courses )
  @JoinTable()
  categories: Category[];

  @Column( {
    type: 'enum',
    enum: DifficultyLevelEnum,
    default: DifficultyLevelEnum.Basica
  } )
  difficultyLevel: DifficultyLevelEnum;

  @ManyToMany( () => CourseInstructor, instructor => instructor.courses, { eager: true } )
  @JoinTable()
  instructors: CourseInstructor[];

  @OneToMany(
    () => CompletedCourse,
    completedCourse => completedCourse.course
  )
  completedCourses: CompletedCourse[];

  @OneToMany(
    () => CourseCertificate,
    courseCertificate => courseCertificate.course
  )
  courseCertificates: CourseCertificate[];

  @OneToMany(
    () => CourseSection,
    courseSection => courseSection.course
  )
  courseSections: CourseSection[];

  @OneToMany(
    () => PurchasedCourse,
    purchasedCourse => purchasedCourse.course
  )
  purchasedCourses: PurchasedCourse[];

  @OneToMany(
    () => TakenCourse,
    takenCourse => takenCourse.course
  )
  takenCourses: TakenCourse[];
}
