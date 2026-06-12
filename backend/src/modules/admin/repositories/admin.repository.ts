import { Repository } from 'typeorm';
import { getDataSource } from '../../../shared/database/typeorm';
import { Admin } from '../models/admin.entity';

export class AdminRepository {
  private repo: Repository<Admin>;

  constructor() {
    this.repo = getDataSource().getRepository(Admin);
  }

  async findById(id: string): Promise<Admin | null> {
    return this.repo.findOneBy({ id });
  }

  async findByUsername(username: string): Promise<Admin | null> {
    return this.repo.findOneBy({ username });
  }

  async findAll(): Promise<Admin[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async create(data: Partial<Admin>): Promise<Admin> {
    const admin = this.repo.create(data);
    return this.repo.save(admin);
  }

  async update(id: string, data: Partial<Admin>): Promise<Admin | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async count(): Promise<number> {
    return this.repo.count();
  }
}
