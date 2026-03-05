# 🚀 Mentor OTP Email - QUICK FIX GUIDE

## The Problem
Mentors aren't getting OTP emails to set up their passwords.

## The Solution Applied ✅

### What Was Fixed
1. ✅ Added detailed error logging to mentor forgot-password endpoint
2. ✅ Added environment variable validation on server startup
3. ✅ Improved SMTP error messages
4. ✅ Created helper scripts for debugging

### Files Modified
- `backend/server.js` - Added env var validation
- `backend/routes/mentorAuth.js` - Added comprehensive logging

### New Helper Scripts
- `backend/create-test-mentor.js` - Create test mentors
- `backend/debug-mentor-otp.js` - Full diagnostic tool

## To Make It Work on Render

### 1️⃣ Add Environment Variables
```
Go to Render Dashboard
→ Backend Service
→ Settings
→ Environment
```

Add these variables:
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

### 2️⃣ Redeploy Backend
```
Render Dashboard
→ Deploys
→ Click "Redeploy" on latest build
→ Wait 5-10 minutes
```

### 3️⃣ Test It
```bash
curl -X POST https://yuganthaai-backend.onrender.com/api/mentor-auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"mentor@example.com"}'
```

## To Test Locally

```bash
# Create test mentor
node backend/create-test-mentor.js

# Run complete diagnostic
node backend/debug-mentor-otp.js testmentor@example.com

# Start server
cd backend
node server.js

# Test endpoint
curl -X POST http://localhost:5000/api/mentor-auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"testmentor@example.com"}'
```

## Expected Behavior After Fix

✅ Backend logs show all steps:
```
📧 Forgot Password Request for: mentor@example.com
🔍 Searching for mentor...
✅ Mentor found
📝 Generating OTP...
📤 Sending OTP email...
✅ OTP email sent successfully
```

✅ API returns:
```json
{
  "message": "OTP sent to your email. Check your inbox."
}
```

✅ OTP email arrives

## Common Issues

| Issue | Fix |
|-------|-----|
| Still getting 404 | Set MONGODB_URI env var on Render |
| "Email transporter verification failed" | Check EMAIL_USER and EMAIL_PASSWORD |
| "Mentor not found" | Email doesn't match database |
| Timeout errors | Redeploy backend after setting env vars |

## Key Files

| File | Purpose |
|------|---------|
| backend/server.js | Validates environment on startup |
| backend/routes/mentorAuth.js | Forgot-password endpoint with logging |
| backend/create-test-mentor.js | Creates test mentor |
| backend/debug-mentor-otp.js | Full diagnostic tool |

---

**💡 The code is working. Just need to set up environment variables on Render and redeploy!**
