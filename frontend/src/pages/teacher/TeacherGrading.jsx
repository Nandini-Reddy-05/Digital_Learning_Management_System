import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Spinner } from '../../components/Spinner';
import { 
  FileText, 
  User, 
  Calendar, 
  ExternalLink,
  Award,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

export const TeacherGrading = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Grading Modal State
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const fetchPendingSubmissions = async () => {
    try {
      const response = await api.get('/teacher/submissions/pending');
      setSubmissions(response.data);
    } catch (err) {
      setError('Failed to fetch pending submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeClick = (sub) => {
    setGradingSubmission(sub);
    setPointsEarned(sub.pointsEarned || 0);
    setRemarks(sub.remarks || '');
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (pointsEarned < 0 || pointsEarned > gradingSubmission.maxPoints) {
      alert(`Score must be between 0 and ${gradingSubmission.maxPoints}`);
      return;
    }

    try {
      await api.post(`/teacher/submissions/${gradingSubmission.id}/grade`, {
        pointsEarned,
        remarks
      });

      // Remove graded submission from list
      setSubmissions(prev => prev.filter(s => s.id !== gradingSubmission.id));
      setGradingSubmission(null);
      setSuccess('Submission graded successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to submit grade');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Grading Portal</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Pending student assignment submissions: {submissions.length}</p>
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

      {/* List */}
      {loading ? (
        <Spinner size="large" className="py-20" />
      ) : submissions.length === 0 ? (
        <div className="p-12 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">All caught up! No pending submissions to grade.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {submissions.map(sub => (
            <div key={sub.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400 px-2 py-0.5 rounded-md font-bold uppercase">{sub.courseTitle}</span>
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(sub.submissionDate).toLocaleDateString()}</span>
                  </span>
                </div>
                <h3 className="font-bold text-lg leading-snug">{sub.assignmentTitle}</h3>
                
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-350 pt-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <span>Student: {sub.studentName}</span>
                </div>

                {sub.remarks && (
                  <p className="text-xs italic bg-slate-50 dark:bg-slate-805/40 p-2.5 rounded-xl border">
                    " {sub.remarks} "
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <a 
                  href={`/${sub.fileUrl}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 border hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View File</span>
                </a>
                <button 
                  onClick={() => handleGradeClick(sub)}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-primary-600/10 transition-all"
                >
                  <Award className="h-4 w-4" />
                  <span>Evaluate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grade Modal Dialog */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold">Evaluate Submission</h3>
              <button onClick={() => setGradingSubmission(null)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-500">Points Awarded (Max: {gradingSubmission.maxPoints})</label>
                <input 
                  type="number" 
                  required 
                  min="0"
                  max={gradingSubmission.maxPoints}
                  value={pointsEarned} 
                  onChange={e => setPointsEarned(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-3 outline-none text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-500">Feedback Remarks</label>
                <textarea 
                  value={remarks} 
                  onChange={e => setRemarks(e.target.value)}
                  rows="3"
                  placeholder="Provide guidance comments..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 outline-none text-sm font-medium resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setGradingSubmission(null)} 
                  className="px-4 py-2 border rounded-xl text-sm font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-600/20"
                >
                  Submit Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
