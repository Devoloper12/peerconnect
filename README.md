# 🎓 PeerConnect — Student Study Group Management System

> **B.Tech S3 Object-Oriented Programming (OOP) Capstone Project • Group 1**  
> Computer Science & Engineering 

---

## 👥 Project Credits & Team Contributions

| Contributor | Contribution Role | Focus Areas |
| :--- | :--- | :--- |
| **HIMASANKAR V** | **Project Integration & Full Stack Development** | End-to-end full-stack integration, Express server architecture, Axios client, OOP class hierarchy & JWT security |
| **AAKIFA SHERIN** | **MongoDB Database Design** | Mongoose relational schema modeling, MongoDB Atlas cluster configuration, foreign references, indexing |
| **GOURI S UNNI** | **Group Management System** | Study group CRUD, capacity enforcement (`maxMembers <= 8`), enrollment validation, session scheduling |
| **GAYATHRI DAS R** | **Notification System & Testing** | Real-time notification triggers, unread badge counter, test automation, global error handling |
| **AALIYA NOUSHAD** | **User Interface Design & Documentation** | Ant Design academic theme, responsive layouts, split-view chat UI, UML class diagrams & viva reports |

---

## 💻 Tech Stack & Deployment Architecture

| Layer | Technology | Deployment Platform |
| :--- | :--- | :--- |
| **Frontend** | React 18, Ant Design (AntD 5), Vite, Axios, React Router 6 | **Vercel** (`https://<your-project>.vercel.app`) |
| **Backend** | Node.js, Express.js (RESTful API), JWT, bcryptjs | **Render** (`https://<your-api>.onrender.com`) |
| **Database** | MongoDB Atlas (Cloud Database with Mongoose ODM) | **MongoDB Atlas Cloud** (AWS / Azure Shared Cluster) |

---

## 🌟 Overview & Key Features

**PeerConnect** is a full-stack academic study group management application engineered to solve student study isolation. It connects classmates based on shared courses, upcoming examinations, and study schedules.

- **Authentication & Security**: Student registration and login powered by bcrypt password hashing and signed JSON Web Tokens (JWT).
- **Academic Profiles**: Department, Year, Semester (S1–S8), and course syllabus interests.
- **Smart Peer Matching**: Automated compatibility percentage algorithm matching students by shared course subjects.
- **Study Group Catalog**: Browse, search, filter, and create course study circles with enrollment capacity limits.
- **Session Walkthrough Scheduler**: Schedule study sessions with dates, times, agenda, and Google Meet/Zoom links.
- **Real-Time Notification Center**: Live alerts for new messages, study invitations, and upcoming session countdowns with unread badges.
- **Academic Chat System**: Split-view chat interface supporting direct peer-to-peer messages, study group rooms, inline image previews, and document/PDF file attachments (up to 10MB).
- **Interactive Project Credits**: Dedicated modal in the application footer highlighting team member contributions and academic roles.

---

## 🧬 Object-Oriented Programming (OOP) Architecture

The backend core in `backend/server.js` strictly demonstrates the four fundamental pillars of OOP:

### 1. Abstraction
- Implemented via the abstract base class `User`.
- Direct instantiation is defended against:
  ```javascript
  if (new.target === User) {
    throw new TypeError("Cannot construct Abstract instance directly.");
  }
  ```
- Declares mandatory abstract method contracts (`getDashboardMetrics()`, `canCreateSession()`) that derived classes must fulfill.
- Abstract class `BaseChatHandler` defines contracts for message authorization and preparation.

### 2. Inheritance
- Concrete classes `StudentUser` and `AdminUser` extend the abstract `User` class using the `extends` keyword:
  ```javascript
  class StudentUser extends User {
    constructor(data) {
      super({ id: data.id, name: data.name, email: data.email, ... });
      this.#subjects = data.subjects;
    }
  }
  ```
- Subclasses inherit common credential handling, getters, and setters while extending role-specific properties.
- `PersonalChatHandler` and `GroupChatHandler` extend `BaseChatHandler`.

### 3. Encapsulation
- Sensitive internal state is encapsulated using **ES6 private class fields** (`#id`, `#name`, `#email`, `#passwordHash`).
- State mutation is gated through validated getters and setters:
  ```javascript
  set email(newEmail) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(newEmail)) throw new Error("Invalid email address format.");
    this.#email = newEmail.trim().toLowerCase();
  }
  ```
- The `toSafeJSON()` serialization method guarantees password hashes are never leaked to clients.
- `ChatAttachment` encapsulates attachment properties with strict 10MB size validation.

