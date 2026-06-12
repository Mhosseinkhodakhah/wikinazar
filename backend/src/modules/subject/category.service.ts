import { CategoryRepository } from './repositories/category.repository';
import { type CreateCategoryDto, type UpdateCategoryDto } from './dto/category.dto';
import { type CategoryResponse } from './interfaces/category.interface';
import { NotFoundError } from '../../shared/errors/http-error';
import { logger } from '../../shared/logger/logger';

export class CategoryService {
  private repository: CategoryRepository;

  constructor() {
    this.repository = new CategoryRepository();
  }

  private toResponse(cat: any): CategoryResponse {
    return {
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      icon: cat.icon,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    };
  }

  async findAll(): Promise<CategoryResponse[]> {
    const categories = await this.repository.findAll();
    return categories.map(this.toResponse);
  }

  async findById(id: string): Promise<CategoryResponse> {
    const cat = await this.repository.findById(id);
    if (!cat) throw new NotFoundError('Category not found');
    return this.toResponse(cat);
  }

  async create(dto: CreateCategoryDto): Promise<CategoryResponse> {
    const existing = await this.repository.findBySlug(dto.slug);
    if (existing) {
      throw new NotFoundError('Category with this slug already exists');
    }
    const cat = await this.repository.create(dto);
    logger.info('Category created', { id: cat.id, slug: cat.slug });
    return this.toResponse(cat);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryResponse> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Category not found');
    const cat = await this.repository.update(id, dto as any);
    logger.info('Category updated', { id });
    return this.toResponse(cat);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundError('Category not found');
    await this.repository.delete(id);
    logger.info('Category deleted', { id });
  }
}
