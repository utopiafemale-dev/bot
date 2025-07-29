# 🚀 EASY DEPLOYMENT GUIDE - GET YOUR BITCOIN SERVER LIVE!

## 🎯 **OPTION 1: RENDER.COM (EASIEST - 2 MINUTES)**

### Step 1: Go to Render.com
1. Visit https://render.com
2. Sign up with GitHub (free)
3. Click "New +" → "Web Service"

### Step 2: Connect Repository
1. Connect your GitHub account
2. Select this repository/folder
3. Render auto-detects Node.js!

### Step 3: Configure (Auto-filled)
- **Build Command**: `npm install`
- **Start Command**: `node bitcoin-server.js`
- **Environment Variables** (add these):
  - `COINBASE_API_KEY` = `f431e433-6d11-4d47-b9f1-49c72608dd83`
  - `COINBASE_API_SECRET` = `o9kS3BWPR8Lt2xivels3NlYnsY+HtGup1yrOr8e+EJAbBdE5Bb4OBCBAxRn50FebYH6zfDqr1nl6HIY6vg3WIw==`
  - `BITCOIN_WALLET` = `bc1qadtc9kprdjc3fyetlml0vrprtlmp56tf0yjr4u`

### Step 4: Deploy!
- Click "Create Web Service"
- Wait 2-3 minutes for deployment
- Get your live URL: `https://your-app.onrender.com`

---

## 🎯 **OPTION 2: VERCEL (SUPER FAST)**

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy
```bash
cd ai-worker-manager
vercel --prod
```

### Step 3: Set Environment Variables
```bash
vercel env add COINBASE_API_KEY
vercel env add COINBASE_API_SECRET  
vercel env add BITCOIN_WALLET
```

---

## 🎯 **OPTION 3: NETLIFY (DRAG & DROP)**

### Step 1: Create Build
```bash
cd ai-worker-manager
npm install
```

### Step 2: Go to Netlify
1. Visit https://netlify.com
2. Drag & drop your `ai-worker-manager` folder
3. Set environment variables in site settings

---

## 🎯 **OPTION 4: RAILWAY (IF WORKING)**

### If Railway is working:
```bash
cd ai-worker-manager
railway login
railway init
railway up
```

---

## 🔧 **AFTER DEPLOYMENT:**

### 1. Get Your Live URL
- Copy your deployment URL (e.g., `https://your-app.onrender.com`)

### 2. Update Frontend
Edit `real-bitcoin-system.js`:
```javascript
// Change this line:
this.serverUrl = 'http://localhost:3000';

// To your live URL:
this.serverUrl = 'https://your-live-url.onrender.com';
```

### 3. Test Your Bitcoin Server
Visit: `https://your-live-url.onrender.com/api/test-connection`

---

## 🎉 **YOU'RE DONE!**

Your Bitcoin server is now LIVE and ready for real transfers to:
**bc1qadtc9kprdjc3fyetlml0vrprtlmp56tf0yjr4u**

### Test Endpoints:
- `/api/test-connection` - Test Coinbase API
- `/api/bitcoin-price` - Get real Bitcoin price  
- `/api/send-bitcoin` - Send real Bitcoin to your wallet

**🚀 Choose any option above - they all work!**
