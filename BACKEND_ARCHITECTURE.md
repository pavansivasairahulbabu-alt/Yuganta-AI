# YuganthaAI - Backend Architecture Documentation

## Overview
The YuganthaAI backend is built with **Node.js**, **Express**, and **MongoDB**. It provides RESTful APIs for course management, user authentication, mentorship sessions, blogs, and admin operations. The architecture follows a modular, scalable design with clear separation of concerns.

---

## 1. Tech Stack & Dependencies

### Core Framework
- **Express.js** (4.18.2) - Web server framework
- **Node.js** (ES Modules) - Runtime environment
- **MongoDB** (8.0.0) - NoSQL database with Mongoose ODM

### Authentication & Security
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Password hashing
- **Helmet** - HTTP security headers
- **CORS** - Cross-origin resource sharing
- **express-rate-limit** - API rate limiting
- **express-validator** - Request validation

### File & External Integrations
- **Cloudinary** - Image/video cloud storage
- **multer** - File upload handling
- **multer-storage-cloudinary** - Cloudinary storage adapter
- **@sendgrid/mail** - Email delivery (Brevo/SendGrid)
- **Nodemailer** - SMTP email handling
- **google-auth-library** - Google OAuth authentication

### Utilities
- **Compression** - Gzip compression for responses
- **Dotenv** - Environment variable management

### Development
- **Nodemon** (3.0.1) - Auto-reload on file changes

---

## 2. Project Structure & Responsibilities

```
backend/
├── config/                    # Configuration files
│   ├── db.js                 # MongoDB connection
│   ├── mailer.js             # Brevo email configuration
│   └── cloudinary.js         # Cloudinary image storage setup
├── middleware/               # Express middleware
│   ├── auth.js              # JWT authentication & user verification
│   ├── instructorAuth.js    # Instructor role verification
│   └── upload.js            # Multer file upload handling
├── models/                   # Mongoose schemas & data models
│   ├── User.js              # User accounts (students)
│   ├── Course.js            # Course content & structure
│   ├── Instructor.js        # Instructor profiles & credentials
│   ├── Mentor.js            # Mentor profiles & availability
│   ├── MentorshipSession.js # 1-on-1 mentorship bookings
│   ├── Blog.js              # Blog articles
│   └── Lead.js              # Lead capture for marketing
├── routes/                   # API endpoint handlers
│   ├── auth.js              # User login/signup/OTP
│   ├── user.js              # User profile & enrollment
│   ├── courses.js           # Course data & progress
│   ├── instructorAuth.js    # Instructor login/verification
│   ├── mentorAuth.js        # Mentor registration & auth
│   ├── mentorshipSessions.js# Mentorship booking & management
│   ├── blogs.js             # Blog CRUD operations
│   ├── leads.js             # Lead capture
│   ├── contact.js           # Contact form submissions
│   └── admin.js             # Admin dashboard operations
├── scripts/                  # Utility scripts
│   ├── clearCourses.js      # Database cleanup
│   ├── fixDsaEnrollment.js  # Data migration
│   └── testSendgrid.js      # Email service testing
├── server.js                # Express app setup & initialization
├── start.js                 # Server startup with error handling
├── package.json             # Dependencies & scripts
├── .env                     # Environment variables (not in repo)
└── Dockerfile              # Docker containerization
```

---

## 3. Data Models & Entity Relationships

### User Model
```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed with bcryptjs),
  isVerified: Boolean,
  signupOtp: String,
  signupOtpExpiry: Date,
  resetOtp: String,
  resetOtpExpiry: Date,
  enrolledCourses: [{
    courseId: ObjectId (ref: Course),
    enrolledAt: Date
  }],
  googleId: String (for OAuth),
  role: String (default: "user"),
  createdAt: Date
}
```

