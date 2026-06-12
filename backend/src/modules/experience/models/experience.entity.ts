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
import { Subject } from '../../subject/models/subject.entity';

@Entity('experiences')
export class Experience {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  content!: string;

  @Column({ default: 5 })
  rating!: number;

  @Column({ default: 0 })
  likes!: number;

  @Column('simple-array', { nullable: true })
  tags!: string[];

  @Column({ name: 'author_id' })
  authorId!: string;

  @Column({ name: 'subject_id' })
  subjectId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.experiences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @ManyToOne(() => Subject, (subject) => subject.experiences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subject_id' })
  subject!: Subject;
}
