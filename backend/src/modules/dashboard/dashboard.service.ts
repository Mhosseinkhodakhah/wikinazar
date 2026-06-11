import { getDataSource } from '../../shared/database/typeorm';
import { User } from '../auth/models/user.entity';
import { Experience } from '../experience/models/experience.entity';
import { Request } from '../request/models/request.entity';
import { type DashboardResponse } from './interfaces/dashboard.interface';
import { type UserResponse } from '../auth/interfaces/user.interface';
import { UnauthorizedError } from '../../shared/errors/http-error';
import { logger } from '../../shared/logger/logger';

export class DashboardService {
  async getDashboard(userId: string, limit: number = 5): Promise<DashboardResponse> {
    const ds = getDataSource();
    const userRepo = ds.getRepository(User);
    const experienceRepo = ds.getRepository(Experience);
    const requestRepo = ds.getRepository(Request);

    const user = await userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const [experiences, requests, ratingStats, totalRequestCount] = await Promise.all([
      experienceRepo.find({
        where: { authorId: userId },
        order: { createdAt: 'desc' },
        take: limit,
        relations: ['subject'],
      }),
      requestRepo.find({
        where: { requesterId: userId },
        order: { createdAt: 'desc' },
        take: limit,
      }),
      experienceRepo
        .createQueryBuilder('experience')
        .select('AVG(experience.rating)', 'avg')
        .addSelect('COUNT(*)', 'count')
        .where('experience.authorId = :userId', { userId })
        .getRawOne(),
      requestRepo.countBy({ requesterId: userId }),
    ]);

    const profile: UserResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt,
    };

    const avgRating = ratingStats?.avg ? parseFloat(ratingStats.avg) : 0;
    const totalExperiences = ratingStats?.count ? parseInt(ratingStats.count, 10) : 0;

    const result: DashboardResponse = {
      profile,
      stats: {
        totalExperiences,
        totalRequests: totalRequestCount,
        averageRating: Math.round(avgRating * 10) / 10,
      },
      recentExperiences: experiences.map((exp) => ({
        id: exp.id,
        content: exp.content,
        rating: exp.rating,
        likes: exp.likes,
        authorId: exp.authorId,
        subjectId: exp.subjectId,
        createdAt: exp.createdAt,
        updatedAt: exp.updatedAt,
        subject: exp.subject ?? undefined,
      })),
      recentRequests: requests.map((req) => ({
        id: req.id,
        title: req.title,
        description: req.description,
        votes: req.votes,
        status: req.status,
        requesterId: req.requesterId,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
      })),
    };

    logger.info('Dashboard retrieved', { userId, totalExperiences, totalRequests: requests.length });
    return result;
  }
}
