import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Spinner } from '../../components/Spinner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Video, 
  FileText, 
  FileQuestion, 
  ChevronLeft,
  X,
  Upload,
  BookOpen,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const TeacherCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // View state: 'LIST' or 'MANAGE'
  const [view, setView] = useState('LIST');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons', 'assignments', 'quizzes'

  // Edit/Create Course State
  const [courseModal, setCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    status: 'DRAFT',
    imageUrl: ''
  });

  // Sub-modules Lists States
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  // Sub-modules Create Modals States
  const [lessonModal, setLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    pdfUrl: '',
    duration: 15,
    sequenceOrder: 1
  });

  const [assignmentModal, setAssignmentModal] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxPoints: 100,
    fileUrl: ''
  });

  const [quizModal, setQuizModal] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    timeLimit: 15,
    passingScore: 60,
    questions: []
  });

  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
    points: 10
  });

  // File Upload state
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/teacher/courses');
      setCourses(response.data);
    } catch (err) {
      setError('Failed to fetch courses list.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e, formType, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const data = new FormData();
      data.append('file', file);
      const res = await api.post('/files/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const filePath = res.data.filePath;

      // Update appropriate form
      if (formType === 'course') {
        setCourseForm(prev => ({ ...prev, [fieldName]: filePath }));
      } else if (formType === 'lesson') {
        setLessonForm(prev => ({ ...prev, [fieldName]: filePath }));
      } else if (formType === 'assignment') {
        setAssignmentForm(prev => ({ ...prev, [fieldName]: filePath }));
      }
      setSuccess('File uploaded successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to upload file');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploading(false);
    }
  };

  // Course Actions
  const handleCourseClick = (course) => {
    setCourseForm({
      title: course.title || '',
      description: course.description || '',
      category: course.category || '',
      price: course.price || 0,
      status: course.status || 'DRAFT',
      imageUrl: course.imageUrl || ''
    });
    setEditingCourse(course);
    setCourseModal(true);
  };

  const handleCreateCourseClick = () => {
    setEditingCourse(null);
    setCourseForm({
      title: '',
      description: '',
      category: '',
      price: 0,
      status: 'DRAFT',
      imageUrl: ''
    });
    setCourseModal(true);
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        // Update
        const res = await api.put(`/teacher/courses/${editingCourse.id}`, courseForm);
        setCourses(prev => prev.map(c => c.id === editingCourse.id ? res.data : c));
        setSuccess('Course updated successfully');
      } else {
        // Create
        const res = await api.post('/teacher/courses', courseForm);
        setCourses(prev => [res.data, ...prev]);
        setSuccess('Course created successfully');
      }
      setCourseModal(false);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to save course');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course? All associated items will be deleted permanently.')) return;
    try {
      await api.delete(`/teacher/courses/${courseId}`);
      setCourses(prev => prev.filter(c => c.id !== courseId));
      setSuccess('Course deleted successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to delete course');
    }
  };

  // Manage Course Sub-Views Loading
  const handleManageCourse = async (course) => {
    setSelectedCourse(course);
    setView('MANAGE');
    setActiveTab('lessons');
    setLoading(true);
    try {
      const lessonsRes = await api.get(`/courses/${course.id}/lessons`);
      const assignRes = await api.get(`/courses/${course.id}/assignments`);
      const quizzesRes = await api.get(`/courses/${course.id}/quizzes`);
      setLessons(lessonsRes.data);
      setAssignments(assignRes.data);
      setQuizzes(quizzesRes.data);
    } catch (err) {
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  // Lesson actions
  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/teacher/courses/${selectedCourse.id}/lessons`, lessonForm);
      setLessons(prev => [...prev, res.data]);
      setLessonModal(false);
      setLessonForm({ title: '', description: '', videoUrl: '', pdfUrl: '', duration: 15, sequenceOrder: lessons.length + 1 });
      setSuccess('Lesson added successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to add lesson');
    }
  };

  const handleDeleteLesson = async (id) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await api.delete(`/teacher/lessons/${id}`);
      setLessons(prev => prev.filter(l => l.id !== id));
      setSuccess('Lesson deleted');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to delete lesson');
    }
  };

  // Assignment actions
  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/teacher/courses/${selectedCourse.id}/assignments`, assignmentForm);
      setAssignments(prev => [...prev, res.data]);
      setAssignmentModal(false);
      setAssignmentForm({ title: '', description: '', dueDate: '', maxPoints: 100, fileUrl: '' });
      setSuccess('Assignment posted successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to post assignment');
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await api.delete(`/teacher/assignments/${id}`);
      setAssignments(prev => prev.filter(a => a.id !== id));
      setSuccess('Assignment deleted');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to delete assignment');
    }
  };

  // Quiz questions actions
  const handleAddQuestion = () => {
    if (!newQuestion.questionText || !newQuestion.optionA || !newQuestion.optionB) {
      alert('Question and at least two options are required');
      return;
    }
    setQuizForm(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setNewQuestion({
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A',
      points: 10
    });
  };

  const handleRemoveQuestion = (idx) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== idx)
    }));
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    if (quizForm.questions.length === 0) {
      alert('Quiz must have at least one question');
      return;
    }

    try {
      const res = await api.post(`/teacher/courses/${selectedCourse.id}/quizzes`, quizForm);
      setQuizzes(prev => [...prev, res.data]);
      setQuizModal(false);
      setQuizForm({ title: '', description: '', timeLimit: 15, passingScore: 60, questions: [] });
      setSuccess('Quiz created successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to create quiz');
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm('Delete this quiz?')) return;
    try {
      await api.delete(`/teacher/quizzes/${id}`);
      setQuizzes(prev => prev.filter(q => q.id !== id));
      setSuccess('Quiz deleted');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to delete quiz');
    }
  };

  if (view === 'MANAGE') {
    return (
      <div className="space-y-6">
        {/* Back header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setView('LIST'); setSelectedCourse(null); }}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:ring-2 hover:ring-primary-500/20 transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{selectedCourse.title}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Category: {selectedCourse.category} | Students Enrolled: {selectedCourse.enrollmentCount}</p>
            </div>
          </div>
        </div>

        {/* Tab Controllers */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold">
          {[
            { id: 'lessons', name: 'Lessons', icon: Video },
            { id: 'assignments', name: 'Assignments', icon: FileText },
            { id: 'quizzes', name: 'Quizzes (MCQ)', icon: FileQuestion },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  pb-3 flex items-center gap-2 border-b-2 transition-all
                  ${active 
                    ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}
                `}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        {loading ? (
          <Spinner size="large" className="py-20" />
        ) : (
          <div className="space-y-4">
            
            {/* 1. LESSONS TAB */}
            {activeTab === 'lessons' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">Course Lessons</h3>
                  <button 
                    onClick={() => {
                      setLessonForm({ title: '', description: '', videoUrl: '', pdfUrl: '', duration: 15, sequenceOrder: lessons.length + 1 });
                      setLessonModal(true);
                    }}
                    className="flex items-center gap-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-primary-600/10"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Lesson</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {lessons.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">No lessons added yet.</div>
                  ) : (
                    lessons.map(lesson => (
                      <div key={lesson.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 rounded-2xl bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 flex items-center justify-center font-bold shrink-0">
                            {lesson.sequenceOrder}
                          </div>
                          <div>
                            <h4 className="font-bold text-base">{lesson.title}</h4>
                            <p className="text-xs text-slate-500 mt-1">{lesson.description}</p>
                            <div className="flex gap-4 mt-2 text-[10px] text-slate-400 font-bold uppercase">
                              <span>Duration: {lesson.duration} mins</span>
                              {lesson.videoUrl && <span className="text-emerald-500">Video Attached</span>}
                              {lesson.pdfUrl && <span className="text-blue-500">PDF Attached</span>}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="self-end md:self-center p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 2. ASSIGNMENTS TAB */}
            {activeTab === 'assignments' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">Course Assignments</h3>
                  <button 
                    onClick={() => setAssignmentModal(true)}
                    className="flex items-center gap-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-primary-600/10"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Assignment</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {assignments.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">No assignments created yet.</div>
                  ) : (
                    assignments.map(a => (
                      <div key={a.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-base">{a.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">{a.description}</p>
                          <div className="flex gap-4 mt-2 text-[10px] text-slate-400 font-bold uppercase">
                            <span className="text-amber-500">Due: {new Date(a.dueDate).toLocaleString()}</span>
                            <span>Max Points: {a.maxPoints}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteAssignment(a.id)}
                          className="self-end md:self-center p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 3. QUIZZES TAB */}
            {activeTab === 'quizzes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">Course Quizzes</h3>
                  <button 
                    onClick={() => setQuizModal(true)}
                    className="flex items-center gap-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-primary-600/10"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create MCQ Quiz</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {quizzes.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">No quizzes created yet.</div>
                  ) : (
                    quizzes.map(q => (
                      <div key={q.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-base">{q.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">{q.description}</p>
                          <div className="flex gap-4 mt-2 text-[10px] text-slate-400 font-bold uppercase">
                            <span>Time Limit: {q.timeLimit} mins</span>
                            <span>Passing Score: {q.passingScore}%</span>
                            <span>Questions: {q.questions?.length || 0}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteQuiz(q.id)}
                          className="self-end md:self-center p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* MODALS */}
        
        {/* A. Lesson Modal */}
        {lessonModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-bold">Add Course Lesson</h3>
                <button onClick={() => setLessonModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleLessonSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-500">Lesson Title *</label>
                  <input type="text" required value={lessonForm.title} onChange={e => setLessonForm(prev=>({...prev, title: e.target.value}))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-500">Description</label>
                  <textarea rows="2" value={lessonForm.description} onChange={e => setLessonForm(prev=>({...prev, description: e.target.value}))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium resize-none"/>
                </div>
                
                {/* Uploads */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-500">Video Lesson</label>
                    <input type="file" accept="video/*" onChange={e => handleFileUpload(e, 'lesson', 'videoUrl')} className="hidden" id="lessVideo"/>
                    <label htmlFor="lessVideo" className="cursor-pointer border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 flex flex-col items-center text-xs font-semibold gap-1 hover:bg-slate-50 dark:hover:bg-slate-800">
                      <Upload className="h-4 w-4 text-slate-400" />
                      <span>{lessonForm.videoUrl ? 'Change Video' : 'Upload Video'}</span>
                    </label>
                    {lessonForm.videoUrl && <span className="text-[10px] text-emerald-500 truncate block mt-1">Uploaded</span>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-500">PDF Study Notes</label>
                    <input type="file" accept=".pdf" onChange={e => handleFileUpload(e, 'lesson', 'pdfUrl')} className="hidden" id="lessPdf"/>
                    <label htmlFor="lessPdf" className="cursor-pointer border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 flex flex-col items-center text-xs font-semibold gap-1 hover:bg-slate-50 dark:hover:bg-slate-800">
                      <Upload className="h-4 w-4 text-slate-400" />
                      <span>{lessonForm.pdfUrl ? 'Change PDF' : 'Upload PDF'}</span>
                    </label>
                    {lessonForm.pdfUrl && <span className="text-[10px] text-emerald-500 truncate block mt-1">Uploaded</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-500">Duration (mins)</label>
                    <input type="number" required value={lessonForm.duration} onChange={e => setLessonForm(prev=>({...prev, duration: Number(e.target.value)}))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-500">Order Order</label>
                    <input type="number" required value={lessonForm.sequenceOrder} onChange={e => setLessonForm(prev=>({...prev, sequenceOrder: Number(e.target.value)}))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"/>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setLessonModal(false)} className="px-4 py-2 border rounded-xl text-sm font-bold">Cancel</button>
                  <button type="submit" disabled={uploading} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold disabled:bg-slate-400">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* B. Assignment Modal */}
        {assignmentModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold">Post Assignment</h3>
                <button onClick={() => setAssignmentModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-500">Assignment Title *</label>
                  <input type="text" required value={assignmentForm.title} onChange={e => setAssignmentForm(prev=>({...prev, title: e.target.value}))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-500">Instructions Description</label>
                  <textarea rows="3" value={assignmentForm.description} onChange={e => setAssignmentForm(prev=>({...prev, description: e.target.value}))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium resize-none"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-500">Due Date *</label>
                  <input type="datetime-local" required value={assignmentForm.dueDate} onChange={e => setAssignmentForm(prev=>({...prev, dueDate: e.target.value}))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-500">Max Points *</label>
                    <input type="number" required value={assignmentForm.maxPoints} onChange={e => setAssignmentForm(prev=>({...prev, maxPoints: Number(e.target.value)}))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-500">Attachment Instructions</label>
                    <input type="file" onChange={e => handleFileUpload(e, 'assignment', 'fileUrl')} className="hidden" id="assignFile"/>
                    <label htmlFor="assignFile" className="cursor-pointer border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850">
                      <Upload className="h-4 w-4 text-slate-400" />
                      <span>{assignmentForm.fileUrl ? 'Uploaded' : 'Upload Document'}</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setAssignmentModal(false)} className="px-4 py-2 border rounded-xl text-sm font-bold">Cancel</button>
                  <button type="submit" disabled={uploading} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold">Post</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* C. Quiz Modal */}
        {quizModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-bold">Create MCQ Quiz</h3>
                <button onClick={() => setQuizModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleQuizSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-500">Quiz Title *</label>
                    <input type="text" required value={quizForm.title} onChange={e => setQuizForm(prev=>({...prev, title: e.target.value}))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"/>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-500">Time Limit (mins)</label>
                      <input type="number" required value={quizForm.timeLimit} onChange={e => setQuizForm(prev=>({...prev, timeLimit: Number(e.target.value)}))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"/>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-500">Passing Score (%)</label>
                      <input type="number" required value={quizForm.passingScore} onChange={e => setQuizForm(prev=>({...prev, passingScore: Number(e.target.value)}))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"/>
                    </div>
                  </div>
                </div>

                {/* Question Editor Block */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-3">
                  <h4 className="font-bold text-sm">Add MCQ Question</h4>
                  <div>
                    <input type="text" placeholder="Question Text" value={newQuestion.questionText} onChange={e => setNewQuestion(prev=>({...prev, questionText: e.target.value}))} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 outline-none text-xs font-semibold"/>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Option A" value={newQuestion.optionA} onChange={e => setNewQuestion(prev=>({...prev, optionA: e.target.value}))} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 outline-none text-xs font-medium"/>
                    <input type="text" placeholder="Option B" value={newQuestion.optionB} onChange={e => setNewQuestion(prev=>({...prev, optionB: e.target.value}))} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 outline-none text-xs font-medium"/>
                    <input type="text" placeholder="Option C" value={newQuestion.optionC} onChange={e => setNewQuestion(prev=>({...prev, optionC: e.target.value}))} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 outline-none text-xs font-medium"/>
                    <input type="text" placeholder="Option D" value={newQuestion.optionD} onChange={e => setNewQuestion(prev=>({...prev, optionD: e.target.value}))} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 outline-none text-xs font-medium"/>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Correct Answer</label>
                      <select value={newQuestion.correctOption} onChange={e => setNewQuestion(prev=>({...prev, correctOption: e.target.value}))} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 outline-none text-xs font-bold w-full">
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Score Points</label>
                      <input type="number" value={newQuestion.points} onChange={e => setNewQuestion(prev=>({...prev, points: Number(e.target.value)}))} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 outline-none text-xs font-semibold"/>
                    </div>
                  </div>
                  <button type="button" onClick={handleAddQuestion} className="bg-slate-800 dark:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-xl">Add Question to Quiz</button>
                </div>

                {/* Question List Preview */}
                <div className="space-y-2">
                  <h4 className="font-bold text-sm">Quiz Questions ({quizForm.questions.length})</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {quizForm.questions.map((q, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/20 px-3 py-2 rounded-xl text-xs border">
                        <span className="truncate pr-4 font-semibold">{idx+1}. {q.questionText} (Answer: {q.correctOption})</span>
                        <button type="button" onClick={() => handleRemoveQuestion(idx)} className="text-red-500 hover:text-red-700 font-bold shrink-0">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setQuizModal(false)} className="px-4 py-2 border rounded-xl text-sm font-bold">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold">Save Quiz</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // STANDARD COURSE LISTING VIEW
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Course Manager</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Develop course lessons, assignments, and test quizzes</p>
        </div>
        <button
          onClick={handleCreateCourseClick}
          className="flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary-600/20 transition-all self-start sm:self-center"
        >
          <Plus className="h-5 w-5" />
          <span>New Course</span>
        </button>
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

      {/* Grid List */}
      {loading ? (
        <Spinner size="large" className="py-20" />
      ) : courses.length === 0 ? (
        <div className="p-12 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">No courses added. Click 'New Course' to get started.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              {/* Image banner */}
              <div className="h-44 bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
                {course.imageUrl ? (
                  <img src={course.imageUrl} alt={course.title} className="h-full w-full object-cover" />
                ) : (
                  <BookOpen className="h-12 w-12 text-slate-400" />
                )}
                <span className={`
                  absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border shadow-sm
                  ${course.status === 'PUBLISHED' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400' 
                    : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400'}
                `}>
                  {course.status}
                </span>
              </div>

              {/* Text metadata */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] text-primary-600 dark:text-primary-400 uppercase font-bold tracking-wider">{course.category}</span>
                  <h3 className="font-bold text-lg mt-1 line-clamp-1">{course.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 line-clamp-2">{course.description}</p>
                </div>

                <div className="flex justify-between items-center text-xs font-semibold text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span>Enrolled: {course.enrollmentCount}</span>
                  <span>Lessons: {course.lessonCount}</span>
                </div>

                {/* Operations */}
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => handleManageCourse(course)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Manage Course</span>
                  </button>
                  <button 
                    onClick={() => handleCourseClick(course)}
                    className="p-2.5 rounded-xl border hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-2.5 rounded-xl border border-red-100 hover:bg-red-50 hover:border-red-200 dark:border-transparent dark:hover:bg-red-950/20 text-red-500 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Edit/Create Modal */}
      {courseModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-bold">{editingCourse ? 'Edit Course Details' : 'Create New Course'}</h3>
              <button onClick={() => setCourseModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCourseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-500">Course Title *</label>
                <input 
                  type="text" 
                  required 
                  value={courseForm.title} 
                  onChange={e => setCourseForm(prev=>({...prev, title: e.target.value}))}
                  placeholder="e.g. Intro to Java Spring Boot"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-500">Description</label>
                <textarea 
                  value={courseForm.description} 
                  onChange={e => setCourseForm(prev=>({...prev, description: e.target.value}))}
                  rows="3"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-500">Category *</label>
                  <input 
                    type="text" 
                    required 
                    value={courseForm.category} 
                    onChange={e => setCourseForm(prev=>({...prev, category: e.target.value}))}
                    placeholder="e.g. Web Dev"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-500">Price ($) *</label>
                  <input 
                    type="number" 
                    required 
                    value={courseForm.price} 
                    onChange={e => setCourseForm(prev=>({...prev, price: Number(e.target.value)}))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-500">Course Thumbnail Image URL</label>
                  <input 
                    type="text" 
                    value={courseForm.imageUrl} 
                    onChange={e => setCourseForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2 text-slate-500">Publish Status</label>
                  <select
                    value={courseForm.status}
                    onChange={e => setCourseForm(prev=>({...prev, status: e.target.value}))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-3 outline-none text-sm font-semibold"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setCourseModal(false)} 
                  className="px-4 py-2 border rounded-xl text-sm font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
