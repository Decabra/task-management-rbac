# Deployment Guide

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 13+
- Docker (optional)
- Git

## Environment Setup

### 1. Database Setup

#### Using Docker (Recommended)
```bash
# Start PostgreSQL with Docker
docker run --name rbac-postgres \
  -e POSTGRES_DB=rbac_system \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:13
```

#### Manual Setup
```bash
# Create database
createdb rbac_system

# Create user (optional)
createuser -P rbac_user
```

### 2. Environment Configuration

```bash
# Copy environment template
cp apps/api/env.template apps/api/.env

# Edit environment variables
nano apps/api/.env
```

**Required Environment Variables:**
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=rbac_system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=1800

# API Configuration
PORT=3000
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_TTL=900000
RATE_LIMIT_MAX=100
```

## Development Deployment

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Shared Libraries
```bash
npx nx build data
npx nx build auth
```

### 3. Run Database Migrations
```bash
npx nx run api:typeorm:migration:run
```

### 4. Seed Database
```bash
npx ts-node apps/api/src/database/seeds/seed.ts
```

### 5. Start Applications
```bash
# Development mode (both apps)
npm run start:dev

# Or individually
npx nx serve api
npx nx serve dashboard
```

## Production Deployment

### 1. Build Applications
```bash
# Build all applications
npm run build

# Or individually
npx nx build api --prod
npx nx build dashboard --prod
```

### 2. Database Setup
```bash
# Run migrations
npx nx run api:typeorm:migration:run

# Seed initial data
npx ts-node apps/api/src/database/seeds/seed.ts
```

### 3. Start Production Servers
```bash
# Start backend
cd dist/apps/api
npm start

# Serve frontend (using nginx or similar)
# Copy dist/apps/dashboard/browser/* to web server
```

## Docker Deployment

### 1. Create Dockerfile for Backend
```dockerfile
# apps/api/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx nx build api --prod

FROM node:18-alpine AS runtime

WORKDIR /app
COPY --from=builder /app/dist/apps/api ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "main.js"]
```

### 2. Create Dockerfile for Frontend
```dockerfile
# apps/dashboard/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npx nx build dashboard --prod

FROM nginx:alpine AS runtime

COPY --from=builder /app/dist/apps/dashboard/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Create docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: rbac_system
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: postgres
      DB_NAME: rbac_system
      JWT_SECRET: your-super-secret-jwt-key
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - postgres

  dashboard:
    build:
      context: .
      dockerfile: apps/dashboard/Dockerfile
    ports:
      - "80:80"
    depends_on:
      - api

volumes:
  postgres_data:
```

### 4. Deploy with Docker
```bash
# Build and start services
docker-compose up -d

# Run migrations
docker-compose exec api npx nx run api:typeorm:migration:run

# Seed database
docker-compose exec api npx ts-node src/database/seeds/seed.ts
```

## Cloud Deployment

### AWS Deployment

#### 1. EC2 Setup
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Install PM2 for process management
npm install -g pm2
```

#### 2. Application Setup
```bash
# Clone repository
git clone <repository-url>
cd rbac

# Install dependencies
npm install

# Build applications
npm run build

# Setup environment
cp apps/api/env.template apps/api/.env
# Edit .env with production values
```

#### 3. Database Setup
```bash
# Create database
sudo -u postgres createdb rbac_system

# Run migrations
npx nx run api:typeorm:migration:run

# Seed database
npx ts-node apps/api/src/database/seeds/seed.ts
```

#### 4. Process Management
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'rbac-api',
      script: 'dist/apps/api/main.js',
      cwd: '/path/to/rbac',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Heroku Deployment

#### 1. Prepare for Heroku
```bash
# Create Procfile
echo "web: node dist/apps/api/main.js" > Procfile

# Create app.json
cat > app.json << EOF
{
  "name": "rbac-task-manager",
  "description": "RBAC Task Management System",
  "repository": "https://github.com/your-username/rbac",
  "logo": "https://node-js-sample.herokuapp.com/node.png",
  "keywords": ["node", "nestjs", "angular", "rbac"],
  "addons": [
    {
      "plan": "heroku-postgresql:hobby-dev"
    }
  ]
}
EOF
```

#### 2. Deploy to Heroku
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create Heroku app
heroku create rbac-task-manager

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-jwt-key

# Deploy
git push heroku main

# Run migrations
heroku run npx nx run api:typeorm:migration:run

# Seed database
heroku run npx ts-node apps/api/src/database/seeds/seed.ts
```

## Nginx Configuration

### 1. Install Nginx
```bash
sudo apt-get update
sudo apt-get install nginx
```

### 2. Configure Nginx
```nginx
# /etc/nginx/sites-available/rbac
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/rbac/dist/apps/dashboard/browser;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/rbac /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL Configuration

### 1. Install Certbot
```bash
sudo apt-get install certbot python3-certbot-nginx
```

### 2. Obtain SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com
```

### 3. Auto-renewal
```bash
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Logging

### 1. Application Logs
```bash
# PM2 logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. Database Monitoring
```bash
# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-13-main.log

# Database performance
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

### 3. System Monitoring
```bash
# Install monitoring tools
sudo apt-get install htop iotop

# Monitor system resources
htop
iotop
```

## Backup and Recovery

### 1. Database Backup
```bash
# Create backup
pg_dump rbac_system > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql rbac_system < backup_20240101_120000.sql
```

### 2. Application Backup
```bash
# Backup application files
tar -czf rbac_backup_$(date +%Y%m%d_%H%M%S).tar.gz /path/to/rbac
```

### 3. Automated Backups
```bash
# Create backup script
cat > backup.sh << EOF
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump rbac_system > /backups/db_$DATE.sql
tar -czf /backups/app_$DATE.tar.gz /path/to/rbac
find /backups -name "*.sql" -mtime +7 -delete
find /backups -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x backup.sh

# Schedule backups
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

## Security Considerations

### 1. Firewall Configuration
```bash
# Install UFW
sudo apt-get install ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Database Security
```bash
# Secure PostgreSQL
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'strong-password';"
sudo -u postgres psql -c "CREATE USER rbac_user WITH PASSWORD 'strong-password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE rbac_system TO rbac_user;"
```

### 3. Application Security
- Use strong JWT secrets
- Enable HTTPS in production
- Regular security updates
- Monitor for vulnerabilities

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U postgres -d rbac_system
```

#### 2. Application Not Starting
```bash
# Check logs
pm2 logs rbac-api

# Restart application
pm2 restart rbac-api
```

#### 3. Nginx Issues
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx
```

### Performance Optimization

#### 1. Database Optimization
```sql
-- Analyze database performance
ANALYZE;

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC;
```

#### 2. Application Optimization
```bash
# Monitor PM2 processes
pm2 monit

# Scale application
pm2 scale rbac-api 4
```

This deployment guide provides comprehensive instructions for deploying the RBAC Task Management System in various environments, from development to production.
