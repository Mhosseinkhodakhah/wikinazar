import { UserRepository } from './repositories/user.repository';
import { hashPassword, comparePassword } from './utils/password.utils';
import { generateAccessToken, generateRefreshToken, verifyToken } from './utils/jwt.utils';
import { ConflictError, UnauthorizedError } from '../../shared/errors/http-error';
import { type RegisterDto } from './dto/register.dto';
import { type LoginDto } from './dto/login.dto';
import { type AuthResponse, type TokenPayload } from './interfaces/auth.interface';
import { type UserResponse } from './interfaces/user.interface';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  private mapUserToResponse(user: {
    id: string;
    email: string;
    username: string;
    role: UserResponse['role'];
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    createdAt: Date;
  }): UserResponse {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt,
    };
  }

  private generateTokens(user: { id: string; email: string; role: string }): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingEmail = await this.userRepository.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictError('Email already registered');
    }

    const existingUsername = await this.userRepository.findByUsername(dto.username);
    if (existingUsername) {
      throw new ConflictError('Username already taken');
    }

    const passwordHash = await hashPassword(dto.password);
    const user = await this.userRepository.create({
      email: dto.email,
      username: dto.username,
      passwordHash,
      displayName: dto.displayName,
    });

    const tokens = this.generateTokens(user);

    return {
      user: this.mapUserToResponse(user),
      tokens,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = this.generateTokens(user);

    return {
      user: this.mapUserToResponse(user),
      tokens,
    };
  }

  async getProfile(userId: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return this.mapUserToResponse(user);
  }

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: TokenPayload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const tokens = this.generateTokens(user);

    return tokens;
  }
}
