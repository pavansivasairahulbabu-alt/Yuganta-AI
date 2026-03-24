# YuganthaAI Backend - Developer Quick Reference Guide

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 16+
MongoDB Atlas account
Brevo API key (for email)
Cloudinary account (for image storage)
```

### Initial Setup
```bash
cd backend
npm install
cp .env.example .env              # Create .env file
# Add your environment variables to .env
npm run dev                        # Start with nodemon
```

### Environment Variables Checklist
```
✓ MONGODB_URI              # MongoDB connection string
✓ JWT_SECRET              # Your JWT secret key
✓ FRONTEND_URL            # http://localhost:5173
✓ BREVO_API_KEY           # Email service key
✓ BREVO_FROM_EMAIL        # Sender email
✓ CLOUDINARY_NAME         # Account name
✓ CLOUDINARY_API_KEY      # CloudinaryAPI key
✓ CLOUDINARY_API_SECRET   # Cloudinary secret
✓ GOOGLE_CLIENT_ID        # For OAuth
✓ NODE_ENV                # 'development' | 'production'
```

---

## 📁 File Structure Navigation

### Quick Lookups
```
Need to add user auth?           → routes/auth.js
Need to create course endpoint?   → routes/courses.js + models/Course.js
Need to add email sending?        → config/mailer.js
Need to secure an endpoint?       → middleware/auth.js
Need user data structure?         → models/User.js
Need to add file upload?          → middleware/upload.js
Need to test locally?             → scripts/test-*.js
```

### Common Patterns

#### Adding a New Route
```javascript
// In routes/myfeature.js
import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import MyModel from '../models/MyModel.js';

const router = express.Router();

