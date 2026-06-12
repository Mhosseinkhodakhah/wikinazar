import { Repository } from 'typeorm';
import { getDataSource } from '../../../shared/database/typeorm';
import { Category } from '../models/category.entity';

export class CategoryRepository {
  private repo: Repository<Category>;

  constructor() {
    this.repo = getDataSource().getRepository(Category);
  }

  async findAll(): Promise<Category[]> {
    return this.repo.find({ order: { createdAt: 'ASC' } });
  }

  async findById(id: string): Promise<Category | null> {
    return this.repo.findOneBy({ id });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.repo.findOneBy({ slug });
  }

  async create(data: { slug: string; name: string; icon: string }): Promise<Category> {
    const category = this.repo.create(data);
    return this.repo.save(category);
  }

  async update(id: string, data: Partial<Pick<Category, 'slug' | 'name' | 'icon'>>): Promise<Category> {
    await this.repo.update(id, data);
    return this.repo.findOneByOrFail({ id });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async count(): Promise<number> {
    return this.repo.count();
  }
}
