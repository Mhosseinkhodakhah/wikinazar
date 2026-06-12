import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export const ADMIN_PERMISSIONS = [
  'dashboard',
  'admins',
  'users',
  'subjects',
  'experiences',
  'requests',
  'settings',
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'varchar', name: 'display_name', nullable: true })
  displayName!: string | null;

  @Column({ type: 'boolean', name: 'is_super_admin', default: false })
  isSuperAdmin!: boolean;

  @Column({ type: 'jsonb', default: [] })
  permissions!: AdminPermission[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
