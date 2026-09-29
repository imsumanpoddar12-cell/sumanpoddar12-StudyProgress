import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { DailyTask, Subject, User } from '../../types/index.ts';

export const AdminDailySubmissionsView: React.FC = () => {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Note inspector modal
  const [inspectTask, setInspectTask] = useState<DailyTask | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, subsRes, stusRes] = await Promise.all([
        api.getDailyTasks({
          studentId: selectedStudent !== 'all' ? selectedStudent : undefined,
          subjectId: selectedSubject !== 'all' ? selectedSubject : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          date: selectedDate || undefined,
        }),
        api.getSubjects(),
        api.getStudents(),
      ]);
      setTasks(tasksRes);
      setSubjects(subsRes);
      setStudents(stusRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStudent, selectedSubject, selectedStatus, selectedDate]);

  const handleVerify = async (task: DailyTask) => {
    try {
      await api.verifyDailyTask(task.id, {
        verified: !task.verifiedByAdmin,
      });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileCheck className="w-6 h-6 text-indigo-600" />
            Daily Task Submissions &amp; Note Audit
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Audit daily student study hours, verify 3–4 page handwritten note submissions and manage statuses
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Student:</span>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Students</option>
            {students.map((s) => (
              <option key={s.id} value={s.studentId}>
                {s.name} ({s.studentId})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Subject:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-xs text-indigo-600 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Submissions Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 sm:px-6">Student</th>
                <th className="py-3.5 px-4">Subject &amp; Topic</th>
                <th className="py-3.5 px-4 text-center">Duration</th>
                <th className="py-3.5 px-4 text-center">Notes Uploaded</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Admin Verification</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading submissions...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No submissions matching current criteria.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const student = students.find((s) => s.studentId === task.studentId);
                  return (
                    <tr key={task.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900 dark:text-white">
                        {student?.name || task.studentId}
                        <span className="block text-[10px] text-slate-400 font-mono font-normal">
                          {task.studentId} • {task.date}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {task.subjectName}
                        </span>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">{task.topic}</p>
                      </td>

                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {task.studyDuration} mins
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] ${
                            task.pageCount >= 3
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {task.pageCount} Pages {task.pageCount >= 3 ? '✅' : '⏳'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            task.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {task.status}
                        </span>
                        {task.pendingReason && (
                          <span className="block text-[9px] text-rose-500 max-w-xs truncate mx-auto mt-0.5">
                            {task.pendingReason}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleVerify(task)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                            task.verifiedByAdmin
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {task.verifiedByAdmin ? 'Verified ✓' : 'Mark Verified'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <button
                          onClick={() => setInspectTask(task)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                        >
                          Inspect Notes
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspector Modal */}
      {inspectTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Submission Audit — {inspectTask.subjectName}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Student: {inspectTask.studentId} • Date: {inspectTask.date} • {inspectTask.studyDuration} mins
                </p>
              </div>
              <button onClick={() => setInspectTask(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Topic Studied:</span>
                <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{inspectTask.topic}</p>
                <div className="mt-3">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">What I Learned Today:</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed whitespace-pre-wrap">
                    {inspectTask.learningSummary}
                  </p>
                </div>
              </div>

              {/* Uploaded Note Pages */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Attached Study Notes ({inspectTask.pageCount} Pages Verified):
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      inspectTask.pageCount >= 3 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Requirement {inspectTask.pageCount >= 3 ? 'Satisfied (>= 3 Pages)' : 'Pending (< 3 Pages)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: inspectTask.pageCount }).map((_, pIdx) => (
                    <div
                      key={pIdx}
                      className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800 shadow-xs flex flex-col justify-between h-40"
                    >
                      <div className="flex justify-between text-[10px] text-slate-400 border-b pb-1">
                        <span>Page {pIdx + 1}</span>
                        <span className="font-mono">{inspectTask.subjectName}</span>
                      </div>
                      <div className="my-2 space-y-1 text-[10px] text-slate-400">
                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded w-3/4" />
                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded w-full" />
                        <div className="h-8 bg-slate-50 dark:bg-slate-900 rounded border border-dashed flex items-center justify-center">
                          Handwritten Math / Circuit Notes Verified
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 text-right">Admin Audit Stamp</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setInspectTask(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleVerify(inspectTask);
                  setInspectTask(null);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {inspectTask.verifiedByAdmin ? 'Revoke Verification' : 'Approve & Verify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
