import React, { useState, useEffect } from 'react';
import {
  Flame,
  Award,
  CalendarCheck,
  Trophy,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  TrendingUp,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type {
  MarkRecord,
  DailyTask,
  NoteItem,
  BoostScoreData,
  StreakData,
  WeeklyChallenge,
  BoostSuggestion,
} from '../../types/index.ts';

interface StudentDashboardProps {
  onNavigate: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [boostScore, setBoostScore] = useState<BoostScoreData | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [todayTask, setTodayTask] = useState<DailyTask | null>(null);
  const [weeklyChallenge, setWeeklyChallenge] = useState<WeeklyChallenge | null>(null);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [marksSummary, setMarksSummary] = useState<any>(null);
  const [recentNotes, setRecentNotes] = useState<NoteItem[]>([]);
  const [suggestions, setSuggestions] = useState<BoostSuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const studentId = user.studentId || user.id;
      const todayStr = new Date().toISOString().split('T')[0];

      const [scoreRes, streakRes, tasksRes, challengesRes, marksRes, notesRes, boostRes] =
        await Promise.all([
          api.getBoostScore(studentId),
          api.getStreak(studentId),
          api.getDailyTasks({ studentId }),
          api.getChallenges(),
          api.getMarks({ studentId }),
          api.getNotes({ studentId }),
          api.getBoostSuggestions(studentId),
        ]);

      setBoostScore(scoreRes);
      setStreak(streakRes);

      // Check if task exists for today
      const today = tasksRes.find((t) => t.date === todayStr);
      setTodayTask(today || null);

      const activeChall = challengesRes.find((c) => c.isActive) || challengesRes[0];
      setWeeklyChallenge(activeChall || null);

      setMarks(marksRes.marks);
      setMarksSummary(marksRes.summary);
      setRecentNotes(notesRes.slice(0, 4));
      setSuggestions(boostRes.suggestions);
    } catch (err) {
      console.error('Error loading student dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs font-semibold text-slate-500">Loading your academic dashboard...</p>
      </div>
    );
  }

  const scoreVal = boostScore?.currentScore ?? 640;
  const currentSuccessPercentage =
    boostScore?.currentSuccessPercentage ?? Math.min(100, Math.round((scoreVal / 1000) * 100));
  const successTrend = boostScore?.successTrend ?? 4;
  const strokeDashoffset = 283 - (283 * Math.min(scoreVal, 1000)) / 1000;
  const isTodayCompleted = todayTask?.status === 'COMPLETED';

  return (
    <div className="space-y-6">
      {/* Student Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white p-6 sm:p-8 shadow-xl shadow-indigo-600/15">
        {/* Decorative backdrop shapes */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-40 -top-10 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <img
              src={
                user?.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.studentId}`
              }
              alt={user?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/30 shadow-lg shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{user?.name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-white/20 text-white backdrop-blur-xs">
                  {user?.studentId}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-100 mt-1 font-medium">
                {user?.course || 'Bachelor of Technology'} • {user?.branch || 'Computer Science'}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-indigo-200">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Semester {user?.semester || 4}
                </span>
                <span>•</span>
                <span>Enrolled: {user?.enrollmentYear || 2023}</span>
                <span>•</span>
                <span className="text-amber-300 font-semibold">
                  Milestone: {boostScore?.currentMilestone || 'Consistent'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('daily-task')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/30 transition-all hover:scale-102"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{isTodayCompleted ? 'View Today’s Task' : 'Submit Today’s Task'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top KPI Metrics: Boost Score, Overall Current Success, Streak, Today's Task, Weekly Challenge */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Boost Score */}
        <div
          onClick={() => onNavigate('boost-score')}
          className="group cursor-pointer rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Boost Score
              </span>
              <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {scoreVal}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">/ 1000</span>
                </div>
                <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                  +{boostScore?.pointsToday || 0} pts today
                </p>
              </div>

              {/* Circular mini gauge */}
              <div className="relative w-12 h-12 shrink-0">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className="stroke-slate-100 dark:stroke-slate-800"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className="stroke-indigo-600 transition-all duration-700 ease-out"
                    strokeWidth="10"
                    strokeDasharray="283"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-700 dark:text-slate-200">
                  {scoreVal}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="truncate">Next: {boostScore?.nextMilestone.title}</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform shrink-0">
              Details <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* 2. Overall Current Success % */}
        <div
          onClick={() => onNavigate('boost-score')}
          className="group cursor-pointer rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-600 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Overall Current Success
              </span>
              <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {currentSuccessPercentage}%
                </span>
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                  ▲ +{successTrend}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${currentSuccessPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="truncate">Habit indicator (not exam marks)</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform shrink-0">
              Score <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* 3. Current Streak */}
        <div
          onClick={() => onNavigate('boost-score')}
          className="group cursor-pointer rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-amber-400 dark:hover:border-amber-600 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Current Streak
            </span>
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Flame className="w-4 h-4" />
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {streak?.currentStreak ?? 7}
              </span>
              <span className="text-sm font-bold text-amber-500 flex items-center">
                Days 🔥
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
              Personal Best: {streak?.longestStreak ?? 12} consecutive days
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Completed: {streak?.totalCompletedDays ?? 24} days</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Calendar <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* 3. Today's Task Status */}
        <div
          onClick={() => onNavigate('daily-task')}
          className={`group cursor-pointer rounded-2xl border p-5 shadow-xs transition-all ${
            isTodayCompleted
              ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500'
              : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 hover:border-amber-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today's Task
            </span>
            <span
              className={`p-2 rounded-xl ${
                isTodayCompleted
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
              }`}
            >
              {isTodayCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-xl sm:text-2xl font-extrabold ${
                  isTodayCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {isTodayCompleted ? 'Completed ✅' : 'Pending ⏳'}
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              {isTodayCompleted
                ? `${todayTask?.subjectName} (${todayTask?.pageCount} pages uploaded)`
                : '3–4 pages of notes required'}
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">
              {isTodayCompleted ? `+${todayTask?.boostPointsAwarded || 35} pts earned` : 'Needs submission'}
            </span>
            <span
              className={`font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform ${
                isTodayCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {isTodayCompleted ? 'Review' : 'Upload Notes'} <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* 4. Weekly Challenge */}
        <div
          onClick={() => onNavigate('weekly-challenge')}
          className="group cursor-pointer rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-purple-400 dark:hover:border-purple-600 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Weekly Challenge
            </span>
            <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4" />
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {weeklyChallenge?.studentProgress?.completedDays ?? 4}
              </span>
              <span className="text-sm font-semibold text-slate-400">
                / {weeklyChallenge?.requiredCompletionDays ?? 7} Days
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.round(
                    ((weeklyChallenge?.studentProgress?.completedDays ?? 4) /
                      (weeklyChallenge?.requiredCompletionDays ?? 7)) *
                      100
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold text-purple-600 dark:text-purple-400">
              +{weeklyChallenge?.rewardPoints ?? 100} pts reward
            </span>
            <span className="font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Challenge <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left (Marks & How to Boost) | Right (Daily Task Banner & Notes) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Previous Marks Snapshot */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Academic Marks Overview
                  </h3>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Official Records
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official examination marks recorded by academic faculty
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Overall</span>
                  <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                    {marksSummary?.overallPercentage ?? 72.3}%
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('marks')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition-colors"
                >
                  Full Marks Sheet
                </button>
              </div>
            </div>

            {/* Subject Marks Grid */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {marks.slice(0, 6).map((mark) => {
                const isNeedsAttention = mark.percentage < 60;
                return (
                  <div
                    key={mark.id}
                    className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {mark.subjectName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {mark.marksObtained} / {mark.maximumMarks} marks
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-extrabold ${
                          isNeedsAttention
                            ? 'text-rose-600 dark:text-rose-400'
                            : mark.percentage >= 75
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-indigo-600 dark:text-indigo-400'
                        }`}
                      >
                        {mark.percentage}%
                      </span>
                      <span
                        className={`block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
                          isNeedsAttention
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : mark.percentage >= 75
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}
                      >
                        {mark.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

            {/* How to Boost Snapshot */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Personalized “How to Boost”
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tailored study activity recommendations based on your marks
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('how-to-boost')}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                View All Plans <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {suggestions.slice(0, 2).map((sug) => (
                <div
                  key={sug.subjectId}
                  className={`p-4 rounded-2xl border ${
                    sug.status === 'low'
                      ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/60'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {sug.subjectName}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          sug.status === 'low'
                            ? 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                            : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                        }`}
                      >
                        {sug.attentionLevel}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      Target: {sug.suggestedDailyMinutes} mins/day
                    </span>
                  </div>

                  <ul className="mt-2.5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {sug.recommendedActivities.slice(0, 2).map((act, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold shrink-0">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 mt-4 italic">
              Notice: Recommendations foster study discipline and do not guarantee examination marks.
            </p>
          </div>
        </div>

        {/* Right Column (1 col): Daily Submission CTA & Recent Notes */}
        <div className="space-y-6">
          {/* Daily Task Action Banner */}
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Daily Study Submission
              </span>

              <h4 className="text-lg font-bold mt-3">
                {isTodayCompleted ? 'Today’s Requirement Fulfilled!' : 'Upload 3–4 Pages of Notes'}
              </h4>

              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                {isTodayCompleted
                  ? `Great work! Your study log and notes for ${todayTask?.subjectName} are recorded and streak is protected.`
                  : 'Submit today’s topic, study duration and upload minimum 3–4 pages of handwritten/digital notes to earn points and maintain your streak.'}
              </p>

              <div className="mt-4 p-3 rounded-2xl bg-white/10 backdrop-blur-xs text-xs space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span>Today's Requirement:</span>
                  <span className="font-semibold text-white">3–4 pages of notes</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Uploaded:</span>
                  <span className="font-bold text-amber-300">
                    {todayTask?.pageCount || 0} pages {isTodayCompleted ? '✅' : '⏳'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Task Status:</span>
                  <span
                    className={`font-bold ${
                      isTodayCompleted ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {isTodayCompleted ? 'COMPLETED' : 'PENDING'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('daily-task')}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-amber-500/20"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>{isTodayCompleted ? 'View Full Submission' : 'Submit Today’s Notes'}</span>
              </button>
            </div>
          </div>

          {/* Recent Uploaded Notes */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Recent Notes</h4>
              </div>
              <button
                onClick={() => onNavigate('notes')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                All Notes
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {recentNotes.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No notes uploaded yet.</p>
              ) : (
                recentNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => onNavigate('notes')}
                    className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {note.topic}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{note.subjectName}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 shrink-0">
                      {note.pageCount} Pages
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
