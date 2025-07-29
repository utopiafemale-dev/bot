# 📱 Mobile Access Guide - AI Worker Manager

## 🚀 Quick Access Options

### Option 1: Local Network Access (Same WiFi)
If your phone is on the same WiFi network as your computer:

1. **Find your computer's IP address:**
   ```bash
   # Run this command on your Mac:
   ipconfig getifaddr en0
   ```
   
2. **Access from your phone:**
   - Open your phone's browser
   - Go to: `http://[YOUR_IP_ADDRESS]:8000`
   - Example: `http://192.168.1.100:8000`

### Option 2: ngrok Public URL (Recommended)
For access from anywhere in the world:

1. **Install ngrok** (if not already done):
   ```bash
   brew install ngrok
   ```

2. **Start your server:**
   ```bash
   cd ai-worker-manager
   python3 -m http.server 8000
   ```

3. **In a new terminal, create public URL:**
   ```bash
   ngrok http 8000
   ```

4. **Copy the HTTPS URL** that appears (looks like: `https://abc123.ngrok.io`)

5. **Access from your phone:**
   - Open any browser on your phone
   - Paste the ngrok URL
   - Your AI Worker Manager will load!

### Option 3: GitHub Pages (Static Hosting)
For permanent online access:

1. **Create a GitHub repository**
2. **Upload your ai-worker-manager files**
3. **Enable GitHub Pages** in repository settings
4. **Access via**: `https://yourusername.github.io/repository-name`

## 📋 Step-by-Step Mobile Setup

### Current Status:
- ✅ **Server**: Running on port 8000
- ✅ **Coinbase API**: Configured with your credentials
- ✅ **Bitcoin Wallet**: `bc1qadtc9kprdjc3fyetlml0vrprtlmp56tf0yjr4u`
- ✅ **Auto-Transfer**: Every 30 seconds

### To Access on Phone:

1. **Make sure your server is running:**
   ```bash
   cd /Users/vamplugmusic/Desktop/ai-worker-manager
   python3 -m http.server 8000
   ```

2. **Get your local IP:**
   ```bash
   ipconfig getifaddr en0
   ```
   (This will show something like: `192.168.1.100`)

3. **On your phone:**
   - Connect to the same WiFi network
   - Open Safari/Chrome
   - Go to: `http://192.168.1.100:8000` (replace with your actual IP)

## 🔧 Troubleshooting

### If local IP doesn't work:
- Make sure both devices are on same WiFi
- Check if firewall is blocking port 8000
- Try: `http://[IP]:8000/index.html`

### If you need public access:
- Use ngrok for temporary public URL
- Use GitHub Pages for permanent hosting
- Consider cloud hosting (Heroku, Netlify, etc.)

## 🌐 Alternative: Quick Public Deployment

### Using Netlify (Free):
1. Zip your `ai-worker-manager` folder
2. Go to [netlify.com](https://netlify.com)
3. Drag and drop your zip file
4. Get instant public URL!

### Using Vercel (Free):
1. Install Vercel CLI: `npm i -g vercel`
2. In your project folder: `vercel`
3. Follow prompts for instant deployment

## 📱 Mobile-Optimized Features

Your AI Worker Manager includes:
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Touch-Friendly**: Large buttons and touch targets
- ✅ **Real-Time Updates**: Live balance and transfer updates
- ✅ **Mobile Notifications**: Success/error messages
- ✅ **Swipe Navigation**: Easy mobile browsing

## 🚀 Quick Commands

```bash
# Start server
cd ai-worker-manager && python3 -m http.server 8000

# Get local IP
ipconfig getifaddr en0

# Create public URL
ngrok http 8000

# Check if server is running
curl http://localhost:8000
```

## 📞 Need Help?

If you need the exact URL for your phone, run these commands and share the output:

```bash
# Get your IP
ipconfig getifaddr en0

# Check server status
curl -I http://localhost:8000
```

Then your mobile URL will be: `http://[YOUR_IP]:8000`
