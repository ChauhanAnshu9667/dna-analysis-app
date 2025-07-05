# ✅ Deployment Checklist

## Pre-Deployment

- [ ] **Code is working locally**
  - [ ] Frontend builds successfully (`npm run build`)
  - [ ] Backend runs without errors (`uvicorn main:app --reload`)
  - [ ] Database connection works
  - [ ] All features tested

- [ ] **Environment variables prepared**
  - [ ] Frontend `.env` file created
  - [ ] Backend `.env` file created
  - [ ] MongoDB connection string ready
  - [ ] Secret keys generated

- [ ] **Git repository ready**
  - [ ] Code committed to GitHub
  - [ ] No sensitive files in repository
  - [ ] `.gitignore` properly configured

## Backend Deployment (Railway)

- [ ] **Railway account setup**
  - [ ] Account created at [railway.app](https://railway.app)
  - [ ] GitHub connected

- [ ] **Project deployment**
  - [ ] New project created
  - [ ] GitHub repository connected
  - [ ] Root directory set to `backend`
  - [ ] Environment variables added:
    - [ ] `MONGODB_URL`
    - [ ] `SECRET_KEY`
    - [ ] `ACCESS_TOKEN_EXPIRE_MINUTES`
    - [ ] `ALGORITHM`
    - [ ] `ALLOWED_ORIGINS` (temporary: `http://localhost:3000`)

- [ ] **Deployment verification**
  - [ ] Build successful
  - [ ] App is running
  - [ ] Backend URL obtained

## Frontend Deployment (Vercel)

- [ ] **Vercel account setup**
  - [ ] Account created at [vercel.com](https://vercel.com)
  - [ ] GitHub connected

- [ ] **Project deployment**
  - [ ] New project created
  - [ ] GitHub repository connected
  - [ ] Framework preset: Vite
  - [ ] Root directory: `./` (root)
  - [ ] Build command: `npm run build`
  - [ ] Output directory: `dist`
  - [ ] Environment variables added:
    - [ ] `VITE_API_URL` (Railway backend URL)
    - [ ] `VITE_APP_NAME`

- [ ] **Deployment verification**
  - [ ] Build successful
  - [ ] App is running
  - [ ] Frontend URL obtained

## Post-Deployment

- [ ] **CORS configuration**
  - [ ] Update `ALLOWED_ORIGINS` in Railway with Vercel URL
  - [ ] Redeploy backend

- [ ] **Testing**
  - [ ] Visit frontend URL
  - [ ] Register new account
  - [ ] Test DNA analysis
  - [ ] Test all features
  - [ ] Check mobile responsiveness

- [ ] **Security verification**
  - [ ] Environment variables not exposed
  - [ ] CORS properly configured
  - [ ] Authentication working
  - [ ] HTTPS enabled

## Monitoring Setup

- [ ] **Railway monitoring**
  - [ ] Logs accessible
  - [ ] Resource usage monitored
  - [ ] Alerts configured (if needed)

- [ ] **Vercel monitoring**
  - [ ] Deployment status checked
  - [ ] Performance monitored
  - [ ] Analytics setup (optional)

## Documentation

- [ ] **Update documentation**
  - [ ] README.md updated with live URLs
  - [ ] DEPLOYMENT.md completed
  - [ ] Environment variables documented

## Final Steps

- [ ] **Share your app**
  - [ ] Frontend URL ready to share
  - [ ] Test with real users
  - [ ] Gather feedback

- [ ] **Backup plan**
  - [ ] Database backup strategy
  - [ ] Code backup on GitHub
  - [ ] Environment variables saved securely

---

## 🚨 Emergency Contacts

- **Railway Support**: [support.railway.app](https://support.railway.app)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **MongoDB Atlas Support**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

## 📞 Quick Commands

```bash
# Test build locally
npm run build

# Test backend locally
cd backend
uvicorn main:app --reload

# Check deployment status
# Railway: Check dashboard
# Vercel: Check dashboard

# View logs
# Railway: View logs in dashboard
# Vercel: View logs in dashboard
``` 