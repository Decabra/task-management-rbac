const { DataSource } = require('typeorm');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const dataSourceOptions = {
  type: 'postgres',
  host: process.env['DB_HOST'] || 'localhost',
  port: parseInt(process.env['DB_PORT'] || '5432', 10),
  username: process.env['DB_USER'] || 'postgres',
  password: process.env['DB_PASSWORD'] || 'postgres',
  database: process.env['DB_NAME'] || 'rbac_system',
  entities: [path.join(__dirname, 'src/database/entities', '**', '*.entity{.ts,.js}')],
  synchronize: true, // Enable for development to auto-create tables
  logging: false, // Disable verbose query logging
};

const dataSource = new DataSource(dataSourceOptions);

module.exports = dataSource;
