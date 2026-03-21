# YuganthaAI - Frontend Architecture Documentation

## Overview
The YuganthaAI frontend is built with **React 19**, **Vite**, and **Tailwind CSS**. It follows a modular, scalable architecture with clear separation of concerns, making it production-ready and maintainable.

---

## 1. High-Level Frontend Architecture

### Key Components:
- **Presentation Layer**: Reusable UI components (Navbar, Footer, Forms, Cards)
- **Page Layer**: Route-level components handling page composition
- **State Management**: React Context API for global state (Auth, Theme, Roles)
- **API Communication**: Fetch API with centralized configuration
- **Configuration**: Centralized API URL and environment settings
- **Utility Layer**: Custom hooks and helper functions

### Architecture Principles:
✅ **Modular Design** - Each folder has a single responsibility  
✅ **Scalability** - Easy to add new features without affecting existing code  
✅ **Reusability** - Components and hooks are designed for reuse  
✅ **Maintainability** - Clear separation between logic, UI, and services  
✅ **Performance** - Optimized rendering with Context API and lazy loading  

---

## 2. Component Hierarchy (App → Pages → Components)

### Provider Nesting Order (Top to Bottom):
```
App (Root Component)
  ↓
ThemeProvider (Theme state: light/dark)
  ↓
AuthProvider (User authentication state)
  ↓
InstructorProvider (Instructor session state)
  ↓
MentorProvider (Mentor session state)
  ↓
Router (React Router for routing)
```

### Page Organization:
- **Public Pages**: Landing, Courses, Blogs, About (no auth required)
- **User Pages**: Profile, MyLearning, Mentorship (user auth required)
- **Instructor Pages**: Dashboard, Forgot Password (instructor auth required)
- **Mentor Pages**: Dashboard, Bookings (mentor auth required)
- **Admin Pages**: Dashboard, User Management, Blog Management (admin auth)

### Component Reuse:
- `MainNavbar` → Used across all pages
- `Footer` → Used across all pages
- `Hero`, `FreeCourses`, `LearningPaths` → Used in landing page composition
- `LoadingSpinner` → Used for loading states across app
- `LeadCaptureForm` → Reused for lead capture

---

## 3. State Management Flow (Context API)

### Why Context API Instead of Redux?
✅ Simpler for this use case (4 global concerns only)  
✅ Less boilerplate code  
✅ Built-in to React (no external dependencies)  
✅ Easier for team understanding  
✅ Sufficient for current data volume  

### Context Breakdown:

#### **AuthContext** (🔐 User Authentication)
```javascript
States:
  - user: Current logged-in user object
  - token: JWT token stored in localStorage
  - enrolledCourses: User's course enrollments
  - loading: Loading state during auth checks

Methods:
  - login(email, password): User login with credentials
  - logout(): Clear user session
  - googleLogin(credentialResponse): OAuth login
  - signup(userData): User registration
  - fetchEnrolledCourses(token): Get user's enrolled courses
```

#### **ThemeContext** (🌓 Theme Management)
```javascript
States:
  - theme: 'light-theme' or 'dark-theme'

Methods:
  - toggleTheme(): Switch between light/dark
  - Persists to localStorage for user preference
```

#### **InstructorContext** (👨‍🏫 Instructor Sessions)
```javascript
States:
  - instructor: Current instructor data
  - loading: Loading state

Methods:
  - login(email, password): Instructor login
  - logout(): Clear instructor session
  - Auto-logout after 2 hours of inactivity
```

#### **MentorContext** (🎓 Mentor Sessions)
```javascript
States:
  - mentor: Current mentor data
  - loading: Loading state

Methods:
  - login(email, password): Mentor login
  - logout(): Clear mentor session
  - Session management similar to Instructor
```

### Data Persistence:
- **localStorage keys**:
  - `token`: JWT authentication token
  - `user`: User object (JSON stringified)
  - `instructor`: Instructor data (if logged in as instructor)
  - `instructorToken`: Instructor JWT
  - `instructorLoginTime`: For session expiration tracking
  - `theme`: User's theme preference

