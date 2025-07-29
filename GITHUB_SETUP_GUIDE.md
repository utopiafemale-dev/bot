# 🚀 GITHUB SETUP & DEPLOYMENT GUIDE

## 📁 **STEP 1: CREATE GITHUB REPOSITORY**

### Manual GitHub Setup:
1. Go to https://github.com
2. Click "New repository" (green button)
3. Repository name: `ai-worker-bitcoin-manager`
4. Description: `Bitcoin AI Worker Management System`
5. Make it **Public** (required for free deployments)
6. Click "Create repository"

### Get Your Repository URL:
- Copy the HTTPS URL: `https://github.com/YOUR_USERNAME/ai-worker-bitcoin-manager.git`

---

## 📤 **STEP 2: PUSH TO GITHUB**

### In Terminal (from ai-worker-manager folder):
```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/ai-worker-bitcoin-manager.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Alternative - Upload Files Manually:
1. Download/zip your `ai-worker-manager` folder
2. Go to your GitHub repository
3. Click "uploading an existing file"
4. Drag & drop all files
5. Commit changes

---

## 🚀 **STEP 3: DEPLOY TO RENDER.COM**

### Quick Deployment:
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository: `ai-worker-bitcoin-manager`
5. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `node bitcoin-server.js`
   - **Environment Variables**:
     - `COINBASE_API_KEY` = `f431e433-6d11-4d47-b9f1-49c72608dd83`
     - `COINBASE_API_SECRET` = `o9kS3BWPR8Lt2xivels3NlYnsY+HtGup1yrOr8e+EJAbBdE5Bb4OBCBAxRn50FebYH6zfDqr1nl6HIY6vg3WIw==`
     - `BITCOIN_WALLET` = `bc1qadtc9kprdjc3fyetlml0vrprtlmp56tf0yjr4u`
6. Click "Create Web Service"
7. Wait 2-3 minutes for deployment

### Your Live URL:
- You'll get: `https://your-app-name.onrender.com`

---

## 🔧 **STEP 4: UPDATE FRONTEND**

### Edit `real-bitcoin-system.js`:
```javascript
// Find this line:
this.serverUrl = 'http://localhost:3000';

// Replace with your Render URL:
this.serverUrl = 'https://your-app-name.onrender.com';
```

### Commit & Push Changes:
```bash
git add real-bitcoin-system.js
git commit -m "Updated server URL to live deployment"
git push origin main
```

---

## ✅ **STEP 5: TEST YOUR BITCOIN SERVER**

### Test Endpoints:
1. **Connection Test**: `https://your-app-name.onrender.com/api/test-connection`
2. **Bitcoin Price**: `https://your-app-name.onrender.com/api/bitcoin-price`
3. **Send Bitcoin**: `https://your-app-name.onrender.com/api/send-bitcoin`

### Open Your App:
- Visit: `https://your-app-name.onrender.com`
- Your Bitcoin system is now LIVE!

---

## 🎯 **ALTERNATIVE DEPLOYMENTS**

### Vercel:
1. Go to https://vercel.com
2. Import from GitHub
3. Deploy automatically

### Netlify:
1. Go to https://netlify.com
2. Connect GitHub repository
3. Auto-deploy

### Railway:
1. Go to https://railway.app
2. Deploy from GitHub
3. Set environment variables

---

## 🎉 **YOU'RE DONE!**

Your Bitcoin AI Worker Manager is now:
- ✅ **Live on the internet**
- ✅ **Connected to real Coinbase API**
- ✅ **Ready for Bitcoin transfers**
- ✅ **Accessible from any device**

**🚀 Your wallet `bc1qadtc9kprdjc3fyetlml0vrprtlmp56tf0yjr4u` is ready to receive funds!**
