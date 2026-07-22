# Digital Learning Management System (LMS)

A complete placement-ready, full-stack Digital Learning Management System (LMS) built using **Spring Boot (Java 21) on the backend** and **React JS styled with Tailwind CSS on the frontend**, utilizing **MySQL** for relational database storage and **Spring Security with JWT** for authentication and role-based permissions (Admin, Teacher, Student).

---

## 🚀 Key Features

*   **Secure Auth**: Role-based access control (RBAC) with JWT Bearer tokens and BCrypt hashed credentials.
*   **Admin Dashboard**: Interactive cards showing students/teachers totals, course category distribution charts (Recharts), activation toggling, and reassigning course instructors.
*   **Teacher Panel**: Syllabus development tools to publish courses, upload lecture videos/notes PDFs, post due homework tasks, formulate MCQ quizzes, and evaluate student submissions.
*   **Student Workspace**: Course catalog browsing, classroom lecture players (HTML5 video), notes downloader, homework submissions, and timed MCQ quiz tests (with timer countdown clocks and automatic submission).
*   **Interactive Seeding**: Automatic database seeder that configures default roles and default credential accounts with sample courses/lessons out-of-the-box.
*   **Static Resource Routing**: Mapped Spring MVC handlers supporting upload files serving from server disk.

---

## 🛠️ Tech Stack & Dependencies

### Backend
*   **Language**: Java 21
*   **Framework**: Spring Boot 3.3.1 (Web, Security, Data JPA, Validation, Mail)
*   **JSON Security**: JWT (io.jsonwebtoken)
*   **Database**: MySQL 8.x
*   **API Docs**: Springdoc OpenAPI (Swagger UI)
*   **Boilerplate reduction**: Lombok

### Frontend
*   **Bundler**: Vite + React 18.3
*   **Routing**: React Router DOM v6
*   **Client Requests**: Axios
*   **Styling**: Tailwind CSS v3
*   **Icons**: Lucide React
*   **Charts**: Recharts

---

## 🧑‍💻 Default Test Credentials

Upon starting the Spring Boot backend, the `DatabaseSeeder` automatically populates the database with these default profiles:

| Role | Username | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin@lms.com` | `admin123` | Control panel access |
| **Teacher** | `teacher` | `teacher@lms.com` | `teacher123` | MCA holder, full-stack spec. |
| **Student** | `student` | `student@lms.com` | `student123` | Enrolled in sample course |

---

## 📂 Project Directory Structure

```
dlms project/
├── backend/
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/com/lms/digital/
│           │   ├── config/          # SecurityConfig, WebConfig, DatabaseSeeder
│           │   ├── controller/      # Auth, Admin, Teacher, Student REST APIs
│           │   ├── dto/             # Shared nested Request/Response shapes
│           │   ├── entity/          # JPA Hibernate entities
│           │   ├── exception/       # Custom Exception classes, Global Handler
│           │   ├── mapper/          # LmsMapper copy utilities
│           │   ├── repository/      # JPA interfaces
│           │   └── security/        # JWT utilities and filters
│           └── resources/
│               ├── application.properties
│               ├── schema.sql       # SQL creation scripts
│               └── data.sql         # SQL role seeding scripts
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── components/      # Shared components (Spinner)
│       ├── context/         # AuthContext session provider
│       ├── hooks/           # useAuth context hook
│       ├── layouts/         # Collapsible Sidebar/Navbar DashboardLayout
│       ├── pages/           # Login, Register, ForgotPassword, Admin/Teacher/Student panels
│       ├── routes/          # ProtectedRoute component
│       ├── services/        # api.js Axios configuration
│       ├── App.jsx          # Route paths mapping
│       └── main.jsx         # DOM binding
└── README.md
```

---

## 💻 Local Setup Instructions

### Prerequisites
*   Java Development Kit (JDK) 21
*   Maven 3.x
*   Node.js (v18+) & npm
*   MySQL Server running locally

### 1. Database Configuration
1.  Open your MySQL CLI/client (e.g. Workbench or terminal) and create a database named `dlms_db`:
    ```sql
    CREATE DATABASE dlms_db;
    ```
2.  Open `backend/src/main/resources/application.properties` and verify/update your MySQL credentials:
    ```properties
    spring.datasource.username=root
    spring.datasource.password=root
    ```

### 2. Run Backend (Spring Boot)
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Build and run the application:
    ```bash
    mvn spring-boot:run
    ```
3.  The backend server will start on **`http://localhost:8080`**.
4.  View Swagger API Documentation in your browser:
    *   **OpenAPI Documentation**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

### 3. Run Frontend (React.js)
1.  Open a new terminal window and navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open the application in your browser:
    *   **Vite Local Dev Link**: [http://localhost:5173](http://localhost:5173)

---

## 🛡️ API Endpoints Summary

*   **Public Authentication**:
    *   `POST /api/auth/login` - Authenticate credentials and return JWT
    *   `POST /api/auth/register` - Create student or teacher account
    *   `POST /api/auth/forgot-password` - Process account recovery email
    *   `POST /api/auth/change-password` - Update password (Authenticated)
*   **Public Courses Browsing**:
    *   `GET /api/courses` - Paginated & filtered catalog list
    *   `GET /api/courses/{id}` - Retrieve course structure
*   **Student Portals (`/api/student/**`)**:
    *   `GET /api/student/dashboard` - Stats count and lists
    *   `POST /api/student/courses/{courseId}/enroll` - Enroll in course
    *   `POST /api/student/lessons/{lessonId}/complete` - Log lesson completion
    *   `POST /api/student/assignments/{assignmentId}/submit` - Upload task file
    *   `POST /api/student/quizzes/{quizId}/submit` - Submit timed MCQ responses
*   **Teacher Portals (`/api/teacher/**`)**:
    *   `POST /api/teacher/courses` - Create new learning program
    *   `POST /api/teacher/courses/{courseId}/lessons` - Upload lecture video/notes
    *   `POST /api/teacher/submissions/{submissionId}/grade` - Evaluate homework scores
    *   `POST /api/teacher/courses/{courseId}/quizzes` - Compose MCQ tests
*   **Admin Portals (`/api/admin/**`)**:
    *   `POST /api/admin/users/{userId}/toggle` - Activate/deactivate logins
    *   `POST /api/admin/courses/{courseId}/assign-teacher/{teacherId}` - Reassign instructor
    *   `GET /api/admin/enrollments` - Inspect all registrations logs