### Course Model
```javascript
{
  title: String,
  description: String,
  category: String,
  instructor: ObjectId (ref: Instructor),
  price: Number,
  duration: Number,
  level: String (beginner|intermediate|advanced),
  modules: [{
    name: String,
    lessons: [ObjectId (ref: Lesson)],
    videoLength: Number
  }],
  students: [ObjectId (ref: User)],
  rating: Number,
  enrollments: Number,
  createdAt: Date
}
```

### Instructor Model
```javascript
{
  fullName: String,
  email: String (unique),
  password: String,
  phone: String,
  bio: String,
  profileImage: String (Cloudinary URL),
  expertise: [String],
  assignedCourses: [ObjectId (ref: Course)],
  isVerified: Boolean,
  createdAt: Date
}
```

### Mentor Model
```javascript
{
  fullName: String,
  email: String (unique),
  password: String,
  phone: String,
  specialization: String,
  bio: String,
  profileImage: String (Cloudinary URL),
  availability: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  isVerified: Boolean,
  assignedUsers: [ObjectId (ref: User)],
  createdAt: Date
}
```

### MentorshipSession Model
```javascript
{
  mentee: ObjectId (ref: User),
  mentor: ObjectId (ref: Mentor),
  sessionDate: Date,
  startTime: String (HH:mm),
  endTime: String (HH:mm),
  topic: String,
  status: String (scheduled|completed|cancelled),
  meetingLink: String,
  notes: String,
  rating: Number (1-5),
  feedback: String,
  createdAt: Date
}
```

### Blog Model
```javascript
{
  title: String,
  slug: String,
  excerpt: String,
  content: String (HTML),
  author: ObjectId (ref: Instructor),
  featured_image: String (Cloudinary URL),
  category: String,
  tags: [String],
  views: Number,
  published: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Lead Model
```javascript
{
  fullName: String,
  email: String,
  phone: String,
  source: String (where they came from),
  interestedCourse: String,
  status: String (new|contacted|converted),
  createdAt: Date
}
```

### Entity Relationships Diagram
```
User (1) ──────→ (Many) Course enrollment
         └──────→ (Many) MentorshipSession (as mentee)
         └──────→ (Many) Blog comments

Instructor (1) ──→ (Many) Course
           └──→ (Many) Blog (author)

Mentor (1) ────→ (Many) MentorshipSession
       └──→ (Many) User (assigned)

Course (1) ─────→ (Many) Lesson/Module
       └──→ (1) Instructor

MentorshipSession ─→ (1) User (mentee)
                 └→ (1) Mentor
