# 🔑 PayPal Payouts Permission - Exact Steps

## Where to Find the "Payouts" Permission

### Step 1: Go to PayPal Developer Dashboard
1. Visit: **https://developer.paypal.com/**
2. Log in with your PayPal Business account
3. Click **"My Apps & Credentials"**

### Step 2: Find Your App (or Create New One)
If you already have an app:
- Click on your existing app name

If you need to create a new app:
- Click **"Create App"** button
- Enter app name: "AI Worker Manager"
- Select your business account as merchant

### Step 3: Enable Payouts Permission
**THIS IS THE CRITICAL STEP:**

In your app settings, you'll see a section called **"Features"**:

```
Features:
☐ Accept Payments
☐ Log In with PayPal  
☐ Payouts                    ← CHECK THIS BOX!
☐ Subscriptions
☐ Partner Referrals
```

**✅ CHECK THE "Payouts" BOX** - This is what you're missing!

### Step 4: Request Approval (If Needed)
After checking "Payouts":
- PayPal may show: **"Payouts feature requires approval"**
- Click **"Request Approval"** 
- Fill out the business use case form
- Wait 1-3 business days for approval

### Step 5: Get Live Credentials
Once approved:
1. Switch from **"Sandbox"** to **"Live"** mode
2. Copy your **Live Client ID** and **Live Client Secret**
3. Update your `config.js` file

## Visual Guide:

```
PayPal Developer Dashboard
├── My Apps & Credentials
    ├── [Your App Name]
        ├── Features Section
            ├── ☐ Accept Payments
            ├── ☐ Log In with PayPal
            ├── ✅ Payouts          ← ENABLE THIS!
            ├── ☐ Subscriptions
            └── ☐ Partner Referrals
```

## Why This Permission is Required:
- **Accept Payments**: Lets you receive money
- **Payouts**: Lets you SEND money (what you need for withdrawals)

Your current credentials can only receive payments, not send them. That's why you get the 401 authorization error.

## After Enabling Payouts:
1. Your withdrawals will work immediately
2. Real money will transfer to utopiafemale@gmail.com
3. 100% of worker earnings will go to your PayPal every 30 seconds

## Quick Check:
Go to: https://developer.paypal.com/developer/applications/
- Find your app
- Look for "Payouts" in the Features section
- If it's not checked, that's your problem!
