import { AdminRepository } from './repositories/admin.repository';
import { hashAdminPassword, compareAdminPassword } from './utils/password.utils';
import { generateAdminAccessToken, generateAdminRefreshToken } from './utils/jwt.utils';
import { ConflictError, NotFoundError, UnauthorizedError, BadRequestError } from '../../shared/errors/http-error';
import { logger } from '../../shared/logger/logger';
import { ADMIN_PERMISSIONS, type AdminPermission } from './models/admin.entity';
import { type CreateAdminDto } from './dto/create-admin.dto';
import { type UpdateAdminDto } from './dto/update-admin.dto';
import { type AdminLoginDto } from './dto/login.dto';
import { type AdminResponse, type AdminLoginResponse } from './interfaces/admin.interface';
import { UserRepository } from '../auth/repositories/user.repository';
import { SubjectRepository } from '../subject/repositories/subject.repository';
import { ExperienceRepository } from '../experience/repositories/experience.repository';
import { RequestRepository } from '../request/repositories/request.repository';
import { getDataSource } from '../../shared/database/typeorm';
import { User } from '../auth/models/user.entity';
import { Subject } from '../subject/models/subject.entity';
import { Experience } from '../experience/models/experience.entity';
import { Request } from '../request/models/request.entity';

export class AdminService {
  private adminRepository: AdminRepository;
  private userRepository: UserRepository;
  private subjectRepository: SubjectRepository;
  private experienceRepository: ExperienceRepository;
  private requestRepository: RequestRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
    this.userRepository = new UserRepository();
    this.subjectRepository = new SubjectRepository();
    this.experienceRepository = new ExperienceRepository();
    this.requestRepository = new RequestRepository();
  }

  private mapToResponse(admin: {
    id: string;
    username: string;
    displayName: string | null;
    isSuperAdmin: boolean;
    permissions: AdminPermission[];
    createdAt: Date;
    updatedAt: Date;
  }): AdminResponse {
    return {
      id: admin.id,
      username: admin.username,
      displayName: admin.displayName,
      isSuperAdmin: admin.isSuperAdmin,
      permissions: admin.permissions,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }

  async seedSuperAdmin(): Promise<void> {
    const count = await this.adminRepository.count();
    if (count > 0) {
      logger.info('Admin already exists, skipping superadmin seed');
      return;
    }

    const existing = await this.adminRepository.findByUsername('superadmin');
    if (existing) {
      logger.info('Superadmin already exists');
      return;
    }

    const passwordHash = await hashAdminPassword('Lucifer@25255225');
    await this.adminRepository.create({
      username: 'superadmin',
      passwordHash,
      displayName: 'Super Admin',
      isSuperAdmin: true,
      permissions: [...ADMIN_PERMISSIONS],
    });

    logger.info('Superadmin account created successfully');
  }

  async login(dto: AdminLoginDto): Promise<AdminLoginResponse> {
    const admin = await this.adminRepository.findByUsername(dto.username);
    if (!admin) {
      throw new UnauthorizedError('Invalid username or password');
    }

    const isValid = await compareAdminPassword(dto.password, admin.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid username or password');
    }

    const payload = {
      sub: admin.id,
      username: admin.username,
      isSuperAdmin: admin.isSuperAdmin,
      permissions: admin.permissions,
    };

    const tokens = {
      accessToken: generateAdminAccessToken(payload),
      refreshToken: generateAdminRefreshToken(payload),
    };

    return {
      admin: this.mapToResponse(admin),
      tokens,
    };
  }

  async getProfile(adminId: string): Promise<AdminResponse> {
    const admin = await this.adminRepository.findById(adminId);
    if (!admin) {
      throw new NotFoundError('Admin not found');
    }
    return this.mapToResponse(admin);
  }

  async getAllAdmins(): Promise<AdminResponse[]> {
    const admins = await this.adminRepository.findAll();
    return admins.map((a) => this.mapToResponse(a));
  }

  async getAdminById(id: string): Promise<AdminResponse> {
    const admin = await this.adminRepository.findById(id);
    if (!admin) {
      throw new NotFoundError('Admin not found');
    }
    return this.mapToResponse(admin);
  }

  async createAdmin(dto: CreateAdminDto): Promise<AdminResponse> {
    const existing = await this.adminRepository.findByUsername(dto.username);
    if (existing) {
      throw new ConflictError('Username already taken');
    }

    const passwordHash = await hashAdminPassword(dto.password);
    const admin = await this.adminRepository.create({
      username: dto.username,
      passwordHash,
      displayName: dto.displayName ?? null,
      permissions: dto.permissions,
      isSuperAdmin: false,
    });

    logger.info('Admin account created', { username: admin.username });
    return this.mapToResponse(admin);
  }

  async updateAdmin(id: string, dto: UpdateAdminDto): Promise<AdminResponse> {
    const admin = await this.adminRepository.findById(id);
    if (!admin) {
      throw new NotFoundError('Admin not found');
    }

    if (admin.isSuperAdmin) {
      throw new BadRequestError('Cannot modify superadmin account');
    }

    if (dto.username && dto.username !== admin.username) {
      const existing = await this.adminRepository.findByUsername(dto.username);
      if (existing) {
        throw new ConflictError('Username already taken');
      }
    }

    const updateData: Record<string, unknown> = {};
    if (dto.username) updateData.username = dto.username;
    if (dto.displayName !== undefined) updateData.displayName = dto.displayName;
    if (dto.password) {
      updateData.passwordHash = await hashAdminPassword(dto.password);
    }
    if (dto.permissions) updateData.permissions = dto.permissions;

    const updated = await this.adminRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError('Admin not found after update');
    }

    logger.info('Admin account updated', { id });
    return this.mapToResponse(updated);
  }

  async deleteAdmin(id: string): Promise<void> {
    const admin = await this.adminRepository.findById(id);
    if (!admin) {
      throw new NotFoundError('Admin not found');
    }

    if (admin.isSuperAdmin) {
      throw new BadRequestError('Cannot delete superadmin account');
    }

    await this.adminRepository.delete(id);
    logger.info('Admin account deleted', { id });
  }

  async getDashboardStats(): Promise<{
    totalUsers: number;
    totalSubjects: number;
    totalExperiences: number;
    totalRequests: number;
    totalAdmins: number;
    recentUsers: Array<{ id: string; username: string; email: string; role: string; createdAt: Date }>;
    recentSubjects: Array<{ id: string; title: string; slug: string; experienceCount: number; createdAt: Date }>;
    recentExperiences: Array<{ id: string; content: string; rating: number; authorId: string; subjectId: string; createdAt: Date }>;
    recentRequests: Array<{ id: string; title: string; status: string; votes: number; createdAt: Date }>;
  }> {
    const ds = getDataSource();
    const userRepo = ds.getRepository(User);
    const subjectRepo = ds.getRepository(Subject);
    const experienceRepo = ds.getRepository(Experience);
    const requestRepo = ds.getRepository(Request);

    const [
      totalUsers,
      totalSubjects,
      totalExperiences,
      totalRequests,
      totalAdmins,
      recentUsers,
      recentSubjects,
      recentExperiences,
      recentRequests,
    ] = await Promise.all([
      userRepo.count(),
      subjectRepo.count(),
      experienceRepo.count(),
      requestRepo.count(),
      this.adminRepository.count(),
      userRepo.find({ order: { createdAt: 'desc' }, take: 5 }),
      subjectRepo.find({ order: { createdAt: 'desc' }, take: 5 }),
      experienceRepo.find({ order: { createdAt: 'desc' }, take: 5, relations: ['author', 'subject'] }),
      requestRepo.find({ order: { createdAt: 'desc' }, take: 5, relations: ['requester'] }),
    ]);

    return {
      totalUsers,
      totalSubjects,
      totalExperiences,
      totalRequests,
      totalAdmins,
      recentUsers: recentUsers.map((u) => ({ id: u.id, username: u.username, email: u.email, role: u.role, createdAt: u.createdAt })),
      recentSubjects: recentSubjects.map((s) => ({ id: s.id, title: s.title, slug: s.slug, experienceCount: s.experienceCount, createdAt: s.createdAt })),
      recentExperiences: recentExperiences.map((e) => ({ id: e.id, content: e.content.substring(0, 100), rating: e.rating, authorId: e.authorId, subjectId: e.subjectId, createdAt: e.createdAt })),
      recentRequests: recentRequests.map((r) => ({ id: r.id, title: r.title, status: r.status, votes: r.votes, createdAt: r.createdAt })),
    };
  }

  async getAllUsers(params: { page: number; limit: number; search?: string; role?: string }): Promise<{ users: User[]; total: number }> {
    const ds = getDataSource();
    const userRepo = ds.getRepository(User);
    const where: Record<string, unknown> = {};

    if (params.role) where.role = params.role;
    if (params.search) {
      const [users, total] = await userRepo.findAndCount({
        where: [
          { ...where, username: { _ilike: `%${params.search}%` } } as any,
          { ...where, email: { _ilike: `%${params.search}%` } } as any,
        ],
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        order: { createdAt: 'desc' },
      });
      return { users, total };
    }

    const [users, total] = await userRepo.findAndCount({
      where: Object.keys(where).length > 0 ? where : undefined,
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      order: { createdAt: 'desc' },
    });
    return { users, total };
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async updateUser(id: string, data: { role?: string; displayName?: string }): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updateData: Record<string, unknown> = {};
    if (data.role) updateData.role = data.role;
    if (data.displayName !== undefined) updateData.displayName = data.displayName;

    if (Object.keys(updateData).length > 0) {
      await getDataSource().getRepository(User).update(id, updateData);
    }

    return this.userRepository.findById(id) as Promise<User>;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    await getDataSource().getRepository(User).delete(id);
    logger.info('User deleted by admin', { userId: id });
  }

  async getAllSubjects(params: { page: number; limit: number; search?: string; category?: string }): Promise<{ subjects: Subject[]; total: number }> {
    return this.subjectRepository.findAll({
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      search: params.search,
      category: params.category,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSubject(data: { title: string; slug: string; description?: string; category?: string; icon?: string }): Promise<Subject> {
    return this.subjectRepository.create(data);
  }

  async updateSubject(id: string, data: { title?: string; slug?: string; description?: string; category?: string; icon?: string }): Promise<Subject> {
    const existing = await this.subjectRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Subject not found');
    }
    return this.subjectRepository.update(id, data);
  }

  async deleteSubject(id: string): Promise<void> {
    const subject = await this.subjectRepository.findById(id);
    if (!subject) {
      throw new NotFoundError('Subject not found');
    }
    await this.subjectRepository.delete(id);
    logger.info('Subject deleted by admin', { subjectId: id });
  }

  async getAllExperiences(params: { page: number; limit: number; subjectId?: string; authorId?: string; minRating?: number }): Promise<{ experiences: Experience[]; total: number }> {
    return this.experienceRepository.findAll({
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      subjectId: params.subjectId,
      authorId: params.authorId,
      minRating: params.minRating,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getExperienceById(id: string): Promise<Experience> {
    const exp = await this.experienceRepository.findById(id);
    if (!exp) {
      throw new NotFoundError('Experience not found');
    }
    return exp;
  }

  async deleteExperience(id: string): Promise<void> {
    const exp = await this.experienceRepository.findById(id);
    if (!exp) {
      throw new NotFoundError('Experience not found');
    }
    await this.experienceRepository.delete(id);
    logger.info('Experience deleted by admin', { experienceId: id });
  }

  async getAllRequests(params: { page: number; limit: number; status?: string }): Promise<{ requests: Request[]; total: number }> {
    return this.requestRepository.findAll({
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      status: params.status,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRequestStatus(id: string, status: string): Promise<Request> {
    const req = await this.requestRepository.findById(id);
    if (!req) {
      throw new NotFoundError('Request not found');
    }
    return this.requestRepository.updateStatus(id, status);
  }

  async deleteRequest(id: string): Promise<void> {
    const req = await this.requestRepository.findById(id);
    if (!req) {
      throw new NotFoundError('Request not found');
    }
    await getDataSource().getRepository(Request).delete(id);
    logger.info('Request deleted by admin', { requestId: id });
  }
}
