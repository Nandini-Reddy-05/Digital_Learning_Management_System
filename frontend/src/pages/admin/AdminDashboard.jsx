import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Spinner } from '../../components/Spinner';
import { 
  Users, 
  BookOpen, 
  Award, 
  ArrowUpRight, 
  Clock, 
  GraduationCap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (err) {
      setError('Failed to load admin statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner size="large" className="min-h-[60vh]" />;
  if (error) return <div className="p-6 text-red-500 font-bold text-center">{error}</div>;

  // Prepare chart data
  const chartData = stats?.categoryWiseCourses 
    ? Object.keys(stats.categoryWiseCourses).map(key => ({
        name: key,
        count: stats.categoryWiseCourses[key]
      }))
    : [];

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Platform overview and statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Students', value: stats?.studentCount, icon: GraduationCap, color: 'from-violet-500 to-indigo-500 shadow-violet-500/20' },
          { label: 'Total Teachers', value: stats?.teacherCount, icon: Award, color: 'from-blue-500 to-sky-500 shadow-blue-500/20' },
          { label: 'Total Courses', value: stats?.courseCount, icon: BookOpen, color: 'from-emerald-500 to-teal-500 shadow-emerald-500/20' },
          { label: 'Enrollments', value: stats?.enrollmentCount, icon: Users, color: 'from-amber-500 to-orange-500 shadow-amber-500/20' }
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
        {/* Chart Column */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-lg">Course Distribution</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total courses cataloged by categories</p>
          </div>
          <div className="h-64">
            {chartData.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-20">No course data available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      background: 'rgba(15,23,42,0.95)', 
                      border: 'none', 
                      color: 'white',
                      fontSize: '12px' 
                    }} 
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Courses Column */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-lg">Recent Courses</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Recently published learning programs</p>
          </div>

          <div className="space-y-4 flex-1">
            {stats?.recentCourses?.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-10">No recent courses</p>
            ) : (
              stats?.recentCourses?.slice(0, 4).map(course => (
                <div key={course.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                  <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-950/40 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold overflow-hidden shrink-0">
                    {course.imageUrl ? (
                      <img src={course.imageUrl} alt={course.title} className="h-full w-full object-cover" />
                    ) : (
                      <BookOpen className="h-5 w-5" />
                    )}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <h4 className="text-sm font-semibold truncate leading-tight">{course.title}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-1">Instructor: {course.teacherName}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">${course.price}</span>
                    <span className="block text-[8px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-md px-1.5 py-0.5 mt-1 font-bold text-center">
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