```

---

## 4. API Routes & Endpoints

### Authentication Routes (`/api/auth`)
```
POST   /signup                - Create new user account with email/password
POST   /verify-signup-otp     - Verify email with OTP
POST   /login                 - Login with credentials → returns JWT
POST   /forgot-password       - Request password reset OTP
POST   /verify-reset-otp      - Verify reset OTP
POST   /reset-password        - Set new password
POST   /google-auth           - Google OAuth login/signup
POST   /logout                - Clear session (client-side token removal)
GET    /check-auth           - Verify current user token
```

### User Routes (`/api/user`)
```
GET    /profile              - Get current user profile
PUT    /profile              - Update user profile (protected)
GET    /enrolled-courses     - Get user's enrolled courses (protected)
POST   /enroll/:courseId     - Enroll in a course (protected)
PUT    /course-progress      - Update lesson completion (protected)
GET    /:userId              - Get public user profile
```

### Course Routes (`/api/courses`)
```
GET    /                      - Get all courses (with filters/pagination)
GET    /:courseId            - Get course details with modules
GET    /:courseId/lessons    - Get all lessons in a course
POST   /search               - Search courses by title/category
GET    /:courseId/progress   - Get user's course progress (protected)
GET    /category/:category   - Get courses by category
```

### Instructor Routes (`/api/instructor-auth`)
```
POST   /signup               - Instructor registration
POST   /login                - Instructor login → returns JWT
GET    /dashboard            - Instructor dashboard data (protected)
PUT    /profile              - Update instructor profile (protected)
GET    /courses              - Get instructor's courses (protected)
POST   /courses              - Create new course (protected)
PUT    /courses/:courseId    - Update course (protected)
DELETE /courses/:courseId    - Delete course (protected)
```

### Mentor Routes (`/api/mentor-auth`)
```
POST   /signup               - Mentor registration
POST   /login                - Mentor login → returns JWT
GET    /dashboard            - Mentor dashboard (protected)
PUT    /profile              - Update mentor profile (protected)
PUT    /availability        - Set mentor availability (protected)
```

### Mentorship Sessions Routes (`/api/mentorship-sessions`)
```
GET    /                      - Get all available mentors
POST   /book                  - Book a mentorship session (protected)
GET    /my-sessions          - Get user's booked sessions (protected)
GET    /mentor-sessions      - Get mentor's scheduled sessions (protected)
PUT    /:sessionId           - Update session status (protected)
DELETE /:sessionId           - Cancel session (protected)
POST   /:sessionId/rate      - Rate a completed session (protected)
```

### Blog Routes (`/api/blogs`)
```
GET    /                      - Get all published blogs with pagination
GET    /:slug                - Get single blog by slug
POST   /                      - Create new blog (instructor only, protected)
PUT    /:id                  - Update blog (instructor only, protected)
DELETE /:id                  - Delete blog (instructor only, protected)
GET    /category/:category   - Get blogs by category
POST   /:id/like             - Like a blog (protected)
```

### Leads Routes (`/api/leads`)
```
POST   /                      - Capture lead from website form
GET    /                      - Get all leads (admin only, protected)
PUT    /status/:leadId       - Update lead status (admin only, protected)
```

### Contact Routes (`/api/contact`)
```
POST   /                      - Submit contact form
GET    /                      - Get all contact submissions (admin only)
```

### Admin Routes (`/api/admin`)
```
GET    /dashboard             - Admin dashboard stats (admin only, protected)
GET    /users                 - Get all users (admin only)
GET    /enrollments          - Get all enrollments (admin only)
PUT    /courses/:courseId    - Assign instructor to course (admin only)
PUT    /mentors/:mentorId    - Assign users to mentor (admin only)
GET    /analytics            - Platform analytics (admin only)
POST   /email-broadcast      - Send bulk email (admin only)
```

---

## 5. Authentication & Authorization Flow

### JWT Token Structure
```javascript
{
  id: ObjectId,              // User/Instructor/Mentor ID
  role: String,              // 'user' | 'instructor' | 'mentor' | 'admin'
  iat: Number,               // Issued at timestamp
  exp: Number                // Expiration timestamp (30 days)
}
```

### Authentication Middleware (`middleware/auth.js`)
```javascript
1. Check Authorization header for "Bearer {token}"
2. Verify JWT signature with JWT_SECRET
3. Fetch user from database using decoded ID
4. Attach user object to req.user
5. Pass control to next middleware/route
6. If token invalid/expired → 401 Unauthorized
```

### Role-Based Access Control
```
Instructor Auth Middleware:
- Verify JWT token
- Check if req.user.role === 'instructor'
- Retrieve instructor record
- Grant access to instructor-specific endpoints

Admin Auth Middleware:
- Verify JWT token
- Check if req.user.email in ADMIN_EMAILS or req.user.role === 'admin'
- Grant access to admin dashboard
```

### OTP-Based Email Verification
```javascript
Signup OTP Flow:
1. User submits email/password
2. Generate 6-digit OTP, hash it, store in User.signupOtp
3. Set expiry to 10 minutes (User.signupOtpExpiry)
4. Send OTP via Brevo email
5. User enters OTP
6. Compare with stored hash
7. If valid + not expired → Mark user isVerified = true

