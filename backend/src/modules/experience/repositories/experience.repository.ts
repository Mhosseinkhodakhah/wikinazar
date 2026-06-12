import { Repository, MoreThanOrEqual } from 'typeorm';
import { getDataSource } from '../../../shared/database/typeorm';
import { Experience } from '../models/experience.entity';
import { ExperienceLike } from '../models/experience-like.entity';
import { Subject } from '../../subject/models/subject.entity';

export class ExperienceRepository {
  private repo: Repository<Experience>;
  private likeRepo: Repository<ExperienceLike>;
  private subjectRepo: Repository<Subject>;

  constructor() {
    this.repo = getDataSource().getRepository(Experience);
    this.likeRepo = getDataSource().getRepository(ExperienceLike);
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
    tags?: string[];
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

  async toggleLike(experienceId: string, userId: string): Promise<{ likes: number; liked: boolean }> {
    const existing = await this.likeRepo.findOneBy({ experienceId, userId });

    if (existing) {
      await this.likeRepo.remove(existing);
      await this.repo.decrement({ id: experienceId }, 'likes', 1);
    } else {
      const like = this.likeRepo.create({ experienceId, userId });
      await this.likeRepo.save(like);
      await this.repo.increment({ id: experienceId }, 'likes', 1);
    }

    const exp = await this.repo.findOneByOrFail({ id: experienceId });
    return { likes: exp.likes, liked: !existing };
  }

  async hasUserLiked(experienceId: string, userId: string): Promise<boolean> {
    const existing = await this.likeRepo.findOneBy({ experienceId, userId });
    return !!existing;
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
