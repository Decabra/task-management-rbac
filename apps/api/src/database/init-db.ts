import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { User } from './entities';
import { Organization } from './entities';
import { Permission } from './entities';
import { Task } from './entities';
import { AuditLog } from './entities';

async function initializeDatabase() {
  console.log('Initializing database...');

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
    console.log('Database connection established');
    console.log('Database schema synchronized');
    await dataSource.destroy();
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
