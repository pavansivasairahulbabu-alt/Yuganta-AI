# Render Deployment Setup for Mentor Auth Endpoints

## Issue
The `/api/mentor-auth/forgot-password` endpoint returns 404 on Render but works locally.

## Root Cause
Missing environment variables on Render deployment platform.

## Required Environment Variables

Add these to your Render dashboard (Settings > Environment):

```
MONGODB_URI=mongodb+srv://karyampudimadhav_db_user:9CTmkrwisAZ3W2tu@yuganthaai.j3hqian.mongodb.net/YuganthaAI?appName=YuganthaAI

JWT_SECRET=your_jwt_secret_key_change_this_in_production_make_it_very_long_and_random

EMAIL_USER=yoshithanunna77@gmail.com

EMAIL_PASSWORD=lpbhjakmoatblbaa

EMAIL_FROM=YuganthaAI <yoshithanunna77@gmail.com>

FRONTEND_URL=https://yuganthaai.vercel.app

NODE_ENV=production

PORT=5000
```

## Steps to Fix

1. **Go to Render Dashboard**
   - Navigate to your MeroSphere backend service
   - Click "Settings" 

2. **Add Environment Variables**
   - Click "Environment" 
   - Add each variable from the list above
   - Click "Deploy" after adding variables

3. **Redeploy**
   - Go to the "Deploys" tab
   - Click the latest deploy or manually trigger a new deploy
   - Wait for deployment to complete

4. **Test the Endpoint**
   ```bash
   curl -X POST https://yuganthaai-backend.onrender.com/api/mentor-auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"mentor@example.com"}'
   ```

## Verification

After deployment, check:
1. Logs show: "✅ All required environment variables are configured"
2. Logs show: "✅ Email server is ready to send messages"
3. API responds with either "OTP sent" or "Mentor not found" (not 404)
