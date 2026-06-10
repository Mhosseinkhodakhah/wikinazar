import { SubjectRepository } from './repositories/subject.repository';
import { type CreateSubjectDto, type UpdateSubjectDto, type SubjectQueryDto } from './dto/subject.dto';
import { type SubjectResponse } from './interfaces/subject.interface';
import { NotFoundError } from '../../shared/errors/http-error';
import { getCache, setCache, invalidateCachePattern } from '../../shared/redis/redis.client';
import { publishEvent } from '../../shared/kafka/kafka.client';
import { logger } from '../../shared/logger/logger';

export class SubjectService {
  private repository: SubjectRepository;

  constructor() {
    this.repository = new SubjectRepository();
  }

  private toResponse(subject: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    category: string | null;
    icon: string | null;
    experienceCount: number;
    createdAt: Date;
    updatedAt: Date;
  }): SubjectResponse {
    return {
      id: subject.id,
      title: subject.title,
      slug: subject.slug,
      description: subject.description,
      category: subject.category,
      icon: subject.icon,
      experienceCount: subject.experienceCount,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
    };
  }

  private slugify(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async findAll(query: SubjectQueryDto): Promise<{ subjects: SubjectResponse[]; total: number; page: number; limit: number }> {
    const cacheKey = `subjects:${JSON.stringify(query)}`;
    const cached = await getCache<{ subjects: SubjectResponse[]; total: number }>(cacheKey);
    if (cached) {
      return { ...cached, page: query.page, limit: query.limit };
    }

    const { subjects, total } = await this.repository.findAll({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      search: query.search,
      category: query.category,
      orderBy: { [query.sortBy]: query.sortOrder },
    });

    const result = {
      subjects: subjects.map(this.toResponse),
      total,
      page: query.page,
      limit: query.limit,
    };

    await setCache(cacheKey, { subjects: result.subjects, total }, 60);
    return result;
  }

  async findBySlug(slug: string): Promise<SubjectResponse> {
    const cacheKey = `subject:${slug}`;
    const cached = await getCache<SubjectResponse>(cacheKey);
    if (cached) return cached;

    const subject = await this.repository.findBySlug(slug);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    const response = this.toResponse(subject);
    await setCache(cacheKey, response, 120);
    return response;
  }

  async findById(id: string): Promise<SubjectResponse> {
    const subject = await this.repository.findById(id);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    return this.toResponse(subject);
  }

  async create(dto: CreateSubjectDto): Promise<SubjectResponse> {
    const slug = this.slugify(dto.title);
    const subject = await this.repository.create({
      title: dto.title,
      slug,
      description: dto.description,
      category: dto.category,
      icon: dto.icon,
    });

    await invalidateCachePattern('subjects:*');

    await publishEvent('subject.events', {
      type: 'subject.created',
      subjectId: subject.id,
      title: subject.title,
    });

    logger.info('Subject created', { id: subject.id, title: subject.title });
    return this.toResponse(subject);
  }

  async update(id: string, dto: UpdateSubjectDto): Promise<SubjectResponse> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Subject not found');
    }

    const updateData: Record<string, unknown> = {};
    if (dto.title !== undefined) {
      updateData.title = dto.title;
      updateData.slug = this.slugify(dto.title);
    }
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.icon !== undefined) updateData.icon = dto.icon;

    const subject = await this.repository.update(id, updateData as Parameters<typeof this.repository.update>[1]);

    await invalidateCachePattern('subjects:*');
    await invalidateCachePattern(`subject:${existing.slug}`);

    logger.info('Subject updated', { id });
    return this.toResponse(subject);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Subject not found');
    }

    await this.repository.delete(id);

    await invalidateCachePattern('subjects:*');
    await invalidateCachePattern(`subject:${existing.slug}`);

    await publishEvent('subject.events', {
      type: 'subject.deleted',
      subjectId: id,
    });

    logger.info('Subject deleted', { id });
  }
}