Password Reset Flow:
1. User submits email
2. Generate OTP, hash, store in User.resetOtp + expiry
3. Send reset OTP email with reset page link
4. User enters OTP on reset page
5. Verify OTP
6. User sets new password
7. Hash password, update User.password
8. Clear resetOtp fields
```

---

## 6. Security Architecture

### Middleware Stack (in order)
```javascript
1. helmet()                    - Set HTTP security headers
2. cors(corsOptions)          - Allow only whitelisted origins
3. compression()              - Gzip responses
4. express.json()             - Parse JSON bodies
5. app.use("/api", apiLimiter) - Rate limit API calls (600/15min)
6. app.use("/auth", authLimiter) - Rate limit auth (50/15min)
7. Custom auth middleware     - Verify JWT for protected routes
```

### CORS Configuration
```javascript
Allowed Origins:
- Development: http://localhost:5173, http://localhost:5174
- Production: https://yugantha-ai.vercel.app, https://yugantaai.com
- All Vercel Preview URLs: https://yugantha-ai-[hash].vercel.app
- Env Variable FRONTEND_URL supports multiple comma-separated URLs

Credentials: true (allows cookies/auth headers)
```

### Rate Limiting
```javascript
API Limiter:
- Window: 15 minutes
- Max: 600 requests (configurable via API_RATE_LIMIT_MAX)
- Applies to all /api routes

Auth Limiter:
- Window: 15 minutes
- Max: 50 requests (configurable via AUTH_RATE_LIMIT_MAX)
- Applies to /auth routes (prevents brute force)
```

### Password Security
```javascript
1. Bcryptjs hashing with salt rounds = 10
2. Passwords never logged or exposed
3. Password reset OTPs are temporary (10 min expiry)
4. OTPs are hashed before storage
5. Passwords selected out of responses (select: "-password")
```

### Environment Variables
```
MONGODB_URI              - MongoDB Atlas connection string
JWT_SECRET               - Secret key for signing JWTs
FRONTEND_URL             - Comma-separated allowed frontend URLs
NODE_ENV                 - 'development' or 'production'
BREVO_API_KEY            - Brevo email service API key
BREVO_FROM_EMAIL         - Sender email address
CLOUDINARY_NAME          - Cloudinary account name
CLOUDINARY_API_KEY       - Cloudinary API key
CLOUDINARY_API_SECRET    - Cloudinary secret
GOOGLE_CLIENT_ID         - Google OAuth client ID
INSTRUCTOR_TOKEN         - Optional bypass token for instructors
API_RATE_LIMIT_MAX       - Max API requests (default: 600)
AUTH_RATE_LIMIT_MAX      - Max auth requests (default: 50)
MONGO_MAX_POOL_SIZE      - MongoDB connection pool (default: 50)
MONGO_MIN_POOL_SIZE      - MongoDB min pool size (default: 10)
```

---

## 7. Email & Notification Services

### Brevo (SendGrid) Email Configuration
```javascript
Provider: Brevo (formerly Sendinblue)
API Key: BREVO_API_KEY
From Email: BREVO_FROM_EMAIL

Supported Email Types:
1. Signup OTP → User email verification
2. Password Reset OTP → Account recovery
3. Course Enrollment Confirmation → User notifications
4. Mentorship Booking Confirmation → Session reminders
5. Admin Notifications → Lead capture, contact form submissions
6. Bulk Email Broadcasts → Admin marketing campaigns
```

### Email Template Architecture
```javascript
1. Generate OTP (6-digit random code)
2. Hash OTP for secure storage
3. Create HTML email template with:
   - Brand styling (YuganthaAI colors)
   - Clear call-to-action
   - OTP display (user-friendly)
   - Expiry time (10 minutes)
   - Alternative button link to portal
4. Send via Brevo API
5. Log email status & errors
```

### OTP Management
```javascript
Signup OTP:
- Generated: User signup request
- Stored: User.signupOtp (hashed)
- Expiry: User.signupOtpExpiry (10 minutes)
- Verified: POST /verify-signup-otp with plaintext OTP
- Comparison: Bcryptjs comparison (hashed vs plaintext)

