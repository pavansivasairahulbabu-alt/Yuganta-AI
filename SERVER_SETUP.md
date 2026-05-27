# YuganthaAI Server Setup & Configuration

## ✅ Current Configuration

### Active Ports

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5001 (automatically assigned when port 5000 was in use)
- **Health Check**: http://localhost:5001

### Environment Configuration

#### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=936298630410-h9evd2c594frurr7vk8q0jubrok4ne7l.apps.googleusercontent.com
```

#### Backend (`.env`)

```env
NODE_ENV=development
PORT=5000  # Will use 5001 if 5000 is in use
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://yamunav3:Yamunav3@...
JWT_SECRET=superSecretJWTKey_12345
GOOGLE_CLIENT_ID=936298630410-h9evd2c594frurr7vk8q0jubrok4ne7l.apps.googleusercontent.com
BREVO_API_KEY=xkeysib-...
BREVO_FROM_EMAIL=noreply@yugantaai.com
CLOUDINARY_CLOUD_NAME=daudlyq2g
CLOUDINARY_API_KEY=345428738793312
CLOUDINARY_API_SECRET=xLPWG1Jwm6UR9tvhAbGXQh9pFUI
```

## 🚀 Running the Servers

### Terminal 1: Backend

```bash
cd C:\Users\YAMUNA\Desktop\Projects\YuganthaAI\backend
npm start
# Output: ✅ Express server running on port 5001
```

### Terminal 2: Frontend

```bash
cd C:\Users\YAMUNA\Desktop\Projects\YuganthaAI\frontend
npm run dev
# Output: Local: http://localhost:5173
```

## 🔍 API Endpoints

All API requests should go to: `http://localhost:5001/api/`

### Authentication Routes

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/google` - Google OAuth login

### User Routes

- `GET /api/users/enrolled` - Get enrolled courses
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## ⚠️ Fixed Issues

### 1. **API Port Mismatch** ✅

- **Problem**: Frontend was making requests to `http://localhost:5000` but backend was on `5001`
- **Solution**: Updated `VITE_API_URL=http://localhost:5001`
- **Result**: 500 errors resolved

### 2. **Google Client ID Configuration** ✅

- **Problem**: Backend had placeholder Google Client ID
- **Solution**: Updated to real Client ID `936298630410-h9evd2c594frurr7vk8q0jubrok4ne7l.apps.googleusercontent.com`
- **Result**: Google authentication now works

### 3. **Frontend URL in Backend CORS** ✅

- **Problem**: Backend CORS was configured for wrong frontend URL
- **Solution**: Set `FRONTEND_URL=http://localhost:5173`
- **Result**: CORS errors resolved

## 🧪 Testing Signup

1. Frontend: http://localhost:5173
2. Click "Sign Up"
3. Enter credentials (email, password, full name)
4. Submit form
5. Backend should send OTP email
6. Enter OTP to verify account
7. Account created successfully

## 📊 Health Check

```bash
# Test backend is running
curl http://localhost:5001/

# Expected response:
# {
#   "message": "YuganthaAI API is running",
#   "version": "1.0.2",
#   "uptime": 123.45,
#   "timestamp": "2026-05-27T08:09:00.000Z"
# }
```

## 🛠️ Troubleshooting

### Backend Fails to Start

1. Check if MongoDB URI is valid: `MONGODB_URI` in `.env`
2. Check if JWT_SECRET is set: `JWT_SECRET` in `.env`
3. Check if port 5000/5001 is in use:
   ```powershell
   Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue
   ```

### Frontend Shows 500 Errors

1. Check backend is running: `http://localhost:5001`
2. Verify `VITE_API_URL=http://localhost:5001` in frontend `.env`
3. Check browser console for CORS errors

### Google Sign-In Not Working

1. Verify Google Client ID matches in both frontend and backend `.env`
2. Check if frontend origin is authorized in Google Cloud Console
3. Open DevTools Console to see specific Google error

### OTP Email Not Sending

1. Verify `BREVO_API_KEY` is set in backend `.env`
2. Verify `BREVO_FROM_EMAIL` is set
3. Check backend logs for "sendOtpEmail" messages
4. Ensure MongoDB connection is working

## 📝 Notes

- Backend auto-retries ports if configured port is in use (5000 → 5001 → 5002, etc.)
- Frontend uses Vite dev server which supports HMR (Hot Module Replacement)
- All API responses are JSON format
- CORS is configured to allow frontend origin
- Rate limiting is enabled on auth endpoints (50 requests per 15 minutes)

## 🔐 Security Reminders

⚠️ **NEVER commit `.env` files to version control**

- Use `.env.example` as template
- Keep `JWT_SECRET` secret
- Keep `GOOGLE_CLIENT_ID` secure (though less critical than secret key)
- Rotate secrets regularly in production
- Use environment variables from hosting platform
