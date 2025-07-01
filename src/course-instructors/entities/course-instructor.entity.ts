import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Course } from '@/courses/entities/course.entity';

@Entity()
export class CourseInstructor {

  @PrimaryGeneratedColumn( 'uuid' )
  id: string;

  @Column( 'boolean', { default: true } )
  isActive: boolean;

  @Column( 'text', { nullable: false } )
  creationDate: string;

  @Column( 'text', { nullable: false } )
  fullName: string;

  @Column( 'text', { nullable: true } )
  profilePictureUrl: string;

  @Column( 'text', { nullable: true } )
  profesionalTitle: string;

  @ManyToMany( () => Course, course => course.instructors )
  courses: Course[];
}