---

## 4. API Communication Layer

### Architecture:
```
Component → Context Method → Fetch API → Backend API
   ↓
localStorage (for token persistence)
   ↓
Component state update → Re-render
```

### API Configuration:
```javascript
// config/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Usage across contexts:
fetch(`${API_URL}/api/auth/login`, { /* options */ })
```

### HTTP Request Pattern:
```javascript
// Standard fetch with authentication
const response = await fetch(`${API_URL}/api/endpoint`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`  // JWT token
  },
  body: JSON.stringify(requestData),
});

const data = await response.json();
if (response.ok) {
  // Handle success (200-299 status)
  return { success: true, data };
} else {
  // Handle error
  return { success: false, error: data.message };
}
```

### Error Handling:
- Check response status and content-type
- Return structured error objects with `success`, `error`, `errorCode`
- Components display error messages in UI
- Rate limiting handled by backend

### Authentication Flow:
1. User submits credentials
2. Backend validates and returns JWT token
3. Token stored in localStorage
4. Token sent in Authorization header for protected routes
5. On app load, token retrieved from localStorage
6. If token exists, AuthContext fetches user's enrolled courses

---

## 5. Routing Structure (React Router v7)

### Route Categories:

#### **Public Routes** (No authentication required)
```
/                          → LandingPage
/courses                   → CoursesPage
/courses/:id               → CourseDetailPage
/about                     → AboutPage
/contact                   → ContactPage
/blogs                     → BlogsPage
/blogs/:id                 → BlogDetailPage
/instructors               → InstructorsPage
/projects/*                → Various project pages
/careers, /terms, /privacy → Static pages
```

#### **Authenticated User Routes** (User auth required)
```
/profile                   → ProfilePage
/my-learning               → MyLearningPage
/mentorship                → MentorshipPage
/mentorship/booking        → MentorshipBookingPage
/my-sessions               → MyMentorshipSessionsPage
/login, /signup, /forgot   → Auth pages (redirect if already logged in)
```

#### **Instructor Routes** (Instructor auth required)
```
/instructor/dashboard      → InstructorDashboard
/instructor/login          → InstructorLoginPage
/instructor/forgot-password → InstructorForgotPasswordPage
/instructor/register       → InstructorRegisterPage
```

#### **Mentor Routes** (Mentor auth required)
```
/mentor/dashboard          → MentorDashboard
/mentor/login              → MentorLoginPage
/mentor/forgot-password    → MentorForgotPasswordPage
```

#### **Admin Routes** (Admin auth required)
```
/admin/dashboard           → AdminDashboard
/admin/mentors             → AdminMentorManagement
/admin/instructors         → AdminInstructorManagement
/admin/users               → AdminRegistrations
/admin/blogs               → AdminBlogManagement
/admin/bookings            → AdminMentorshipBookings
/admin/mentor-assignments  → AdminMentorAssignments
/admin/calls               → AdminCalls
```

### Route Protection:
- Protected routes check context state for authorization
- Redirect unauthenticated users to login
- Each user type (user, instructor, mentor, admin) has separate dashboard
- Session timeout handled in contexts

---

## 6. Folder Structure & Responsibilities

```
frontend/src/
│
├── 📄 main.jsx                  # React app entry point
├── 📄 App.jsx                   # Router root, Provider setup
├── 📄 index.css                 # Global styles (Tailwind imports)
├── 📄 App.css                   # App-level component styles
│
├── 📁 pages/                    # Route-level page components
│   ├── LoginPage.jsx            # User login
│   ├── SignupPage.jsx           # User registration
│   ├── ProfilePage.jsx          # User profile view/edit
│   ├── CoursesPage.jsx          # Course listing
│   ├── CourseDetailPage.jsx     # Individual course details
│   ├── MyLearningPage.jsx       # User's enrolled courses
│   ├── MentorshipPage.jsx       # Browse mentors
│   ├── MentorshipBookingPage.jsx# Book mentorship sessions
│   ├── InstructorDashboard.jsx  # Instructor management
│   ├── MentorDashboard.jsx      # Mentor management
│   ├── AdminDashboard.jsx       # Admin management
│   ├── BlogsPage.jsx            # Blog listings
│   ├── BlogDetailPage.jsx       # Individual blog posts
│   ├── AboutPage.jsx            # About company
│   ├── ContactPage.jsx          # Contact form
│   ├── courses/                 # Specific course pages
│   └── projects/                # Project showcase pages
│
├── 🎨 components/               # Reusable UI components
│   ├── MainNavbar.jsx           # Main navigation bar
│   ├── CoursesNavbar.jsx        # Course page navbar
│   ├── Footer.jsx               # Page footer
│   ├── Hero.jsx                 # Hero section
│   ├── FreeCourses.jsx          # Free courses showcase
│   ├── LearningPaths.jsx        # Learning path cards
│   ├── ProgramSection.jsx       # Program cards display
│   ├── LeadCaptureForm.jsx      # Lead capture form
│   ├── VideoUpload.jsx          # Video upload form
│   ├── LoadingSpinner.jsx       # Loading indicator
│   ├── ScrollToTop.jsx          # Scroll to top button
│   ├── SEO.jsx                  # SEO metadata component
│   └── StructuredData.jsx       # JSON-LD structured data
│
├── 🔄 context/                  # Global state management
│   ├── AuthContext.jsx          # User authentication state
│   │   └── Exports: AuthProvider, useAuth()
│   ├── ThemeContext.jsx         # Theme state (light/dark)
│   │   └── Exports: ThemeProvider, useTheme()
│   ├── InstructorContext.jsx    # Instructor session state
│   │   └── Exports: InstructorProvider, useInstructor()
│   └── MentorContext.jsx        # Mentor session state
│       └── Exports: MentorProvider, useMentor()
│
├── 🪝 hooks/                    # Custom React hooks
│   └── useScrollAnimation.js    # Intersection Observer for animations
│       └── Detects element visibility for fade-in effects
│
├── ⚙️ config/                   # Configuration files
│   └── api.js                   # API base URL configuration
│       └── Export: API_URL constant
│
└── 🖼️ assets/                   # Static resources
    └── Images, icons, media files
```

### Folder Responsibilities:

| Folder | Purpose | Key Responsibilities |
|--------|---------|----------------------|
| **pages/** | Route-level containers | Handle routing, page composition, page-specific logic |
| **components/** | Reusable UI elements | Display UI, receive props, emit events, no business logic |
| **context/** | Global state management | Store global state, API calls, persistence logic |
| **hooks/** | Custom React hooks | Encapsulate reusable logic (animations, effects) |
| **config/** | App configuration | Centralize environment variables and settings |
| **assets/** | Static resources | Store images, icons, fonts, and media files |

---

## 7. Data Flow: User Interaction → UI Update

### Complete Flow Diagram:

```
1. USER INTERACTION
   └─ User clicks button / submits form / navigates

2. COMPONENT STATE UPDATE
   └─ Local component state updates (loading, form input)

3. CALL CONTEXT METHOD
   └─ Component calls context hook (e.g., login from useAuth)

4. CREATE HTTP REQUEST
   └─ Fetch API creates request with:
      - Method: GET, POST, PUT, DELETE
      - Headers: Content-Type, Authorization Bearer token
      - Body: JSON request data

5. SEND TO BACKEND
   └─ Request sent to Backend API via config/api.js URL

6. BACKEND PROCESSING
   └─ Backend:
      - Validates request format
      - Authenticates user (checks JWT)
      - Queries database
      - Returns JSON response (data or error)

7. PARSE RESPONSE
   └─ Frontend Fetch API:
      - Parses JSON response
      - Checks response status

8. UPDATE STORAGE
   └─ localStorage updated with:
      - New token (if auth response)
      - User data
      - Preferences

9. UPDATE CONTEXT STATE
   └─ Context state updated:
      - user, token, loading state
      - Triggers re-render of subscribed components

10. COMPONENT RE-RENDERS
    └─ React component re-renders with new context state

11. UI UPDATED
    └─ New data displayed to user
    └─ Error messages shown if failure
    └─ Loading states cleared
```

### Example: User Login Flow

```
User types email/password
         ↓
User clicks "Login" button
         ↓
LoginPage calls login() from useAuth()
         ↓
AuthContext.login() creates fetch request:
  POST ${API_URL}/api/auth/login
  Headers: { "Content-Type": "application/json" }
  Body: { email, password }
         ↓
Backend receives request, validates credentials
         ↓
Backend returns: { user: {...}, token: "jwt_token" }
         ↓
AuthContext saves to localStorage: token, user
         ↓
AuthContext updates state: setUser(), setToken()
         ↓
All components subscribed to AuthContext re-render
         ↓
MainNavbar shows user name
ProfilePage shows user data
MyLearningPage shows enrolled courses
         ↓
navigate("/") redirects to home page
         ↓
User sees personalized experience
```

---

## 8. Separation of Concerns

### Layer Architecture:

#### **1. Presentation Layer** (components/)
```
Responsibility: Display UI only
- Receive data via props
- Emit events (onClick, onChange, onSubmit)
- No business logic
- No API calls

Examples:
  - MainNavbar: Display navigation links and user profile
  - Hero: Display hero banner
  - LeadCaptureForm: Display form fields
```

#### **2. Container/Page Layer** (pages/)
```
Responsibility: Page composition and business logic
- Compose UI components
- Connect to contexts (useAuth, useTheme)
- Handle page-level state
- Orchestrate data flow
- Handle navigation

Examples:
  - LoginPage: Get login method from AuthContext, handle form submission
  - CoursesPage: Fetch courses, filter, sort, display course list
  - ProfilePage: Get user from AuthContext, display/edit profile
```

#### **3. State Management** (context/)
```
Responsibility: Global state and API orchestration
- Manage global state (user, theme, instructor, mentor)
- Make API calls (fetch requests)
- Handle authentication
- Persist to localStorage
- Provide methods for pages/components to use

Examples:
  - AuthContext: login(), logout(), googleLogin()
  - ThemeContext: toggleTheme()
  - InstructorContext: login(), logout()
```

#### **4. API Service Layer** (Built into contexts)
```
Responsibility: HTTP communication
- Create HTTP requests with proper headers
- Handle response parsing
- Error handling
- Header management (JWT tokens)

Pattern:
  const response = await fetch(
    `${API_URL}/api/endpoint`,
    { method, headers, body }
  );
```

#### **5. Configuration** (config/)
```
Responsibility: Centralize configuration
- API base URL
- Environment variables
- API endpoint constants (if created)

Usage:
  import API_URL from '../config/api';
```

#### **6. Routing** (App.jsx)
```
Responsibility: Route definitions and guards
- Define all routes
- Protect routes based on auth
- Navigate between pages
- Handle redirects

Technology: React Router v7
```

#### **7. Utilities & Hooks** (hooks/)
```
Responsibility: Reusable logic and utilities
- Custom React hooks for animations
- Helper functions for formatting
- Validation functions
- Business logic utilities

Examples:
  - useScrollAnimation: Trigger animations on scroll
  - useAuth, useTheme: Access context values
```

### Why This Separation Works:

| Benefit | Implementation |
|---------|-----------------|
| **Testability** | Each layer can be tested independently |
| **Maintainability** | Clear responsibilities, easy to find code |
| **Scalability** | Add new features without affecting existing layers |
| **Reusability** | Components used across multiple pages |
| **Performance** | Optimized rendering with Context API |
| **Debugging** | Clear data flow makes bugs easier to find |

---

## Technology Stack

| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI library | 19.2.0 |
| **Vite** | Build tool & dev server | 7.2.4 |
| **React Router** | Page routing | 7.11.0 |
| **Tailwind CSS** | Utility-first CSS framework | 3.4.19 |
| **React Hot Toast** | Toast notifications | 2.6.0 |
| **Lucide React** | Icon library | 0.562.0 |
| **React Markdown** | Markdown rendering | 10.1.0 |
| **React OAuth Google** | Google login integration | 0.13.4 |
| **ESLint** | Code linting | 9.39.1 |

---

## Key Features Implemented

### ✅ Authentication System
- Email/password login
- Google OAuth integration
- Forgot password flow with OTP
- Session management with JWT tokens
- Role-based access control (User, Instructor, Mentor, Admin)

### ✅ Dynamic Theme System
- Light/Dark mode toggle
- Persists theme preference
- Applied to entire app via CSS variables

### ✅ Responsive Design
- Mobile-first approach
- Tailwind CSS responsive utilities
- Adaptive layouts for all screen sizes

### ✅ Performance Optimizations
- Lazy component loading
- Intersection Observer for animations
- Efficient re-renders with Context API
- Optimized asset loading

### ✅ SEO Implementation
- Meta tags in components
- Structured data (JSON-LD)
- Open Graph tags
- Sitemap and robots.txt

### ✅ Error Handling
- Graceful error messages
- Network error fallbacks
- Loading states
- Form validation

---

## Best Practices Implemented

1. **Component Composition** - Break down UI into small, reusable components
2. **Custom Hooks** - Encapsulate logic in custom hooks (DRY principle)
3. **Context API** - Centralize global state management
4. **localStorage** - Persist user preferences and auth tokens
5. **Error Handling** - Structured error objects with clear messages
6. **Loading States** - Show spinners during async operations
7. **SEO Optimization** - Meta tags and structured data
8. **Responsive Design** - Mobile-first CSS approach
9. **Code Organization** - Clear folder structure with single responsibilities
10. **Configuration Management** - Centralized environment variables

---

## Future Scalability Considerations

### If App Grows to Need:

1. **More Complex State** → Migrate to Redux/Zustand
2. **API Service Layer** → Create separate services/ folder with API calls
3. **Form Validation** → Add react-hook-form + Zod/Yup
4. **Testing** → Add Jest + React Testing Library
5. **Performance** → Add React.lazy() for code splitting
6. **Caching** → Implement React Query / SWR
7. **Analytics** → Add Google Analytics integration
8. **Error Boundary** → Implement Error Boundary components
9. **WebSocket** → For real-time notifications
10. **PWA** → Service workers for offline support

---

## Common Development Workflows

### Adding a New Page:
1. Create new file in `pages/` folder
2. Add route in `App.jsx`
3. Use contexts with `useAuth()`, `useTheme()`, etc.
4. Compose UI components from `components/`
5. Handle navigation with `useNavigate()`

### Adding New Component:
1. Create file in `components/` folder
2. Accept props for data and callbacks
3. Keep component "dumb" (minimal logic)
4. Export and import where needed

### Accessing Global State:
```javascript
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { user, login, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // Use in component
}
```

### Making API Calls:
API calls are made within contexts. Components call context methods:
```javascript
const { login } = useAuth();
const result = await login(email, password);
```

---

## Deployment Configuration

### Build Process:
```bash
npm run build  # Creates optimized dist/ folder
```

### Environment Variables (.env):
```
VITE_API_URL=https://api.example.com
```

### Deployment Platforms:
- **Frontend**: Vercel (automatically builds and deploys from GitHub)
- **Backend**: Render or similar
- **Database**: MongoDB Atlas (cloud MongoDB)

---

## Summary

The YuganthaAI frontend follows industry best practices with:
- ✅ Clear, modular architecture
- ✅ Scalable folder structure
- ✅ Effective state management with Context API
- ✅ Centralized API communication
- ✅ Strong separation of concerns
- ✅ Production-ready code quality
- ✅ SEO optimization
- ✅ Responsive and accessible UI

This architecture supports team collaboration, rapid feature development, and long-term maintenance.

---

**Document Version**: 1.0  
**Last Updated**: March 2026  
**Frontend Framework**: React 19 with Vite  

