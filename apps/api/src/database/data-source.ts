import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { User } from './entities';
import { Organization } from './entities';
import { Permission } from './entities';
import { Task } from './entities';
import { AuditLog } from './entities';

// Railway provides DATABASE_URL, so we need to parse it
const getDatabaseConfig = () => {
  // If DATABASE_URL is provided (Railway), use it
  if (process.env['DATABASE_URL']) {
    return {
      type: 'postgres' as const,
      url: process.env['DATABASE_URL'],
      entities: [User, Organization, Permission, Task, AuditLog],
      migrations: [path.join(__dirname, 'migrations', '*{.ts,.js}')],
      synchronize: process.env['NODE_ENV'] !== 'production', // Only sync in development
      logging: false,
    };
  }

  // Fallback to individual environment variables (local development)
  return {
    type: 'postgres' as const,
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '5432', 10),
    username: process.env['DB_USER'] || 'postgres',
    password: process.env['DB_PASSWORD'] || 'postgres',
    database: process.env['DB_NAME'] || 'rbac_system',
    entities: [User, Organization, Permission, Task, AuditLog],
    migrations: [path.join(__dirname, 'migrations', '*{.ts,.js}')],
    synchronize: true, // Enable for development to auto-create tables
    logging: false, // Disable verbose query logging
  };
};

export const dataSourceOptions: DataSourceOptions = getDatabaseConfig();

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;