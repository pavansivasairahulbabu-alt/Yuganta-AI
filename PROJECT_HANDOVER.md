# Project Handover Documentation

## 1. Project Overview
- Project Name: MeroSphere (brand references in code: YuganthaAI / YugantaAI)
- Purpose of the Project: Production EdTech platform for selling and delivering AI/ML courses, capturing leads, and managing mentorship workflows for learners.
- Target Users (students / teachers / admin etc.):
  - Students/Learners
  - Instructors
  - Mentors
  - Admin/Operations team

## 2. Tech Stack
- Frontend:
  - React 19 (Vite)
  - React Router v7
  - Tailwind CSS
- Backend:
  - Node.js + Express (ES modules)
  - JWT auth
  - Express middleware: helmet, cors, compression, express-rate-limit
- Database:
  - MongoDB (Mongoose ODM)
- AI Models / APIs Used:
  - No direct LLM inference API is used in current backend runtime.
  - Google OAuth API is used for social sign-in.
  - Cloudinary API is used for media uploads.
- Hosting Platform:
  - Frontend: Vercel
  - Backend: Render (with Dockerfile present)

## 3. GitHub Repository
- Repository Link:
  - https://github.com/KaryampudiMadhav/MeroSphere.git
- Branches Used (main / dev etc.):
  - main
  - yoshitha (currently checked out)
  - features/t-changes
  - dummy
  - trail
  - thanusha
  - backup/api-config
- Important Notes about the Repo:
  - Monorepo-style split into `frontend` and `backend` folders.
  - Several utility/test scripts exist in backend for OTP, SMTP, mentor checks, and seed operations.
  - A setup note file (`backend/RENDER_SETUP.md`) currently contains sensitive values in plain text. Rotate those credentials and remove secrets from source control immediately.

## 4. Project Setup (How to Run the Project)

Steps to run locally:

1. Clone the repository
2. Backend setup:
   - `cd backend`
   - `npm install`
   - Create `.env` using `backend/.env.example`
   - Set minimum required vars: `MONGODB_URI`, `JWT_SECRET`
   - Recommended for auth emails: `BREVO_API_KEY`, `BREVO_FROM_EMAIL`
   - Run backend: `npm run dev`
3. Frontend setup:
   - `cd ../frontend`
   - `npm install`
   - Create `.env` (if needed) with at least: `VITE_API_URL`
   - Run frontend: `npm run dev`
4. Open app at `http://localhost:5173`

Additional requirements:
- MongoDB Atlas/database reachable from local machine
- Cloudinary keys if video/image upload paths are used
- Google OAuth client ID for Google login flow

## 5. Folder Structure (Important Folders)

Root:
- `backend/` -> API server, business logic, models, auth, scripts
- `frontend/` -> React app, pages/components/contexts

Backend:
- `backend/config/` -> database, mailer, cloudinary configs
- `backend/middleware/` -> auth guards and upload middleware
- `backend/models/` -> MongoDB schemas
- `backend/routes/` -> API route handlers
- `backend/scripts/` -> operational scripts and diagnostics

Frontend:
- `frontend/src/components/` -> reusable UI components
- `frontend/src/pages/` -> route-level page components
- `frontend/src/context/` -> auth/instructor/mentor/theme state providers
- `frontend/src/config/` -> API base URL config
- `frontend/public/` -> static assets (robots/sitemap)

## 6. Backend API Endpoints

Base route registration (from server boot):
- `/api/auth`
- `/api/users`
- `/api/courses`
- `/api/admin`
- `/api/instructor-auth`
- `/api/mentor-auth`
- `/api/blogs`
- `/api/mentorship-sessions`
- `/api/leads`
- `/api/contact`

### Authentication (`/api/auth`)
- POST `/signup`
- POST `/verify-signup-otp`
- POST `/login`
- POST `/forgot-password`
- POST `/reset-password`
- POST `/google`

### Users (`/api/users`)
- GET `/health`
- DELETE `/delete`
- DELETE `/delete-account`
- POST `/delete-account`
- GET `/profile`
- PUT `/profile`
- GET `/assigned-instructor`
- GET `/assigned-mentor`
- POST `/enroll/:courseId`
- GET `/enrolled`

