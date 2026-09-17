# DevCollab

### Real-Time Collaborative Project Workspace for Developers

DevCollab is a full-stack collaboration platform designed for development teams to organize projects, manage tasks through a Kanban workflow, collaborate with teammates, and track project activity in real time.

It combines secure authentication, project-level role-based access control, real-time communication, task management, comments, notifications, and activity tracking in a single workspace.

## Live Application

**Live Demo:** https://dev-collab-one.vercel.app

**Backend API:** https://devcollab-backend-odae.onrender.com

---

## Features

### Authentication & Security

- User registration and login
- Password hashing using bcrypt
- JWT-based authentication
- HTTP-only cookie authentication
- Protected frontend and backend routes

### Project Management

- Create collaborative project workspaces
- View owned and shared projects
- Add registered users as teammates
- Assign project-specific roles
- Manage project members

### Role-Based Access Control

DevCollab implements project-level Role-Based Access Control (RBAC) with four roles:

| Role | Permissions |
|------|-------------|
| **OWNER** | Full project access, task management, member management, and role management |
| **ADMIN** | Manage tasks and project members |
| **MEMBER** | Collaborate on tasks, comments, and task progress |
| **VIEWER** | Read-only project access |

### Kanban Task Management

- Create tasks
- Edit tasks
- Delete tasks
- Assign tasks to teammates
- Set task priorities
- Move tasks through:
  - To Do
  - In Progress
  - Done

### Team Collaboration

- Add teammates using their registered email
- Assign project-specific roles
- Update member roles
- Remove project members
- View project team information

### Comments

- Add comments to tasks
- View task discussions
- Delete comments based on permissions
- Receive real-time comment updates

### Real-Time Collaboration

Socket.IO is used to synchronize project activity between connected users.

Real-time events include:

- Task creation
- Task updates
- Task deletion
- Comments
- Member additions
- Role changes
- Member removal
- Notifications
- Activity updates

### Notifications

- Task assignment notifications
- Comment notifications
- Role-change notifications
- Unread notification counter
- Mark individual notifications as read
- Mark all notifications as read

### Activity Tracking

Important project actions are recorded in the activity feed, including:

- Task creation
- Task updates
- Task status changes
- Task deletion
- Comments
- Member additions and removals
- Role changes

### User Experience

- Responsive developer-focused interface
- Light and dark themes
- Persistent workspace theme preference
- Kanban-style task board
- Project statistics
- Team management panel
- Notification panel
- Activity feed
- Page-specific browser titles
- Custom DevCollab branding

---

## Tech Stack

### Frontend

- React.js
- Vite
- JavaScript
- HTML
- CSS
- Axios
- React Router

### Backend

- Node.js
- Express.js
- REST APIs
- Socket.IO

### Database

- MongoDB
- MongoDB Atlas
- Mongoose

### Authentication & Authorization

- JSON Web Token (JWT)
- bcrypt
- HTTP-only cookies
- Role-Based Access Control (RBAC)

### Development & Deployment

- Git
- GitHub
- Postman
- Vercel
- Render

---

## Architecture

```text
                   ┌─────────────────────┐
                   │   React + Vite      │
                   │      Frontend       │
                   └─────────┬───────────┘
                             │
                      REST API / Axios
                             │
                   ┌─────────▼───────────┐
                   │ Node.js + Express   │
                   │      Backend        │
                   ├─────────────────────┤
                   │ JWT Authentication  │
                   │ RBAC Authorization  │
                   │ REST Controllers    │
                   │ Socket.IO           │
                   └─────────┬───────────┘
                             │
                   ┌─────────▼───────────┐
                   │    MongoDB Atlas    │
                   └─────────────────────┘
```

Socket.IO provides a real-time communication layer between authenticated clients and the backend.

---

## Real-Time Security

Socket.IO connections are authenticated using the JWT stored in the HTTP-only cookie.

After authentication, the backend associates the verified user with the socket connection.

Before allowing a socket to join a project-specific room, the backend verifies that the authenticated user is a member of that project.

This prevents unauthorized users from subscribing to project-specific real-time events.

---

## Project Structure

```text
DevCollab/
│
├── Backend/
│   └── src/
│       ├── config/
│       │   └── db.js
│       │
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── projectController.js
│       │   ├── projectMemberController.js
│       │   ├── taskController.js
│       │   ├── commentController.js
│       │   ├── notificationController.js
│       │   └── activityLogController.js
│       │
│       ├── middleware/
│       │   └── authMiddleware.js
│       │
│       ├── models/
│       │   ├── user.js
│       │   ├── project.js
│       │   ├── projectMember.js
│       │   ├── task.js
│       │   ├── comment.js
│       │   ├── notification.js
│       │   └── activityLog.js
│       │
│       ├── routes/
│       ├── app.js
│       └── server.js
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── App.jsx
│       └── main.jsx
│
└── README.md
```

---

## Core Database Models

DevCollab uses the following MongoDB models:

- **User** — stores registered user information
- **Project** — stores project workspace information
- **ProjectMember** — connects users with projects and stores project-specific roles
- **Task** — stores project tasks, priorities, assignments, and statuses
- **Comment** — stores task discussions
- **Notification** — stores user notifications
- **ActivityLog** — records important project activity

---

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Git
- MongoDB Atlas account

### 1. Clone the Repository

```bash
git clone https://github.com/himanshiagrawal22/DevCollab.git
cd DevCollab
```

### 2. Backend Setup

Navigate to the backend:

```bash
cd Backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `Backend` directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Start the development server:

```bash
npm run dev
```

The backend runs locally on:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The frontend normally runs on:

```text
http://localhost:5173
```

---

## API Overview

The backend follows a REST-based architecture.

Major API groups include:

```text
/api/auth
/api/projects
/api/projects/:projectId/members
/api/projects/:projectId/tasks
/api/projects/:projectId/tasks/:taskId/comments
/api/projects/:projectId/activities
/api/notifications
```

---

## Key Technical Highlights

- Implemented JWT authentication using HTTP-only cookies
- Built project-level RBAC using a separate ProjectMember model
- Developed REST APIs for projects, tasks, members, comments, notifications, and activities
- Implemented authenticated Socket.IO connections
- Added project-room authorization before users can receive real-time events
- Built real-time synchronization for tasks, comments, members, notifications, and activity logs
- Created a Kanban workflow for task status management
- Deployed the frontend and backend separately using Vercel and Render
- Connected the deployed application to MongoDB Atlas

---

## Future Improvements

- Advanced project analytics
- Task search and filtering
- Notification preferences
- File attachments
- Due dates and task deadlines
- Additional project customization

---

## Author

**Himanshi Agrawal**

**GitHub:** https://github.com/himanshiagrawal22

**LinkedIn:** https://www.linkedin.com/in/himanshiagrawal22

---

If you find this project useful, consider giving the repository a star.