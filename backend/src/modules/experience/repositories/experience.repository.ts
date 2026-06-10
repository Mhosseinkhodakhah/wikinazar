import { Repository, MoreThanOrEqual } from 'typeorm';
import { getDataSource } from '../../../shared/database/typeorm';
import { Experience } from '../models/experience.entity';
import { Subject } from '../../subject/models/subject.entity';

export class ExperienceRepository {
  private repo: Repository<Experience>;
  private subjectRepo: Repository<Subject>;

  constructor() {
    this.repo = getDataSource().getRepository(Experience);
    this.subjectRepo = getDataSource().getRepository(Subject);
  }

  async findById(id: string): Promise<Experience | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['author', 'subject'],
    });
  }

  async findAll(params: {
    skip: number;
    take: number;
    subjectId?: string;
    authorId?: string;
    minRating?: number;
    orderBy: Record<string, 'asc' | 'desc'>;
  }): Promise<{ experiences: Experience[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (params.subjectId) where.subjectId = params.subjectId;
    if (params.authorId) where.authorId = params.authorId;
    if (params.minRating) where.rating = MoreThanOrEqual(params.minRating);

    const [experiences, total] = await this.repo.findAndCount({
      where,
      skip: params.skip,
      take: params.take,
      order: params.orderBy,
      relations: ['author', 'subject'],
    });

    return { experiences, total };
  }

  async create(data: {
    content: string;
    rating: number;
    authorId: string;
    subjectId: string;
  }): Promise<Experience> {
    const experience = this.repo.create(data);
    return this.repo.save(experience);
  }

  async update(
    id: string,
    data: Partial<Pick<Experience, 'content' | 'rating'>>,
  ): Promise<Experience> {
    await this.repo.update(id, data);
    return this.repo.findOneByOrFail({ id });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async incrementLikes(id: string): Promise<Experience> {
    await this.repo.increment({ id }, 'likes', 1);
    return this.repo.findOneByOrFail({ id });
  }

  async getSubjectRatingStats(subjectId: string): Promise<{ average: number; count: number }> {
    const result = await this.repo
      .createQueryBuilder('experience')
      .select('AVG(experience.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('experience.subjectId = :subjectId', { subjectId })
      .getRawOne();

    return {
      average: result?.avg ? parseFloat(result.avg) : 0,
      count: result?.count ? parseInt(result.count, 10) : 0,
    };
  }

  async updateSubjectExperienceCount(subjectId: string): Promise<void> {
    const count = await this.repo.countBy({ subjectId });
    await this.subjectRepo.update(subjectId, { experienceCount: count });
  }
}