### Courses (`/api/courses`)
- GET `/`
- GET `/instructors/public`
- GET `/instructor/:instructorId`
- GET `/my-courses/list`
- GET `/:id`
- POST `/`
- POST `/instructor/create`
- PUT `/:id`
- PUT `/instructor/:id`
- DELETE `/:id`
- DELETE `/instructor/:id`
- POST `/instructor/:courseId/modules`
- PUT `/instructor/:courseId/modules/:moduleId`
- DELETE `/instructor/:courseId/modules/:moduleId`
- POST `/instructor/:courseId/modules/:moduleId/videos`
- PUT `/instructor/:courseId/modules/:moduleId/videos/:videoId`
- DELETE `/instructor/:courseId/modules/:moduleId/videos/:videoId`

### Admin (`/api/admin`)
- POST `/login`
- GET `/mentors`
- POST `/mentors`
- PUT `/mentors/:id/activate`
- PUT `/mentors/:id/deactivate`
- PUT `/mentors/:id`
- DELETE `/mentors/:id`
- GET `/mentorship-sessions`
- PUT `/mentorship-sessions/:id/assign-mentor`
- GET `/users`
- POST `/assign-instructor`
- POST `/instructors`
- GET `/instructors`
- PUT `/instructors/:id/approve`
- PUT `/instructors/:id/deactivate`
- PUT `/instructors/:id/activate`
- DELETE `/instructors/:id`
- POST `/assign-mentor`
- GET `/blogs`
- POST `/blogs`
- PUT `/blogs/:id`
- DELETE `/blogs/:id`
- PUT `/blogs/:id/toggle-featured`
- POST `/upload-instructor-photo`
- POST `/upload-image`

### Instructor Auth (`/api/instructor-auth`)
- POST `/register`
- POST `/setup-password`
- POST `/forgot-password`
- POST `/reset-password`
- POST `/login`

### Mentor Auth (`/api/mentor-auth`)
- POST `/forgot-password`
- POST `/reset-password`
- POST `/login`

### Blogs (`/api/blogs`)
- GET `/`
- GET `/featured`
- GET `/:slug`
- POST `/:slug/like`

### Mentorship Sessions (`/api/mentorship-sessions`)
- POST `/`
- GET `/user`
- GET `/booked-slots`
- GET `/instructor`
- PUT `/:id/meeting-link`
- PUT `/:id/status`
- PUT `/:id/reject`
- PUT `/:id/reschedule`
- GET `/mentor/:id`
- PUT `/:id/complete`
- PATCH `/:id/complete`
- GET `/mentor-bookings`
- PUT `/:id/cancel`
- PUT `/:id/user-reschedule`
- PATCH `/:id/reject`
- PATCH `/:id/reschedule`
- PUT `/:id/add-meet-link`

### Leads (`/api/leads`)
- POST `/`
- GET `/`
- PUT `/:id`

### Contact (`/api/contact`)
- POST `/`

Key request/response format examples:
- Auth login request: `{ "email": "user@example.com", "password": "..." }`
- Auth login response: `{ "token": "<jwt>", "user": { ... } }`
- Enroll request: `POST /api/users/enroll/:courseId` with Bearer token
- Lead create request: `{ "name", "email", "phone", "courseName", ... }`
- Contact request: `{ "name", "email", "phone", "message" }`

## 7. Database Structure

Collections (Mongoose models):
- `users`
  - fullName, email, password
  - isVerified, signupOtp, signupOtpExpiry
  - resetOtp, resetOtpExpiry
  - enrolledCourses[]
  - assignedInstructor, assignedMentor
- `instructors`
  - name, email, password, bio, photo
  - expertise, company, experience, avatar
  - approved, active
  - resetToken, resetTokenExpiry
  - courses[]
- `mentors`
  - name, expertise, email, password, bio, photo
  - company, avatar
  - approved, active
  - resetToken, resetTokenExpiry
  - assignedSessions[]
