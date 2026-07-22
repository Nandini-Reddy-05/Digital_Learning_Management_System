import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { 
  Home, 
  Users, 
  BookOpen, 
  Award, 
  BarChart2, 
  FileText, 
  FileQuestion, 
  LineChart, 
  User, 
  Search, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Bell,
  GraduationCap
} from 'lucide-react';

export const DashboardLayout = ({ children }) => {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define sidebar links based on role
  const getSidebarLinks = () => {
    if (!user) return [];
    
    if (user.role === 'ROLE_ADMIN') {
      return [
        { path: '/admin/dashboard', name: 'Dashboard', icon: Home },
        { path: '/admin/students', name: 'Students', icon: Users },
        { path: '/admin/teachers', name: 'Teachers', icon: Award },
        { path: '/admin/courses', name: 'Courses', icon: BookOpen },
        { path: '/admin/reports', name: 'Enrollments & Stats', icon: BarChart2 },
      ];
    } else if (user.role === 'ROLE_TEACHER') {
      return [
        { path: '/teacher/dashboard', name: 'Dashboard', icon: Home },
        { path: '/teacher/courses', name: 'My Courses', icon: BookOpen },
        { path: '/teacher/grading', name: 'Grading & Tasks', icon: FileText },
        { path: '/teacher/profile', name: 'My Profile', icon: User },
      ];
    } else {
      // Student
      return [
        { path: '/student/dashboard', name: 'Dashboard', icon: Home },
        { path: '/student/catalog', name: 'Explore Courses', icon: Search },
        { path: '/student/courses', name: 'My Enrollments', icon: BookOpen },
        { path: '/student/submissions', name: 'My Submissions', icon: FileText },
        { path: '/student/profile', name: 'My Profile', icon: User },
      ];
    }
  };

  const links = getSidebarLinks();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300">
      {/* Sidebar Mobile Toggle Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Section */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
        transform transition-transform duration-300 ease-in-out flex flex-col justify-between
        md:translate-x-0 md:static md:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
            <Link to="/" className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xl">
              <GraduationCap className="h-8 w-8" />
              <span>Digital LMS</span>
            </Link>
            <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all
                    ${isActive 
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400 border-l-4 border-primary-600' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'}
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/60 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold">
              {user?.username?.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-semibold text-sm truncate">{user?.username}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.role?.replace('ROLE_', '')}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
          {/* Left menu toggle (Mobile) */}
          <div className="flex items-center gap-4">
            <button className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="font-bold text-lg hidden md:block">
              Welcome back, <span className="text-primary-600 dark:text-primary-400">{user?.username}</span>
            </h2>
          </div>

          {/* Right items */}
          <div className="flex items-center gap-4">
            {/* Dark Mode toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:ring-2 hover:ring-primary-500/20 transition-all"
            >
              {darkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-slate-600" />}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:ring-2 hover:ring-primary-500/20 transition-all relative"
              >
                <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-3 z-50 overflow-hidden max-h-96 flex flex-col">
                  <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="font-bold text-sm">Notifications</span>
                    <button className="text-xs text-primary-600 hover:underline" onClick={fetchNotifications}>Refresh</button>
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400 p-6 text-center">No notifications yet</p>
                    ) : (
                      notifications.map(noti => (
                        <div 
                          key={noti.id} 
                          onClick={() => !noti.isRead && markNotificationRead(noti.id)}
                          className={`
                            px-4 py-3 border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50
                            ${!noti.isRead ? 'bg-primary-50/20 dark:bg-primary-950/10 font-medium' : ''}
                          `}
                        >
                          <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug">{noti.message}</p>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            {new Date(noti.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Dynamic View */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
