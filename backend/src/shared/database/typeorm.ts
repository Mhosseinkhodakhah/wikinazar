import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from '../../config';
import { logger } from '../logger/logger';

import { User } from '../../modules/auth/models/user.entity';
import { Subject } from '../../modules/subject/models/subject.entity';
import { Experience } from '../../modules/experience/models/experience.entity';
import { Request } from '../../modules/request/models/request.entity';

let dataSource: DataSource;

export function getDataSource(): DataSource {
  if (!dataSource) {
    dataSource = new DataSource({
      type: 'postgres',
      url: env.database.url,
      entities: [User, Subject, Experience, Request],
      synchronize: env.nodeEnv !== 'production',
      logging: env.nodeEnv !== 'production',
    });
  }
  return dataSource;
}

export async function initializeDatabase(): Promise<DataSource> {
  const ds = getDataSource();
  if (!ds.isInitialized) {
    await ds.initialize();
    logger.info('PostgreSQL connected via TypeORM');
  }
  return ds;
}

export async function disconnectDatabase(): Promise<void> {
  if (dataSource?.isInitialized) {
    await dataSource.destroy();
    logger.info('PostgreSQL disconnected');
  }
}
