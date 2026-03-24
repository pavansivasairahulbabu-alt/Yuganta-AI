# YuganthaAI - Backend Architecture Diagram

## System Architecture Overview

```mermaid
graph TB
    subgraph Client["🖥️ Client Layer"]
        FE["Frontend<br/>(React + Vite)<br/>Port 5173"]
        WEB["Web Browser"]
    end

    subgraph API["🔌 API Layer"]
        EXP["Express.js Server<br/>(Port 5000)"]
        CORS["CORS Middleware<br/>(Whitelisted Origins)"]
        RATE["Rate Limiting<br/>(600/15min API<br/>50/15min Auth)"]
        HELMET["Security Headers<br/>(Helmet)"]
        COMP["Compression<br/>(GZIP)"]
    end

    subgraph Routes["📍 Route Handlers"]
        AUTH["🔐 Auth Routes<br/>(/api/auth)<br/>- Signup/Login<br/>- OTP Verification<br/>- Google OAuth"]
        USER["👤 User Routes<br/>(/api/user)<br/>- Profile<br/>- Enrollments<br/>- Progress"]
        COURSE["📚 Course Routes<br/>(/api/courses)<br/>- Get Courses<br/>- Lessons<br/>- Search"]
        INST["👨‍🏫 Instructor Routes<br/>(/api/instructor-auth)<br/>- Dashboard<br/>- Course CRUD"]
        MENTOR["🎯 Mentor Routes<br/>(/api/mentor-auth)<br/>- Profile<br/>- Availability"]
        MSESS["📅 Mentorship Routes<br/>(/api/mentorship-sessions)<br/>- Book Session<br/>- Rate/Feedback"]
        BLOG["📝 Blog Routes<br/>(/api/blogs)<br/>- CRUD<br/>- Category Filter"]
        ADMIN["⚙️ Admin Routes<br/>(/api/admin)<br/>- Dashboard<br/>- User Management"]
    end

    subgraph Middleware["🔑 Middleware Stack"]
        AUTHM["JWT Auth<br/>Middleware"]
        INSTM["Instructor Auth<br/>Middleware"]
        UPLOAD["Multer Upload<br/>Middleware"]
        VALID["Express Validator<br/>Middleware"]
    end

    subgraph Models["📊 Data Models"]
        USERDB["User<br/>- email, password<br/>- enrolledCourses<br/>- OTP fields"]
        COURSEDB["Course<br/>- title, modules<br/>- instructor<br/>- students[]"]
        INSTDB["Instructor<br/>- courses[]<br/>- verified status"]
        MENTORDB["Mentor<br/>- availability<br/>- specialization<br/>- assignedUsers[]"]
        SESSDB["MentorshipSession<br/>- mentee, mentor<br/>- date, rating<br/>- feedback"]
        BLOGDB["Blog<br/>- title, content<br/>- author, tags<br/>- featured_image"]
        LEADDB["Lead<br/>- email, source<br/>- interestedCourse<br/>- status"]
    end

    subgraph Database["🗄️ Data Layer"]
        MONGO["MongoDB Atlas<br/>(NoSQL Database)<br/>- Collections<br/>- Indexes<br/>- Aggregation"]
    end

    subgraph External["🔗 External Services"]
        BREVO["📧 Brevo Email<br/>- OTP Emails<br/>- Confirmations<br/>- Broadcasts"]
        CLOUD["🖼️ Cloudinary<br/>- Image Storage<br/>- Video Storage<br/>- Auto Optimization"]
        GOOGLE["🔐 Google OAuth<br/>- Sign In<br/>- Token Verify"]
    end

    subgraph Deployments["🚀 Deployment"]
        VERCEL["Vercel<br/>(Frontend)<br/>Port 5173"]
        RENDER["Render<br/>(Backend)<br/>Port 5000"]
    end

    %% Client to API
    WEB -->|API Requests<br/>JWT Token| CORS
    CORS --> HELMET
    HELMET --> COMP
    COMP --> RATE
    RATE --> EXP

    %% API to Routes
    EXP --> AUTH
    EXP --> USER
    EXP --> COURSE
    EXP --> INST
    EXP --> MENTOR
    EXP --> MSESS
    EXP --> BLOG
    EXP --> ADMIN

    %% Routes to Middleware
    AUTH --> VALID
    USER --> AUTHM
    COURSE --> AUTHM
    INST --> INSTM
    MENTOR --> INSTM
    MSESS --> AUTHM
    BLOG --> INSTM
    ADMIN --> AUTHM
    INST --> UPLOAD

    %% Middleware to Models
    AUTHM --> USERDB
    INSTM --> INSTDB
    AUTHM --> COURSEDB
    AUTHM --> MENTORDB
    AUTHM --> SESSDB
    VALID --> BLOGDB
    AUTHM --> LEADDB

    %% Models to Database
    USERDB --> MONGO
    COURSEDB --> MONGO
    INSTDB --> MONGO
    MENTORDB --> MONGO
    SESSDB --> MONGO
    BLOGDB --> MONGO
    LEADDB --> MONGO

    %% Database back to API
    MONGO -->|Query Results| EXP

    %% External Services
    AUTH -.->|Send OTP| BREVO
    MSESS -.->|Send Confirmation| BREVO
    INST -.->|Upload Images| CLOUD
    UPLOAD -.->|Store Files| CLOUD
    AUTH -.->|Verify Token| GOOGLE

    %% Deployment Connection
    FE -->|HTTP/HTTPS| VERCEL
    EXP -->|Docker/Node| RENDER
    VERCEL -->|API Calls| RENDER

    %% Styling
    classDef client fill:#e1f5ff,stroke:#0288d1,stroke-width:2px
    classDef api fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef route fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef middleware fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef model fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef db fill:#ede7f6,stroke:#5e35b1,stroke-width:2px
    classDef external fill:#e0f2f1,stroke:#00796b,stroke-width:2px
    classDef deploy fill:#f1f8e9,stroke:#558b2f,stroke-width:2px

    class WEB,FE client
    class EXP,CORS,RATE,HELMET,COMP api
    class AUTH,USER,COURSE,INST,MENTOR,MSESS,BLOG,ADMIN route
    class AUTHM,INSTM,UPLOAD,VALID middleware
    class USERDB,COURSEDB,INSTDB,MENTORDB,SESSDB,BLOGDB,LEADDB model
    class MONGO db
    class BREVO,CLOUD,GOOGLE external
    class VERCEL,RENDER deploy
```

