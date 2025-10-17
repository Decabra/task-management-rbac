import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { User } from './entities/user/user.entity';
import { Organization } from './entities/organization/organization.entity';
import { Permission } from './entities/permission/permission.entity';
import { Task } from './entities/task/task.entity';
import { AuditLog } from './entities/audit-log/audit-log.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
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

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;