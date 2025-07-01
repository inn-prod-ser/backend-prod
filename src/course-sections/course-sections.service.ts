import {
  ConflictException,
  Injectable,
  NotFoundException,
  UseInterceptors
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

import { Course } from '@/courses';
import { CourseSection } from './entities';
import { CreateCourseSectionDto, UpdateCourseSectionDto } from './dto';
import { ErrorHandlerInterceptor } from '@/decorators';
import { SystemHistory } from '@/system-history';
import { User } from '@/auth';

@Injectable()
export class CourseSectionsService {

  constructor(
    @InjectRepository(CourseSection)
    private readonly courseSectionRepository: Repository<CourseSection>,

    @InjectRepository(SystemHistory)
    private readonly systemHistoryRepository: Repository<SystemHistory>,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) { }

  private getBuenosAiresTime(): string {
    return DateTime.now()
      .setZone('America/Argentina/Buenos_Aires')
      .toFormat('dd/MM/yyyy HH:mm:ss');
  }

  private sanitizeText(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n')
      .replace(/[^\x00-\x7F]/g, '')
      .trim();
  }

  private async saveHistory(title: string, description: string, user: User, idRegister: string): Promise<void> {
    const sanitizedDescription = this.sanitizeText(description);

    const historyEntry = this.systemHistoryRepository.create({
      createdBy: user,
      creationDate: this.getBuenosAiresTime(),
      description: sanitizedDescription,
      idRegister,
      title,
    });

    await this.systemHistoryRepository.save(historyEntry);
  }

  private generateSlug(slug: string): string {
    return slug.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n')
      .replace(/[^a-zA-Z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }

  private async validateUniqueSlug(slug: string, courseSectionId?: string): Promise<void> {
    const existingCourseSection = await this.courseSectionRepository.findOne({
      where: { slug, status: true, id: courseSectionId ? Not(courseSectionId) : undefined },
    });

    if (existingCourseSection) {
      throw new ConflictException(`A section with the slug "${slug}" already exists.`);
    }
  }

  private async reorderSections(courseId: string): Promise<void> {
    const sections = await this.courseSectionRepository.find({
      where: { course: { id: courseId }, status: true },
      order: { positionOrder: 'ASC' },
    });

    for (let i = 0; i < sections.length; i++) {
      await this.courseSectionRepository.update(sections[i].id, { positionOrder: i });
    }
  }

  @UseInterceptors(ErrorHandlerInterceptor)
  async create(createCourseSectionDto: CreateCourseSectionDto, user: User): Promise<CourseSection> {
    const sanitizedSlug = this.generateSlug(createCourseSectionDto.slug);
    await this.validateUniqueSlug(sanitizedSlug);

    const course = await this.courseRepository.findOne({
      where: { id: createCourseSectionDto.courseId, status: true },
    });

    if (!course) {
      throw new NotFoundException(`The course with ID "${createCourseSectionDto.courseId}" does not exist or is inactive.`);
    }

    const sections = await this.courseSectionRepository.find({
      where: { course: { id: createCourseSectionDto.courseId }, status: true },
      order: { positionOrder: 'ASC' },
    });

    let newPositionOrder = sections.length;

    if (createCourseSectionDto.positionOrder !== undefined) {
      newPositionOrder = createCourseSectionDto.positionOrder;

      for (const section of sections) {
        if (section.positionOrder >= newPositionOrder) {
          await this.courseSectionRepository.update(section.id, {
            positionOrder: section.positionOrder + 1
          });
        }
      }
    }

    const newCourseSection = this.courseSectionRepository.create({
      ...createCourseSectionDto,
      title: createCourseSectionDto.title.trim(),
      slug: sanitizedSlug,
      course,
      createdBy: user,
      creationDate: this.getBuenosAiresTime(),
      positionOrder: newPositionOrder,
      status: true,
    });

    const savedCourseSection = await this.courseSectionRepository.save(newCourseSection);

    await this.saveHistory(
      'Section created',
      `The section "${savedCourseSection.title}" was created by user "${user.username}".`,
      user,
      savedCourseSection.id,
    );

    return savedCourseSection;
  }

  @UseInterceptors(ErrorHandlerInterceptor)
  async findAll(): Promise<CourseSection[]> {
    return this.courseSectionRepository.find({
      where: { status: true },
      relations: ['course', 'createdBy'],
      order: { positionOrder: 'ASC' },
    });
  }

  @UseInterceptors(ErrorHandlerInterceptor)
  async findOne(id: string): Promise<CourseSection> {
    const section = await this.courseSectionRepository.findOne({
      where: { id, status: true },
      relations: ['course', 'createdBy'],
    });

    if (!section) {
      throw new NotFoundException(`The section with ID "${id}" does not exist.`);
    }

    return section;
  }

  @UseInterceptors(ErrorHandlerInterceptor)
  async findByCourseId(courseId: string): Promise<CourseSection[]> {
    return this.courseSectionRepository.find({
      where: { course: { id: courseId }, status: true },
      relations: ['course', 'createdBy'],
      order: { positionOrder: 'ASC' },
    });
  }

  async update(id: string, updateCourseSectionDto: UpdateCourseSectionDto, user: User): Promise<CourseSection> {
    const section = await this.findOne(id);

    if (updateCourseSectionDto.title) {
      section.title = this.sanitizeText(updateCourseSectionDto.title);
    }

    if (updateCourseSectionDto.slug && updateCourseSectionDto.slug !== section.slug) {
      section.slug = this.generateSlug(updateCourseSectionDto.slug);
      await this.validateUniqueSlug(section.slug, id);
    }

    if (updateCourseSectionDto.description) {
      section.description = this.sanitizeText(updateCourseSectionDto.description);
    }

    if (updateCourseSectionDto.positionOrder !== undefined && updateCourseSectionDto.positionOrder !== section.positionOrder) {
      const sections = await this.courseSectionRepository.find({
        where: { course: { id: section.course.id }, status: true },
        order: { positionOrder: 'ASC' },
      });

      const newOrder = updateCourseSectionDto.positionOrder;
      const oldOrder = section.positionOrder;

      if (newOrder < oldOrder) {
        for (const s of sections) {
          if (s.positionOrder >= newOrder && s.positionOrder < oldOrder && s.id !== id) {
            await this.courseSectionRepository.update(s.id, {
              positionOrder: s.positionOrder + 1
            });
          }
        }
      } else if (newOrder > oldOrder) {
        for (const s of sections) {
          if (s.positionOrder > oldOrder && s.positionOrder <= newOrder && s.id !== id) {
            await this.courseSectionRepository.update(s.id, {
              positionOrder: s.positionOrder - 1
            });
          }
        }
      }

      section.positionOrder = newOrder;
    }

    const updated = await this.courseSectionRepository.save({
      ...section,
      ...updateCourseSectionDto,
      title: section.title,
      slug: section.slug,
      description: section.description,
      positionOrder: section.positionOrder,
    });

    await this.saveHistory(
      'Section updated',
      `The section "${updated.title}" was updated by "${user.username}".`,
      user,
      updated.id,
    );

    return updated;
  }

  @UseInterceptors(ErrorHandlerInterceptor)
  async remove(id: string, user: User): Promise<void> {
    const section = await this.findOne(id);
    await this.courseSectionRepository.update(id, { status: false, slug: uuidv4() });
    await this.reorderSections(section.course.id);

    await this.saveHistory(
      'Section deleted',
      `The section "${section.title}" was deleted by "${user.username}".`,
      user,
      id,
    );
  }

  @UseInterceptors(ErrorHandlerInterceptor)
  async updateOrder(id: string, newOrder: number, user: User): Promise<CourseSection> {
    const section = await this.findOne(id);
    await this.courseSectionRepository.update(id, { positionOrder: newOrder });
    await this.reorderSections(section.course.id);

    await this.saveHistory(
      'Order updated',
      `The section "${section.title}" changed to position ${newOrder}.`,
      user,
      section.id,
    );

    return this.findOne(id);
  }
}