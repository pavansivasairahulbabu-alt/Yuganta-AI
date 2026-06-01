# 🚀 Yuganta-AI Production Deployment Guide

This document provides complete instructions for deploying the **Yuganta-AI** application to production. 

The architecture consists of:
*   **Frontend**: React (Vite-based Single Page Application)
*   **Backend**: Node.js/Express REST API
*   **Database**: MongoDB (Atlas)
*   **File Storage**: Cloudinary (for course images, logos, etc.)
*   **Email Deliverability**: SMTP / Brevo (for OTP and user auth notifications)

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have gathered credentials/values for the following configuration tables.

### 1. Backend Environment Variables (`backend/.env`)

These variables must be set on your backend host:

| Environment Variable | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Mode of operation | `production` |
| `PORT` | Service port | `5000` (Render/Railway override automatically) |
| `FRONTEND_URL` | Allowed origin for CORS | `https://yugantaai.com` or Vercel URL |
| `MONGODB_URI` | Connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT signing | *Generate a long random secure string* |
| `GOOGLE_CLIENT_ID` | Google Client ID | `936298630410-h9evd2c594frurr7vk8q0jubrok4ne7l...` |
| `BREVO_API_KEY` | Transactional email provider API key | `xkeysib-...` |
| `BREVO_FROM_EMAIL` | Sender email address | `noreply@yugantaai.com` |
| `EMAIL_USER` | SMTP username (alternative mailer) | `yoshithanunna77@gmail.com` |
| `EMAIL_PASSWORD` | SMTP app-specific password | `lpbhjakmoatblbaa` |
| `EMAIL_FROM` | SMTP Sender Envelope Header | `YuganthaAI <noreply@yugantaai.com>` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary name for asset uploads | `daudlyq2g` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `345428738793312` |
| `CLOUDINARY_API_SECRET` | Cloudinary Secret Key | `xLPWG1Jwm6...` |

### 2. Frontend Environment Variables (`frontend/.env`)

These variables must be injected during the frontend build step:

| Environment Variable | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base API URL of your deployed Backend | `https://yuganta-api.onrender.com` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client identity | `936298630410-h9evd2c594frurr7vk8q0jubrok4ne7l...` |

---

## 🛠️ Deployment Methods

Choose the deployment method that fits your infrastructure needs.

### Option A: Cloud Platforms (Vercel & Render) — *Recommended*

This is the easiest and most cost-effective method. It separates static frontend assets from API services.

#### 1. Frontend: Deploy to Vercel
Since a `vercel.json` configuration is already included in `frontend/`, this is optimized for hosting single-page routing fallback rules.

1. Create/Login to your [Vercel account](https://vercel.com).
2. Connect your Git repository.
3. Configure the Project:
   * **Framework Preset**: `Vite` (Vercel will auto-detect).
   * **Root Directory**: `frontend`.
   * **Build Command**: `npm run build`.
   * **Output Directory**: `dist`.
4. Add **Environment Variables**:
   * Add `VITE_API_URL` pointing to your deployed backend URL.
   * Add `VITE_GOOGLE_CLIENT_ID`.
5. Click **Deploy**.

#### 2. Backend: Deploy to Render
A `vercel.json` for Serverless Node is also in `backend/`, but a dedicated container/Express host is recommended for stateful Node.js servers, making **Render** or **Railway** a better target.

1. Create/Login to your [Render account](https://render.com).
2. Create a new **Web Service** and link your Git repository.
3. Configure the Web Service:
   * **Root Directory**: `backend`.
   * **Runtime**: `Node`.
   * **Build Command**: `npm install`.
   * **Start Command**: `npm start`.
4. Click **Advanced** and add the variables listed in the *Backend Environment Variables* checklist.
5. Click **Create Web Service**.

---

### Option B: Unified Docker Deployment (Docker Compose)

Use the root-level `docker-compose.yml` to deploy both services on a single virtual server.

#### Prerequisites
* Install `docker` and `docker-compose` on the target machine.

#### Instructions
1. Clone the repository on the target server.
2. Edit `docker-compose.yml`:
   * Update `environment` variables under `backend` and `frontend` with production credentials.
   * Modify host bindings if port `80` (HTTP) or `5000` is already in use.
3. Start the stack in background daemon mode:
   ```bash
   docker-compose up -d --build
   ```
4. Verify containers are running:
   ```bash
   docker-compose ps
   ```

---

### Option C: Bare Metal / VPS Deployment (Ubuntu + Nginx + PM2)

For self-hosting on AWS EC2, DigitalOcean Droplet, Linode, or other virtual private servers.

#### Step 1: Install System Dependencies
Update system packages and install Node.js, Nginx, and PM2:
```bash
sudo apt update
sudo apt install -y curl git nginx
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -y -g pm2
```

#### Step 2: Setup Database & Backend Service
1. Clone the project code to `/var/www/yuganta-ai`.
2. Move into the backend directory and configure `.env`:
   ```bash
   cd /var/www/yuganta-ai/backend
   npm install --production
   nano .env # Add your production variables
   ```
3. Use PM2 to run the Express process in the background and configure startup options:
   ```bash
   pm2 start server.js --name "yuganta-backend"
   pm2 save
   pm2 startup
   ```

#### Step 3: Compile and Serve Frontend
1. Move to the frontend directory and configure environment:
   ```bash
   cd /var/www/yuganta-ai/frontend
   nano .env # Set production VITE_API_URL & VITE_GOOGLE_CLIENT_ID
   ```
2. Build static production bundle:
   ```bash
   npm install
   npm run build
   ```
3. The build assets will be inside `/var/www/yuganta-ai/frontend/dist`.

#### Step 4: Configure Nginx as Reverse Proxy & Web Server
Create a new Nginx block at `/etc/nginx/sites-available/yuganta-ai`:
```nginx
server {
    listen 80;
    server_name yugantaai.com www.yugantaai.com; # Replace with your domains

    # Serve Frontend static assets
    location / {
        root /var/www/yuganta-ai/frontend/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Reverse proxy for Backend API requests
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```
Link and activate the Nginx block:
```bash
sudo ln -s /etc/nginx/sites-available/yuganta-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: Secure with SSL (Let's Encrypt)
Install Certbot to automatically configure HTTPS on Nginx:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yugantaai.com -d www.yugantaai.com
```

---

## 🗄️ Database Seeding (Production)

Once the backend database URI is configured and running, you need to seed the system with the initial set of courses, instructors, and categories.

From the `backend/` directory, run these commands:

1. **Seed Instructors**:
   ```bash
   npm run seed:instructors
   ```
2. **Seed Courses**:
   ```bash
   npm run seed
   ```
3. **Seed Blogs**:
   ```bash
   npm run seed:blogs
   ```

*Note: Make sure your terminal has access to the relevant production `.env` variables or that they are populated in `backend/.env` during this step.*

---

## 🔒 Security Best Practices for Production

1. **CORS Restrictions**: Always make sure the `FRONTEND_URL` backend variable matches your exact production frontend URL to prevent unauthorized origin request hijacking.
2. **Rate Limiting**: Rate limiting is enabled on critical authentication routes (`/api/auth/login`, `/api/auth/verify-otp`, `/api/auth/signup`). Do not disable the `express-rate-limit` middleware in production.
3. **HTTP Security Headers**: Ensure `helmet` remains active in `server.js` to protect against cross-site scripting (XSS) and frame-jacking vulnerabilities.
