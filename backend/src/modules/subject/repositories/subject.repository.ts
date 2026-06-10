import { Repository, ILike } from 'typeorm';
import { getDataSource } from '../../../shared/database/typeorm';
import { Subject } from '../models/subject.entity';

export class SubjectRepository {
  private repo: Repository<Subject>;

  constructor() {
    this.repo = getDataSource().getRepository(Subject);
  }

  async findById(id: string): Promise<Subject | null> {
    return this.repo.findOneBy({ id });
  }

  async findBySlug(slug: string): Promise<Subject | null> {
    return this.repo.findOneBy({ slug });
  }

  async findAll(params: {
    skip: number;
    take: number;
    search?: string;
    category?: string;
    orderBy: Record<string, 'asc' | 'desc'>;
  }): Promise<{ subjects: Subject[]; total: number }> {
    const where: Record<string, unknown>[] = [];

    if (params.search) {
      where.push({
        title: ILike(`%${params.search}%`),
        ...(params.category ? { category: params.category } : {}),
      });
      where.push({
        description: ILike(`%${params.search}%`),
        ...(params.category ? { category: params.category } : {}),
      });
    } else if (params.category) {
      where.push({ category: params.category });
    }

    const [subjects, total] = await this.repo.findAndCount({
      where: where.length > 0 ? where : undefined,
      skip: params.skip,
      take: params.take,
      order: params.orderBy,
    });

    return { subjects, total };
  }

  async create(data: {
    title: string;
    slug: string;
    description?: string;
    category?: string;
    icon?: string;
  }): Promise<Subject> {
    const subject = this.repo.create(data);
    return this.repo.save(subject);
  }

  async update(
    id: string,
    data: Partial<Pick<Subject, 'title' | 'slug' | 'description' | 'category' | 'icon'>>,
  ): Promise<Subject> {
    await this.repo.update(id, data);
    return this.repo.findOneByOrFail({ id });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
