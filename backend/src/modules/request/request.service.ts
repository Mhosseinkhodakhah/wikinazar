import { RequestRepository } from './repositories/request.repository';
import { type CreateRequestDto, type RequestQueryDto } from './dto/request.dto';
import { type RequestResponse } from './interfaces/request.interface';
import { NotFoundError } from '../../shared/errors/http-error';
import { invalidateCachePattern, setCache, getCache } from '../../shared/redis/redis.client';
import { publishEvent } from '../../shared/kafka/kafka.client';
import { logger } from '../../shared/logger/logger';

export class RequestService {
  private repository: RequestRepository;

  constructor() {
    this.repository = new RequestRepository();
  }

  private toResponse(req: any): RequestResponse {
    return {
      id: req.id,
      title: req.title,
      description: req.description,
      category: req.category ?? null,
      votes: req.votes,
      status: req.status,
      requesterId: req.requesterId,
      createdAt: req.createdAt,
      updatedAt: req.updatedAt,
      ...(req.requester && {
        requester: {
          id: req.requester.id,
          username: req.requester.username,
          displayName: req.requester.displayName,
        },
      }),
    };
  }

  async findAll(query: RequestQueryDto): Promise<{
    requests: RequestResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const cacheKey = `requests:${JSON.stringify(query)}`;
    const cached = await getCache<{ requests: RequestResponse[]; total: number }>(cacheKey);
    if (cached) {
      logger.info('Request findAll (cached)', { query });
      return { ...cached, page: query.page, limit: query.limit };
    }

    const { requests, total } = await this.repository.findAll({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      status: query.status,
      category: query.category,
      orderBy: { [query.sortBy]: query.sortOrder },
    });

    const result = {
      requests: requests.map(this.toResponse),
      total,
      page: query.page,
      limit: query.limit,
    };

    await setCache(cacheKey, { requests: result.requests, total }, 60);
    logger.info('Request findAll', { total, page: query.page });
    return result;
  }

  async create(dto: CreateRequestDto, requesterId: string): Promise<RequestResponse> {
    const request = await this.repository.create({
      title: dto.title,
      description: dto.description,
      category: dto.category,
      requesterId,
    });

    await invalidateCachePattern('requests:*');

    await publishEvent('request.events', {
      type: 'request.created',
      requestId: request.id,
      title: request.title,
    });

    logger.info('Request created', { id: request.id });
    return this.toResponse(request);
  }

  async vote(id: string, userId: string): Promise<{ votes: number; voted: boolean }> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Request not found');
    }

    const result = await this.repository.toggleVote(id, userId);
    await invalidateCachePattern('requests:*');

    await publishEvent('request.events', {
      type: result.voted ? 'request.voted' : 'request.unvoted',
      requestId: id,
      userId,
    });

    logger.info('Request vote toggled', { id, userId, voted: result.voted, votes: result.votes });
    return result;
  }

  async updateStatus(id: string, status: string): Promise<RequestResponse> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Request not found');
    }

    const request = await this.repository.updateStatus(id, status);
    await invalidateCachePattern('requests:*');

    logger.info('Request status updated', { id, status });
    return this.toResponse(request);
  }
}
