# PayPal Setup Guide for Real Withdrawals

## The authorization error occurs because you need PayPal Business account credentials with "Payouts" permission enabled.

### Step 1: Create PayPal Business Account
1. Go to https://www.paypal.com/us/business
2. Click "Get Started" and create a Business account
3. Complete business verification process

### Step 2: Create PayPal App with Payout Permissions
1. Go to https://developer.paypal.com/
2. Log in with your PayPal Business account
3. Click "Create App"
4. Fill in app details:
   - **App Name**: "AI Worker Manager"
   - **Merchant**: Select your business account
   - **Features**: ✅ Check "Payouts" (THIS IS CRITICAL)
5. Click "Create App"

### Step 3: Get Your Live Credentials
1. In your app dashboard, switch to "Live" mode (not Sandbox)
2. Copy your **Client ID** and **Client Secret**
3. Replace the placeholders in `config.js`:

```javascript
CLIENT_ID: 'YOUR_ACTUAL_LIVE_CLIENT_ID_HERE',
CLIENT_SECRET: 'YOUR_ACTUAL_LIVE_CLIENT_SECRET_HERE',
```

### Step 4: Enable Payouts Feature
1. In PayPal Developer Dashboard, go to your app
2. Under "Features", ensure "Payouts" is enabled
3. You may need to request approval for Payouts feature
4. Wait for PayPal approval (can take 1-3 business days)

### Step 5: Test the System
1. Open your AI Worker Manager
2. The system will now be able to send real money to utopiafemale@gmail.com
3. 100% of all worker earnings will transfer to your PayPal every 30 seconds

## Important Notes:
- **Sandbox credentials won't work** for real money transfers
- **Personal PayPal accounts** don't have Payout API access
- **Business account** with verified status is required
- **Payouts feature** must be explicitly enabled and approved

## Current Status:
✅ System configured for 100% earnings transfer
✅ Automatic 30-second transfers enabled  
✅ Real PayPal API integration ready
❌ Need live Business account credentials with Payouts permission

Once you have the proper credentials, simply update the CLIENT_ID and CLIENT_SECRET in config.js and your withdrawals will work perfectly!
