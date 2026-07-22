import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Spinner } from '../../components/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { 
  Search, 
  BookOpen, 
  Check, 
  ChevronRight,
  ArrowRight,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

export const StudentCatalog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Course Details Modal State
  const [detailCourse, setDetailCourse] = useState(null);
  const [syllabus, setSyllabus] = useState([]);
  const [loadingSyllabus, setLoadingSyllabus] = useState(false);

  useEffect(() => {
    fetchCatalogData();
  }, []);

  const fetchCatalogData = async () => {
    try {
      const response = await api.get('/courses?size=100'); // Load all published courses
      setCourses(response.data.content);

      // Extract unique categories
      const cats = [...new Set(response.data.content.map(c => c.category))];
      setCategories(cats);

      // Load student's already enrolled courses to mark them
      const enrollRes = await api.get('/student/courses');
      setEnrolledIds(enrollRes.data.map(e => e.courseId));
    } catch (err) {
      setError('Failed to load course catalog data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (course) => {
    setDetailCourse(course);
    setLoadingSyllabus(true);
    try {
      const lessonsRes = await api.get(`/courses/${course.id}/lessons`);
      setSyllabus(lessonsRes.data);
    } catch (err) {
      setSyllabus([]);
    } finally {
      setLoadingSyllabus(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      setError('');
      setSuccess('');
      await api.post(`/student/courses/${courseId}/enroll`);
      setEnrolledIds(prev => [...prev, courseId]);
      setSuccess('Enrolled successfully! Redirecting to classroom...');
      setDetailCourse(null);
      setTimeout(() => {
        setSuccess('');
        navigate(`/student/courses?courseId=${courseId}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll in this course');
    }
  };

  // Filters
  const filteredCourses = courses.filter(c => {
    const titleMatch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (c.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = selectedCategory ? c.category === selectedCategory : true;
    return (titleMatch || descMatch) && categoryMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Explore Courses</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Browse online courses and enhance your skills</p>
      </div>

      {/* Alerts */}
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

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm flex-1 items-center gap-3">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by keywords..." 
            className="bg-transparent border-none outline-none w-full text-sm font-medium"
          />
        </div>

        {/* Categories Scroll tags */}
        <div className="flex gap-2 overflow-x-auto py-1 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('')}
            className={`
              px-4 py-2.5 rounded-xl text-xs font-bold transition-all border
              ${selectedCategory === '' 
                ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-600/10' 
                : 'bg-white text-slate-600 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}
            `}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                px-4 py-2.5 rounded-xl text-xs font-bold transition-all border shrink-0
                ${selectedCategory === cat 
                  ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-600/10' 
                  : 'bg-white text-slate-600 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <Spinner size="large" className="py-20" />
      ) : filteredCourses.length === 0 ? (
        <div className="p-12 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">No courses match your criteria.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => {
            const isEnrolled = enrolledIds.includes(course.id);
            return (
              <div key={course.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div className="h-44 bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
                  {course.imageUrl ? (
                    <img src={course.imageUrl} alt={course.title} className="h-full w-full object-cover" />
                  ) : (
                    <BookOpen className="h-12 w-12 text-slate-400" />
                  )}
                  {isEnrolled && (
                    <span className="absolute top-4 right-4 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-900/30 flex items-center gap-1 shadow-sm">
                      <Check className="h-3.5 w-3.5" />
                      <span>Enrolled</span>
                    </span>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] text-primary-600 dark:text-primary-400 uppercase font-bold tracking-wider">{course.category}</span>
                    <h3 className="font-bold text-lg mt-1 line-clamp-1">{course.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 line-clamp-2">{course.description}</p>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3">
                    <span className="text-sm font-extrabold text-slate-950 dark:text-slate-50">${course.price}</span>
                    <span className="text-xs text-slate-400 font-semibold">{course.lessonCount} lectures</span>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewDetails(course)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold py-2.5 rounded-xl text-xs transition-all"
                    >
                      View Syllabus
                    </button>
                    {isEnrolled ? (
                      <button 
                        onClick={() => navigate(`/student/courses?courseId=${course.id}`)}
                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-primary-600/10 transition-all"
                      >
                        <span>Classroom</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleEnroll(course.id)}
                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-primary-600/10 transition-all"
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Course Details Syllabus Modal */}
      {detailCourse && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="overflow-hidden pr-2">
                <span className="text-[10px] text-primary-600 uppercase font-bold tracking-wider">{detailCourse.category}</span>
                <h3 className="text-lg font-bold truncate mt-0.5">{detailCourse.title}</h3>
              </div>
              <button onClick={() => setDetailCourse(null)} className="p-1 rounded-lg hover:bg-slate-100 shrink-0">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase">Description</h4>
                <p className="text-sm mt-1 text-slate-650 dark:text-slate-300 leading-relaxed">{detailCourse.description}</p>
              </div>

              <div className="flex gap-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border text-xs font-semibold">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  <span>Price: ${detailCourse.price}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4 text-slate-400" />
                  <span>Syllabus: {detailCourse.lessonCount} lectures</span>
                </div>
              </div>

              {/* Syllabus Lessons list */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Lessons list</h4>
                {loadingSyllabus ? (
                  <Spinner size="small" />
                ) : syllabus.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No syllabus details registered.</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {syllabus.map(l => (
                      <div key={l.id} className="p-3 bg-slate-50/50 dark:bg-slate-805 border rounded-xl flex items-center justify-between text-xs">
                        <div className="overflow-hidden pr-2 flex items-center gap-2.5">
                          <span className="h-5 w-5 bg-primary-100 text-primary-600 rounded-md flex items-center justify-center font-bold shrink-0">{l.sequenceOrder}</span>
                          <span className="font-semibold truncate">{l.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 font-bold uppercase">{l.duration} mins</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setDetailCourse(null)} 
                className="px-4 py-2 border rounded-xl text-sm font-bold"
              >
                Close
              </button>
              {enrolledIds.includes(detailCourse.id) ? (
                <button 
                  onClick={() => { setDetailCourse(null); navigate(`/student/courses?courseId=${detailCourse.id}`); }}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-600/10 flex items-center gap-1"
                >
                  <span>Go to Classroom</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </button>
              ) : (
                <button 
                  onClick={() => handleEnroll(detailCourse.id)}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-600/20"
                >
                  Enroll & Start Learning
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
