import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Spinner } from '../../components/Spinner';
import { 
  Search, 
  Trash2, 
  User, 
  CheckCircle,
  AlertCircle,
  BookOpen,
  Award
} from 'lucide-react';

export const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Course Assign State
  const [assigningCourse, setAssigningCourse] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  useEffect(() => {
    fetchCoursesAndTeachers();
  }, []);

  const fetchCoursesAndTeachers = async () => {
    try {
      const coursesRes = await api.get('/admin/courses');
      const teachersRes = await api.get('/admin/teachers');
      setCourses(coursesRes.data);
      setTeachers(teachersRes.data);
    } catch (err) {
      setError('Failed to load courses or teachers lists.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? All associated lessons, quizzes, and enrollments will be deleted permanently.')) {
      return;
    }
    try {
      await api.delete(`/admin/courses/${courseId}`);
      setCourses(prev => prev.filter(c => c.id !== courseId));
      setSuccess('Course deleted successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to delete course');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAssignClick = (course) => {
    setAssigningCourse(course);
    setSelectedTeacherId(course.teacherId || '');
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeacherId) return;

    try {
      await api.post(`/admin/courses/${assigningCourse.id}/assign-teacher/${selectedTeacherId}`);
      
      const teacher = teachers.find(t => String(t.id) === String(selectedTeacherId));
      const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Assigned Teacher';

      setCourses(prev => prev.map(c => 
        c.id === assigningCourse.id 
          ? { ...c, teacherId: Number(selectedTeacherId), teacherName: teacherName } 
          : c
      ));

      setAssigningCourse(null);
      setSuccess('Teacher assigned successfully to course');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to assign teacher to course');
    }
  };

  const filteredCourses = courses.filter(c => {
    const title = c.title.toLowerCase();
    const category = c.category.toLowerCase();
    const teacher = c.teacherName.toLowerCase();
    const query = searchQuery.toLowerCase();
    return title.includes(query) || category.includes(query) || teacher.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Manage Courses</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Cataloged learning courses: {courses.length}</p>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center gap-2 text-sm font-medium">
          <CheckCircle className="h-5 w-5" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm max-w-md items-center gap-3">
        <Search className="h-5 w-5 text-slate-400 shrink-0" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, category, or instructor..." 
          className="bg-transparent border-none outline-none w-full text-sm font-medium"
        />
      </div>

      {/* Table view */}
      {loading ? (
        <Spinner size="large" className="py-20" />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/55 dark:bg-slate-900/55">
                  <th className="p-4 font-bold text-slate-500">Course Detail</th>
                  <th className="p-4 font-bold text-slate-500">Category</th>
                  <th className="p-4 font-bold text-slate-500">Instructor</th>
                  <th className="p-4 font-bold text-slate-500 text-center">Lessons</th>
                  <th className="p-4 font-bold text-slate-500 text-center">Enrolled</th>
                  <th className="p-4 font-bold text-slate-500 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500 dark:text-slate-400">No courses cataloged</td>
                  </tr>
                ) : (
                  filteredCourses.map(course => (
                    <tr key={course.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                      <td className="p-4 max-w-xs md:max-w-sm">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 font-bold flex items-center justify-center overflow-hidden shrink-0">
                            {course.imageUrl ? (
                              <img src={course.imageUrl} alt={course.title} className="h-full w-full object-cover" />
                            ) : (
                              <BookOpen className="h-5 w-5" />
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-bold truncate leading-snug">{course.title}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">${course.price}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-600 dark:text-slate-300">{course.category}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{course.teacherName}</span>
                          <button
                            onClick={() => handleAssignClick(course)}
                            className="text-[10px] bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400 px-1.5 py-0.5 rounded border border-primary-200 dark:border-primary-900/30 hover:bg-primary-100 transition-all font-bold"
                          >
                            Reassign
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-600 dark:text-slate-300">{course.lessonCount}</td>
                      <td className="p-4 text-center font-bold text-slate-600 dark:text-slate-300">{course.enrollmentCount}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center">
                          <button 
                            onClick={() => handleDelete(course.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-all"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Teacher Dialog Modal */}
      {assigningCourse && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold">Assign Instructor</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Assign an instructor for: <span className="font-semibold text-slate-800 dark:text-slate-200">{assigningCourse.title}</span></p>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-2 text-slate-500">Choose Teacher</label>
                <select
                  required
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-3 outline-none text-sm font-semibold"
                >
                  <option value="">-- Choose Instructor --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} ({t.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setAssigningCourse(null)} 
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-600/20 transition-all"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
