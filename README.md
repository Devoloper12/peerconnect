# 🎓 PeerConnect - Student Study Group Management System

> **Academic Object-Oriented Programming (OOP) Capstone Project**  
> Designed for **MCA / B.Tech Computer Science & Information Technology** students.

---

## 🌟 Overview

**PeerConnect** is a modern full-stack web application engineered to help students find, create, and join study groups based on academic subjects, placement goals, availability, and learning preferences. 

The application implements a **clean, production-ready full-stack architecture** with an interactive **glassmorphism blue-purple theme**, robust Ant Design UI components, and strict adherence to **Object-Oriented Programming (OOP) principles**.

---

## 💻 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Ant Design (AntD 5), Axios, Day.js, Lucide Icons |
| **Backend** | Node.js, Express.js (RESTful API), JWT Authentication |
| **Database** | MongoDB Atlas (Cloud) / Local MongoDB with Mongoose ODM |
| **Security** | JSON Web Tokens (JWT), BCrypt password hashing, CORS, input sanitization |
| **Design System** | Midnight Blue-Purple Gradient, Glassmorphism (`backdrop-filter`), Responsive CSS |

---

## 🧬 Object-Oriented Programming (OOP) Concepts Demonstrated

This project is tailored for academic project viva and code review examinations, featuring explicit OOP patterns:

### 1. Abstraction
- Implemented in `backend/oop/User.js`.
- An **abstract base class** that cannot be instantiated directly (`new.target === User` throws a `TypeError`).
- Mandates derived classes to fulfill contracts by implementing abstract methods: `getDashboardMetrics()`, `canCreateSession()`, and `getRole()`.

### 2. Inheritance
- `StudentUser extends User` (`backend/oop/StudentUser.js`)
- `AdminUser extends User` (`backend/oop/AdminUser.js`)
- Child classes inherit common credential fields, getters, setters, and authorization rules, while extending academic-specific properties (`subjects[]`, `interests[]`, `availability`, `learningPreference`).

### 3. Encapsulation
- Implemented via **ES6 private class fields** (`#id`, `#name`, `#email`, `#passwordHash`, `#subjects`).
- State mutation is strictly controlled through validated getters and setters (email format regex validation, string length validation).
- Safe JSON serialization method `toSafeJSON()` prevents exposing sensitive password hashes to clients.

### 4. Polymorphism
- Calling `user.getDashboardMetrics()` executes **polymorphic behavior**:
  - On a `StudentUser`: Computes individual study streaks, enrolled group affinities, and peer compatibility scores.
  - On an `AdminUser`: Generates university-wide analytics, department statistics, and moderation queues.
- `canCreateSession(group)` enforces role-specific authorization dynamically.

---

## 📁 Project Directory Structure

```
peerconnect/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Atlas Mongoose connection
│   ├── controllers/
│   │   ├── authController.js     # Register & JWT Login
│   │   ├── profileController.js  # Profile view & update
│   │   ├── groupController.js    # Groups CRUD, search & membership
│   │   ├── sessionController.js  # Study session creation & retrieval
│   │   └── notificationController.js # Alerts & mark-as-read
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer protection & OOP instantiation
│   │   └── errorHandler.js       # Centralized error handler
│   ├── models/
│   │   ├── Student.js            # Mongoose Student schema
│   │   ├── Group.js              # Mongoose Group schema
│   │   ├── Session.js            # Mongoose Session schema
│   │   └── Notification.js       # Mongoose Notification schema
│   ├── oop/
│   │   ├── User.js               # Abstract User base class (Abstraction, Encapsulation)
│   │   ├── StudentUser.js        # Student entity (Inheritance, Polymorphism)
│   │   ├── AdminUser.js          # Admin entity (Inheritance, Polymorphism)
│   │   ├── GroupManager.js       # OOP Domain Service for group capacity & matching
│   │   └── SessionScheduler.js   # OOP Domain Service for session validation
│   ├── routes/
│   │   ├── authRoutes.js         # /register, /login
│   │   ├── profileRoutes.js      # /profile
│   │   ├── groupRoutes.js        # /groups, /groups/join, /my-groups
│   │   ├── sessionRoutes.js      # /session/create, /sessions
│   │   └── notificationRoutes.js # /notifications
│   ├── scripts/
│   │   └── seedData.js           # Database seeder with sample students & groups
│   ├── .env.example              # Environment variables template
│   ├── package.json              # Backend dependencies
│   └── server.js                 # Express application entry point
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js         # Axios HTTP client with JWT interceptor
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication state management
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx            # 1. Landing Page
│   │   │   ├── RegisterPage.jsx           # 2. Register Page
│   │   │   ├── LoginPage.jsx              # 3. Login Page
│   │   │   ├── StudentDashboard.jsx       # 4. Student Dashboard
│   │   │   ├── ProfileManagementPage.jsx  # 5. Profile Management
│   │   │   ├── StudyGroupPage.jsx         # 6. Study Group Discovery
│   │   │   ├── CreateGroupPage.jsx        # 7. Create Group Page
│   │   │   ├── MyGroupsPage.jsx           # 8. My Groups Page
│   │   │   ├── SessionSchedulerPage.jsx   # 9. Session Scheduler
│   │   │   └── NotificationsPage.jsx      # 10. Notifications Page
│   │   ├── App.jsx               # Routes & Ant Design Theme Configuration
│   │   ├── index.css             # Glassmorphism design tokens
│   │   └── index.jsx             # React entry point
│   └── package.json              # Frontend dependencies
├── public/
│   ├── index.html                # Self-contained zero-config running app
│   ├── styles.css                # Glassmorphic Blue-Purple CSS
│   └── app.js                    # Full React 18 + AntD 5 live client
├── serve.ps1                     # 1-Click PowerShell server for instant evaluation
├── README.md                     # Setup guide and API documentation
└── OOP_PROJECT_REPORT.md         # Academic report with UML diagrams
```

