import { Repository } from 'typeorm';
import { getDataSource } from '../../../shared/database/typeorm';
import { Request } from '../models/request.entity';
import { RequestVote } from '../models/request-vote.entity';

export class RequestRepository {
  private repo: Repository<Request>;
  private voteRepo: Repository<RequestVote>;

  constructor() {
    this.repo = getDataSource().getRepository(Request);
    this.voteRepo = getDataSource().getRepository(RequestVote);
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

  async toggleVote(requestId: string, userId: string): Promise<{ votes: number; voted: boolean }> {
    const existing = await this.voteRepo.findOneBy({ requestId, userId });

    if (existing) {
      await this.voteRepo.remove(existing);
      await this.repo.decrement({ id: requestId }, 'votes', 1);
    } else {
      const vote = this.voteRepo.create({ requestId, userId });
      await this.voteRepo.save(vote);
      await this.repo.increment({ id: requestId }, 'votes', 1);
    }

    const req = await this.repo.findOneByOrFail({ id: requestId });
    return { votes: req.votes, voted: !existing };
  }

  async hasUserVoted(requestId: string, userId: string): Promise<boolean> {
    const existing = await this.voteRepo.findOneBy({ requestId, userId });
    return !!existing;
  }

  async updateStatus(id: string, status: string): Promise<Request> {
    await this.repo.update(id, { status });
    return this.repo.findOneByOrFail({ id });
  }
}
