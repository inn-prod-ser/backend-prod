import { join } from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';

import { CommonModule } from './common/common.module';
// import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { MessagesWsModule } from './messages-ws/messages-ws.module';

import { SystemHistoryModule } from './system-history/system-history.module';
import { CoursesModule } from './courses/courses.module';
import { VideosModule } from './videos/videos.module';
import { CategoriesModule } from './categories/categories.module';
import { CourseSectionsModule } from './course-sections/course-sections.module';
import { ClassResourcesModule } from './class-resources/class-resources.module';
import { CourseClassesModule } from './course-classes/course-classes.module';
import { TakenCoursesModule } from './taken-courses/taken-courses.module';
import { TakenClassesModule } from './taken-classes/taken-classes.module';
import { CompletedCoursesModule } from './completed-courses/completed-courses.module';
import { CourseCertificatesModule } from './course-certificates/course-certificates.module';
import { PurchasedCoursesModule } from './purchased-courses/purchased-courses.module';
import { ClassContentModule } from './class-content/class-content.module';
import { CourseInstructorsModule } from './course-instructors/course-instructors.module';


@Module( {
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot( {
      ssl: process.env.STAGE === 'prod',
      extra: {
        ssl: process.env.STAGE === 'prod'
          ? { rejectUnauthorized: false }
          : null,
      },
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
    } ),

    ServeStaticModule.forRoot( {
      rootPath: join( __dirname, '..', 'public' ),
    } ),


    CommonModule,

    // FilesModule,

    AuthModule,

    MessagesWsModule,

    SystemHistoryModule,

    CoursesModule,

    VideosModule,

    CategoriesModule,

    CourseSectionsModule,

    ClassResourcesModule,

    CourseClassesModule,

    TakenCoursesModule,

    TakenClassesModule,

    CompletedCoursesModule,

    CourseCertificatesModule,

    PurchasedCoursesModule,

    ClassContentModule,

    CourseInstructorsModule,
  ],
} )
export class AppModule { }
