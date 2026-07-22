import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Spinner } from '../../components/Spinner';
import { 
  BarChart2, 
  Search, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  User 
} from 'lucide-react';

export const AdminReports = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await api.get('/admin/enrollments');
      setEnrollments(response.data);
    } catch (err) {
      setError('Failed to fetch enrollment records.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter(e => {
    const student = e.studentName.toLowerCase();
    const course = e.courseTitle.toLowerCase();
    const category = (e.courseCategory || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return student.includes(query) || course.includes(query) || category.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Enrollments & Activity Logs</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Cross-course student enrollment and learning progress log tracker</p>
      </div>

      {/* Filter and Search */}
      <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm max-w-md items-center gap-3">
        <Search className="h-5 w-5 text-slate-400 shrink-0" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by student name or course title..." 
          className="bg-transparent border-none outline-none w-full text-sm font-medium"
        />
      </div>

      {/* Table view */}
      {loading ? (
        <Spinner size="large" className="py-20" />
      ) : error ? (
        <div className="p-6 text-red-500 font-bold text-center">{error}</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/55 dark:bg-slate-900/55">
                  <th className="p-4 font-bold text-slate-500">Student Name</th>
                  <th className="p-4 font-bold text-slate-500">Course Enrolled</th>
                  <th className="p-4 font-bold text-slate-500">Category</th>
                  <th className="p-4 font-bold text-slate-500">Date Enrolled</th>
                  <th className="p-4 font-bold text-slate-500">Progress Tracker</th>
                  <th className="p-4 font-bold text-slate-500 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500 dark:text-slate-400">No enrollment records available</td>
                  </tr>
                ) : (
                  filteredEnrollments.map(record => (
                    <tr key={record.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                      <td className="p-4">
                        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                          <User className="h-4 w-4 text-slate-400" />
                          <span>{record.studentName}</span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold max-w-xs truncate">{record.courseTitle}</td>
                      <td className="p-4 font-medium text-slate-500 dark:text-slate-400">{record.courseCategory || 'General'}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                        {record.enrollmentDate ? new Date(record.enrollmentDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 w-48">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>{record.progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-primary-500 h-full rounded-full transition-all" 
                              style={{ width: `${record.progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`
                          px-3 py-1 rounded-full text-xs font-bold border
                          ${record.status === 'COMPLETED' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400' 
                            : 'bg-primary-50 text-primary-600 border-primary-200 dark:bg-primary-950/20 dark:text-primary-400'}
                        `}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
