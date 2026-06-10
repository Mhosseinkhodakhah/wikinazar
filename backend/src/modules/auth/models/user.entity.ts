import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Experience } from '../../experience/models/experience.entity';
import { Request } from '../../request/models/request.entity';

export enum Role {
  USER = 'USER',
  EXPERT = 'EXPERT',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role!: Role;

  @Column({ name: 'display_name', nullable: true })
  displayName!: string | null;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl!: string | null;

  @Column({ nullable: true })
  bio!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Experience, (exp) => exp.author)
  experiences!: Experience[];

  @OneToMany(() => Request, (req) => req.requester)
  requests!: Request[];
}
