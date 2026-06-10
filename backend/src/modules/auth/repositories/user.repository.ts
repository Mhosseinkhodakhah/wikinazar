import { Repository } from 'typeorm';
import { getDataSource } from '../../../shared/database/typeorm';
import { User } from '../models/user.entity';

export class UserRepository {
  private repo: Repository<User>;

  constructor() {
    this.repo = getDataSource().getRepository(User);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOneBy({ email });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repo.findOneBy({ username });
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOneBy({ id });
  }

  async create(data: {
    email: string;
    username: string;
    passwordHash: string;
    displayName?: string;
  }): Promise<User> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async update(
    id: string,
    data: Partial<Pick<User, 'displayName' | 'avatarUrl' | 'bio' | 'passwordHash'>>,
  ): Promise<User> {
    await this.repo.update(id, data);
    return this.repo.findOneByOrFail({ id });
  }
}