Reset OTP:
- Generated: Password reset request
- Stored: User.resetOtp (hashed)
- Expiry: User.resetOtpExpiry (10 minutes)
- Same verification pattern as signup OTP
```

---

## 8. External Integrations

### Cloudinary (Image/Video Storage)
```javascript
Configuration:
- Account Name: CLOUDINARY_NAME
- API Key: CLOUDINARY_API_KEY
- API Secret: CLOUDINARY_API_SECRET

Usage:
- Course cover images
- Blog featured images
- Instructor profile pictures
- Mentor profile pictures
- User avatars
- Testimonial images

Integration:
- Multer handles file upload
- multer-storage-cloudinary stores files
- Returns secure HTTPS URLs
- Automatic optimization & resizing
```

### MongoDB (Database)
```javascript
Connection Strategy:
- Atlas cluster for reliability
- Connection pooling (10-50 connections)
- Retry logic for failed writes
- 60-second socket timeout
- Server selection timeout: 60s

Database Architecture:
- Single MongoDB instance
- Collections: users, courses, instructors, mentors, blogs, etc.
- Indexes on: email, courseId, mentorId, slug
- Relationships via ObjectId references

Tuning:
- maxPoolSize: 50 (production), lower in dev
- minPoolSize: 10 (maintain baseline connections)
- retryWrites: true (auto-retry failed operations)
- retryReads: true (auto-retry read failures)
```

### Google OAuth
```javascript
Provider: Google Cloud Console
Setup: GOOGLE_CLIENT_ID environment variable

Flow:
1. Frontend handles Google sign-in with SDK
2. Returns credentialResponse token to backend
3. Backend verifies token with Google library
4. Create or find user by google_id
5. Return JWT token for YuganthaAI
6. User authenticated without password storage
```

---

## 9. Request/Response Patterns

### Standard API Response
```javascript
Success Response (200):
{
  success: true,
  data: { ... },
  message: "Operation successful"
}

Error Response (4xx/5xx):
{
  success: false,
  message: "Error description",
  errors: [
    { field: "email", message: "Invalid format" }
  ]
}

Validation Error Response (400):
{
  success: false,
  message: "Validation failed",
  errors: [
    { field: "fullName", message: "Field required" },
    { field: "email", message: "Invalid email" }
  ]
}
```

### Request Validation Pattern
```javascript
Using express-validator:
1. Define validators on route: [
     body('email').isEmail(),
     body('password').isLength({ min: 6 })
   ]
2. Check for errors: validationResult(req)
3. Return 400 with error details if invalid
4. Proceed to controller if valid
```

---

## 10. Deployment Architecture

### Environment Configuration
```javascript
Development:
- NODE_ENV = 'development'
- FRONTEND_URL = 'http://localhost:5173,http://localhost:5174'
- MongoDB: Local or Atlas dev instance
- Email: Test mode (check console)

Production (Vercel/Render):
- NODE_ENV = 'production'
- FRONTEND_URL = 'https://yugantha-ai.vercel.app'
- MongoDB: Atlas production cluster
- Email: Brevo production API key
- All environment variables in platform secrets
```

### Server Initialization (`start.js`)
```javascript
1. Load environment variables (.env)
2. Validate required env variables
3. Connect to MongoDB
4. Initialize Express app with middleware
5. Mount all route handlers
6. Start listening on PORT (default 5000)
7. Log initialization status
8. Handle startup errors gracefully
```

### Docker Support
```dockerfile
- Node.js base image
- Install dependencies
- Copy backend files
- Expose port 5000
- Run: node start.js
- Used for containerized deployment to Render
```

### Vercel Deployment (API Routes)
```javascript
vercel.json:
- Redirects API requests to server.js
- Builds backend for serverless functions
- Manages environment variables via Vercel dashboard
```

---

## 11. Request Flow Diagrams

### User Signup Flow
```
Frontend                 Backend                MongoDB            Brevo
   |                        |                       |                |
   |-- POST /signup -----→  |                       |                |
   |                  (email, password)              |                |
   |                        |-- Hash password ----→ (password)        |
   |                        |-- Generate OTP ----→ |                 |
   |                        | (store + hash)        |                |
   |                        |-- Create User -----→ CREATE user        |
   |                        |                       |                |
   |                        |-- Send OTP email ----→|---- POST ----→ |
   |                        |                       |   (HTML+OTP)    |
   |                        |-- Return 200 -----→  |                |
   |← OTP sent message ----|                       |                |
   |                        |                       |                |
   |-- POST /verify ------→|                       |                |
   |  (email, otp)         |-- Verify OTP --------→|                |
   |                        | (hashed compare)      |                |
   |                        |-- Update User ------→ UPDATE isVerified |
   |                        |-- Generate JWT ----→ (attach to response)
   |← JWT Token + User ----|                       |                |
