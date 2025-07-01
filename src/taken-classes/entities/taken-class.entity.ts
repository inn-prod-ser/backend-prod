import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { CourseClass } from '@/course-classes/entities/course-class.entity';
import { User } from '@/auth/entities/user.entity';

@Entity('taken_classes')
export class TakenClass {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('boolean', { default: true })
  status: boolean;

  @Column('text', { nullable: false })
  creationDate: string;

  @ManyToOne(
    () => CourseClass,
    courseClass => courseClass.takenClasses,
    { eager: true }
  )
  courseClass: CourseClass;

  @ManyToOne(
    () => User,
    user => user.takenClasses,
    { eager: true }
  )
  user: User;

}