import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { User } from './entities/user/user.entity';
import { Organization } from './entities/organization/organization.entity';
import { Permission } from './entities/permission/permission.entity';
import { Task } from './entities/task/task.entity';
import { AuditLog } from './entities/audit-log/audit-log.entity';

async function initializeDatabase() {
  console.log('🚀 Initializing database...');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '5432', 10),
    username: process.env['DB_USER'] || 'postgres',
    password: process.env['DB_PASSWORD'] || 'postgres',
    database: process.env['DB_NAME'] || 'rbac_system',
    entities: [User, Organization, Permission, Task, AuditLog],
    synchronize: true, // This will create tables automatically
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connection established');
    console.log('✅ Database schema synchronized');
    await dataSource.destroy();
    console.log('🎉 Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
