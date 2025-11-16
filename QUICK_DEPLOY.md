# Quick Deployment Checklist ⚡

## Before You Start
- [ ] Create GitHub account (if not already done)
- [ ] Push project to GitHub
- [ ] Create MongoDB Atlas account
- [ ] Create Render account
- [ ] Create Vercel account

---

## Step 1: MongoDB Atlas (5 minutes)
- [ ] Go to https://www.mongodb.com/cloud/atlas
- [ ] Sign up → Create Project → Create Cluster (Free Tier)
- [ ] Add Database User (username: `khadamli_user`, save password)
- [ ] Network Access → Allow 0.0.0.0/0
- [ ] Copy Connection String: `mongodb+srv://khadamli_user:PASSWORD@...`

---

## Step 2: Backend Configuration
- [ ] Update `backend/.env`:
  ```env
  MONGODB_URI=mongodb+srv://khadamli_user:PASSWORD@cluster0...
  JWT_SECRET=random_long_secret_string_here
  NODE_ENV=production
  USE_IN_MEMORY_DB=false
  ```
- [ ] Push to GitHub

---

## Step 3: Deploy Backend (Render)
- [ ] Go to https://render.com → Sign up
- [ ] New Web Service from GitHub
- [ ] Select your repo
- [ ] Settings:
  - Name: `khadamli-backend`
  - Environment: Node
  - Build: `npm install --prefix backend`
  - Start: `node backend/server.js`
- [ ] Add environment variables (MONGODB_URI, JWT_SECRET, NODE_ENV, USE_IN_MEMORY_DB)
- [ ] Deploy → Wait 5-10 minutes
- [ ] Copy backend URL (e.g., `https://khadamli-backend.onrender.com`)

---

## Step 4: Frontend Configuration
- [ ] Update `frontend/.env`:
  ```env
  REACT_APP_API_URL=https://khadamli-backend.onrender.com/api
  ```
- [ ] Push to GitHub

---

## Step 5: Deploy Frontend (Vercel)
- [ ] Go to https://vercel.com → Sign up with GitHub
- [ ] Import Project → Select your repo
- [ ] Settings:
  - Root Directory: `frontend`
  - Framework: Create React App
- [ ] Add REACT_APP_API_URL environment variable
- [ ] Deploy → Wait 3-5 minutes
- [ ] Copy frontend URL (e.g., `https://khadamli-darasi.vercel.app`)

---

## Step 6: Test
- [ ] Open https://khadamli-darasi.vercel.app
- [ ] Test Sign Up
- [ ] Test Sign In
- [ ] Check Network tab (verify API calls go to Render)
- [ ] Check MongoDB Atlas for saved users

---

## Troubleshooting
| Problem | Solution |
|---------|----------|
| "Cannot connect to database" | Check MONGODB_URI in Render, allow 0.0.0.0/0 in MongoDB |
| "Frontend can't reach backend" | Verify REACT_APP_API_URL in Vercel environment |
| Slow startup | Normal (cold start). Wait or trigger rebuild |
| 404 on API routes | Check Build/Start commands in Render |

---

## Your Live URLs
- **Frontend**: `https://khadamli-darasi.vercel.app`
- **Backend API**: `https://khadamli-backend.onrender.com`
- **Database**: MongoDB Atlas (https://www.mongodb.com/cloud/atlas)

---

**All done? 🎉 Share your app with the world!**
