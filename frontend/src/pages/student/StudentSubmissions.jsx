import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Spinner } from '../../components/Spinner';
import { 
  FileText, 
  Calendar, 
  Award,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

export const StudentSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await api.get('/student/assignments/submissions');
      setSubmissions(response.data);
    } catch (err) {
      setError('Failed to fetch submissions details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner size="large" className="min-h-[60vh]" />;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My Submissions</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Review grading status and feedbacks for homework assignments</p>
      </div>

      {error ? (
        <div className="p-6 text-red-500 font-bold text-center">{error}</div>
      ) : submissions.length === 0 ? (
        <div className="p-12 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900">
          No assignments submitted yet. Go to your courses to submit tasks.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {submissions.map(sub => (
            <div key={sub.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] bg-primary-50 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400 px-2 py-0.5 rounded-md font-bold uppercase">{sub.courseTitle}</span>
                  <span className={`
                    px-2.5 py-0.5 rounded-full text-[10px] font-bold border
                    ${sub.status === 'GRADED' 
                      ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-950/20' 
                      : 'bg-primary-50 text-primary-600 border-primary-200 dark:bg-primary-950/20'}
                  `}>
                    {sub.status}
                  </span>
                </div>

                <h3 className="font-bold text-base leading-snug">{sub.assignmentTitle}</h3>
                
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Submitted: {new Date(sub.submissionDate).toLocaleDateString()}</span>
                  </span>
                </div>

                {/* Feedback remarks */}
                {sub.status === 'GRADED' ? (
                  <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-200/50 dark:border-emerald-900/30 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-emerald-600 flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        <span>Grading Results</span>
                      </span>
                      <span>Score: {sub.pointsEarned} / {sub.maxPoints}</span>
                    </div>
                    {sub.remarks && (
                      <p className="text-xs italic text-slate-650 dark:text-slate-350">
                        Instructor remarks: "{sub.remarks}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-805/45 border rounded-2xl flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>Waiting for instructor evaluation...</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <a 
                  href={`/${sub.fileUrl}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
                >
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                  <span>View Submitted File</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