- `courses`
  - title, description, instructor, instructorId
  - level, category, rating, students, lessons, duration
  - price, isFree, image, videoUrl, brochureLink
  - modules[] (nested videos[])
  - videos[]
- `blogs`
  - title, slug, excerpt, content, author
  - category, tags, thumbnail, readTime
  - featured, views, likes
- `leads`
  - name, email, phone, courseId, courseName
  - discussionTopic
  - preferredContactMode, preferredContactTime
  - leadSource, status, type, date
- `mentorshipsessions`
  - userId, instructorId, mentorId
  - title, date, time, notes
  - meetingLink, status
  - rejectionReason, rescheduleReason
  - originalDate, originalTime

## 8. Environment Variables (Names Only)

Backend:
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV`
- `BREVO_API_KEY`
- `BREVO_FROM_EMAIL`
- `FRONTEND_URL`
- `GOOGLE_CLIENT_ID`
- `API_RATE_LIMIT_MAX`
- `AUTH_RATE_LIMIT_MAX`
- `MONGO_MAX_POOL_SIZE`
- `MONGO_MIN_POOL_SIZE`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SMTP_USER`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `EMAIL_FROM`
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `INSTRUCTOR_TOKEN`
- `MONGO_URI`

Frontend:
- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`

## 9. Features Implemented

- Multi-role authentication flows (student/instructor/mentor/admin)
- OTP-based signup and password reset
- Google OAuth login
- Course catalog and course detail pages
- Instructor course CRUD
- Course modules and nested video management
- User enrollment APIs and enrollment-aware UI logic
- Mentorship booking and lifecycle management
- Admin dashboard APIs for users/instructors/mentors/sessions
- Blog management + public blog routes with views/likes
- Lead capture and status update pipeline
- Contact form to email pipeline
- CORS, helmet, compression, rate limiting, JWT auth middleware
- Dockerfiles and deployment config for frontend/backend

## 10. Pending Work

- Add formal API docs (OpenAPI/Swagger)
- Add comprehensive automated test suite (unit/integration/e2e)
- Harden admin auth (replace hardcoded admin login approach)
- Consolidate mentorship status values and transitions
- Add payment/billing integration (if paid courses are business requirement)
- Add observability: structured logs, error tracking, metrics dashboards
- Improve role-based authorization consistency across all endpoints

## 11. Known Bugs / Issues

- A setup markdown file currently includes plain-text secrets; rotate credentials immediately.
- If `BREVO_API_KEY` is missing, OTP email operations fail.
- Production requires correct `FRONTEND_URL` and `VITE_API_URL`; mismatch causes CORS/auth issues.
- Session status enums include overlapping states (`upcoming`, `pending`, `scheduled`, etc.) and may lead to edge-case behavior.

## 12. Deployment

Frontend:
- Hosted on Vercel using Vite build output (`dist`)
- Rewrites to `index.html` for SPA routing

Backend:
- Hosted on Render
- Node/Express app with env-based config
- Dockerfile available (`node:18-alpine`)

Database:
- MongoDB Atlas

Domain:
- Frontend domain configured via Vercel (e.g., yuganthaai.vercel.app)
- Backend Render URL consumed by `VITE_API_URL`

Steps to deploy:
1. Push code to GitHub
2. Deploy backend on Render with required env vars
3. Deploy frontend on Vercel with `VITE_API_URL` pointing to backend URL
4. Validate auth, email OTP, CORS, and course/media flows

## 13. Accounts Used

- MongoDB Atlas
- GitHub
- Vercel
- Render
- Brevo (transactional email)
- Google Cloud Console (OAuth client)
- Cloudinary
- Optional legacy/test integrations seen in scripts: SendGrid/SMTP

Credentials are stored securely in environment variables.

## 14. Additional Notes

- This is a production/business project: prioritize security, reliability, and change control.
- Recommended immediate hardening:
  - Remove secrets from repository history and docs
  - Rotate all exposed keys/passwords
  - Add backup and incident response checklist
  - Enforce branch protection + PR review + CI checks
- Backend and frontend are independently deployable; ensure version compatibility of API contracts during releases.
- Current date for this handover snapshot: March 18, 2026.
