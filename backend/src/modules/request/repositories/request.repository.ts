import { Repository } from 'typeorm';
import { getDataSource } from '../../../shared/database/typeorm';
import { Request } from '../models/request.entity';

export class RequestRepository {
  private repo: Repository<Request>;

  constructor() {
    this.repo = getDataSource().getRepository(Request);
  }

  async findById(id: string): Promise<Request | null> {
    return this.repo.findOneBy({ id });
  }

  async findAll(params: {
    skip: number;
    take: number;
    status?: string;
    orderBy: Record<string, 'asc' | 'desc'>;
  }): Promise<{ requests: Request[]; total: number }> {
    const where: Record<string, unknown> = {};
    if (params.status) where.status = params.status;

    const [requests, total] = await this.repo.findAndCount({
      where,
      skip: params.skip,
      take: params.take,
      order: params.orderBy,
      relations: ['requester'],
    });

    return { requests, total };
  }

  async create(data: {
    title: string;
    description?: string;
    requesterId: string;
  }): Promise<Request> {
    const request = this.repo.create(data);
    return this.repo.save(request);
  }

  async incrementVotes(id: string): Promise<Request> {
    await this.repo.increment({ id }, 'votes', 1);
    return this.repo.findOneByOrFail({ id });
  }

  async updateStatus(id: string, status: string): Promise<Request> {
    await this.repo.update(id, { status });
    return this.repo.findOneByOrFail({ id });
  }
}
