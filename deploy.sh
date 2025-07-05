#!/bin/bash

echo "🚀 DNA Analysis App Deployment Script"
echo "====================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not initialized. Please run:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if remote origin is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ Git remote origin not set. Please run:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/dna-analysis-app.git"
    exit 1
fi

echo "✅ Git repository is ready"

# Build frontend
echo "📦 Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Check if .env files exist
if [ ! -f ".env" ]; then
    echo "⚠️  Frontend .env file not found. Please create it with:"
    echo "   VITE_API_URL=https://your-backend-url.railway.app"
    echo "   VITE_APP_NAME=GeneScope DNA Analysis"
fi

if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found. Please create it with:"
    echo "   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/dna_analysis"
    echo "   SECRET_KEY=your-super-secret-key-here"
    echo "   ACCESS_TOKEN_EXPIRE_MINUTES=30"
    echo "   ALGORITHM=HS256"
    echo "   ALLOWED_ORIGINS=https://your-frontend-url.vercel.app"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Deploy: Prepare for production deployment"
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Code pushed to GitHub successfully"
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Set up MongoDB Atlas database"
echo "2. Deploy backend to Railway:"
echo "   - Go to https://railway.app"
echo "   - Connect your GitHub repo"
echo "   - Set root directory to 'backend'"
echo "   - Add environment variables"
echo ""
echo "3. Deploy frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Connect your GitHub repo"
echo "   - Configure build settings"
echo "   - Add environment variables"
echo ""
echo "4. Update CORS settings in Railway after both deployments"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions" 