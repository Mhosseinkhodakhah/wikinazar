import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/models/user.entity';

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'varchar', nullable: true })
  description!: string | null;

  @Column({ default: 0 })
  votes!: number;

  @Column({ default: 'open' })
  status!: string;

  @Column({ name: 'requester_id' })
  requesterId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.requests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requester_id' })
  requester!: User;
}
