# 📱 QUICK MOBILE ACCESS - AI Worker Manager

## 🚀 INSTANT MOBILE LINK

### Option 1: Local Network (Same WiFi)
1. **Make sure your server is running:**
   ```bash
   cd ai-worker-manager
   python3 -m http.server 8080
   ```

2. **Find your IP address:**
   - Open Terminal
   - Run: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - Look for something like: `inet 192.168.1.100`

3. **On your phone:**
   - Connect to same WiFi
   - Open browser
   - Go to: `http://192.168.1.100:8080` (replace with your IP)

### Option 2: Quick Public Deployment (Recommended)

#### Using Netlify (Free & Instant):
1. **Zip your project:**
   ```bash
   cd ai-worker-manager
   zip -r ai-worker-manager.zip . -x "*.log" "*.DS_Store"
   ```

2. **Deploy instantly:**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your zip file
   - Get instant public URL!

#### Using GitHub Pages:
1. **Create GitHub repo**
2. **Upload files**
3. **Enable Pages in Settings**
4. **Access via**: `https://yourusername.github.io/repo-name`

## 🔧 Alternative: Use ngrok

```bash
# Install ngrok
brew install ngrok

# Start your server
cd ai-worker-manager
python3 -m http.server 8080

# In new terminal, create public tunnel
ngrok http 8080

# Copy the https:// URL and use on your phone
```

## 📱 Current Status
- ✅ **Coinbase API**: Configured
- ✅ **Bitcoin Wallet**: bc1qadtc9kprdjc3fyetlml0vrprtlmp56tf0yjr4u
- ✅ **Auto-Transfer**: Every 30 seconds
- ✅ **Mobile Ready**: Responsive design

## 🚀 Quick Commands

```bash
# Start server
cd ai-worker-manager && python3 -m http.server 8080

# Get your local IP
ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1

# Create public URL
ngrok http 8080
```

## 📞 Need Immediate Access?

**Try these common local IPs on your phone:**
- `http://192.168.1.100:8080`
- `http://192.168.0.100:8080`
- `http://10.0.0.100:8080`

(Replace the last number with your computer's IP)

## 🌐 Instant Online Deployment

**Fastest method - Use Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy instantly
cd ai-worker-manager
vercel

# Get instant public URL!
```

Your AI Worker Manager will be live and accessible from your phone within minutes!