## Data Flow Diagram - User Signup

```mermaid
sequenceDiagram
    participant User as 👤 User<br/>Frontend
    participant API as 🔌 Backend API
    participant Validate as ✓ Validation
    participant Hash as 🔐 Bcrypt
    participant DB as 🗄️ MongoDB
    participant Email as 📧 Brevo

    User->>API: POST /signup<br/>{email, password, fullName}
    API->>Validate: Check input format
    Validate-->>API: Valid ✓
    API->>Hash: Hash password with bcrypt
    Hash-->>API: $2a$10$...hashed_pwd...
    API->>Hash: Generate & hash OTP
    Hash-->>API: hashed OTP
    API->>DB: CREATE User<br/>{email, hashedPwd, otpHash, expiry}
    DB-->>API: User created
    API->>Email: POST send OTP email
    Email-->>User: 📧 OTP sent to email
    API-->>User: 200 OK {message: "OTP sent"}
    
    User->>API: POST /verify-signup-otp<br/>{email, otp}
    API->>DB: GET User by email
    DB-->>API: User record + hashedOtp
    API->>Hash: Compare plaintext OTP with hash
    Hash-->>API: Match ✓
    API->>DB: UPDATE User {isVerified: true}
    DB-->>API: Updated
    API-->>User: 200 OK {token, user}
```

## Data Flow Diagram - Course Enrollment

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant FE as 🖥️ Frontend
    participant API as 🔌 Backend
    participant Auth as 🔐 JWT Verify
    participant DB as 🗄️ MongoDB

    User->>FE: Click "Enroll Now"
    FE->>API: POST /enroll/{courseId}<br/>Headers: {Authorization: Bearer JWT}
    API->>Auth: Verify JWT token
    Auth-->>API: User ID + Details
    API->>DB: GET Course by ID
    DB-->>API: Course details
    API->>DB: UPDATE User<br/>ADD enrolledCourses[{courseId, date}]
    API->>DB: UPDATE Course<br/>ADD user to students[]<br/>INCREMENT enrollments++
    DB-->>API: Both updates success
    API-->>FE: 200 OK {message: "Enrolled"}
    FE->>FE: Update UI<br/>Show "Go to Course"
    FE-->>User: ✓ Enrollment confirmed
```

## Data Flow Diagram - Mentorship Booking

```mermaid
sequenceDiagram
    participant Student as 🎓 Student
    participant FE as 🖥️ Frontend
    participant API as 🔌 Backend
    participant DB as 🗄️ MongoDB
    participant Email as 📧 Brevo

    Student->>FE: Select Mentor & Date
    FE->>API: POST /mentorship-sessions/book<br/>{mentorId, date, topic}
    API->>DB: Verify mentor availability
    DB-->>API: ✓ Available
    API->>DB: CREATE MentorshipSession<br/>{mentee, mentor, date, status: scheduled}
    DB-->>API: Session created
    API->>DB: UPDATE Mentor<br/>ADD sessionId to sessions[]
    API->>DB: UPDATE User<br/>ADD sessionId to mentorshipSessions[]
    DB-->>API: All updates complete

    API->>Email: Send confirmation to Student
    Email-->>Student: 📧 Booking confirmed
    API->>Email: Send reminder to Mentor
    Email-->>Student: 📧 New booking notification
    
    API-->>FE: 200 OK {sessionId, date, time}
    FE-->>Student: ✓ Mentorship booked!