```

### Course Enrollment Flow
```
Frontend              Backend               MongoDB              Cloudinary
   |                    |                      |                    |
   |─ GET /courses ──→ |                      |                    |
   |  (with filters)   |─ Query courses ──→  FIND courses          |
   |                   |                      |← Course data ←──────|
   |← Course list ──--|                      |                    |
   |                   |                      |                    |
   |─ GET /courses/ID ─|                      |                    |
   | (signed JWT)      |─ Verify JWT ─────  (check token)          |
   |                   |─ Fetch course ──→  FIND by ID             |
   |                   |─ Get lesson videos ─ (Cloudinary URLs)    |
   |← Course data ────|                      |                    |
   |                   |                      |                    |
   |─ POST /enroll ──→|                      |                    |
   | (courseId, JWT)   |─ Verify JWT ─────  (check token)          |
   |                   |─ Add enrollment ─→ UPDATE user (enroll)   |
   |                   |                   UPDATE course (add count)|
   |← Confirmed ─────|                      |                    |
```

### Mentorship Booking Flow
```
Frontend                Backend             MongoDB               Email
   |                       |                    |                   |
   |─ GET /mentors ──→    |                    |                   |
   |                      |─ Find all mentors ─→ FIND with avail    |
   |← Mentor list ────    |                    |                   |
   |                       |                    |                   |
   |─ POST /book ────→    |                    |                   |
   | (mentorId, date)     |─ Verify JWT ────→  (check user)        |
   |                      |─ Create session ──→ CREATE session      |
   |                      |                   ADD to mentor.session |
   |                      |                   ADD to user.session  |
   |                      |─ Send email ──────→|── Brevo email ──→ |
   |                      |  (confirmation)    |   (mentor + mentee)|
   |← Booking confirmed →|                    |                   |
   |                       |                    |                   |
   |─ PUT /rate ──────→   |                    |                   |
   | (sessionId, rating)  |─ Verify JWT ────→  (check user)        |
   |                      |─ Update session ──→ UPDATE rating/notes |
   |                      |─ Send thank you ──→|── Brevo email ──→ |
   |← Rating saved ────  |                    |                   |
```

---

## 12. Error Handling Strategy

### Error Types & HTTP Status Codes
```javascript
400 Bad Request:
- Missing required fields
- Invalid input format
- Validation errors
Response: { success: false, errors: [...] }

401 Unauthorized:
- Missing or invalid JWT token
- Token expired
- Insufficient permissions
Response: { message: "Not authorized, no token" }

403 Forbidden:
- Valid token but insufficient role/permissions
- Trying to access other user's resources
Response: { message: "Access denied" }

404 Not Found:
- Resource doesn't exist
- Course/User/Mentor not found
Response: { message: "Resource not found" }

409 Conflict:
- Email already registered
- Duplicate enrollment
Response: { message: "Resource already exists" }

500 Internal Server Error:
- Unexpected server error
- Database connection error
- Email service failure
Response: { message: "Server error occurred" }
```

### Logging Strategy
```javascript
Startup Logs:
- ✅ Environment variables loaded
- ✅ MongoDB connected
- ✅ Email service ready
- ⚠️ Warnings for missing optional vars

