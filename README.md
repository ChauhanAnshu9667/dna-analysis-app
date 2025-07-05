# 🧬 GeneScope - DNA Analysis App

A modern web application for analyzing DNA sequences and detecting genetic mutations associated with various traits and health conditions.

## ✨ Features

- **DNA Sequence Analysis**: Upload or paste DNA sequences for analysis
- **Mutation Detection**: Identify genetic mutations using advanced algorithms
- **Trait Prediction**: Predict physical traits and health predispositions
- **User Authentication**: Secure user accounts with JWT tokens
- **Analysis History**: Track and review previous analyses
- **PDF Reports**: Generate detailed analysis reports
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- MongoDB (local or Atlas)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/dna-analysis-app.git
   cd dna-analysis-app
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   
   Create `.env` in the root directory:
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_APP_NAME=GeneScope DNA Analysis
   ```
   
   Create `backend/.env`:
   ```env
   MONGODB_URL=mongodb://localhost:27017/dna_analysis
   SECRET_KEY=your-secret-key-here
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ALGORITHM=HS256
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   ```

5. **Start the backend**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

6. **Start the frontend**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:5173`

## 🌐 Deployment

### Option 1: Vercel + Railway (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy Backend to Railway**
   - Go to [Railway](https://railway.app)
   - Connect your GitHub repository
   - Set root directory to `backend`
   - Add environment variables
   - Deploy

3. **Deploy Frontend to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Connect your GitHub repository
   - Configure build settings
   - Add environment variables
   - Deploy

4. **Update CORS settings**
   - Update `ALLOWED_ORIGINS` in Railway with your Vercel URL

### Option 2: Heroku

1. **Deploy Backend**
   ```bash
   cd backend
   heroku create your-app-backend
   heroku config:set MONGODB_URL=your-mongodb-url
   git push heroku main
   ```

2. **Deploy Frontend**
   ```bash
   heroku create your-app-frontend
   heroku config:set VITE_API_URL=https://your-app-backend.herokuapp.com
   git push heroku main
   ```

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT.md) - Detailed deployment instructions
- [API Documentation](backend/README.md) - Backend API reference
- [Component Documentation](src/components/README.md) - Frontend components

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Date-fns** - Date utilities

### Backend
- **FastAPI** - Web framework
- **Python 3.11** - Programming language
- **MongoDB** - Database
- **Motor** - Async MongoDB driver
- **JWT** - Authentication
- **BioPython** - Bioinformatics
- **ReportLab** - PDF generation

### Deployment
- **Vercel** - Frontend hosting
- **Railway** - Backend hosting
- **MongoDB Atlas** - Cloud database

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.railway.app
VITE_APP_NAME=GeneScope DNA Analysis
```

#### Backend (.env)
```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/dna_analysis
SECRET_KEY=your-super-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALGORITHM=HS256
ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
```

## 🧪 Testing

### Frontend Tests
```bash
npm run test
```

### Backend Tests
```bash
cd backend
python -m pytest
```

### Build Test
```bash
npm run build
```

## 📊 Performance

- **Frontend Bundle Size**: ~242KB (74KB gzipped)
- **Build Time**: ~4.5 seconds
- **API Response Time**: <200ms average

## 🔒 Security

- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- Environment variable protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [troubleshooting section](DEPLOYMENT.md#troubleshooting)
2. Review the logs in your deployment platform
3. Create an issue on GitHub
4. Check the documentation

## 🎯 Roadmap

- [ ] Add more genetic traits
- [ ] Implement batch analysis
- [ ] Add visualization charts
- [ ] Mobile app development
- [ ] Advanced reporting features
- [ ] Integration with genetic databases

---

Built with ❤️ using modern web technologies
