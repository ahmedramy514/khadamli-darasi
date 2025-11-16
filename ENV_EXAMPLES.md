# Example Environment Files for Production

## backend/.env.production
```env
# MongoDB Atlas Connection String
# Replace USERNAME and PASSWORD with your actual credentials
MONGODB_URI=mongodb+srv://khadamli_user:YOUR_PASSWORD_HERE@cluster0.xxxxx.mongodb.net/khadamli_darasi?retryWrites=true&w=majority

# JWT Secret (use a strong random string)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=1f8b8e5a4c3d2f1e9a8b7c6d5e4f3a2b1c9d8e7f6a5b4c3d2e1f0a9b8c7d6e

# Production mode
NODE_ENV=production

# Disable in-memory database (use MongoDB Atlas)
USE_IN_MEMORY_DB=false

# Port (Render will override this)
PORT=8080

# Optional: API URL (for frontend reference)
API_URL=https://khadamli-backend.onrender.com

# Optional: Frontend URL (for CORS)
FRONTEND_URL=https://khadamli-darasi.vercel.app
```

## frontend/.env.production
```env
# Backend API URL (must match your Render deployment)
REACT_APP_API_URL=https://khadamli-backend.onrender.com/api
```

---

## How to Generate a Strong JWT_SECRET

Run in Node.js:
```javascript
const crypto = require('crypto');
console.log(crypto.randomBytes(32).toString('hex'));
```

Output example:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

---

## Notes

1. **MongoDB Atlas Connection String**:
   - Get from: MongoDB Atlas → Cluster → Connect → "Connect your application"
   - Format: `mongodb+srv://username:password@cluster-name.xxxxx.mongodb.net/database-name?retryWrites=true&w=majority`
   - Replace `<password>` with your actual password

2. **JWT_SECRET**:
   - Must be long and random (at least 32 characters)
   - Different from development
   - Never commit to repository (use environment variables)
   - Regenerate if compromised

3. **CORS Settings**:
   - Add your Vercel domain to CORS allowed origins in `backend/server.js`
   - Example: `origin: ['https://khadamli-darasi.vercel.app']`

4. **Environment Variables in Render**:
   - Go to Web Service → Environment
   - Add each variable separately
   - No quotes needed

5. **Environment Variables in Vercel**:
   - Go to Settings → Environment Variables
   - Add variables for Production, Preview, and Development
   - Use same names as in `.env` but with `REACT_APP_` prefix

---

## Deployment Environment Matrix

| Variable | Development | Production (Render) | Frontend (Vercel) |
|----------|-------------|---------------------|-------------------|
| `MONGODB_URI` | (skip, use in-memory) | ✓ Required | N/A |
| `JWT_SECRET` | any | ✓ Strong random | N/A |
| `NODE_ENV` | development | `production` | N/A |
| `USE_IN_MEMORY_DB` | true | false | N/A |
| `PORT` | 5002 | 8080 (auto) | N/A |
| `REACT_APP_API_URL` | N/A | N/A | `https://...onrender.com/api` |

---

**Keep `.env` files secure. Never commit to Git!** 🔒