Request Logs:
- API calls with timestamp
- Authentication attempts
- Validation failures
- Email sent/failed
- Database operations (dev only)

Error Logs:
- Full error stack traces
- Context (which endpoint, user, etc)
- Timestamps for debugging
```

---

## 13. Performance Optimization

### Database Indexing
```javascript
Recommended Indexes:
- User: email (unique), googleId
- Course: category, instructor
- Blog: slug (unique), author, createdAt
- MentorshipSession: mentee, mentor, sessionDate
- Mentor: email (unique), availability
- Instructor: email (unique), expertise
```

### Caching Strategy
```javascript
Client-side Caching:
- JWT stored in localStorage (30-day expiry)
- Course list cached with pagination
- User profile cached until logout

Server-side Optimization:
- Connection pooling (10-50 MongoDB connections)
- Compress responses with gzip
- Rate limiting prevents abuse
- Select specific fields to reduce payload
```

### API Efficiency
```javascript
- Pagination on list endpoints (limit 10-20 items)
- Filter courses by category/level
- Search with text indexes
- Only return necessary user fields (exclude password)
- Use ObjectId references instead of embedding
```

---

## 14. Maintenance & Scripts

### Available NPM Scripts
```json
"start": "node server.js"           - Start production server
"dev": "nodemon server.js"          - Development with auto-reload
"seed": "node seedCourses.js"       - Populate test courses
"seed:blogs": "node seedBlogs.js"   - Populate test blogs
"seed:instructors": "node seedInstructors.js" - Populate instructors
```

### Diagnostic & Testing Scripts
```javascript
check-mentors.js              - Verify mentor data
create-test-mentor.js         - Create test mentor for QA
debug-mentor-otp.js          - Debug OTP issues
diagnose-gmail.js            - Test email connectivity
diagnose-mongodb.js          - Test database connection
test-env.js                  - Validate environment setup
test-mentor-forgot-password.js - Test password reset flow
test-mongodb.js              - Database operation test
test-otp.js                  - OTP generation/verification test
test-smtp.js                 - SMTP email service test
update-courses-modules.js    - Bulk course updates
verify-instructor-courses.js - Check instructor-course mapping
```

---

## 15. Common Tasks & Solutions

### Adding a New API Endpoint
```javascript
1. Create route handler in routes/{feature}.js
2. Define schema in models/{Feature}.js if new entity
3. Add authentication middleware if needed
4. Validate input with express-validator
5. Implement controller logic
6. Return standard response format
7. Add tests
8. Mount route in server.js
```

### Adding a New Email Template
```javascript
1. Define HTML template in routes/{feature}.js
2. Use Brevo API to send
3. Include error handling
4. Log email status
5. Handle bounce/delivery failures
6. Test with test account before production
```

### Database Migration
```javascript
1. Create migration script in scripts/
2. Load environment variables
3. Connect to MongoDB
4. Perform bulk operations
5. Verify changes
6. Log migration status
7. Test on development first
```

---

## Key Architecture Principles

✅ **Modular Design** - Each route/model has single responsibility  
✅ **Security First** - JWT auth, CORS, rate limiting, helmet on all requests  
✅ **Error Handling** - Consistent error responses with proper HTTP codes  
✅ **Scalability** - Connection pooling, proper indexing, pagination  
✅ **Maintainability** - Clear folder structure, consistent patterns  
✅ **Observability** - Strategic logging for debugging and monitoring  
✅ **Reliability** - Email retries, database retries, connection resilience  

---

## Next Steps for Expansion

1. **Caching Layer** - Add Redis for session/course caching
2. **WebSockets** - Real-time notifications for mentorship sessions
3. **Advanced Search** - Elasticsearch for full-text course/blog search
4. **API Documentation** - Swagger/OpenAPI specs
5. **Monitoring** - Sentry/DataDog for error tracking
6. **Load Testing** - Verify rate limits and scalability
7. **Webhooks** - Outbound notifications for integrations
8. **Payments** - Stripe integration for paid courses
