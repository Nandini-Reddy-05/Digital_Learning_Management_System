## 🎓 Digital Learning Management System (DLMS)

📖 Overview

Digital Learning Management System (DLMS) is a full-stack web application designed to provide a centralized platform for online learning. It supports **Admin, Teacher, and Student** roles with secure authentication, course management, assignments, quizzes, and progress tracking.

🚀 Features

- 🔐 Secure Login and Registration
- 👨‍💼 Admin Dashboard
- 👨‍🏫 Teacher Dashboard
- 👨‍🎓 Student Dashboard
- 📚 Course Management
- 🎥 Lesson and Learning Material Management
- 📝 Assignments and Submissions
- 🧠 MCQ Quizzes with Timer
- 📊 Student Progress Tracking
- 🔑 JWT-Based Authentication
- 👥 Role-Based Access Control

 🛠️ Technologies Used

 Frontend
- React.js
- JavaScript
- HTML
- Tailwind CSS
- Axios

 Backend
- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- REST APIs
- JWT

 Database
- MySQL

 Deployment
- GitHub
- Render
- Netlify

 📂 Project Structure

Digital_Learning_Management_System/
│
├── backend/
│   ├── src/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── screenshots/
│   ├── login.png
│   ├── admin-dashboard.png
│   ├── teacher-dashboard.png
│   └── student-dashboard.png
│
└── README.md
📸 Project Screenshots

📝 Registration Page
![Registration Page](screenshots/RegistrationPage.png)

🔐 Login Page
![Login Page](screenshots/LoginPage.png)

👨‍💼 Admin Dashboard
![Admin Dashboard](screenshots/AdminDashboard.png)

👨‍🏫 Teacher Dashboard
![Teacher Dashboard](screenshots/TeacherDashboard.png)

👨‍🎓 Student Dashboard
![Student Dashboard](screenshots/StudentDashboard.png)

📚 Course Management
![Course Management](screenshots/Courses.png)

📊 Progress Tracking
![Progress Tracking](screenshots/ProgressPage.png)

## ⚙️ Application Workflow

1. Users register and log in to the system.
2. JWT authentication verifies the user's identity.
3. Based on the user's role, the system provides access to the appropriate dashboard.
4. Teachers can create courses, lessons, assignments, and quizzes.
5. Students can enroll in courses, access learning materials, submit assignments, and attempt quizzes.
6. Administrators can manage users, courses, and teacher assignments.
7. Student activities and completed lessons are used to track learning progress.

---

## 🔐 Security

The application implements secure authentication and authorization using:

- JWT-based authentication
- BCrypt password hashing
- Role-based access control
- Protected REST API endpoints
- Separate permissions for Admin, Teacher, and Student

---

## 🚀 Deployment

The application is deployed using separate frontend and backend services.

- **Frontend:** Netlify
- **Backend:** Render
- **Database:** MySQL
- **Source Code:** GitHub

The frontend communicates with the Spring Boot backend through REST APIs.

---

## 💻 Local Development

### Prerequisites

- Java 21
- Maven
- Node.js
- npm
- MySQL

### Backend Setup

```bash
cd backend
mvn spring-boot:run
