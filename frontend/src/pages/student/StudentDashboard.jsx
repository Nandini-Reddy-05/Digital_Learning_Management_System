import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Spinner } from '../../components/Spinner';
import { 
  BookOpen, 
  CheckCircle2, 
  TrendingUp, 
  Award,
  ChevronRight,
  Clock
} from 'lucide-react';

export const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudentStats();
  }, []);

  const fetchStudentStats = async () => {
    try {
      const response = await api.get('/student/dashboard');
      setStats(response.data);
    } catch (err) {
      setError('Failed to fetch student statistics.');
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
        <h1 className="text-3xl font-extrabold tracking-tight">Student Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Track your learning progress, check assignments and take quizzes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: 'Enrolled Courses', value: stats?.enrolledCoursesCount, icon: BookOpen, color: 'from-violet-500 to-indigo-500 shadow-violet-500/20' },
          { label: 'Completed Courses', value: stats?.completedCoursesCount, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500 shadow-emerald-500/20' },
          { label: 'Average Progress', value: `${stats?.averageProgressPercentage}%`, icon: TrendingUp, color: 'from-amber-500 to-orange-500 shadow-amber-500/20' }
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
        {/* Enrolled Courses Progress */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">My Active Enrollments</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Class modules currently in progress</p>
            </div>
            <Link to="/student/courses" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4 flex-1">
            {stats?.recentEnrollments?.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">You are not enrolled in any courses yet</p>
                <Link to="/student/catalog" className="inline-block bg-primary-600 text-white font-bold text-xs px-4 py-2 rounded-xl">Browse Catalog</Link>
              </div>
            ) : (
              stats?.recentEnrollments?.slice(0, 3).map(enroll => (
                <div key={enroll.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="overflow-hidden pr-2 flex-1">
                    <span className="text-[9px] bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400 px-1.5 py-0.5 rounded font-bold uppercase">{enroll.courseCategory}</span>
                    <h4 className="font-bold text-sm truncate mt-1">{enroll.courseTitle}</h4>
                    
                    {/* Progress slider */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex-1 bg-slate-200 dark:bg-slate-750 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary-500 h-full rounded-full" style={{ width: `${enroll.progressPercentage}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">{enroll.progressPercentage}%</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/student/courses?courseId=${enroll.courseId}`)}
                    className="bg-white hover:bg-slate-100 text-slate-850 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-bold text-xs px-4 py-2 border rounded-xl transition-all self-end sm:self-center"
                  >
                    Resume Study
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Quiz Attempts */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-lg">Quiz Scores</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Recently evaluated MCQ test attempts</p>
          </div>

          <div className="space-y-4 flex-1">
            {stats?.recentQuizzes?.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-10">No quizzes taken yet</p>
            ) : (
              stats?.recentQuizzes?.slice(0, 3).map(attempt => (
                <div key={attempt.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-805 transition-all">
                  <div className="overflow-hidden flex-1 pr-2">
                    <h4 className="text-xs font-bold truncate leading-tight">{attempt.quizTitle}</h4>
                    <span className="text-[9px] text-slate-400 block mt-1">{new Date(attempt.attemptDate).toLocaleDateString()}</span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-sm font-extrabold">{attempt.score}%</span>
                    <span className={`
                      block text-[8px] rounded-md px-1.5 py-0.5 mt-1 font-bold text-center
                      ${attempt.passed 
                        ? 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400' 
                        : 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'}
                    `}>
                      {attempt.passed ? 'PASSED' : 'FAILED'}
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
