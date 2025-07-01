import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Category } from '@/categories';
import { CompletedCourse } from '@/completed-courses';
import { CourseCertificate } from '@/course-certificates';
import { Course } from '@/courses';
import { PurchasedCourse } from '@/purchased-courses';
import { SystemHistory } from '@/system-history';
import { TakenClass } from '@/taken-classes';
import { TakenCourse } from '@/taken-courses';
import { ClassResource } from '@/class-resources';
import { Video } from '@/videos';




@Entity( 'users' )
export class User {

  @PrimaryGeneratedColumn( 'uuid' )
  id: string;

  @Column( 'text', { nullable: false } )
  creationDate: string;

  @Column( 'text', { nullable: true } )
  lastActivity: string;

  @Column( 'boolean', { default: true, nullable: false } )
  isActive: boolean;

  @Column( 'text', { unique: true, nullable: false } )
  username: string;

  @Column( 'text', { unique: true, nullable: false } )
  clerkId: string;

  @Column( 'text', { select: false, nullable: false } )
  password: string;

  @Column( 'text', { nullable: false } )
  name: string;

  @Column( 'text', { nullable: false } )
  lastName: string;

  @Column( 'text', { nullable: true } )
  phone: string;

  @Column( 'text', { array: true, default: [ 'user' ] } )
  roles: string[];

  @OneToMany(
    () => Category,
    category => category.createdBy
  )
  category: Category[];

  @OneToMany(
    () => CompletedCourse,
    completedCourse => completedCourse.user
  )
  completedCourses: CompletedCourse[];

  @OneToMany(
    () => Course,
    course => course.createdBy
  )
  course: Course[];

  @OneToMany(
    () => CourseCertificate,
    courseCertificate => courseCertificate.user
  )
  courseCertificates: CourseCertificate[];

  @OneToMany(
    () => PurchasedCourse,
    purchasedCourse => purchasedCourse.user
  )
  purchasedCourses: PurchasedCourse[];

  @OneToMany(
    () => SystemHistory,
    systemHistory => systemHistory.createdBy
  )
  systemHistory: SystemHistory[];

  @OneToMany(
    () => TakenClass,
    takenClass => takenClass.user
  )
  takenClasses: TakenClass[];

  @OneToMany(
    () => TakenCourse,
    takenCourse => takenCourse.user
  )
  takenCourses: TakenCourse[];

  @OneToMany(
    () => ClassResource,
    classResources => classResources.createdBy
  )
  classResources: ClassResource[];

  @OneToMany(
    () => Video,
    video => video.createdBy
  )
  video: Video[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.username = this.username.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }

}