// Public route
router.get('/', async (req, res) => {
  try {
    const data = await MyModel.find();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Protected route (requires authentication)
router.post('/', protect, async (req, res) => {
  try {
    // req.user is available from auth middleware
    const newItem = await MyModel.create(req.body);
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;

// Then in server.js add:
// import myfeatureRoutes from './routes/myfeature.js';
// app.use('/api/myfeature', myfeatureRoutes);
```

#### Adding Database Validation
```javascript
using express-validator:
router.post('/data', [
  body('email').isEmail().withMessage('Invalid email'),
  body('fullName').notEmpty().withMessage('Name required'),
  body('age').isInt({ min: 18 }).withMessage('Must be 18+'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Proceed with validated data
});
```

#### Protecting Routes by Role
```javascript
// In middleware/instructorAuth.js - adapt for specific roles
import Instructor from '../models/Instructor.js';

export const instructorProtect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const instructor = await Instructor.findById(decoded.id);
    
    if (!instructor) {
      return res.status(403).json({ message: 'Not an instructor' });
    }
    
    req.user = instructor;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Use in route:
router.post('/courses', instructorProtect, async (req, res) => {
  // Only instructors can reach here
});
```

#### Sending Emails
```javascript
import transporter from '../config/mailer.js';

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.BREVO_FROM_EMAIL,
      to,
      subject,
      html
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Email failed: ${error.message}`);
    throw error;
  }
};

// Usage:
await sendEmail(
  user.email,
  'Welcome to YuganthaAI',
  '<h1>Welcome!</h1><p>Your account is ready.</p>'
);
```

#### Processing File Uploads
```javascript
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'yuganthaai/users',
    allowed_formats: ['jpg', 'png', 'gif'],
    resource_type: 'auto'
  }
});

const upload = multer({ storage });

// Use in route:
router.post('/upload', upload.single('image'), async (req, res) => {
  res.json({ 
    success: true, 
    imageUrl: req.file.path  // Cloudinary URL
  });
});
```

#### Querying Database with Filtering
```javascript
// Simple query
const users = await User.find({ email: 'user@example.com' });

// With filtering
const courses = await Course.find()
  .where('category').equals('DSA')
  .where('level').equals('beginner')
  .limit(10)
  .skip((page - 1) * 10);

// With population (join related data)
const courseWithInstructor = await Course.findById(id)
  .populate('instructor', 'fullName email bio');

// Exclude password field
const user = await User.findById(id).select('-password');

// Count
const totalCourses = await Course.countDocuments({ category: 'DSA' });

// Aggregation
const stats = await Course.aggregate([
  { $group: { _id: '$category', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]);
```

---

## 🔑 API Testing Examples

### Using cURL
```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","fullName":"John"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'

# Get courses (with JWT token)
curl -X GET http://localhost:5000/api/courses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Enroll in course
curl -X POST http://localhost:5000/api/user/enroll/COURSE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman/Insomnia
1. Open new request
2. Set method: POST
3. URL: `http://localhost:5000/api/auth/login`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "email": "user@example.com",
  "password": "pass123"
}
```
6. Send → Save token from response
7. Use token in subsequent requests: 
   - Header → `authorization: Bearer {token}`

---

## 🐛 Debugging Tips

### Check Server Status
```bash
# Is server running?
curl http://localhost:5000/api/health

# Check logs for errors
npm run dev                    # Watch console output

# Test MongoDB connection
node test-mongodb.js
```

### Test Email Service
```bash
# Run email diagnostic
node diagnose-gmail.js

# Check Brevo availability
node test-smtp.js
```

### Database Inspection
```bash
# Connect to MongoDB Atlas
# Use MongoDB Compass tool
# Or via Atlas Web UI
# Check collections: users, courses, instructors, etc.

# Quick test
node test-mongodb.js
```

### Common "Fix" Commands
```bash
# Clear all courses (if corrupted)
node scripts/clearCourses.js

# Fix DSA enrollment issues
node scripts/fixDsaEnrollment.js

# Reseed with test data
npm run seed
npm run seed:blogs
npm run seed:instructors

# Check instructor-course mapping
node verify-instructor-courses.js
```

---

## 🔐 Security Checklist

When adding new endpoints:
- [ ] Validate all input with express-validator
- [ ] Use `protect` middleware for authenticated routes
- [ ] Never return passwords in API responses (use `.select('-password')`)
- [ ] Hash passwords with bcryptjs before storage
- [ ] Set JWT expiry to 30 days maximum
- [ ] Rate limit auth endpoints
- [ ] Validate file uploads (format, size)
- [ ] Sanitize user input (prevent injection)
- [ ] Test CORS with external URLs
- [ ] Never log sensitive data (passwords, tokens)

---

## 📊 Database Schema Tips

### Creating Indexes for Better Performance
```javascript
// In MongoDB Atlas or via script
db.users.createIndex({ email: 1 })  // Unique email lookup
db.courses.createIndex({ category: 1 })  // Filter by category
db.mentorshipSessions.createIndex({ sessionDate: 1 })  // Find by date
db.blogs.createIndex({ slug: 1 })  // Unique blog URL
```

### Common Query Patterns
```javascript
// Find all courses for an instructor
const courses = await Course.find({ instructor: instructorId });

// Find user's enrollments with course details
const user = await User.findById(userId)
  .populate('enrolledCourses.courseId', 'title category');

// Get mentor's upcoming sessions
const sessions = await MentorshipSession.find({
  mentor: mentorId,
  sessionDate: { $gte: new Date() },
  status: 'scheduled'
}).sort({ sessionDate: 1 });
```

---

## 🚀 Deployment Quick Steps

### To Render.com
1. Push code to GitHub
2. Connect GitHub repo to Render
3. Set environment variables in Render dashboard
4. Select "Node" environment
5. Build command: `npm install`
6. Start command: `node start.js`
7. Deploy!

### To Vercel (Alternative)
1. Push code to GitHub
2. Create `vercel.json` (already exists)
3. Connect to Vercel
4. Set environment variables
5. Deploy!

### Environment Variables to Set
```
MONGODB_URI
JWT_SECRET
FRONTEND_URL
BREVO_API_KEY
BREVO_FROM_EMAIL
CLOUDINARY_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
GOOGLE_CLIENT_ID
NODE_ENV=production
```

---

## 📚 Useful npm Commands

```bash
npm run dev                # Start with hot reload
npm run start              # Start production server
npm run seed              # Populate test courses
npm run seed:blogs        # Populate test blogs
npm run seed:instructors  # Populate test instructors

# Test scripts
node test-mongodb.js      # Test database
node test-smtp.js         # Test email
node test-otp.js          # Test OTP
node diagnose-mongodb.js  # Debug database
node diagnose-gmail.js    # Debug email
```

---

## 🎯 Common Tasks

### Task: Add a New Course Field
```javascript
1. Update models/Course.js - add new field
2. Create migration script in scripts/
3. Update routes/courses.js to handle new field
4. Update admin course edit endpoint
5. Test in Postman
6. Deploy to production
```

### Task: Send Bulk Emails
```javascript
const users = await User.find();
for (const user of users) {
  await sendEmail(user.email, 'Subject', '<html>...</html>');
  await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
}
```

### Task: Add Pagination
```javascript
const page = req.query.page || 1;
const limit = 10;
const skip = (page - 1) * limit;

const data = await Model.find()
  .limit(limit)
  .skip(skip);

const total = await Model.countDocuments();
res.json({
  data,
  pagination: {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  }
});
```

---

## 📞 Troubleshooting

| Problem | Solution |
|---------|----------|
| "CORS error" | Add frontend URL to allowedOrigins in server.js |
| "MongoDB connection failed" | Check MONGODB_URI, whitelist your IP in Atlas |
| "Email not sending" | Verify BREVO_API_KEY and BREVO_FROM_EMAIL |
| "File upload not working" | Check Cloudinary credentials |
| "JWT verification failed" | Ensure token format is "Bearer {token}" |
| "Rate limit exceeded" | Wait 15 minutes or adjust limit in server.js |
| "OTP expires too fast" | Check OTP expiry time (default: 10 min) |
| "Password reset isn't working" | Verify email service and check error logs |

---

## 📖 Further Reading

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Mongoose Guide](https://mongoosejs.com/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [CORS Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Helmet.js](https://helmetjs.github.io/)
- [Bcryptjs](https://github.com/dcodeIO/bcrypt.js)

---

## 🤝 Contributing Guidelines

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes with clear commits
3. Test locally: `npm run dev`
4. Push and create PR
5. Add description of changes
6. Get review before merging

---

**Last Updated:** March 2025  
**Maintained By:** YuganthaAI Development Team
