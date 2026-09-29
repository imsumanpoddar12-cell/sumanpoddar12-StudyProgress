import React, { useState, useEffect } from 'react';
import {
  Flame,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Trophy,
  ArrowRight,
  Sparkles,
  CalendarCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { StreakData } from '../../types/index.ts';

interface StudyStreakViewProps {
  onNavigate: (tab: string) => void;
}

export const StudyStreakView: React.FC<StudyStreakViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDay, setSelectedDay] = useState<any>(null);

  const fetchStreak = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const studentId = user.studentId || user.id;
      const res = await api.getStreak(studentId);
      setStreak(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreak();
  }, [user]);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-semibold text-slate-500">
        Loading study streak statistics...
      </div>
    );
  }

  const currentStreak = streak?.currentStreak ?? 7;
  const longestStreak = streak?.longestStreak ?? 12;
  const totalCompleted = streak?.totalCompletedDays ?? 24;
  const missedDays = streak?.missedDays ?? 3;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Flame className="w-6 h-6 text-amber-500" />
            Study Streak &amp; Daily Habit Calendar
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Maintain daily study momentum by validating 3–4 pages of notes each consecutive day
          </p>
        </div>

        <button
          onClick={() => onNavigate('daily-task')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-colors"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Complete Today’s Task</span>
        </button>
      </div>

      {/* KPI Cards: Current Streak, Longest Streak, Total Completed, Missed Days */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Streak */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
              Current Streak
            </span>
            <Flame className="w-5 h-5 text-amber-200" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black">{currentStreak}</span>
              <span className="text-sm font-bold text-amber-100">Days Active 🔥</span>
            </div>
            <p className="text-[11px] text-amber-100 mt-1">Consecutive task completion</p>
          </div>
          <div className="text-[10px] text-amber-100 font-semibold">
            {currentStreak >= 7 ? '+50 streak bonus earned!' : `${7 - currentStreak} days to next +50 bonus`}
          </div>
        </div>

        {/* Longest Streak */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Longest Streak
            </span>
            <Trophy className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white">
                {longestStreak}
              </span>
              <span className="text-sm font-bold text-slate-500">Days</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Personal all-time college record</p>
          </div>
          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
            Target: Beat 15 consecutive days
          </div>
        </div>

        {/* Total Completed Days */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Completed
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white">
                {totalCompleted}
              </span>
              <span className="text-sm font-bold text-slate-500">Days</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Satisfied all daily study notes requirements</p>
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {(totalCompleted / 30 * 100).toFixed(0)}% month completion rate
          </div>
        </div>

        {/* Missed Days */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Missed Days
            </span>
            <XCircle className="w-5 h-5 text-slate-400" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white">
                {missedDays}
              </span>
              <span className="text-sm font-bold text-slate-500">Days</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Incomplete submissions</p>
          </div>
          <div className="text-[10px] text-slate-400 font-semibold">
            Protected by daily reminders
          </div>
        </div>
      </div>

      {/* Interactive 30-Day Streak Calendar */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Recent 30-Day Study Consistency Calendar
            </h3>
            <p className="text-xs text-slate-500">
              Click on any day to inspect recorded study duration and subject details
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-3 h-3 rounded-md bg-emerald-500" /> Completed
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-3 h-3 rounded-md bg-amber-400" /> Pending
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-3 h-3 rounded-md bg-slate-200 dark:bg-slate-700" /> Missed
            </span>
          </div>
        </div>

        {/* Days Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2.5">
          {streak?.calendar.map((item, idx) => {
            const isSelected = selectedDay?.date === item.date;
            const isCompleted = item.status === 'completed';
            const isPending = item.status === 'pending';

            return (
              <div
                key={item.date || idx}
                onClick={() => setSelectedDay(item)}
                className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 scale-105 shadow-md'
                    : 'hover:scale-102'
                } ${
                  isCompleted
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
                    : isPending
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-500'
                }`}
              >
                <span className="text-[10px] font-mono text-slate-400 block">
                  {item.date.slice(5)}
                </span>
                <span className="text-base my-1 block">
                  {isCompleted ? '🔥' : isPending ? '⏳' : '⚪'}
                </span>
                <span className="text-[11px] font-bold block truncate">
                  {isCompleted ? `${item.studyDuration || 45}m` : item.status}
                </span>
              </div>
            );
          })}
        </div>

        {/* Day Detail Inspector */}
        {selectedDay && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedDay.status === 'completed' ? '🔥' : '⏳'}</span>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  Date: {selectedDay.date} — Status:{' '}
                  <span className="uppercase text-indigo-600 dark:text-indigo-400">
                    {selectedDay.status}
                  </span>
                </p>
                <p className="text-slate-500 mt-0.5">
                  {selectedDay.status === 'completed'
                    ? `Logged ${selectedDay.studyDuration || 45} minutes in ${selectedDay.subjectName || 'Curriculum Subject'}. Full 3-page notes validated.`
                    : 'Task was not completed on this date.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
