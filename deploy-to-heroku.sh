#!/bin/bash

echo "🚀 Deploying Bitcoin Server to Heroku..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Install it first:"
    echo "https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Login to Heroku
echo "🔐 Login to Heroku..."
heroku login

# Create Heroku app
APP_NAME="bitcoin-worker-manager-$(date +%s)"
echo "📱 Creating Heroku app: $APP_NAME"
heroku create $APP_NAME

# Set environment variables
echo "🔧 Setting environment variables..."
heroku config:set COINBASE_API_KEY="f431e433-6d11-4d47-b9f1-49c72608dd83" --app $APP_NAME
heroku config:set COINBASE_API_SECRET="o9kS3BWPR8Lt2xivels3NlYnsY+HtGup1yrOr8e+EJAbBdE5Bb4OBCBAxRn50FebYH6zfDqr1nl6HIY6vg3WIw==" --app $APP_NAME
heroku config:set BITCOIN_WALLET="bc1qadtc9kprdjc3fyetlml0vrprtlmp56tf0yjr4u" --app $APP_NAME
heroku config:set NODE_ENV="production" --app $APP_NAME

# Create Procfile
echo "📝 Creating Procfile..."
echo "web: node bitcoin-server.js" > Procfile

# Initialize git if not already
if [ ! -d ".git" ]; then
    git init
    git add .
    git commit -m "Initial commit"
fi

# Add Heroku remote
heroku git:remote -a $APP_NAME

# Deploy to Heroku
echo "🚀 Deploying to Heroku..."
git add .
git commit -m "Deploy Bitcoin server"
git push heroku main

# Get the deployed URL
DEPLOYED_URL=$(heroku info --app $APP_NAME | grep "Web URL" | awk '{print $3}')

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "🌐 Your Bitcoin server is live at: $DEPLOYED_URL"
echo "🔗 API endpoints:"
echo "   - $DEPLOYED_URL/api/test-connection"
echo "   - $DEPLOYED_URL/api/bitcoin-price"
echo "   - $DEPLOYED_URL/api/send-bitcoin"
echo ""
echo "📱 Update your frontend to use: $DEPLOYED_URL"
echo ""
echo "🔧 To update the frontend, run:"
echo "   sed -i '' 's|http://localhost:3000|$DEPLOYED_URL|g' real-bitcoin-system.js"
