import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  Award,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { AdminAnalytics } from '../../types/index.ts';

export const AdminAnalyticsView: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getAdminAnalytics().then(setAnalytics).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading university analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          University Academic Analytics &amp; Habit Intelligence
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Aggregate evaluation of study habits, note submission integrity and departmental performance
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Active Engagement</span>
          <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {analytics?.activeStudents} / {analytics?.totalStudents}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">100% active roster</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Daily Submissions</span>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {analytics?.completedTasksToday}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">{analytics?.pendingTasksToday} pending review</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Avg Boost Score</span>
          <p className="text-3xl font-extrabold text-amber-500 mt-1">
            {analytics?.averageBoostScore}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Consistent band benchmark</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Students on Streak</span>
          <p className="text-3xl font-extrabold text-orange-500 mt-1">
            {analytics?.studentsOnStreak}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">High retention group</p>
        </div>
      </div>

      {/* Curriculum Subject Pass Rate Analytics */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span>Subject Average Marks &amp; Pass Rate Breakdown</span>
          <span className="text-xs font-semibold text-slate-400">Semester 3 &amp; 4 Modules</span>
        </h3>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {analytics?.subjectPerformance.map((sub, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {sub.subjectName}
                </span>
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                  {sub.averageMarks} / 100 avg
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Pass Rate:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{sub.passRate}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full ${
                      sub.passRate >= 75 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${sub.passRate}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Calculated across verified examination answer sheets.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
