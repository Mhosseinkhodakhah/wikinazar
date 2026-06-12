import { ExperienceRepository } from './repositories/experience.repository';
import { SubjectRepository } from '../subject/repositories/subject.repository';
import { type CreateExperienceDto, type UpdateExperienceDto, type ExperienceQueryDto } from './dto/experience.dto';
import { type ExperienceResponse } from './interfaces/experience.interface';
import { NotFoundError, ForbiddenError } from '../../shared/errors/http-error';
import { invalidateCachePattern, setCache, getCache } from '../../shared/redis/redis.client';
import { publishEvent } from '../../shared/kafka/kafka.client';
import { logger } from '../../shared/logger/logger';

export class ExperienceService {
  private repository: ExperienceRepository;
  private subjectRepository: SubjectRepository;

  constructor() {
    this.repository = new ExperienceRepository();
    this.subjectRepository = new SubjectRepository();
  }

  private toResponse(exp: any): ExperienceResponse {
    return {
      id: exp.id,
      content: exp.content,
      rating: exp.rating,
      likes: exp.likes,
      tags: exp.tags ?? [],
      authorId: exp.authorId,
      subjectId: exp.subjectId,
      createdAt: exp.createdAt,
      updatedAt: exp.updatedAt,
      ...(exp.author && {
        author: {
          id: exp.author.id,
          username: exp.author.username,
          displayName: exp.author.displayName,
          avatarUrl: exp.author.avatarUrl,
        },
      }),
      ...(exp.subject && {
        subject: {
          id: exp.subject.id,
          title: exp.subject.title,
          slug: exp.subject.slug,
        },
      }),
    };
  }

  async findAll(query: ExperienceQueryDto): Promise<{
    experiences: ExperienceResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const cacheKey = `experiences:${JSON.stringify(query)}`;
    const cached = await getCache<{ experiences: ExperienceResponse[]; total: number }>(cacheKey);
    if (cached) {
      logger.info('Experience findAll (cached)', { query });
      return { ...cached, page: query.page, limit: query.limit };
    }

    const { experiences, total } = await this.repository.findAll({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      subjectId: query.subjectId,
      authorId: query.authorId,
      minRating: query.minRating,
      orderBy: { [query.sortBy]: query.sortOrder },
    });

    const result = {
      experiences: experiences.map(this.toResponse),
      total,
      page: query.page,
      limit: query.limit,
    };

    await setCache(cacheKey, { experiences: result.experiences, total }, 60);
    logger.info('Experience findAll', { total, page: query.page });
    return result;
  }

  async findById(id: string): Promise<ExperienceResponse> {
    const exp = await this.repository.findById(id);
    if (!exp) {
      throw new NotFoundError('Experience not found');
    }

    logger.info('Experience findById', { id });
    return this.toResponse(exp);
  }

  async create(dto: CreateExperienceDto, authorId: string): Promise<ExperienceResponse> {
    const subject = await this.subjectRepository.findById(dto.subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    const experience = await this.repository.create({
      content: dto.content,
      rating: dto.rating,
      tags: dto.tags,
      authorId,
      subjectId: dto.subjectId,
    });

    await this.repository.updateSubjectExperienceCount(dto.subjectId);
    await invalidateCachePattern('experiences:*');
    await invalidateCachePattern(`subjects:*`);

    await publishEvent('experience.events', {
      type: 'experience.created',
      experienceId: experience.id,
      subjectId: dto.subjectId,
      rating: dto.rating,
    });

    logger.info('Experience created', { id: experience.id, subjectId: dto.subjectId });

    return this.toResponse({
      ...experience,
      author: undefined,
      subject: undefined,
    });
  }

  async update(id: string, dto: UpdateExperienceDto, userId: string): Promise<ExperienceResponse> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Experience not found');
    }

    if (existing.authorId !== userId) {
      throw new ForbiddenError('You can only update your own experiences');
    }

    const updateData: Record<string, unknown> = {};
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.rating !== undefined) updateData.rating = dto.rating;

    const experience = await this.repository.update(id, updateData as any);
    await invalidateCachePattern('experiences:*');

    logger.info('Experience updated', { id });
    return this.toResponse(experience);
  }

  async delete(id: string, userId: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Experience not found');
    }

    if (existing.authorId !== userId) {
      throw new ForbiddenError('You can only delete your own experiences');
    }

    await this.repository.delete(id);
    await this.repository.updateSubjectExperienceCount(existing.subjectId);
    await invalidateCachePattern('experiences:*');
    await invalidateCachePattern(`subjects:*`);

    await publishEvent('experience.events', {
      type: 'experience.deleted',
      experienceId: id,
      subjectId: existing.subjectId,
    });

    logger.info('Experience deleted', { id });
  }

  async like(id: string, userId: string): Promise<{ likes: number; liked: boolean }> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Experience not found');
    }

    const result = await this.repository.toggleLike(id, userId);
    await invalidateCachePattern('experiences:*');

    await publishEvent('experience.events', {
      type: result.liked ? 'experience.liked' : 'experience.unliked',
      experienceId: id,
      userId,
    });

    logger.info('Experience like toggled', { id, userId, liked: result.liked, likes: result.likes });
    return result;
  }

  async getSubjectStats(subjectId: string): Promise<{ averageRating: number; totalExperiences: number }> {
    const subject = await this.subjectRepository.findById(subjectId);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }

    const stats = await this.repository.getSubjectRatingStats(subjectId);
    logger.info('Experience getSubjectStats', { subjectId, averageRating: stats.average, totalExperiences: stats.count });
    return {
      averageRating: Math.round(stats.average * 10) / 10,
      totalExperiences: stats.count,
    };
  }
}
