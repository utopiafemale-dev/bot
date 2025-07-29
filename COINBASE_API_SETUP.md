# 🚀 Coinbase API Setup Guide

## Step 1: Log into Coinbase
1. Go to [coinbase.com](https://coinbase.com)
2. Sign in to your account

## Step 2: Access API Settings
1. Click your **profile picture** (top right)
2. Select **"Settings"**
3. Click **"API"** tab on the left sidebar

## Step 3: Create API Key
1. Click **"+ New API Key"** button
2. Give it a name like "AI Worker Payments"
3. **IMPORTANT**: Select these permissions:
   - ✅ **wallet:accounts:read** (to see your balance)
   - ✅ **wallet:transactions:send** (to send Bitcoin)
   - ✅ **wallet:transactions:read** (to check transactions)

## Step 4: Get Your Credentials
After creating the API key, you'll get:
- **API Key**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **API Secret**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Step 5: Alternative - Coinbase Pro/Advanced Trade
If you use Coinbase Pro (now Advanced Trade):
1. Go to [pro.coinbase.com](https://pro.coinbase.com) or [coinbase.com/advanced-trade](https://coinbase.com/advanced-trade)
2. Click **profile** → **API**
3. Create new API key with:
   - ✅ **View** permission
   - ✅ **Trade** permission
   - ✅ **Transfer** permission

You'll get:
- **API Key**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **API Secret**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Passphrase**: `xxxxxxxxxxxxxxxx`

## Step 6: Fund Your Account
Make sure you have Bitcoin in your Coinbase account to send payments.

## ⚠️ Security Notes:
- **Never share** your API credentials
- **Use IP restrictions** if available
- **Set spending limits** for safety
- **Test with small amounts** first

## 🔧 What I Need:
Once you have your credentials, provide me with:
1. **API Key**
2. **API Secret** 
3. **Passphrase** (if using Coinbase Pro)
4. **Which Coinbase service** you're using (regular Coinbase or Pro)

Then I'll integrate them into your AI worker system for real Bitcoin payments!
