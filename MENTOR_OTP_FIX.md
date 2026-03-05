# Mentor OTP Email Fix - Comprehensive Guide

## Problem
Mentors are not receiving OTP emails when trying to set up their password via the forgot-password endpoint.

##Root Cause Analysis

### Possible Causes:
1. **MongoDB Connection Issues** - Can't find mentors in database
2. **Email Configuration** - SMTP not properly configured
3. **No Mentors in Database** - Testing with non-existent mentor emails
4. **Render Deployment Issues** - Environment variables not set on Render
5. **Async/Error Handling** - Errors being silently swallowed

## What I've Fixed (Local Development)

### 1. Added Environment Variable Validation
**File:** [backend/server.js](../server.js)
- Now validates all required env vars on startup
- Exits with clear error messages if vars are missing
- Prevents silent failures

### 2. Enhanced Error Logging
**File:** [backend/routes/mentorAuth.js](../routes/mentorAuth.js)
- Added detailed console logging to `/forgot-password` endpoint
- Logs each step: mentor search, OTP generation, email sending
- Improved `sendOTPEmail` function with better error diagnostics

### 3. Verified SMTP Configuration
- Ran `test-smtp.js` - ✅ **PASSED**
- Email sending to `yoshithanunna77@gmail.com` works perfectly
- Gmail authentication successful

## How to Fix OTP Not Sending

### Step 1: Verify Local Environment
```bash
cd backend
node test-smtp.js  # Should show ✅ Email server is ready
```

### Step 2: Ensure Mentors Exist in Database
Run this to check/create mentors:
```bash
node check-mentors.js
```

If no mentors exist, you'll need to:
- Register mentors via admin panel
- OR manually insert test data

### Step 3: Test the Endpoint Locally

Start the server:
```bash
npm run dev  # or: node server.js
```

Test with a real mentor email:
```bash
curl -X POST http://localhost:5000/api/mentor-auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"EXISTING_MENTOR_EMAIL@example.com"}'
```

### Step 4: Check Backend Logs
When testing, the backend logs will show:
```
✅ All required environment variables are configured
📧 Forgot Password Request for: mentoremail@example.com
🔍 Searching for mentor with email: mentoremail@example.com
✅ Mentor found: Mentor Name
📝 Generating OTP: 123456
✅ OTP saved to database
📤 Sending OTP email to mentoremail@example.com...
🔧 Transporter config - From: YuganthaAI <yoshithanunna77@gmail.com>, To: mentoremail@example.com
✅ OTP email sent successfully to mentoremail@example.com
📧 Message ID: <xxx@gmail.com>
```

## Render Production Fix

### For OTP Emails to Work on Render:

1. **Set Environment Variables in Render Dashboard:**
   - Go to your backend service
   - Settings → Environment Variables
   - Add these variables:

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

2. **Redeploy:**
   - Go to Deploys tab
   - Click "Deploy" or manually trigger redeploy
   - Wait for it to complete

3. **Verify in Logs:**
   - Check Render logs to ensure:
     - All env vars loaded
     - MongoDB connected
     - Email transporter ready

## Mentor Database Setup

Mentors need to exist before forgot-password works. Mentor must have:
- `name`: string
- `email`: string (unique)
- `expertise`: string
- `password`: optional (can be null initially)
- `resetToken`: generated during forgot-password
- `resetTokenExpiry`: expiry time

###Example Mentor Data:
```json
{
  "name": "John Mentor",
  "email": "john@example.com",
  "expertise": "Web Development",
  "approved": true,
  "active": true,
  "password": null
}
```

## Testing After Fix

### Local Test:
1. Ensure MongoDB is accessible
2. Ensure mentors exist in DB
3. Run server with `npm run dev`
4. Call forgot-password endpoint with valid mentor email
5. Check console for detailed logs
6. Check email inbox for OTP

### Production Test on Render:
1. Check Render dashboard environment variables are set
2. Check Render logs for startup messages
3. Make request to: `https://yuganthaai-backend.onrender.com/api/mentor-auth/forgot-password`
4. Use a real mentor email that exists in the database
5. Check mentor's email inbox for OTP
6. Monitor Render logs in real-time while testing

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Mentor not found" error | Email doesn't match DB | Ensure mentor exists with exact email |
| No email received | SMTP not configured | Check EMAIL_USER and EMAIL_PASSWORD |
| Silent 500 error | Logging not showing | Check console logs, should see detailed output |
| Timeout errors | MongoDB offline | Check MongoDB Atlas cluster status |
| 404 on Render | Missing env vars | Set all env vars in Render dashboard |

## Files Modified

1. ✅ [server.js](../server.js) - Added env var validation
2. ✅ [routes/mentorAuth.js](../routes/mentorAuth.js) - Enhanced logging & error handling
3. ✅ [test-smtp.js](../test-smtp.js) - Existing SMTP test (VERIFIED WORKING)
4. ✅ [check-mentors.js](../check-mentors.js) - NEW: Check/create test mentors
5. ✅ [test-mentor-forgot-password.js](../test-mentor-forgot-password.js) - NEW: Test endpoint

## Next Steps

1. **Immediate:** Check if mentors exist in database
2. **Then:** Test locally with real mentor email
3. **Finally:** Verify all env vars on Render and test in production

