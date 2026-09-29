import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  FileCheck,
  Flame,
  Sparkles,
  Trophy,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Search,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { AdminAnalytics, DailyTask } from '../../types/index.ts';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading admin analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-amber-600" />
            University Academic Management Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time student progress monitoring, official marks publication and task verification
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('admin-marks')}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            + Publish Marks
          </button>
          <button
            onClick={() => onNavigate('admin-students')}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
          >
            + Add Student
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigate('admin-students')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-indigo-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Enrolled Students
            </span>
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {analytics?.totalStudents ?? 4}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              {analytics?.activeStudents ?? 4} active
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across B.Tech branches</p>
        </div>

        {/* Submissions Today */}
        <div
          onClick={() => onNavigate('admin-submissions')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-amber-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Daily Submissions
            </span>
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <FileCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {analytics?.completedTasksToday ?? 1}
            </span>
            <span className="text-xs font-semibold text-amber-600">
              {analytics?.pendingTasksToday ?? 0} pending
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Today's note review queue</p>
        </div>

        {/* Average Boost Score */}
        <div
          onClick={() => onNavigate('admin-boost-scores')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-emerald-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Average Boost Score
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {analytics?.averageBoostScore ?? 600}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 1000 index</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Consistent study momentum</p>
        </div>

        {/* Students on Streak */}
        <div
          onClick={() => onNavigate('admin-boost-scores')}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-orange-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Students on Streak
            </span>
            <span className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {analytics?.studentsOnStreak ?? 2}
            </span>
            <span className="text-xs font-semibold text-orange-600">students 🔥</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">&gt;= 3 days streak recorded</p>
        </div>
      </div>

      {/* Grid: Subject Academic Performance & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Subject Performance Breakdown */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Curriculum Subject Performance
              </h3>
              <p className="text-xs text-slate-500">
                Departmental examination results and student pass rates
              </p>
            </div>
            <button
              onClick={() => onNavigate('admin-marks')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Manage Marks →
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {analytics?.subjectPerformance.map((sub, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {sub.subjectName}
                  </span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-500">Avg: {sub.averageMarks}/100</span>
                    <span
                      className={`font-extrabold ${
                        sub.passRate >= 80
                          ? 'text-emerald-600'
                          : sub.passRate >= 60
                          ? 'text-indigo-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {sub.passRate}% Pass Rate
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full ${
                      sub.passRate >= 80
                        ? 'bg-emerald-500'
                        : sub.passRate >= 60
                        ? 'bg-indigo-600'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${sub.passRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Quick Administration Actions & Queue */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Quick Administrative Tasks
            </h3>

            <div className="mt-4 space-y-2.5">
              <button
                onClick={() => onNavigate('admin-marks')}
                className="w-full p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">
                    Publish Student Marks
                  </p>
                  <p className="text-[11px] text-slate-500">Record midterm and semester marks</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => onNavigate('admin-submissions')}
                className="w-full p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600">
                    Verify Note Uploads
                  </p>
                  <p className="text-[11px] text-slate-500">Inspect 3–4 page submissions</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => onNavigate('admin-challenges')}
                className="w-full p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-left transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600">
                    Create Weekly Challenge
                  </p>
                  <p className="text-[11px] text-slate-500">Set rules, duration and reward points</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => onNavigate('admin-subjects')}
                className="w-full p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Subject Management
                  </p>
                  <p className="text-[11px] text-slate-500">Configure courses &amp; curriculum codes</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions Feed */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Recent Student Submissions Log
          </h3>
          <button
            onClick={() => onNavigate('admin-submissions')}
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            Review All Submissions →
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {analytics?.recentActivity.map((act) => (
            <div key={act.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center font-bold">
                  {act.type.includes('Completed') ? '✅' : '⏳'}
                </span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {act.studentName} — <span className="text-slate-500">{act.description}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{act.timestamp}</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  act.type.includes('Completed')
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {act.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
