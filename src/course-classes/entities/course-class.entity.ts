import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { ClassContent } from '@/class-content/entities/class-content.entity';
import { CourseSection } from '@/course-sections';
import { TakenClass } from '@/taken-classes';
import { User } from '@/auth';
import { Video } from '@/videos';


@Entity( 'course_classes' )
export class CourseClass {

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
  slug: string;

  @ManyToOne(
    () => CourseSection,
    courseSection => courseSection.courseClasses,
    { eager: true }
  )
  courseSection: CourseSection;

  @OneToMany(
    () => TakenClass,
    takenClass => takenClass.courseClass
  )
  takenClasses: TakenClass[];

  @OneToOne(
    () => Video,
    video => video.courseClass,
    { nullable: true }
  )
  video: Video;

  @Column( 'integer', { nullable: false } )
  positionOrder: number;

  @OneToMany(
    () => ClassContent,
    classContent => classContent.courseClass
  )
  ClassContent: ClassContent[];
}