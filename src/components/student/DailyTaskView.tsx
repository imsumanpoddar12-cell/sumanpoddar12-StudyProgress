import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  BookOpen,
  X,
  FileCheck,
  Flame,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { Subject, DailyTask } from '../../types/index.ts';

interface DailyTaskViewProps {
  onNavigate: (tab: string) => void;
}

export const DailyTaskView: React.FC<DailyTaskViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form State
  const [subjectId, setSubjectId] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [studyDuration, setStudyDuration] = useState<number>(45);
  const [learningSummary, setLearningSummary] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [pageCount, setPageCount] = useState<number>(3); // Default 3 pages
  const [uploadedFiles, setUploadedFiles] = useState<
    {
      id: string;
      fileName: string;
      fileType: 'image/jpeg' | 'image/png' | 'application/pdf';
      fileSize: number;
      url: string;
      pageCount: number;
    }[]
  >([]);

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const studentId = user.studentId || user.id;
      const [subsRes, tasksRes] = await Promise.all([
        api.getSubjects(),
        api.getDailyTasks({ studentId }),
      ]);
      setSubjects(subsRes);
      if (subsRes.length > 0 && !subjectId) {
        setSubjectId(subsRes[0].id);
      }
      setTasks(tasksRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).map((file, idx) => {
      const isPdf = file.type === 'application/pdf';
      const fileType: 'application/pdf' | 'image/png' | 'image/jpeg' = isPdf
        ? 'application/pdf'
        : file.type === 'image/png'
        ? 'image/png'
        : 'image/jpeg';

      // Estimate pages: if PDF, user can adjust or default 3 pages
      const estPages = isPdf ? 3 : 1;

      return {
        id: `upl_${Date.now()}_${idx}`,
        fileName: file.name,
        fileType,
        fileSize: file.size,
        url: URL.createObjectURL(file),
        pageCount: estPages,
      };
    });

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    // Automatically update total page count
    const total = [...uploadedFiles, ...newFiles].reduce((acc, f) => acc + f.pageCount, 0);
    setPageCount(Math.max(3, total));
  };

  // Quick preset helper to attach a 3-page or 4-page verified note document
  const handleAttachDemoNotes = (pages: number) => {
    const sampleDoc = {
      id: `sample_${Date.now()}`,
      fileName: `Study_Notes_Calculus_${pages}Pages.pdf`,
      fileType: 'application/pdf' as const,
      fileSize: pages * 320000,
      url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
      pageCount: pages,
    };
    setUploadedFiles([sampleDoc]);
    setPageCount(pages);
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Real-time validation computation
  const totalPages =
    uploadedFiles.length > 0
      ? uploadedFiles.reduce((acc, f) => acc + f.pageCount, 0)
      : pageCount;
  const isNotesValid = totalPages >= 3;
  const isDurationValid = studyDuration >= 30;
  const isSummaryValid = learningSummary.trim().length >= 15;
  const willBeCompleted = isNotesValid && isDurationValid && isSummaryValid && !!topic;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !topic) {
      setSubmitError('Please select a subject and specify the topic studied.');
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    try {
      const res = await api.submitDailyTask({
        subjectId,
        topic,
        studyDuration,
        learningSummary,
        remarks,
        pageCount: totalPages,
        noteFiles: uploadedFiles.length > 0 ? uploadedFiles : [
          {
            id: `nf_${Date.now()}`,
            fileName: `${topic.replace(/\s+/g, '_')}_Notes_${totalPages}Pages.pdf`,
            fileType: 'application/pdf',
            fileSize: totalPages * 350000,
            url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
            pageCount: totalPages,
          },
        ],
      });

      setSubmitSuccess(res.message);
      if (res.isCompleted) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      // Refresh task list
      fetchData();
      // Clear form
      setTopic('');
      setLearningSummary('');
      setRemarks('');
      setUploadedFiles([]);
    } catch (err: any) {
      setSubmitError(err.message || 'Submission failed. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayTask = tasks.find((t) => t.date === todayStr);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-indigo-600" />
            Mandatory Daily Study Task &amp; Notes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Log your daily academic study hours and upload 3–4 pages of verified study notes
          </p>
        </div>

        {todayTask && (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              todayTask.status === 'COMPLETED'
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
            }`}
          >
            {todayTask.status === 'COMPLETED' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Today’s Task Completed
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-600" /> Today’s Task Pending
              </>
            )}
          </span>
        )}
      </div>

      {/* Today's Validation Status Indicator Banner */}
      <div
        className={`p-5 rounded-3xl border shadow-xs transition-colors ${
          todayTask?.status === 'COMPLETED'
            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
            : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`p-3 rounded-2xl shrink-0 ${
                todayTask?.status === 'COMPLETED'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
              }`}
            >
              {todayTask?.status === 'COMPLETED' ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6 animate-pulse" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Daily Requirement Status
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    todayTask?.status === 'COMPLETED'
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-amber-200 text-amber-900'
                  }`}
                >
                  {todayTask ? todayTask.status : 'PENDING'}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                {todayTask?.status === 'COMPLETED'
                  ? 'Today’s Requirement Satisfied! (+35 Boost Points Awarded)'
                  : 'Upload your 3–4 pages of study notes to complete today’s task.'}
              </h3>

              <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-2 text-xs text-slate-600 dark:text-slate-300">
                <span>
                  Today’s Requirement:{' '}
                  <strong className="text-slate-900 dark:text-white">3–4 pages of notes</strong>
                </span>
                <span>•</span>
                <span>
                  Uploaded:{' '}
                  <strong
                    className={
                      (todayTask?.pageCount || 0) >= 3
                        ? 'text-emerald-600 font-bold'
                        : 'text-amber-600 font-bold'
                    }
                  >
                    {todayTask?.pageCount || 0} pages {(todayTask?.pageCount || 0) >= 3 ? '✅' : '⏳'}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Task Status:{' '}
                  <strong
                    className={
                      todayTask?.status === 'COMPLETED'
                        ? 'text-emerald-600 font-bold'
                        : 'text-amber-600 font-bold'
                    }
                  >
                    {todayTask ? todayTask.status : 'PENDING'}
                  </strong>
                </span>
              </div>

              {todayTask?.status === 'PENDING' && todayTask.pendingReason && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Reason: {todayTask.pendingReason}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Reward</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                +20 Task • +10 Notes • +5 Time
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Form and Live Validation Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Container (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Submit Daily Study Task
              </h3>
              <p className="text-xs text-slate-500">
                Fill in what you studied today and attach your 3–4 pages of notes
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Date: {todayStr}
            </span>
          </div>

          {submitSuccess && (
            <div className="mb-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-900 dark:text-emerald-200 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Submission Confirmed!</p>
                <p className="mt-0.5">{submitSuccess}</p>
              </div>
            </div>
          )}

          {submitError && (
            <div className="mb-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Submission Issue</p>
                <p className="mt-0.5">{submitError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Study Duration */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Study Duration <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {studyDuration} Minutes {studyDuration >= 30 ? '✅' : '⏳ (Min 30 mins)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="180"
                  step="5"
                  value={studyDuration}
                  onChange={(e) => setStudyDuration(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>15m</span>
                  <span>30m (Min)</span>
                  <span>60m</span>
                  <span>120m</span>
                  <span>180m</span>
                </div>
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Topic Studied <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Fourier Transforms &amp; Boundary Value Problems"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* What I Learned Today */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  What I Learned Today (Summary) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  {learningSummary.length} chars (min 15 required)
                </span>
              </div>
              <textarea
                required
                rows={3}
                value={learningSummary}
                onChange={(e) => setLearningSummary(e.target.value)}
                placeholder="Describe key concepts, theorems, or problem methodologies mastered during this study session..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            {/* Optional Remarks */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Optional Remarks / Doubts for Faculty
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Need clarification on example #4 in office hours"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
            </div>

            {/* Notes Upload Section (MANDATORY 3-4 PAGES) */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  Study Notes Upload (Mandatory 3–4 Pages Required)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAttachDemoNotes(3)}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-lg hover:bg-indigo-100"
                  >
                    + Attach 3-Page Sample
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAttachDemoNotes(4)}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-lg hover:bg-indigo-100"
                  >
                    + Attach 4-Page Sample
                  </button>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50 dark:bg-slate-800/20">
                <input
                  type="file"
                  id="note-file-upload"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="note-file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Click to select files or drag &amp; drop
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Supported formats: <strong className="text-slate-700 dark:text-slate-300">JPG, JPEG, PNG, PDF</strong> (Max 25MB per file)
                  </p>
                </label>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Attached Documents ({uploadedFiles.length} file(s), {totalPages} total pages):
                  </p>
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="font-semibold text-slate-900 dark:text-white truncate">
                          {file.fileName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({(file.fileSize / 1024).toFixed(0)} KB)
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-slate-500">Pages:</span>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={file.pageCount}
                            onChange={(e) => {
                              const val = Math.max(1, Number(e.target.value));
                              setUploadedFiles((prev) =>
                                prev.map((f) => (f.id === file.id ? { ...f, pageCount: val } : f))
                              );
                            }}
                            className="w-12 text-center text-xs py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFile(file.id)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                  willBeCompleted
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
                } disabled:opacity-50`}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Validating & Recording...'
                    : willBeCompleted
                    ? 'Submit & Validate Today’s Task (Complete ✅)'
                    : 'Submit Study Task (Pending Requirements ⏳)'}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Validation Checklist (1 col) */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              Automatic Validation Criteria
            </h4>

            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              The system automatically validates your submission. Full Boost Points are awarded once
              all 3 requirements are fulfilled.
            </p>

            <div className="mt-4 space-y-3">
              {/* Rule 1: Notes pages */}
              <div
                className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  isNotesValid
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 text-emerald-900 dark:text-emerald-200'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {isNotesValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold">3–4 Pages of Notes Uploaded</span>
                  <p className="text-[11px] mt-0.5">
                    Currently: {totalPages} page(s) {isNotesValid ? '(Satisfied)' : '(Pending 3-4 pages)'}
                  </p>
                </div>
              </div>

              {/* Rule 2: Study Duration >= 30 mins */}
              <div
                className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  isDurationValid
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 text-emerald-900 dark:text-emerald-200'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {isDurationValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold">Minimum 30 Minutes Logged</span>
                  <p className="text-[11px] mt-0.5">
                    Selected: {studyDuration} mins {isDurationValid ? '(Satisfied)' : '(Under 30 mins)'}
                  </p>
                </div>
              </div>

              {/* Rule 3: Learning Summary */}
              <div
                className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  isSummaryValid
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 text-emerald-900 dark:text-emerald-200'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {isSummaryValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold">Substantive Learning Summary</span>
                  <p className="text-[11px] mt-0.5">
                    {learningSummary.length >= 15 ? 'Summary provided' : 'Requires >= 15 characters'}
                  </p>
                </div>
              </div>
            </div>

            {/* Score points preview */}
            <div className="mt-5 p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs">
              <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Boost Points for this task:
              </span>
              <ul className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <li className="flex justify-between">
                  <span>Daily task completed:</span>
                  <strong className="text-indigo-600">+20 pts</strong>
                </li>
                <li className="flex justify-between">
                  <span>3–4 pages notes:</span>
                  <strong className="text-indigo-600">+10 pts</strong>
                </li>
                <li className="flex justify-between">
                  <span>30+ minutes logged:</span>
                  <strong className="text-indigo-600">+5 pts</strong>
                </li>
                <li className="flex justify-between pt-1 border-t border-indigo-200/60 font-bold text-slate-900 dark:text-white">
                  <span>Total Daily Gain:</span>
                  <span className="text-emerald-600">+35 pts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Submission History */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          Recent Study Submissions
        </h3>

        {tasks.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No study tasks submitted yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.map((task) => (
              <div key={task.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {task.subjectName}
                    </span>
                    <span className="text-slate-400 text-xs">•</span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {task.topic}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        task.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{task.learningSummary}</p>
                  {task.pendingReason && (
                    <p className="text-[11px] text-rose-500 mt-0.5">{task.pendingReason}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs shrink-0">
                  <div className="text-right">
                    <span className="text-slate-400 text-[11px] block">{task.date}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {task.pageCount} pages • {task.studyDuration}m
                    </span>
                  </div>
                  {task.boostPointsAwarded > 0 && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg">
                      +{task.boostPointsAwarded} pts
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
