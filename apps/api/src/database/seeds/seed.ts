import { DataSource } from 'typeorm';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

console.log('🚀 Seed script starting...');

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create data source
    const dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'rbac_system',
      entities: [path.join(__dirname, '../entities', '**', '*.entity.js')],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    });

    // Initialize connection
    await dataSource.initialize();
    console.log('✅ Database connection established');

    // Clear existing data (in reverse order of dependencies)
    await dataSource.query('DELETE FROM tasks');
    await dataSource.query('DELETE FROM permissions');
    await dataSource.query('DELETE FROM users');
    await dataSource.query('DELETE FROM organizations');
    console.log('🧹 Cleared existing data');

    // Create Organizations (2-level hierarchy as per requirements)
    const acmeOrgResult = await dataSource.query(`
      INSERT INTO organizations (id, name, parent_id, created_at, updated_at) 
      VALUES (gen_random_uuid(), 'Acme Corp', NULL, NOW(), NOW()) 
      RETURNING id
    `);
    const acmeOrgId = acmeOrgResult[0].id;

    const salesOrgResult = await dataSource.query(`
      INSERT INTO organizations (id, name, parent_id, created_at, updated_at) 
      VALUES (gen_random_uuid(), 'Sales Department', $1, NOW(), NOW()) 
      RETURNING id
    `, [acmeOrgId]);
    const salesOrgId = salesOrgResult[0].id;

    const engineeringOrgResult = await dataSource.query(`
      INSERT INTO organizations (id, name, parent_id, created_at, updated_at) 
      VALUES (gen_random_uuid(), 'Engineering Department', $1, NOW(), NOW()) 
      RETURNING id
    `, [acmeOrgId]);
    const engineeringOrgId = engineeringOrgResult[0].id;

    const marketingOrgResult = await dataSource.query(`
      INSERT INTO organizations (id, name, parent_id, created_at, updated_at) 
      VALUES (gen_random_uuid(), 'Marketing Department', $1, NOW(), NOW()) 
      RETURNING id
    `, [acmeOrgId]);
    const marketingOrgId = marketingOrgResult[0].id;

    const hrOrgResult = await dataSource.query(`
      INSERT INTO organizations (id, name, parent_id, created_at, updated_at) 
      VALUES (gen_random_uuid(), 'HR Department', $1, NOW(), NOW()) 
      RETURNING id
    `, [acmeOrgId]);
    const hrOrgId = hrOrgResult[0].id;

    console.log('✅ Created 2-level organization hierarchy:');
    console.log('   ├── Acme Corp (root)');
    console.log('   │   ├── Sales Department');
    console.log('   │   ├── Engineering Department');
    console.log('   │   ├── Marketing Department');
    console.log('   │   └── HR Department');

    // Create Users (comprehensive test scenarios)
    const users = [
      // Root level users
      { email: 'owner@acme.com', name: 'Alice Owner' },
      { email: 'ceo@acme.com', name: 'John CEO' },
      
      // Sales Department users
      { email: 'sales-admin@acme.com', name: 'Bob Sales Admin' },
      { email: 'sales-manager@acme.com', name: 'Sarah Sales Manager' },
      { email: 'sales-rep@acme.com', name: 'Mike Sales Rep' },
      
      // Engineering Department users
      { email: 'eng-admin@acme.com', name: 'Carol Eng Admin' },
      { email: 'senior-dev@acme.com', name: 'David Senior Dev' },
      { email: 'junior-dev@acme.com', name: 'Emma Junior Dev' },
      
      // Marketing Department users
      { email: 'marketing-admin@acme.com', name: 'Frank Marketing Admin' },
      { email: 'marketing-specialist@acme.com', name: 'Grace Marketing Specialist' },
      
      // HR Department users
      { email: 'hr-admin@acme.com', name: 'Henry HR Admin' },
      { email: 'hr-specialist@acme.com', name: 'Ivy HR Specialist' },
    ];

    const createdUsers = [];
    for (const userData of users) {
      const result = await dataSource.query(`
        INSERT INTO users (id, email, name, password_hash, created_at, updated_at) 
        VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW()) 
        RETURNING id
      `, [userData.email, userData.name, await bcrypt.hash('password123', 12)]);
      createdUsers.push({ id: result[0].id, ...userData });
    }

    console.log('✅ Created users for comprehensive testing');

    // Create Permissions (comprehensive RBAC scenarios)
    const permissions = [
      // Root level permissions
      { userId: createdUsers[0].id, orgId: acmeOrgId, role: 'OWNER' }, // Alice Owner at Acme Corp
      { userId: createdUsers[1].id, orgId: acmeOrgId, role: 'ADMIN' }, // John CEO at Acme Corp
      
      // Sales Department permissions
      { userId: createdUsers[2].id, orgId: salesOrgId, role: 'ADMIN' }, // Bob Sales Admin
      { userId: createdUsers[3].id, orgId: salesOrgId, role: 'ADMIN' }, // Sarah Sales Manager
      { userId: createdUsers[4].id, orgId: salesOrgId, role: 'VIEWER' }, // Mike Sales Rep
      
      // Engineering Department permissions
      { userId: createdUsers[5].id, orgId: engineeringOrgId, role: 'ADMIN' }, // Carol Eng Admin
      { userId: createdUsers[6].id, orgId: engineeringOrgId, role: 'ADMIN' }, // David Senior Dev
      { userId: createdUsers[7].id, orgId: engineeringOrgId, role: 'VIEWER' }, // Emma Junior Dev
      
      // Marketing Department permissions
      { userId: createdUsers[8].id, orgId: marketingOrgId, role: 'ADMIN' }, // Frank Marketing Admin
      { userId: createdUsers[9].id, orgId: marketingOrgId, role: 'VIEWER' }, // Grace Marketing Specialist
      
      // HR Department permissions
      { userId: createdUsers[10].id, orgId: hrOrgId, role: 'ADMIN' }, // Henry HR Admin
      { userId: createdUsers[11].id, orgId: hrOrgId, role: 'VIEWER' }, // Ivy HR Specialist
    ];

    for (const permData of permissions) {
      await dataSource.query(`
        INSERT INTO permissions (id, user_id, org_id, role, created_at, updated_at) 
        VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
      `, [permData.userId, permData.orgId, permData.role]);
    }

    console.log('✅ Created comprehensive RBAC permissions');

    // Create Sample Tasks (comprehensive scenarios across all orgs)
    const tasks = [
      // Acme Corp (Root) tasks
      {
        orgId: acmeOrgId,
        title: 'Q4 Strategy Planning',
        description: 'Plan company strategy for Q4 2024',
        category: 'Strategic',
        status: 'IN_PROGRESS',
        orderIndex: 1,
        ownerUserId: createdUsers[0].id, // Alice Owner
      },
      {
        orgId: acmeOrgId,
        title: 'Annual Budget Review',
        description: 'Review and approve annual budget',
        category: 'Financial',
        status: 'TODO',
        orderIndex: 2,
        ownerUserId: createdUsers[1].id, // John CEO
      },
      {
        orgId: acmeOrgId,
        title: 'Company All-Hands Meeting',
        description: 'Organize quarterly all-hands meeting',
        category: 'Administrative',
        status: 'DONE',
        orderIndex: 3,
        ownerUserId: createdUsers[0].id, // Alice Owner
      },
      
      // Sales Department tasks
      {
        orgId: salesOrgId,
        title: 'Lead Generation Campaign',
        description: 'Launch Q4 lead generation campaign',
        category: 'Marketing',
        status: 'TODO',
        orderIndex: 1,
        ownerUserId: createdUsers[2].id, // Bob Sales Admin
      },
      {
        orgId: salesOrgId,
        title: 'Client Follow-ups',
        description: 'Follow up with potential clients from last week',
        category: 'Sales',
        status: 'IN_PROGRESS',
        orderIndex: 2,
        ownerUserId: createdUsers[3].id, // Sarah Sales Manager
      },
      {
        orgId: salesOrgId,
        title: 'Sales Report Q3',
        description: 'Complete Q3 sales performance report',
        category: 'Reporting',
        status: 'DONE',
        orderIndex: 3,
        ownerUserId: createdUsers[2].id, // Bob Sales Admin
      },
      
      // Engineering Department tasks
      {
        orgId: engineeringOrgId,
        title: 'API Documentation Update',
        description: 'Update API documentation for v2.0',
        category: 'Documentation',
        status: 'TODO',
        orderIndex: 1,
        ownerUserId: createdUsers[5].id, // Carol Eng Admin
      },
      {
        orgId: engineeringOrgId,
        title: 'Security Audit',
        description: 'Conduct quarterly security audit',
        category: 'Security',
        status: 'IN_PROGRESS',
        orderIndex: 2,
        ownerUserId: createdUsers[6].id, // David Senior Dev
      },
      {
        orgId: engineeringOrgId,
        title: 'Database Optimization',
        description: 'Optimize database queries for performance',
        category: 'Performance',
        status: 'TODO',
        orderIndex: 3,
        ownerUserId: createdUsers[6].id, // David Senior Dev
      },
      
      // Marketing Department tasks
      {
        orgId: marketingOrgId,
        title: 'Brand Guidelines Update',
        description: 'Update company brand guidelines',
        category: 'Branding',
        status: 'IN_PROGRESS',
        orderIndex: 1,
        ownerUserId: createdUsers[8].id, // Frank Marketing Admin
      },
      {
        orgId: marketingOrgId,
        title: 'Social Media Campaign',
        description: 'Launch new social media campaign',
        category: 'Social Media',
        status: 'TODO',
        orderIndex: 2,
        ownerUserId: createdUsers[9].id, // Grace Marketing Specialist
      },
      
      // HR Department tasks
      {
        orgId: hrOrgId,
        title: 'Employee Onboarding Process',
        description: 'Streamline new employee onboarding',
        category: 'Process',
        status: 'IN_PROGRESS',
        orderIndex: 1,
        ownerUserId: createdUsers[10].id, // Henry HR Admin
      },
      {
        orgId: hrOrgId,
        title: 'Performance Review Cycle',
        description: 'Conduct annual performance reviews',
        category: 'Performance Management',
        status: 'TODO',
        orderIndex: 2,
        ownerUserId: createdUsers[11].id, // Ivy HR Specialist
      },
    ];

    for (const task of tasks) {
      await dataSource.query(`
        INSERT INTO tasks (id, org_id, title, description, category, status, order_index, owner_user_id, created_at, updated_at) 
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      `, [task.orgId, task.title, task.description, task.category, task.status, task.orderIndex, task.ownerUserId]);
    }

    console.log('✅ Created sample tasks');

    // Create additional test tasks for pagination testing
    const additionalTasks = [];
    const taskCategories = ['Strategic', 'Financial', 'Marketing', 'Sales', 'Reporting', 'Documentation', 'Security', 'Performance', 'Training', 'Process'];
    const taskStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
    
    for (let i = 1; i <= 20; i++) {
      const randomOrg = [acmeOrgId, salesOrgId, engineeringOrgId, marketingOrgId, hrOrgId][Math.floor(Math.random() * 5)];
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const randomCategory = taskCategories[Math.floor(Math.random() * taskCategories.length)];
      const randomStatus = taskStatuses[Math.floor(Math.random() * taskStatuses.length)];
      
      additionalTasks.push({
        orgId: randomOrg,
        title: `Test Task ${i} - ${randomCategory}`,
        description: `This is test task ${i} for pagination testing in ${randomCategory} category`,
        category: randomCategory,
        status: randomStatus,
        orderIndex: i + 20,
        ownerUserId: randomUser.id,
      });
    }

    for (const task of additionalTasks) {
      await dataSource.query(`
        INSERT INTO tasks (id, org_id, title, description, category, status, order_index, owner_user_id, created_at, updated_at) 
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      `, [task.orgId, task.title, task.description, task.category, task.status, task.orderIndex, task.ownerUserId]);
    }

    console.log('✅ Created 20 additional test tasks for pagination');

    console.log('\n🎉 Comprehensive seeding completed successfully!');
    console.log('\n📊 Database Summary:');
    console.log('   🏢 Organizations: 5 (1 root + 4 departments)');
    console.log('   👥 Users: 12 (comprehensive role testing)');
    console.log('   🔐 Permissions: 12 (RBAC scenarios)');
    console.log('   📋 Tasks: 18 (across all organizations)');
    
    console.log('\n🧪 Test Scenarios Available:');
    console.log('   👑 OWNER Access: Alice Owner can see ALL tasks across ALL orgs');
    console.log('   👤 ADMIN Access: Department admins can manage their org tasks');
    console.log('   👀 VIEWER Access: Department viewers can only read their org tasks');
    console.log('   🔒 RBAC Inheritance: Owner at root has access to all child orgs');
    
    console.log('\n🔑 Login Credentials for Testing:');
    console.log('   👑 owner@acme.com / password123 (Full access to everything)');
    console.log('   👤 ceo@acme.com / password123 (Acme Corp admin only)');
    console.log('   👤 sales-admin@acme.com / password123 (Sales department admin)');
    console.log('   👤 eng-admin@acme.com / password123 (Engineering department admin)');
    console.log('   👤 marketing-admin@acme.com / password123 (Marketing department admin)');
    console.log('   👤 hr-admin@acme.com / password123 (HR department admin)');
    console.log('   👀 sales-rep@acme.com / password123 (Sales department viewer)');
    console.log('   👀 junior-dev@acme.com / password123 (Engineering department viewer)');
    console.log('   👀 marketing-specialist@acme.com / password123 (Marketing department viewer)');
    console.log('   👀 hr-specialist@acme.com / password123 (HR department viewer)');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