### 4. Polymorphism
- Dynamic method dispatch: `user.getDashboardMetrics()` executes specialized behavior based on object instance type:
  - **On a `StudentUser`**: Computes enrolled subjects, group affinities, and revision session countdowns.
  - **On an `AdminUser`**: Generates institutional analytics, total student registrations, and server health audits.
- Polymorphic chat execution: `ChatManager.getHandler(chatType, studentId, studentName)` dynamically instantiates the correct handler at runtime.

---

## 📁 Consolidated Project Directory Structure

```
peerconnect/
├── backend/
│   ├── .env                      # Environment config (PORT, MONGO_URI, JWT_SECRET)
│   ├── .env.example              # Template environment variables
│   ├── package.json              # Backend dependencies
│   ├── server.js                 # Express REST API, OOP Classes, Controllers, Routes
│   └── models/                   # Mongoose Schemas (MongoDB Atlas)
│       ├── Student.js            # Student profile, department, semester, interests
│       ├── Group.js              # Study group schema with member references
│       ├── Message.js            # Personal and group messages with attachments
│       ├── Session.js            # Study and revision sessions
│       └── Notification.js       # Real-time event notifications
│
├── frontend/
│   ├── index.html                # Single-page HTML entry point
│   ├── vite.config.js            # Vite build configuration
│   ├── package.json              # Frontend dependencies
│   └── src/
│       ├── main.jsx              # React DOM root render
│       ├── App.jsx               # Root routes, layout & interactive Project Credits modal
│       ├── Auth.jsx              # Landing Hero, Student Login & Registration
│       ├── Dashboard.jsx         # Analytics Dashboard, Profile Management & Notifications
│       ├── Groups.jsx            # Study Groups, Creation, Session Scheduler & Real-Time Chat
│       ├── Partners.jsx          # Study Partner Recommendations & Compatibility Matching
│       ├── index.css             # Academic theme styling & layout definitions
│       ├── api/
│       │   └── client.js         # Axios HTTP client with JWT interceptor
│       ├── constants/
│       │   └── academicData.js   # B.Tech departments & S3 subject list
│       └── context/
│           ├── AuthContext.jsx   # Authentication context (user, token, login, logout)
│           └── NotificationContext.jsx # Live unread notification counter badge
│
└── Academic Documentation:
    ├── README.md                 # Setup guide, architecture & deployment documentation
    ├── OOP_PROJECT_REPORT.md     # Full academic report with UML class diagram
    └── S3_OOP_VIVA_GUIDE.md      # Individual viva questions & pitch guide
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18+ or v20+ installed
- **MongoDB Atlas Account**: Free cloud cluster configured

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   npm install
   ```
2. Configure your `backend/.env` file:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/peerconnect?retryWrites=true&w=majority
   JWT_SECRET=peerconnect_academic_jwt_secret_key_2026
   ```
3. Start the backend server:
   ```bash
   node server.js
   ```
   *Server starts on `http://localhost:5000` with message `MongoDB Connected`.*

### 3. Frontend Setup
1. Open a second terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open your browser at **`http://localhost:5173`**.

---

## ☁️ Deployment Guide

### A. Database Deployment → MongoDB Atlas
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster (e.g., `Cluster0` on AWS).
3. Under **Database Access**, create a database user with Read/Write privileges.
4. Under **Network Access**, add an IP address:
   - Select **Allow Access from Anywhere (`0.0.0.0/0`)** to allow cloud hosts (Render) to connect.
5. In your cluster overview, click **Connect** → **Drivers (Node.js)** and copy the connection URI:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/peerconnect?retryWrites=true&w=majority
   ```

---

### B. Backend Deployment → Render
1. Push your repository to GitHub.
2. Sign up / Log in to [Render](https://render.com).
3. Click **New +** → **Web Service** and connect your GitHub repository.
4. Configure the Web Service settings:
   - **Name**: `peerconnect-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Under **Environment Variables**, add:
   - `PORT`: `5000`
   - `MONGO_URI`: *Your MongoDB Atlas connection URI string*
   - `JWT_SECRET`: *Your secret key string*
   - `NODE_ENV`: `production`
6. Click **Deploy Web Service**.
7. Note down your deployed backend URL (e.g., `https://peerconnect-backend.onrender.com`).

---

### C. Frontend Deployment → Vercel
1. Sign up / Log in to [Vercel](https://vercel.com).
2. Click **Add New...** → **Project** and import your GitHub repository.
3. Configure the Project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, configure the backend API endpoint:
   - `VITE_API_URL`: `https://peerconnect-backend.onrender.com`
5. Click **Deploy**.
6. Vercel will build and deploy your React + Ant Design frontend to a global CDN (e.g., `https://peerconnect.vercel.app`).

---
