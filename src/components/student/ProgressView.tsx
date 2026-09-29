import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  BookOpen,
  Flame,
  BarChart3,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { MarkRecord, DailyTask, NoteItem, BoostScoreData, StreakData } from '../../types/index.ts';

interface ProgressViewProps {
  onNavigate: (tab: string) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [boostScore, setBoostScore] = useState<BoostScoreData | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAll = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const studentId = user.studentId || user.id;
        const [marksRes, tasksRes, notesRes, scoreRes, streakRes] = await Promise.all([
          api.getMarks({ studentId }),
          api.getDailyTasks({ studentId }),
          api.getNotes({ studentId }),
          api.getBoostScore(studentId),
          api.getStreak(studentId),
        ]);
        setMarks(marksRes.marks);
        setTasks(tasksRes);
        setNotes(notesRes);
        setBoostScore(scoreRes);
        setStreak(streakRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading progress analytics...</div>;
  }

  const totalStudyMinutes = tasks.reduce((sum, t) => sum + (t.studyDuration || 0), 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);
  const totalNotesPages = notes.reduce((sum, n) => sum + (n.pageCount || 0), 0);
  const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            Comprehensive Academic Progress &amp; Habit Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Holistic cross-analysis of marks, study hours, daily task completion and note submissions
          </p>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Study</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {totalStudyHours} <span className="text-xs font-semibold text-slate-400">hrs</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">{totalStudyMinutes} mins logged</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Notes Pages</span>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {totalNotesPages}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Across {notes.length} submissions</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Task Rate</span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {taskCompletionRate}%
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">{completedTasksCount} completed</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Current Streak</span>
          <p className="text-2xl font-extrabold text-amber-500 mt-1">
            {streak?.currentStreak ?? 7} <span className="text-xs font-bold">Days</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Best: {streak?.longestStreak} days</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Boost Score</span>
          <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
            {boostScore?.currentScore ?? 640}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">/ 1000 index</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Evaluated</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {marks.length}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Subjects recorded</p>
        </div>
      </div>

      {/* Subject-Wise Improvement Chart */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Subject Performance &amp; Target Benchmarks
            </h3>
            <p className="text-xs text-slate-500">
              Recorded previous marks compared with semester mastery targets
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-3 h-3 rounded-md bg-indigo-600" /> Recorded Score
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-3 h-3 rounded-md bg-slate-200 dark:bg-slate-700" /> Target (80%)
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {marks.map((m) => {
            const isNeedAttention = m.percentage < 60;
            return (
              <div key={m.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">{m.subjectName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px] font-mono">
                      {m.marksObtained}/{m.maximumMarks}
                    </span>
                    <span
                      className={`font-extrabold ${
                        isNeedAttention ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {m.percentage}%
                    </span>
                  </div>
                </div>

                <div className="relative w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden">
                  <div
                    className={`h-3.5 rounded-full transition-all duration-700 ${
                      isNeedAttention ? 'bg-rose-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${m.percentage}%` }}
                  />
                  {/* Benchmark 80% line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                    style={{ left: '80%' }}
                    title="80% Target Benchmark"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Boost Score Growth History */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
          Boost Score Progress Log
        </h3>

        {!boostScore?.history || boostScore.history.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No points history yet.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {boostScore.history.map((h) => (
              <div
                key={h.id}
                className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{h.date}</span>
                    <span className="font-bold text-emerald-600">+{h.points} pts</span>
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">{h.reason}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
