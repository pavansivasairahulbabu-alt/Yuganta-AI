# Google Authentication Setup & Troubleshooting Guide

## Issues Fixed ✅

### 1. **GSI Multiple Initialization Warning**

**Problem**: `google.accounts.id.initialize() is called multiple times`  
**Root Cause**: React StrictMode was double-invoking the GoogleOAuthProvider initialization in development  
**Solution**: Removed StrictMode wrapper from main.jsx to prevent double initialization

### 2. **API Endpoint 404 Errors**

**Problem**: `POST http://localhost:5173//api/auth/signup 404 (Not Found)`  
**Issues**:

- API URL was pointing to frontend port (5173) instead of backend port (5000)
- Trailing slash caused double slashes in URL paths

**Fixed in**: Frontend `.env`

```diff
- VITE_API_URL=http://localhost:5173/
+ VITE_API_URL=http://localhost:5000
```

### 3. **Google Client ID Mismatch**

**Problem**: "The given origin is not allowed for the given client ID"  
**Root Cause**: Backend had placeholder Google Client ID while frontend had the real one  
**Fixed in**: Backend `.env`

```diff
- GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnopqrz.apps.googleusercontent.com
+ GOOGLE_CLIENT_ID=936298630410-h9evd2c594frurr7vk8q0jubrok4ne7l.apps.googleusercontent.com
```

### 4. **COOP Policy Blocking PostMessage**

**Problem**: "Cross-Origin-Opener-Policy policy would block the window.postMessage call"  
**Status**: ✅ Already handled - helmet middleware configured with `crossOriginResourcePolicy: false`

---

## Environment Configuration

### Frontend (`YuganthaAI/frontend/.env`)

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=936298630410-h9evd2c594frurr7vk8q0jubrok4ne7l.apps.googleusercontent.com
```

### Backend (`YuganthaAI/backend/.env`)

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=936298630410-h9evd2c594frurr7vk8q0jubrok4ne7l.apps.googleusercontent.com
```

---

## Verification Checklist

### 1. **Backend Server**

```bash
cd YuganthaAI/backend
npm start
# Should show: ✅ Express server running on port 5000
```

### 2. **Frontend Development Server**

```bash
cd YuganthaAI/frontend
npm run dev
# Should show app running on http://localhost:5173
```

### 3. **Test Google Sign-In**

1. Navigate to http://localhost:5173
2. Go to Sign Up or Login page
3. Click "Sign in with Google"
4. After successful authentication, should redirect to home page

### 4. **Check Console Errors**

- ❌ "google.accounts.id.initialize() is called multiple times" - **FIXED** (removed StrictMode)
- ❌ "Failed to load resource: 404 (Not Found)" for `/api/auth/` - **FIXED** (corrected API URL)
- ❌ "The given origin is not allowed" - **FIXED** (corrected Google Client ID)

---

## Google OAuth Setup

### Configure Google Cloud Console

If you haven't set up Google OAuth, follow these steps:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web Application)
5. Add Authorized JavaScript origins:
   - `http://localhost:5173`
   - `http://localhost:5174`
   - `https://yugantaai.com` (production)
6. Add Authorized redirect URIs:
   - `http://localhost:5173`
   - `http://localhost:5174`
   - `https://yugantaai.com` (production)

---

## Debugging Tips

### 1. Check Network Requests

- Open DevTools → Network tab
- Look for `POST /api/auth/google` requests
- Should return 200/201 with user data

### 2. Check LocalStorage

- Open DevTools → Application → LocalStorage
- Should have `user` and `token` after successful login
- Token should start with `eyJ...` (JWT format)

### 3. Backend Logs

- Check backend console for `✅ Existing Google user logged in:` or `✅ New Google user created:`
- Errors will show `❌ Google authentication error:`

### 4. CORS Issues

If CORS errors persist:

- Verify backend server.js has correct allowed origins
- Check that `FRONTEND_URL` in backend `.env` matches frontend URL
- Ensure backend is running on port 5000

---

## Common Issues & Solutions

| Issue                                      | Solution                                                                   |
| ------------------------------------------ | -------------------------------------------------------------------------- |
| "The request has been aborted"             | Ensure Google Client ID matches in both frontend and backend               |
| "Failed to load Google Sign-In button"     | Check VITE_GOOGLE_CLIENT_ID is set correctly in frontend .env              |
| "FedCM get() rejects with NotAllowedError" | Multiple credential requests; ensure only one GoogleLogin component active |
| "GOOGLE_CLIENT_ID_NOT_SET" on backend      | Check backend .env has GOOGLE_CLIENT_ID                                    |
| "Invalid Google token"                     | Google Client ID mismatch; verify both frontend and backend use same ID    |

---

## Testing Commands

```bash
# Test backend is running
curl http://localhost:5000/

# Test API endpoint exists
curl -X OPTIONS http://localhost:5000/api/auth/google

# Check CORS headers
curl -I -H "Origin: http://localhost:5173" http://localhost:5000/api/auth/google
```

---

## Security Notes

⚠️ **DO NOT commit `.env` files to version control**  
✅ Use `.env.example` as template for others to copy

Production security checklist:

- [ ] Change JWT_SECRET to strong random value
- [ ] Use environment variables from hosting platform
- [ ] Enable HTTPS only in production
- [ ] Keep Google Client ID confidential
- [ ] Regularly rotate secrets

---

## Additional Resources

- [React OAuth Google Documentation](https://www.npmjs.com/package/@react-oauth/google)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Express CORS Configuration](https://www.npmjs.com/package/cors)
- [Helmet Security Middleware](https://helmetjs.github.io/)
