import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Spinner } from '../../components/Spinner';
import { Award, Calendar, ShieldCheck, ChevronLeft, Printer } from 'lucide-react';

export const StudentCertificate = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCertificate();
  }, [courseId]);

  const fetchCertificate = async () => {
    try {
      const res = await api.get(`/student/courses/${courseId}/certificate`);
      setCertificate(res.data);
    } catch (err) {
      setError('Could not retrieve certificate. Make sure you have completed 100% of this course.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <Spinner size="large" className="min-h-[70vh]" />;

  if (error || !certificate) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-2xl border border-red-200 dark:border-red-900/30 text-sm font-semibold">
          {error || 'Certificate not available.'}
        </div>
        <button 
          onClick={() => navigate('/student/courses')} 
          className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary-700 transition-all"
        >
          Back to Classrooms
        </button>
      </div>
    );
  }

  // Format Date
  const issueDateFormatted = new Date(certificate.issueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Page Header (Hidden during printing) */}
      <div className="flex items-center justify-between no-print border-b pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/student/courses')} 
            className="p-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Your Course Certificate</h1>
            <p className="text-xs text-slate-500 font-medium">Verify and download your achievement</p>
          </div>
        </div>

        <button 
          onClick={handlePrint}
          className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-md shadow-primary-600/10 transition-all"
        >
          <Printer className="h-4.5 w-4.5" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Certificate Frame Area */}
      <div className="flex justify-center py-6 px-2">
        <div className="print-area w-full max-w-4xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-8 double border-primary-600/30 dark:border-primary-500/20 p-8 md:p-16 rounded-3xl shadow-xl relative overflow-hidden transition-all duration-300">
          
          {/* Certificate Watermark Background Decorative Seals */}
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Certificate Main Content */}
          <div className="border-2 border-slate-200 dark:border-slate-800 p-8 md:p-12 rounded-2xl flex flex-col items-center text-center space-y-8 relative">
            
            {/* Logo and Icon Header */}
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-full border border-amber-200 dark:border-amber-900/30 text-amber-500">
                <Award className="h-10 w-10 md:h-12 md:w-12 animate-pulse" />
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary-600 dark:text-primary-400">DIGITAL LMS ACADEMY</span>
            </div>

            {/* Title Statement */}
            <div className="space-y-2">
              <h2 className="text-3xl md:text-5xl font-serif font-black tracking-tight text-slate-800 dark:text-slate-105">
                Certificate of Completion
              </h2>
              <p className="text-xs md:text-sm text-slate-500 italic font-medium">
                This is proudly presented to
              </p>
            </div>

            {/* Student Name */}
            <div className="py-2 border-b-2 border-amber-550 w-full max-w-lg">
              <h3 className="text-2xl md:text-4xl font-extrabold font-serif tracking-wide text-primary-700 dark:text-primary-400">
                {certificate.studentName}
              </h3>
            </div>

            {/* Achievement Detail Statement */}
            <div className="max-w-xl space-y-2">
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
                for successfully and honorably completing all criteria and required syllabus studies of the course
              </p>
              <h4 className="text-lg md:text-2xl font-extrabold text-slate-850 dark:text-slate-200 font-serif">
                {certificate.courseTitle}
              </h4>
            </div>

            {/* Date and Signature Details Block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl pt-8 border-t border-slate-100 dark:border-slate-800 items-center justify-between text-xs font-semibold">
              
              {/* Date details */}
              <div className="flex flex-col items-center md:items-start gap-1">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-350">
                  <Calendar className="h-4.5 w-4.5 text-slate-400" />
                  <span>Date of Issue:</span>
                  <span className="font-extrabold">{issueDateFormatted}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-350 mt-1">
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                  <span>ID:</span>
                  <span className="font-mono text-[10px] select-all bg-slate-50 dark:bg-slate-805 px-1.5 py-0.5 rounded border border-slate-200/50">{certificate.certificateCode}</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="flex justify-center md:justify-end gap-10">
                <div className="flex flex-col items-center">
                  <span className="font-serif italic text-base text-primary-600 dark:text-primary-400">LMS Admin</span>
                  <div className="w-28 border-t border-slate-300 dark:border-slate-700 mt-1 pt-1 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Administrator
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-serif italic text-base text-amber-600 dark:text-amber-500">Lead Instructor</span>
                  <div className="w-28 border-t border-slate-300 dark:border-slate-700 mt-1 pt-1 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Instructor
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom ribbon design */}
            <div className="absolute bottom-4 right-4 pointer-events-none opacity-20 dark:opacity-10">
              <Award className="h-28 w-28 text-slate-500" />
            </div>

          </div>
        </div>
      </div>

      {/* Global CSS Inject for Clean Print Styles */}
      <style>{`
        @media print {
          /* Hide parent/dashboard sidebar and headers */
          body * {
            visibility: hidden;
          }
          
          /* Render only the print frame */
          .print-area, .print-area * {
            visibility: visible;
          }
          
          .print-area {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            border: none !important;
            padding: 1.5in !important;
            margin: 0 !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            transform: scale(1.05);
            transform-origin: top left;
          }

          /* Ensure dark mode colors map to clean print paper */
          .print-area h2, .print-area h3, .print-area h4 {
            color: #1e293b !important;
          }
          .print-area p, .print-area span {
            color: #475569 !important;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
