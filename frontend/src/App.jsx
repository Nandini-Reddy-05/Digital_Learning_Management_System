import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminTeachers } from './pages/admin/AdminTeachers';
import { AdminCourses } from './pages/admin/AdminCourses';
import { AdminReports } from './pages/admin/AdminReports';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherCourses } from './pages/teacher/TeacherCourses';
import { TeacherGrading } from './pages/teacher/TeacherGrading';
import { TeacherProfile } from './pages/teacher/TeacherProfile';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentCatalog } from './pages/student/StudentCatalog';
import { StudentCourses } from './pages/student/StudentCourses';
import { StudentSubmissions } from './pages/student/StudentSubmissions';
import { StudentProfile } from './pages/student/StudentProfile';
import { StudentCertificate } from './pages/student/StudentCertificate';

// Helper Root Redirect component
const RootRedirect = () => {
  const { user } = React.useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'ROLE_ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user.role === 'ROLE_TEACHER') {
    return <Navigate to="/teacher/dashboard" replace />;
  } else {
    return <Navigate to="/student/dashboard" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Admin Protected Dashboard Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <DashboardLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="students" element={<AdminStudents />} />
                  <Route path="teachers" element={<AdminTeachers />} />
                  <Route path="courses" element={<AdminCourses />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Teacher Protected Dashboard Routes */}
          <Route path="/teacher/*" element={
            <ProtectedRoute allowedRoles={['ROLE_TEACHER']}>
              <DashboardLayout>
                <Routes>
                  <Route path="dashboard" element={<TeacherDashboard />} />
                  <Route path="courses" element={<TeacherCourses />} />
                  <Route path="grading" element={<TeacherGrading />} />
                  <Route path="profile" element={<TeacherProfile />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Student Protected Dashboard Routes */}
          <Route path="/student/*" element={
            <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
              <DashboardLayout>
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="catalog" element={<StudentCatalog />} />
                  <Route path="courses" element={<StudentCourses />} />
                  <Route path="submissions" element={<StudentSubmissions />} />
                  <Route path="profile" element={<StudentProfile />} />
                  <Route path="certificate/:courseId" element={<StudentCertificate />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Default fallback route */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
