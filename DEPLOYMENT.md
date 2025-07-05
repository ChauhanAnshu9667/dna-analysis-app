# 🚀 DNA Analysis App Deployment Guide

This guide will help you deploy your DNA Analysis app to production.

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier available)
- Railway account (free tier available)
- MongoDB Atlas account (free tier available)

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite (hosted on Vercel)
- **Backend**: FastAPI + Python (hosted on Railway)
- **Database**: MongoDB Atlas

## 🎯 Step 1: Prepare Your Repository

### 1.1 Push to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dna-analysis-app.git
git push -u origin main
```

### 1.2 Create Environment Files

Create `.env` files for both frontend and backend:

**Frontend (.env):**
```env
VITE_API_URL=https://your-backend-url.railway.app
VITE_APP_NAME=GeneScope DNA Analysis
```

**Backend (.env):**
```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/dna_analysis
SECRET_KEY=your-super-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALGORITHM=HS256
ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
```

## 🗄️ Step 2: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Create a database user with read/write permissions
5. Get your connection string
6. Add your IP address to the whitelist (or use 0.0.0.0/0 for all IPs)

## 🔧 Step 3: Deploy Backend to Railway

1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Set the root directory to `backend`
6. Add environment variables:
   - `MONGODB_URL`: Your MongoDB Atlas connection string
   - `SECRET_KEY`: A random secret key
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: 30
   - `ALGORITHM`: HS256
   - `ALLOWED_ORIGINS`: Your frontend URL (will be added after frontend deployment)

7. Railway will automatically detect it's a Python app and deploy
8. Get your backend URL from Railway dashboard

## 🌐 Step 4: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project" → "Import Git Repository"
4. Select your repository
5. Configure the project:
   - Framework Preset: Vite
   - Root Directory: `./` (root)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

6. Add environment variables:
   - `VITE_API_URL`: Your Railway backend URL
   - `VITE_APP_NAME`: GeneScope DNA Analysis

7. Deploy

## 🔄 Step 5: Update CORS Settings

After both deployments are complete:

1. Go back to Railway dashboard
2. Update the `ALLOWED_ORIGINS` environment variable to include your Vercel frontend URL
3. Redeploy the backend

## 🧪 Step 6: Test Your Deployment

1. Visit your Vercel frontend URL
2. Register a new account
3. Try uploading a DNA sequence
4. Check if analysis works correctly

## 🔒 Step 7: Security Considerations

### Environment Variables
- Never commit `.env` files to git
- Use strong, unique secret keys
- Rotate keys regularly

### CORS
- Only allow your frontend domain
- Remove wildcard origins in production

### Database
- Use strong passwords
- Enable network access restrictions
- Regular backups

## 📊 Step 8: Monitoring & Maintenance

### Railway (Backend)
- Monitor logs in Railway dashboard
- Set up alerts for errors
- Monitor resource usage

### Vercel (Frontend)
- Check deployment status
- Monitor performance
- Set up analytics if needed

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `ALLOWED_ORIGINS` in backend
   - Ensure frontend URL is correct

2. **Database Connection**
   - Verify MongoDB connection string
   - Check network access settings

3. **Build Failures**
   - Check dependency versions
   - Verify build commands

4. **Environment Variables**
   - Ensure all variables are set
   - Check for typos in variable names

### Debug Commands

```bash
# Test backend locally
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Test frontend locally
npm install
npm run dev

# Build frontend
npm run build
```

## 📈 Scaling Considerations

### Free Tier Limits
- **Vercel**: 100GB bandwidth/month
- **Railway**: $5 credit/month
- **MongoDB Atlas**: 512MB storage

### Paid Upgrades
- **Vercel Pro**: $20/month
- **Railway**: Pay-as-you-use
- **MongoDB Atlas**: Starts at $9/month

## 🎉 Success!

Your DNA Analysis app is now live! Share your Vercel URL with users.

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review logs in Railway/Vercel dashboards
3. Check GitHub issues for similar problems
4. Consider upgrading to paid tiers for better support 