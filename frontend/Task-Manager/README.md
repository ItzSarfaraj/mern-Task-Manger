# MERN Task Manager

A full-stack MERN Task Manager application with authentication and role-based access control.  
The platform allows admins and users to manage tasks efficiently with dashboard analytics, task tracking, file attachments, and report generation.

---

## Features

## Features

- User Authentication
- Admin & User Role-Based Access
- Create, Update, Delete Tasks
- Task Status Tracking
- Dashboard Overview
- Responsive UI
- Excel Report Download
- Attachment Support
- Protected Routes
- Task Progress Monitoring

---

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Axios
- React Router DOM

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

---

## Screenshots

### Admin Dashboard
![AdminDashboard](../Task-Manager/src/assets/images/AdminDashboard.png)

### User Dashboard
![User Dashboard](../Task-Manager/src/assets/images/UserDashboard.png)

### Manage Tasks
![Mange Tasks](../Task-Manager/src/assets/images/ManageTasks.png)

---

## Installation

### Clone Repository

```bash
git clone https://github.com/itzSarfaraj/mern-Task-Manager.git
```

---

### Install Frontend Dependencies

```bash
cd frontend
cd Task-Manger
npm install
```

---

### Install Backend Dependencies

```bash
cd backend
npm install
```

---

## Environment Variables

Create `.env` file inside server folder:

```env
MONGO_URI=mongodb+srv://sarfarajsiddiqui:srs78692@cluster0.zczwtbx.mongodb.net/taskmanager?appName=Cluster0
JWT_SECRET=d214ec75032328a4304d27b69198908f0ed29b8dbe0d49bc89d21d398ea42071557324c0db327e88c34e8badc93291ea6d996b0253858e526639f4cfe2cece28
PORT=8000
```

---

## Run Frontend

```bash
npm run dev
```

---

## Run Backend

```bash
npm run dev
```

---

## Future Improvements

- Drag and Drop Tasks
- Team Collaboration
- Notifications
- Dark Mode

---

## Author

Sarfaraj Siddiqui