---

## 🌐 10 Application Pages Implemented

1. **Landing Page**: Modern hero banner, features overview, academic value proposition, CTAs.
2. **Register Page**: Name, email, password, multi-subject picker, interests, availability, and learning style.
3. **Login Page**: Secure JWT authentication directly against MongoDB Atlas database with form validation and loading states.
4. **Student Dashboard**: Personalized greeting, academic profile summary, active groups, upcoming study sessions countdown, notifications badge, and quick action shortcuts.
5. **Profile Management Page**: Update subjects, interests, availability windows, and learning preferences with live feedback.
6. **Study Group Page**: Interactive group catalog, keyword search, course subject filter, smart match score, and group details modal.
7. **Create Group Page**: Group title, subject selection, syllabus agenda description, and maximum member capacity.
8. **My Groups Page**: Tabbed view of enrolled groups vs created groups with leave group confirmation.
9. **Session Scheduler**: Study session creation with date/time pickers and upcoming sessions timeline.
10. **Notifications Page**: System alerts, group membership notifications, and session reminders with mark-as-read controls.

---

## 🗄️ Database Schemas (Mongoose)

### 1. Student Schema
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  subjects: [String],
  interests: [String],
  availability: String,
  learningPreference: String,
  role: { type: String, enum: ['student', 'admin'], default: 'student' }
}
```

### 2. Group Schema
```javascript
{
  groupName: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  maxMembers: { type: Number, default: 10 }
}
```

### 3. Session Schema
```javascript
{
  topic: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }
}
```

### 4. Notification Schema
```javascript
{
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['JOIN', 'SESSION', 'GROUP_UPDATE', 'WELCOME', 'GENERAL'] },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}
```

---

## 🔌 Backend API Specification

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Register student with subjects, interests, and preferences |
| `POST` | `/login` | Public | Authenticate student/admin and return signed JWT |
| `GET` | `/profile` | Private | Retrieve authenticated student profile & polymorphic metrics |
| `PUT` | `/profile` | Private | Update student subjects, availability, and learning preferences |
| `GET` | `/groups` | Public/Private | Retrieve study groups with optional search and subject filters |
| `POST` | `/groups` | Private | Create a new study group (creator auto-enrolled) |
| `POST` | `/groups/join` | Private | Join an existing study group (validates max capacity) |
| `POST` | `/groups/leave` | Private | Leave an enrolled study group |
| `GET` | `/my-groups` | Private | Retrieve groups created and groups joined by student |
| `POST` | `/session/create` | Private | Schedule a new group study session with timing validation |
| `GET` | `/sessions` | Private | Retrieve upcoming scheduled sessions |
| `GET` | `/notifications` | Private | Retrieve student notifications and reminders |

---

## ☁️ MongoDB Atlas Configuration Guide

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster (e.g. `Cluster0` on AWS/Azure).
3. Under **Database Access**, create a database user:
   - Username: `student_admin`
   - Password: `YourSecurePassword123`
4. Under **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)** for development.
5. In your Cluster Overview, click **Connect** → **Drivers (Node.js)**.
6. Copy the connection string into `backend/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://student_admin:YourSecurePassword123@cluster0.mongodb.net/peerconnect?retryWrites=true&w=majority
   JWT_SECRET=peerconnect_mca_btech_secret_jwt_token_key_2026
   ```

---

## 🚀 Running the Production Full-Stack Application

### 1. Backend Setup & MongoDB Connection
1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Configure your MongoDB Atlas connection in `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/peerconnect?retryWrites=true&w=majority
   JWT_SECRET=peerconnect_mca_btech_secret_jwt_token_key_2026
   ```
3. Start the backend server:
   ```bash
   npm run dev
   ```
   Server will start on **`http://localhost:5000`**.

### 2. Frontend Setup
1. In a separate terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open your browser at the local Vite port (usually **`http://localhost:5173`**).
3. Register your student account via the **Register** page and immediately start creating and joining study groups!

*(Alternatively, you can serve the production static client via PowerShell: `.\serve.ps1` from the root directory).*
