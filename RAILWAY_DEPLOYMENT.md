# 🚀 Railway Deployment Guide

## **Why Railway is Perfect for Your Setup**

✅ **Built for Monorepos** - Handles NX workspaces natively  
✅ **PostgreSQL Included** - Managed database with automatic backups  
✅ **Docker Support** - Can deploy your docker-compose setup  
✅ **Automatic Deployments** - Connects to GitHub  
✅ **Simple Pricing** - $5/month for production  
✅ **Great DX** - Excellent developer experience  

## **🚀 Deployment Steps**

### **Step 1: Install Railway CLI**
```bash
npm install -g @railway/cli
```

### **Step 2: Login to Railway**
```bash
railway login
```

### **Step 3: Initialize Project**
```bash
railway init
```

### **Step 4: Add PostgreSQL Database**
```bash
railway add -d postgres
```

**Alternative: Add through Railway Dashboard**
1. Go to [railway.app](https://railway.app)
2. Select your project
3. Click "New" → "Database" → "PostgreSQL"

### **Step 5: Deploy Your App**
```bash
railway up
```

## **🔧 Manual Deployment (Alternative)**

### **Step 1: Create Railway Account**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Connect your repository

### **Step 2: Create New Project**
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository

### **Step 3: Add PostgreSQL Database**
1. Click "New" → "Database" → "PostgreSQL"
2. Railway will automatically configure the connection

### **Step 4: Configure Environment Variables**
Railway will automatically detect and set:
- `DATABASE_URL` (PostgreSQL connection string)
- `PORT` (Railway will set this)
- `NODE_ENV=production`

**Manual Environment Variables to Set:**
```
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRY=1800
CORS_ORIGIN=https://your-frontend-url.railway.app
```

### **Step 5: Deploy**
1. Railway will automatically build and deploy
2. Your API will be available at: `https://your-project-name.up.railway.app`

## **🎯 Railway-Specific Configuration**

### **Railway.json Configuration**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start:railway",
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### **Package.json Scripts**
```json
{
  "scripts": {
    "start:railway": "npm run build:api && npm run start:api",
    "build:api": "nx build api",
    "start:api": "cd apps/api && npm start"
  }
}
```

## **🗄️ Database Setup**

### **Automatic Database Setup**
Railway will automatically:
- Create PostgreSQL database
- Set `DATABASE_URL` environment variable
- Handle connection pooling
- Provide automatic backups

### **Manual Database Setup (if needed)**
```bash
# Connect to your Railway database
railway connect postgresql

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed
```

## **🌐 Frontend Deployment**

### **Option 1: Railway Static Site**
1. Create new service in Railway
2. Select "Static Site"
3. Build command: `npm run build:dashboard`
4. Publish directory: `dist/apps/dashboard`

### **Option 2: Vercel/Netlify (Recommended)**
For better frontend performance:
1. Deploy to Vercel or Netlify
2. Update API URL in environment files
3. Connect to your Railway API

## **🔧 Environment Variables**

### **Automatic (Railway sets these):**
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Railway sets this automatically
- `NODE_ENV=production`

### **Manual (You need to set these):**
```bash
# Set JWT secret
railway variables set JWT_SECRET=your-super-secret-jwt-key

# Set JWT expiry
railway variables set JWT_EXPIRY=1800

# Set CORS origin (update with your frontend URL)
railway variables set CORS_ORIGIN=https://your-frontend-url.railway.app
```

## **📊 Monitoring & Logs**

### **View Logs**
```bash
railway logs
```

### **Monitor Service**
- Railway dashboard shows real-time metrics
- Automatic health checks
- Restart on failure

## **💰 Pricing**

### **Free Tier:**
- $5/month usage credit
- 512MB RAM
- 1GB storage
- Perfect for development/testing

### **Production Tier:**
- $20/month for better performance
- 1GB RAM
- 10GB storage
- Better for production workloads

## **🚀 Production Deployment**

### **1. Deploy API to Railway**
```bash
railway up
```

### **2. Deploy Frontend to Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### **3. Update Environment Variables**
- Update `CORS_ORIGIN` to your Vercel URL
- Update frontend API URL to Railway URL

## **🔧 Troubleshooting**

### **Common Issues:**

1. **Build Fails:**
   ```bash
   # Check logs
   railway logs
   
   # Ensure Node.js version
   railway variables set NODE_VERSION=18
   ```

2. **Database Connection:**
   ```bash
   # Check database status
   railway status
   
   # Connect to database
   railway connect postgresql
   ```

3. **CORS Issues:**
   ```bash
   # Update CORS origin
   railway variables set CORS_ORIGIN=https://your-frontend-url.com
   ```

## **✅ Deployment Checklist**

- [ ] Railway account created
- [ ] GitHub repository connected
- [ ] PostgreSQL database added
- [ ] Environment variables set
- [ ] API deployed successfully
- [ ] Database migrations run
- [ ] Frontend deployed (Vercel/Netlify)
- [ ] CORS origin updated
- [ ] Health check passing

## **🎯 Next Steps After Deployment**

1. **Test API endpoints**
2. **Verify database connection**
3. **Deploy frontend**
4. **Update environment variables**
5. **Test full application**
6. **Set up monitoring**

Your NX monorepo is now ready for Railway deployment! 🚀
