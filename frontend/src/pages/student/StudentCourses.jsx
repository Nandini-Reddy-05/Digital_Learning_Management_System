import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Spinner } from '../../components/Spinner';
import { 
  BookOpen, 
  Video, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  FileQuestion,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Clock,
  Play,
  Award,
  Calendar,
  CheckSquare,
  Square
} from 'lucide-react';

export const StudentCourses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseIdParam = searchParams.get('courseId');

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected Classroom view states
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [classroomTab, setClassroomTab] = useState('lessons'); // 'lessons', 'assignments', 'quizzes'

  // Assignments & Submissions State
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]); // Student's submissions
  const [submittingAssignId, setSubmittingAssignId] = useState(null);
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [assignmentRemarks, setAssignmentRemarks] = useState('');

  // Quizzes & Timed testing State
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({}); // { questionId: 'A' }
  const [quizTimer, setQuizTimer] = useState(0); // in seconds
  const [quizResult, setQuizResult] = useState(null);

  // File uploading tracker
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  useEffect(() => {
    if (courseIdParam) {
      loadClassroom(courseIdParam);
    } else {
      setSelectedCourse(null);
    }
  }, [courseIdParam, enrollments]);

  const fetchEnrollments = async () => {
    try {
      const response = await api.get('/student/courses');
      setEnrollments(response.data);
    } catch (err) {
      setError('Failed to fetch enrolled courses.');
    } finally {
      setLoading(false);
    }
  };

  const loadClassroom = async (courseId) => {
    const enrollment = enrollments.find(e => String(e.courseId) === String(courseId));
    if (!enrollment) return;

    setLoading(true);
    try {
      setSelectedCourse(enrollment);

      // Load Lessons
      const lessonsRes = await api.get(`/courses/${courseId}/lessons`);
      setLessons(lessonsRes.data);
      if (lessonsRes.data.length > 0) {
        setCurrentLesson(lessonsRes.data[0]);
      } else {
        setCurrentLesson(null);
      }

      // Load Completed Lessons
      const completedRes = await api.get(`/student/courses/${courseId}/completed-lessons`);
      setCompletedLessonIds(completedRes.data);

      // Load Assignments
      const assignRes = await api.get(`/courses/${courseId}/assignments`);
      setAssignments(assignRes.data);

      // Load Student's Submissions
      const subRes = await api.get('/student/assignments/submissions');
      setSubmissions(subRes.data);

      // Load Quizzes
      const quizzesRes = await api.get(`/courses/${courseId}/quizzes`);
      setQuizzes(quizzesRes.data);
    } catch (err) {
      setError('Failed to load classroom details');
    } finally {
      setLoading(false);
    }
  };

  // Mark lesson as completed
  const handleMarkCompleted = async (lessonId) => {
    try {
      await api.post(`/student/lessons/${lessonId}/complete`);
      setCompletedLessonIds(prev => [...prev, lessonId]);
      
      // Update progress locally
      const totalLessons = lessons.length;
      const completedCount = completedLessonIds.length + 1;
      const newProgress = Math.round((completedCount / totalLessons) * 100);
      
      setSelectedCourse(prev => ({ ...prev, progressPercentage: newProgress }));
      setEnrollments(prev => prev.map(e => e.courseId === selectedCourse.courseId ? { ...e, progressPercentage: newProgress } : e));
      if (newProgress === 100) {
        setSuccess('🎉 Congratulations! You have completed the course and earned a Certificate of Completion!');
      } else {
        setSuccess('Lesson marked completed successfully!');
      }
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError('Failed to mark lesson completed.');
    }
  };

  // Upload assignment file
  const handleAssignFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const data = new FormData();
      data.append('file', file);
      const res = await api.post('/files/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAssignmentFile(res.data.filePath);
      setSuccess('File uploaded successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!assignmentFile) {
      alert('Please upload a file first');
      return;
    }

    try {
      const res = await api.post(`/student/assignments/${submittingAssignId}/submit`, {
        fileUrl: assignmentFile,
        remarks: assignmentRemarks
      });

      // Update submissions list
      setSubmissions(prev => {
        const filtered = prev.filter(s => s.assignmentId !== submittingAssignId);
        return [...filtered, res.data];
      });

      setSubmittingAssignId(null);
      setAssignmentFile(null);
      setAssignmentRemarks('');
      setSuccess('Assignment submitted successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to submit assignment');
    }
  };

  // TIMED QUIZ CONTROLLER TIMER LOGIC
  useEffect(() => {
    if (!activeQuiz || quizTimer <= 0) {
      if (activeQuiz && quizTimer === 0) {
        handleAutoQuizSubmit();
      }
      return;
    }

    const timerInterval = setInterval(() => {
      setQuizTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [activeQuiz, quizTimer]);

  const handleStartQuiz = async (quizId) => {
    setLoading(true);
    setQuizResult(null);
    setQuizAnswers({});
    try {
      // Pull full quiz questions
      const res = await api.get(`/student/quizzes/${quizId}`);
      setActiveQuiz(res.data);
      setQuizTimer(res.data.timeLimit * 60); // minutes to seconds
      setClassroomTab('quiz-session');
    } catch (err) {
      setError('Failed to load quiz questions');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (qId, option) => {
    setQuizAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleQuizSubmit = async () => {
    if (!window.confirm('Submit answers for grading?')) return;
    submitQuizApi();
  };

  const handleAutoQuizSubmit = () => {
    alert('Time limit reached! Auto-submitting responses...');
    submitQuizApi();
  };

  const submitQuizApi = async () => {
    const answersList = Object.keys(quizAnswers).map(key => ({
      questionId: Number(key),
      selectedOption: quizAnswers[key]
    }));

    try {
      setLoading(true);
      const res = await api.post(`/student/quizzes/${activeQuiz.id}/submit`, {
        answers: answersList
      });
      setQuizResult(res.data);
      setActiveQuiz(null);
      setClassroomTab('quizzes');
    } catch (err) {
      setError('Failed to evaluate quiz');
      setActiveQuiz(null);
      setClassroomTab('quizzes');
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading && enrollments.length === 0) return <Spinner size="large" className="min-h-[60vh]" />;

  // CLASSROOM VIEW
  if (selectedCourse) {
    return (
      <div className="space-y-6">
        {/* Course header details */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setSearchParams({}); }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{selectedCourse.courseTitle}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Progress: {selectedCourse.progressPercentage}% | {selectedCourse.courseCategory}</p>
            </div>
          </div>
          {selectedCourse.progressPercentage === 100 && (
            <button
              onClick={() => navigate(`/student/certificate/${selectedCourse.courseId}`)}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-amber-500/20 transition-all shrink-0 border border-amber-400/20 animate-pulse"
            >
              <Award className="h-4.5 w-4.5" />
              <span>Claim Certificate 🎓</span>
            </button>
          )}
        </div>

        {/* Dynamic Alerts */}
        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center gap-2 text-xs font-semibold">
            <CheckCircle className="h-5 w-5" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-2 text-xs font-semibold">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main workspace (Video, PDFs, Tabs) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* VIDEO PLAYER & LESSON DETAILS */}
            {classroomTab === 'lessons' && currentLesson && (
              <div className="space-y-4">
                <div className="bg-black aspect-video rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-805 relative group">
                  {currentLesson.videoUrl ? (
                    <video 
                      src={`/${currentLesson.videoUrl}`} 
                      controls 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                      <Video className="h-16 w-16 text-slate-600" />
                      <span>No video resource attached to this lecture.</span>
                    </div>
                  )}
                </div>

                {/* Lesson Info */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] text-primary-600 dark:text-primary-400 uppercase font-bold tracking-wider">Lesson {currentLesson.sequenceOrder}</span>
                      <h2 className="text-xl font-bold mt-0.5">{currentLesson.title}</h2>
                    </div>
                    
                    {/* Mark Completed actions */}
                    {completedLessonIds.includes(currentLesson.id) ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-900/30">
                        <CheckCircle className="h-4.5 w-4.5" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleMarkCompleted(currentLesson.id)}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-primary-600/10 transition-all shrink-0"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed">{currentLesson.description}</p>
                  
                  {/* Notes downloads */}
                  {currentLesson.pdfUrl && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary-500" />
                        <span className="text-xs font-semibold">Study Notes PDF File</span>
                      </div>
                      <a 
                        href={`/${currentLesson.pdfUrl}`} 
                        download
                        className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition-all border"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download Notes</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB SELECTORS */}
            {classroomTab !== 'quiz-session' && (
              <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold">
                {[
                  { id: 'lessons', name: 'Syllabus Video' },
                  { id: 'assignments', name: 'Assignments Task' },
                  { id: 'quizzes', name: 'MCQ Quizzes' },
                ].map(tab => {
                  const active = classroomTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setClassroomTab(tab.id)}
                      className={`
                        pb-3 border-b-2 transition-all
                        ${active 
                          ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400' 
                          : 'border-transparent text-slate-500 hover:text-slate-805 dark:hover:text-slate-200'}
                      `}
                    >
                      {tab.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* A. LESSONS LIST - MOBILE ACCORDION FALLBACK */}
            {classroomTab === 'lessons' && (
              <div className="lg:hidden bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h3 className="font-bold text-sm">Course Syllabus</h3>
                <div className="space-y-2">
                  {lessons.map(lesson => (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLesson(lesson)}
                      className={`
                        w-full text-left p-3 rounded-2xl border text-xs flex items-center justify-between gap-3
                        ${currentLesson?.id === lesson.id 
                          ? 'bg-primary-50/40 border-primary-400 text-primary-600 dark:bg-primary-950/15' 
                          : 'bg-transparent border-slate-200 hover:bg-slate-55'}
                      `}
                    >
                      <span className="truncate font-semibold">{lesson.sequenceOrder}. {lesson.title}</span>
                      {completedLessonIds.includes(lesson.id) && <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* B. ASSIGNMENTS TAB */}
            {classroomTab === 'assignments' && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg">Homework Tasks</h3>
                {assignments.length === 0 ? (
                  <p className="text-sm text-slate-500 italic p-6 border rounded-3xl text-center bg-white dark:bg-slate-900">No assignments created for this course.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {assignments.map(a => {
                      const studentSub = submissions.find(s => s.assignmentId === a.id);
                      return (
                        <div key={a.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h4 className="font-bold text-base">{a.title}</h4>
                              <p className="text-xs text-slate-400 mt-1">Due: {new Date(a.dueDate).toLocaleString()} | Max score: {a.maxPoints} pts</p>
                            </div>
                            {studentSub ? (
                              <span className={`
                                px-3 py-1 rounded-full text-xs font-bold border
                                ${studentSub.status === 'GRADED' 
                                  ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-950/20' 
                                  : 'bg-primary-50 text-primary-600 border-primary-200 dark:bg-primary-950/20'}
                              `}>
                                {studentSub.status}
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/20">Pending Submission</span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-350">{a.description}</p>
                          
                          {/* Grading feedback if graded */}
                          {studentSub && studentSub.status === 'GRADED' && (
                            <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-200/50 dark:border-emerald-900/30 rounded-2xl text-xs space-y-2">
                              <h5 className="font-bold text-emerald-600">Grading Results</h5>
                              <div className="flex gap-4">
                                <span className="font-bold">Score: {studentSub.pointsEarned} / {a.maxPoints}</span>
                                {studentSub.remarks && <span className="text-slate-600 dark:text-slate-300">Feedback: "{studentSub.remarks}"</span>}
                              </div>
                            </div>
                          )}

                          {/* Submit controls */}
                          {!studentSub || studentSub.status !== 'GRADED' ? (
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                              {submittingAssignId === a.id ? (
                                <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                                    <div>
                                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Upload Homework PDF/Image *</label>
                                      <input type="file" onChange={handleAssignFileUpload} className="hidden" id={`homeworkFile-${a.id}`}/>
                                      <label htmlFor={`homeworkFile-${a.id}`} className="cursor-pointer border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 flex flex-col items-center justify-center text-xs font-semibold gap-1 hover:bg-slate-50">
                                        <Upload className="h-4 w-4 text-slate-400" />
                                        <span>{assignmentFile ? 'File Loaded' : 'Upload File'}</span>
                                      </label>
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Student Remarks</label>
                                      <input 
                                        type="text" 
                                        value={assignmentRemarks}
                                        onChange={e => setAssignmentRemarks(e.target.value)}
                                        placeholder="Add notes for teacher..."
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-xs font-semibold"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-2 text-xs font-semibold">
                                    <button type="button" onClick={() => setSubmittingAssignId(null)} className="px-4 py-2 border rounded-xl">Cancel</button>
                                    <button type="submit" disabled={uploading} className="px-4 py-2 bg-primary-600 text-white rounded-xl shadow-md">Submit Answer</button>
                                  </div>
                                </form>
                              ) : (
                                <button 
                                  onClick={() => setSubmittingAssignId(a.id)}
                                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-all"
                                >
                                  {studentSub ? 'Re-Submit Assignment' : 'Hand in Assignment'}
                                </button>
                              )}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* C. QUIZZES TAB */}
            {classroomTab === 'quizzes' && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg">Course Quizzes</h3>

                {/* Instant Quiz attempt results banner */}
                {quizResult && (
                  <div className={`
                    p-6 border rounded-3xl flex items-center justify-between gap-4 animate-fadeIn
                    ${quizResult.passed 
                      ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400' 
                      : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400'}
                  `}>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-base">Quiz Completed!</h4>
                      <p className="text-xs">Your Score percentage: <span className="font-bold">{quizResult.score}%</span> (Passing score limit: {selectedCourse.passingScore ?? 60}%)</p>
                      <span className="text-[10px] block mt-1 font-bold uppercase">{quizResult.passed ? 'Result: PASSED 🎓' : 'Result: FAILED ❌'}</span>
                    </div>
                  </div>
                )}

                {quizzes.length === 0 ? (
                  <p className="text-sm text-slate-500 italic p-6 border rounded-3xl text-center bg-white dark:bg-slate-900">No quizzes available for this course.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {quizzes.map(q => (
                      <div key={q.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-base">{q.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">{q.description}</p>
                          <div className="flex gap-4 mt-2 text-[10px] text-slate-400 font-bold uppercase">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{q.timeLimit} minutes</span>
                            </span>
                            <span>Passing limit: {q.passingScore}%</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleStartQuiz(q.id)}
                          className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-primary-600/10 transition-all shrink-0"
                        >
                          Start Test
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* D. QUIZ TESTING PORTAL (TIMED QUESTION VIEWER) */}
            {classroomTab === 'quiz-session' && activeQuiz && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                
                {/* Timer Clock */}
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-805/40 p-4 rounded-2xl border sticky top-16 z-20">
                  <div>
                    <h3 className="font-bold text-base leading-tight">{activeQuiz.title}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Do not refresh or leave this page until you finish.</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-extrabold text-red-500 shrink-0">
                    <Clock className="h-5 w-5 animate-pulse" />
                    <span>Time Left: {formatTimer(quizTimer)}</span>
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-6">
                  {activeQuiz.questions?.map((q, idx) => (
                    <div key={q.id} className="space-y-3 p-4 bg-slate-50/50 dark:bg-slate-805 rounded-2xl border">
                      <h4 className="font-semibold text-sm">{idx + 1}. {q.questionText} <span className="text-[9px] text-slate-400 font-bold ml-1">({q.points} pts)</span></h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {[
                          { key: 'A', text: q.optionA },
                          { key: 'B', text: q.optionB },
                          { key: 'C', text: q.optionC },
                          { key: 'D', text: q.optionD }
                        ].map(opt => {
                          const isSelected = quizAnswers[q.id] === opt.key;
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => handleQuizAnswer(q.id, opt.key)}
                              className={`
                                text-left px-4 py-3 rounded-xl border text-xs font-semibold flex items-center gap-3 transition-all
                                ${isSelected 
                                  ? 'border-primary-500 bg-primary-50/30 text-primary-600 dark:bg-primary-950/15' 
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'}
                              `}
                            >
                              <span className={`h-5 w-5 rounded-full border flex items-center justify-center text-[10px] font-extrabold
                                ${isSelected ? 'border-primary-600 bg-primary-600 text-white' : 'border-slate-350 text-slate-500'}
                              `}>
                                {opt.key}
                              </span>
                              <span>{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={handleQuizSubmit}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-primary-600/20 transition-all"
                  >
                    Submit Test Answers
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Right Column sidebar: Lessons/Lecture navigation (Desktop Only) */}
          <div className="hidden lg:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm border-b pb-2">Course Syllabus</h3>
            <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
              {lessons.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No syllabus registered.</p>
              ) : (
                lessons.map(lesson => {
                  const active = currentLesson?.id === lesson.id;
                  const completed = completedLessonIds.includes(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => { setCurrentLesson(lesson); setClassroomTab('lessons'); }}
                      className={`
                        w-full text-left p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3.5 transition-all
                        ${active 
                          ? 'border-primary-500 bg-primary-50/30 text-primary-600 dark:bg-primary-950/15 dark:text-primary-400' 
                          : 'bg-transparent border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-805 hover:border-slate-300'}
                      `}
                    >
                      <span className="truncate">{lesson.sequenceOrder}. {lesson.title}</span>
                      {completed ? (
                        <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                      ) : (
                        <Play className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD MY ENROLLMENTS LOG LIST VIEW
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My Classrooms</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Courses enrolled by you</p>
      </div>

      {/* Grid view */}
      {enrollments.length === 0 ? (
        <div className="text-center py-16 space-y-4 border-2 border-dashed rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400">You are not active in any classroom enrollments yet.</p>
          <Link to="/student/catalog" className="inline-block bg-primary-600 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-primary-600/10">Browse Catalog</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {enrollments.map(record => (
            <div key={record.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              
              {/* Image Thumbnail */}
              <div className="h-40 bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
                {record.courseImageUrl ? (
                  <img src={record.courseImageUrl} alt={record.courseTitle} className="h-full w-full object-cover" />
                ) : (
                  <BookOpen className="h-10 w-10 text-slate-400" />
                )}
                <span className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase">
                  {record.status}
                </span>
              </div>

              {/* Text content details */}
              <div className="p-6 space-y-4">
                <div>
                  <span className="text-[10px] text-primary-600 dark:text-primary-400 uppercase font-bold tracking-wider">{record.courseCategory}</span>
                  <h3 className="font-bold text-base mt-1 line-clamp-1">{record.courseTitle}</h3>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>Progress</span>
                    <span>{record.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary-500 h-full rounded-full transition-all" 
                      style={{ width: `${record.progressPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setSearchParams({ courseId: record.courseId })}
                    className="flex-1 bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 transition-all border"
                  >
                    <span>Enter Classroom</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  {record.progressPercentage === 100 && (
                    <button 
                      onClick={() => navigate(`/student/certificate/${record.courseId}`)}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 transition-all shadow-md shadow-amber-500/10 shrink-0 border border-amber-400"
                      title="View Certificate"
                    >
                      <Award className="h-4 w-4" />
                      <span>Certificate</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
