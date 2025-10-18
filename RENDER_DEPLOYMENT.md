# 🚀 Render Deployment Guide

## **Deployment Steps**

### **1. Prepare Your Repository**
- ✅ All changes have been made to support Render deployment
- ✅ `render.yaml` configuration file created
- ✅ Production environment files updated
- ✅ Build scripts configured

### **2. Deploy to Render**

#### **Step 1: Create Render Account**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Connect your repository

#### **Step 2: Deploy Database**
1. Click "New +" → "PostgreSQL"
2. Name: `rbac-database`
3. Plan: **Free** (for testing)
4. Database Name: `rbac_system`
5. Click "Create Database"

#### **Step 3: Deploy API Backend**
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. **Settings:**
   - **Name:** `rbac-api`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build:api`
   - **Start Command:** `npm run start:api`
   - **Plan:** Free

4. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3000
   DB_HOST=<from database>
   DB_PORT=<from database>
   DB_USER=<from database>
   DB_PASSWORD=<from database>
   DB_NAME=<from database>
   JWT_SECRET=<generate new>
   JWT_EXPIRY=1800
   CORS_ORIGIN=https://rbac-dashboard.onrender.com
   ```

5. Click "Create Web Service"

#### **Step 4: Deploy Frontend Dashboard**
1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. **Settings:**
   - **Name:** `rbac-dashboard`
   - **Build Command:** `npm install && npm run build:dashboard`
   - **Publish Directory:** `dist/apps/dashboard`
   - **Plan:** Free

4. **Environment Variables:**
   ```
   NODE_ENV=production
   ```

5. Click "Create Static Site"

### **3. Update Environment Variables**

After deployment, update the dashboard environment:

1. Go to your dashboard service
2. Update the API URL to your actual API URL
3. Redeploy the dashboard

### **4. Test Your Deployment**

1. **API Health Check:** `https://rbac-api.onrender.com/api/health`
2. **Dashboard:** `https://rbac-dashboard.onrender.com`
3. **Database:** Check Render dashboard for database status

## **🔧 Troubleshooting**

### **Common Issues:**

1. **Build Fails:**
   - Check Node.js version (should be 18+)
   - Ensure all dependencies are in package.json

2. **Database Connection:**
   - Verify environment variables are set correctly
   - Check database is running

3. **CORS Issues:**
   - Update CORS_ORIGIN to your actual frontend URL
   - Check environment variables

4. **Frontend Not Loading:**
   - Verify build output directory
   - Check API URL in environment files

## **📊 Monitoring**

- **Render Dashboard:** Monitor service health
- **Logs:** Check service logs for errors
- **Database:** Monitor database performance

## **💰 Cost**

- **Free Tier:** 750 hours/month
- **Database:** Free for small databases
- **Total Cost:** $0/month for development/testing

## **🚀 Production Considerations**

For production deployment:
1. Upgrade to paid plans for better performance
2. Set up custom domains
3. Configure SSL certificates
4. Set up monitoring and alerts
5. Implement backup strategies
