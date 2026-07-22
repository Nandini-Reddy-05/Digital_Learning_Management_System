import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Spinner } from '../../components/Spinner';
import { 
  BookOpen, 
  Users, 
  FileText, 
  ArrowUpRight, 
  Clock, 
  GraduationCap,
  ChevronRight
} from 'lucide-react';

export const TeacherDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeacherStats();
  }, []);

  const fetchTeacherStats = async () => {
    try {
      const response = await api.get('/teacher/dashboard');
      setStats(response.data);
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner size="large" className="min-h-[60vh]" />;
  if (error) return <div className="p-6 text-red-500 font-bold text-center">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Teacher Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your courses, assignments and student grading tasks</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: 'My Courses', value: stats?.courseCount, icon: BookOpen, color: 'from-violet-500 to-indigo-500 shadow-violet-500/20' },
          { label: 'Total Students', value: stats?.studentCount, icon: Users, color: 'from-emerald-500 to-teal-500 shadow-emerald-500/20' },
          { label: 'Pending Gradings', value: stats?.assignmentCount, icon: FileText, color: 'from-amber-500 to-orange-500 shadow-amber-500/20' }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm relative overflow-hidden">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{card.label}</p>
                <h3 className="text-3xl font-bold">{card.value}</h3>
              </div>
              <div className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-lg`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Gradings List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">Pending Evaluations</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Student submissions waiting for points grading</p>
            </div>
            <Link to="/teacher/grading" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {stats?.pendingGradings?.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-20">All caught up! No pending evaluations.</p>
            ) : (
              stats?.pendingGradings?.slice(0, 4).map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-850">
                  <div className="overflow-hidden pr-2">
                    <h4 className="font-bold text-sm truncate">{sub.assignmentTitle}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">Submitted by: <span className="font-medium text-slate-700 dark:text-slate-350">{sub.studentName}</span></p>
                    <span className="text-[10px] text-slate-400 block mt-1">Date: {new Date(sub.submissionDate).toLocaleDateString()}</span>
                  </div>
                  <button 
                    onClick={() => navigate('/teacher/grading')}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md shadow-primary-600/20 transition-all shrink-0"
                  >
                    Grade Task
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Courses Catalog */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">My Courses</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Class modules currently taught by you</p>
            </div>
            <Link to="/teacher/courses" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4 flex-1">
            {stats?.courses?.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-10">No courses created yet</p>
            ) : (
              stats?.courses?.slice(0, 4).map(course => (
                <div key={course.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold overflow-hidden shrink-0">
                    {course.imageUrl ? (
                      <img src={course.imageUrl} alt={course.title} className="h-full w-full object-cover" />
                    ) : (
                      <BookOpen className="h-5 w-5" />
                    )}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <h4 className="text-sm font-semibold truncate leading-tight">{course.title}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-1">Enrolled: {course.enrollmentCount} students</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-[9px] bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400 rounded-md px-1.5 py-0.5 mt-1 font-bold text-center block">
                      {course.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
