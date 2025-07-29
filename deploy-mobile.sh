#!/bin/bash

echo "🚀 Setting up mobile access for AI Worker Manager..."

# Get local IP address
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')

if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "IP_NOT_FOUND")
fi

echo "📍 Your local IP address: $LOCAL_IP"

# Start local server if not running
if ! pgrep -f "python3 -m http.server" > /dev/null; then
    echo "🔄 Starting local server on port 8080..."
    python3 -m http.server 8080 > server.log 2>&1 &
    sleep 2
fi

# Create mobile access URLs
echo ""
echo "📱 MOBILE ACCESS URLS:"
echo "================================"

if [ "$LOCAL_IP" != "IP_NOT_FOUND" ]; then
    echo "🏠 Local Network (Same WiFi): http://$LOCAL_IP:8080"
    echo ""
fi

# Try to create ngrok tunnel
if command -v ngrok &> /dev/null; then
    echo "🌐 Creating public URL with ngrok..."
    ngrok http 8080 --log=stdout > ngrok.log 2>&1 &
    sleep 5
    
    # Get ngrok URL
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*' | cut -d'"' -f4 | head -1)
    
    if [ ! -z "$NGROK_URL" ]; then
        echo "🌍 Public URL (Access from anywhere): $NGROK_URL"
        echo ""
        echo "✅ SUCCESS! Use this URL on your phone: $NGROK_URL"
    else
        echo "⚠️  ngrok tunnel creation failed. Using local network only."
    fi
else
    echo "⚠️  ngrok not found. Install with: brew install ngrok"
fi

echo ""
echo "📋 INSTRUCTIONS:"
echo "1. Make sure your phone is on the same WiFi network"
echo "2. Open your phone's browser (Safari/Chrome)"
echo "3. Go to one of the URLs above"
echo "4. Your AI Worker Manager will load!"
echo ""
echo "💰 Your Bitcoin wallet: bc1qadtc9kprdjc3fyetlml0vrprtlmp56tf0yjr4u"
echo "🔄 Auto-transfers: Every 30 seconds"
echo ""
echo "🔧 To stop servers: killall python3 && killall ngrok"
