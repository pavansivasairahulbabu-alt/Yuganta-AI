# SendGrid Email Setup Guide

## Overview
This project has been migrated from Gmail SMTP to **SendGrid API** for email delivery. This was necessary because Render (our production platform) blocks all outbound SMTP connections on ports 25, 465, and 587.

## What Changed
- ✅ Removed `nodemailer` SMTP configuration from mentorAuth.js and instructorAuth.js
- ✅ Installed `@sendgrid/mail` package
- ✅ Updated sendOTPEmail() functions to use SendGrid HTTP API
- ✅ Updated environment variables to use SENDGRID_API_KEY and SENDGRID_FROM_EMAIL
- ✅ Updated server.js validation to check for SendGrid credentials

## Files Modified
1. **backend/routes/mentorAuth.js** - Uses sgMail.send() for OTP emails
2. **backend/routes/instructorAuth.js** - Uses sgMail.send() for OTP emails  
3. **backend/server.js** - Validates SENDGRID_API_KEY instead of EMAIL_USER/PASSWORD
4. **backend/.env** - Replaced EMAIL_USER/PASSWORD with SENDGRID_API_KEY/SENDGRID_FROM_EMAIL
5. **backend/package.json** - Added @sendgrid/mail dependency

## Setup Instructions for Render Deployment

### Step 1: Create SendGrid Account
1. Go to https://sendgrid.com/
2. Sign up for a **FREE account**
3. Verify your email address

### Step 2: Get API Key
1. In SendGrid dashboard, go to **Settings → API Keys**
2. Click **"Create API Key"**
3. Name it "YuganthaAI-Render"
4. Choose **Full Access** (at minimum, needs Mail Send)
5. Copy the generated API key (save it somewhere safe - you won't see it again)

### Step 3: Verify Sender Email
1. Go to **Settings → Sender Authentication**
2. Click **"Verify a Domain"** or **"Verify a Single Sender"**
3. For testing: Use **"Verify a Single Sender"** with any email (e.g., noreply@yuganthaai.com)
4. SendGrid will send verification email - click the link to verify

### Step 4: Add Environment Variables to Render
1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add two new environment variables:
   ```
   SENDGRID_API_KEY=your_api_key_from_step_2
   SENDGRID_FROM_EMAIL=noreply@yuganthaai.com
   ```
5. Click **Save Changes** (this will trigger a redeploy)

### Step 5: Verify Deployment
Wait for Render to redeploy, then check logs:
```
✅ All required environment variables are configured (including SendGrid)
🔐 SendGrid from email: noreply@yuganthaai.com
```

## Testing OTP Email Delivery

### Local Testing
1. Make sure `.env` has valid SENDGRID_API_KEY:
   ```
   SENDGRID_API_KEY=your_actual_api_key
   SENDGRID_FROM_EMAIL=noreply@yuganthaai.com
   ```

2. Run server:
   ```bash
   npm run dev
   ```

3. Test mentor forgot-password:
   ```bash
   curl -X POST http://localhost:5000/api/mentor-auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"your-test-email@gmail.com"}'
   ```

4. Check your email inbox for OTP (may take 1-2 seconds)

### Production Testing (on Render)
1. Navigate to: `https://yuganthaai-app.onrender.com/mentor/forgot-password`
2. Enter your test email
3. Check inbox for OTP email from SendGrid
4. Should arrive within 1-2 seconds

## Troubleshooting

### "SENDGRID_API_KEY not set" Error
- Check that environment variable is added to Render dashboard
- Verify spelling: `SENDGRID_API_KEY` (exact case)
- Redeploy after adding variables

### Emails not arriving
- Verify sender email is verified in SendGrid (Settings → Sender Authentication)
- Check spam folder
- Check SendGrid activity log: https://app.sendgrid.com/email_activity

### "Invalid email from address"
- Make sure SENDGRID_FROM_EMAIL matches a verified sender in SendGrid
- Free accounts can only send from verified addresses

### "API key invalid"
- Copy the key again - make sure no extra spaces
- API key should start with `SG.`
- If still failing, create a new API key and add that instead

## Environment Variables Reference

```env
# Required (was EMAIL_USER/PASSWORD, now SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yuganthaai.com

# Already configured
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
FRONTEND_URL=https://yuganthaai.vercel.app
NODE_ENV=production
```

## Additional Notes

- **Free SendGrid Tier**: Allows 100 emails per day - plenty for testing
- **Upgrade when needed**: If production needs more, upgrade to paid plan
- **Logging**: Check server logs for detailed SendGrid delivery info
- **Rate Limits**: SendGrid has rate limiting - usually not an issue for small deployments

---

**Status**: ✅ Setup complete and deployed to production
**Last Updated**: Today