```

## Technology Stack Layer

```mermaid
graph LR
    subgraph Frontend["Frontend Stack"]
        REACT["React 19<br/>+ Context API"]
        VITE["Vite<br/>(Build Tool)"]
        TAILWIND["Tailwind CSS<br/>(Styling)"]
    end

    subgraph Backend["Backend Stack"]
        NODE["Node.js<br/>(Runtime)"]
        EXPRESS["Express.js<br/>(Web Framework)"]
        MONGOOSE["Mongoose<br/>(ODM)"]
    end

    subgraph Database["Database Stack"]
        MONGODB["MongoDB Atlas<br/>(CloudDB)"]
        INDEXING["Indexing<br/>Strategy"]
    end

    subgraph External["External Services"]
        BREVO["Brevo<br/>(Email)"]
        CLOUDINARY["Cloudinary<br/>(Storage)"]
        GOOGLE["Google<br/>(OAuth)"]
    end

    subgraph Security["Security Layer"]
        JWT["JWT<br/>Authentication"]
        BCRYPT["Bcryptjs<br/>Password Hash"]
        HELMET["Helmet<br/>Security Headers"]
        CORS["CORS<br/>Validation"]
        RATE["Rate<br/>Limiting"]
    end

    REACT --> VITE
    VITE --> TAILWIND
    
    NODE --> EXPRESS
    EXPRESS --> MONGOOSE
    MONGOOSE --> MONGODB
    MONGODB --> INDEXING

    EXPRESS --> JWT
    EXPRESS --> BCRYPT
    EXPRESS --> HELMET
    EXPRESS --> CORS
    EXPRESS --> RATE

    EXPRESS -.->|API Calls| BREVO
    EXPRESS -.->|File Upload| CLOUDINARY
    REACT -.->|OAuth| GOOGLE

    style Frontend fill:#e1f5ff
    style Backend fill:#f3e5f5
    style Database fill:#ede7f6
    style External fill:#e0f2f1
    style Security fill:#fff3e0
```

## Authentication State Machine

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated

    Unauthenticated --> Signup: User submits signup
    Signup --> OTPWaiting: OTP sent to email
    OTPWaiting --> EmailVerified: OTP correct
    EmailVerified --> Authenticated: JWT issued
    
    Unauthenticated --> Login: User submits credentials
    Login --> Authenticated: Password matches + JWT issued

    Unauthenticated --> GoogleOAuth: Click "Sign in with Google"
    GoogleOAuth --> Authenticated: Google token verified + JWT issued

    Authenticated --> PasswordReset: User clicks "Forgot Password"
    PasswordReset --> ResetOTPWaiting: Reset OTP sent
    ResetOTPWaiting --> ResetVerified: Reset OTP correct
    ResetVerified --> Authenticated: New password set

    Authenticated --> Logout: User logs out
    Logout --> Unauthenticated: Token cleared

    Authenticated --> TokenExpired: 30 days pass
    TokenExpired --> Unauthenticated: Token invalid

    Authenticated --> Instructor: Switch to instructor role
    Instructor --> InstructorAuth: Instructor dashboard
    
    Authenticated --> Mentor: Switch to mentor role
    Mentor --> MentorAuth: Mentor dashboard

    note right of Authenticated
        JWT Token Valid
        User Data in Context
        localStorage persists token
    end

    note right of Unauthenticated
        No JWT Token
        No User State
        Redirect to login
    end
```

## Request Processing Pipeline

```mermaid
graph TD
    REQ["Incoming HTTP Request"]
    TLS["TLS/SSL<br/>Encrypted"]
    PARSE["Body Parser<br/>Extract JSON"]
    CORS2["CORS Check<br/>Validate Origin"]
    RATE2["Rate Limiter<br/>Check Quota"]
    HELMET2["Helmet<br/>Security Headers"]
    COMP2["Compression<br/>Enable GZIP"]
    AUTH2["Auth Middleware<br/>Verify JWT"]
    VALID2["Validator<br/>Check Input"]
    CTRL["Controller<br/>Business Logic"]
    DB2["Database<br/>Query/Update"]
    RESP["Response<br/>Format JSON"]
    SEND["Send<br/>HTTP Response"]

    REQ --> TLS
    TLS --> PARSE
    PARSE --> CORS2
    CORS2 --> RATE2
    RATE2 --> HELMET2
    HELMET2 --> COMP2
    COMP2 --> AUTH2
    AUTH2 --> VALID2
    VALID2 --> CTRL
    CTRL --> DB2
    DB2 --> RESP
    RESP --> SEND

    CORS2 -->|❌ CORS failure| ERR["400/403 Error"]
    RATE2 -->|❌ Rate limit| ERR
    AUTH2 -->|❌ Invalid token| ERR
    VALID2 -->|❌ Validation fail| ERR
    ERR --> SEND

    style REQ fill:#e1f5ff
    style SEND fill:#c8e6c9
    style ERR fill:#ffcdd2
```
