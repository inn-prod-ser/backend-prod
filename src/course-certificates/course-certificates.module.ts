import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/auth';
import { CourseCertificate } from './entities';
import { CourseCertificatesController } from './course-certificates.controller';
import { CourseCertificatesService } from './course-certificates.service';
import { CoursesModule } from '@/courses/courses.module';
import { SystemHistory } from '@/system-history';


@Module({
  controllers: [
    CourseCertificatesController
  ],
  providers: [
    CourseCertificatesService
  ],
  imports: [
    TypeOrmModule.forFeature([
      CourseCertificate,
      SystemHistory
    ]),
    AuthModule,
    CoursesModule,
  ],
  exports: [TypeOrmModule],
})
export class CourseCertificatesModule {}