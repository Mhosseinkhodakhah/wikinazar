import { getDataSource } from '../../shared/database/typeorm';
import { Subject } from '../subject/models/subject.entity';
import { Request } from '../request/models/request.entity';
import { type FeedQueryDto } from './dto/feed.dto';
import { type FeedItemResponse } from './interfaces/feed.interface';
import { getCache, setCache } from '../../shared/redis/redis.client';

export class FeedService {
  async findAll(query: FeedQueryDto): Promise<{
    items: FeedItemResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const cacheKey = `feed:${JSON.stringify(query)}`;
    const cached = await getCache<{ items: FeedItemResponse[]; total: number }>(cacheKey);
    if (cached) {
      return { ...cached, page: query.page, limit: query.limit };
    }

    const dataSource = getDataSource();

    const [subjects, requests] = await Promise.all([
      dataSource.getRepository(Subject).find({
        order: { createdAt: 'DESC' },
        take: 200,
      }),
      dataSource.getRepository(Request).find({
        order: { createdAt: 'DESC' },
        take: 200,
        relations: ['requester'],
      }),
    ]);

    const items: FeedItemResponse[] = [
      ...subjects.map((s) => ({
        type: 'subject' as const,
        id: s.id,
        title: s.title,
        description: s.description,
        category: s.category,
        images: s.images ?? [],
        icon: s.icon,
        slug: s.slug,
        experienceCount: s.experienceCount,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
        votes: undefined,
        status: undefined,
        requesterId: undefined,
        requester: undefined,
      })),
      ...requests.map((r) => ({
        type: 'request' as const,
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category ?? null,
        images: r.images ?? [],
        votes: r.votes,
        status: r.status,
        requesterId: r.requesterId,
        requester: r.requester
          ? {
              id: r.requester.id,
              username: r.requester.username,
              displayName: r.requester.displayName,
            }
          : null,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        icon: undefined,
        slug: undefined,
        experienceCount: undefined,
      })),
    ];

    items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const total = items.length;
    const start = (query.page - 1) * query.limit;
    const paginatedItems = items.slice(start, start + query.limit);

    const result = {
      items: paginatedItems,
      total,
      page: query.page,
      limit: query.limit,
    };

    await setCache(cacheKey, { items: result.items, total }, 60);
    return result;
  }
}
