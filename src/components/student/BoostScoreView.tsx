import React, { useState, useEffect } from 'react';
import {
  Flame,
  Sparkles,
  Trophy,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { BoostScoreData, BoostMilestone } from '../../types/index.ts';

interface BoostScoreViewProps {
  onNavigate: (tab: string) => void;
}

export const BoostScoreView: React.FC<BoostScoreViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [scoreData, setScoreData] = useState<(BoostScoreData & { milestones: BoostMilestone[]; disclaimer: string }) | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchScore = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const studentId = user.studentId || user.id;
      const res = await api.getBoostScore(studentId);
      setScoreData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
  }, [user]);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-semibold text-slate-500">
        Loading Boost Score metrics...
      </div>
    );
  }

  const currentScore = scoreData?.currentScore ?? 640;
  const strokeDashoffset = 283 - (283 * Math.min(currentScore, 1000)) / 1000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Flame className="w-6 h-6 text-amber-500" />
            Study Boost Score &amp; Engagement
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Holistic index measuring study consistency, note submissions and task completion (0–1000)
          </p>
        </div>

        <button
          onClick={() => onNavigate('daily-task')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-colors"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Earn Points in Daily Task</span>
        </button>
      </div>

      {/* Required Motivational Disclosure Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 text-xs text-indigo-950 dark:text-indigo-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Motivational Habit Metric Only:</span>{' '}
          {scoreData?.disclaimer ||
            'The Study Boost Score (0–1000) represents study consistency and routine engagement. It must NOT be interpreted as an official examination mark, university GPA, or guaranteed prediction of test grades.'}
        </div>
      </div>

      {/* Circular Gauge Card & KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Circular Gauge Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-xs flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Current Boost Score
          </span>

          <div className="relative w-48 h-48 my-2">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-indigo-600 transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {currentScore}
              </span>
              <span className="text-xs font-semibold text-slate-400">/ 1000 Points</span>
              <span className="mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                {scoreData?.currentMilestone}
              </span>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            {scoreData?.nextMilestone.remaining && scoreData.nextMilestone.remaining > 0 ? (
              <span>
                <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                  {scoreData.nextMilestone.remaining} points
                </strong>{' '}
                remaining to reach <strong>{scoreData.nextMilestone.title}</strong>
              </span>
            ) : (
              <span className="text-emerald-600 font-bold">Maximum Tier Reached!</span>
            )}
          </div>
        </div>

        {/* Scoring Breakdown & Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Metrics: Overall Current Success, Today & This Week */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Current Success
                  </span>
                  <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {scoreData?.currentSuccessPercentage ?? Math.round(currentScore / 10)}%
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600">
                    ▲ +{scoreData?.successTrend ?? 4}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-700"
                    style={{
                      width: `${scoreData?.currentSuccessPercentage ?? Math.round(currentScore / 10)}%`,
                    }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                Study engagement metric vs previous period
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Points Today
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    +{scoreData?.pointsToday || 0}
                  </span>
                  <span className="text-xs text-slate-400">pts</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">From validated submissions</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Points This Week
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    +{scoreData?.pointsThisWeek || 0}
                  </span>
                  <span className="text-xs text-slate-400">pts</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Weekly targets progress</p>
            </div>
          </div>

          {/* Scoring Rules Matrix */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span>Points Earning Structure</span>
              <span className="text-[11px] font-semibold text-slate-400">Fixed Point Safeguards</span>
            </h3>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Daily Task Completed</span>
                  <p className="text-[10px] text-slate-400">Core study logging satisfied</p>
                </div>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">+20 pts</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">3–4 Pages Notes</span>
                  <p className="text-[10px] text-slate-400">Verified handwritten / digital pages</p>
                </div>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">+10 pts</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">30+ Mins Study Logged</span>
                  <p className="text-[10px] text-slate-400">Dedicated focus session</p>
                </div>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">+5 pts</span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-900 dark:text-amber-200">7-Day Study Streak</span>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400">Consistency bonus</p>
                </div>
                <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm">+50 bonus</span>
              </div>

              <div className="sm:col-span-2 p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-purple-900 dark:text-purple-200">Weekly Challenge Completed</span>
                  <p className="text-[10px] text-purple-700 dark:text-purple-400">Completed all milestone days</p>
                </div>
                <span className="font-extrabold text-purple-600 dark:text-purple-400 text-sm">+100 pts</span>
              </div>
            </div>

            {/* Anti-cheat safeguarding note */}
            <p className="text-[11px] text-slate-400 mt-4 italic">
              * Safeguards Active: Students cannot re-upload duplicate materials or make repeated submissions on the same day to gain unlimited points. Points are awarded once per distinct validated study session.
            </p>
          </div>
        </div>
      </div>

      {/* Motivational Milestones Grid */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
          Boost Score Milestones
        </h3>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { points: 250, title: 'Getting Started', desc: 'Initial study routine setup and habit initiation' },
            { points: 500, title: 'Consistent', desc: 'Demonstrating sustained daily study tasks and notes' },
            { points: 750, title: 'Strong Progress', desc: 'Consecutive study streaks and multi-subject mastery' },
            { points: 1000, title: 'Maximum Score', desc: 'Peak study habit discipline across the college semester' },
          ].map((m) => {
            const isUnlocked = currentScore >= m.points;
            return (
              <div
                key={m.points}
                className={`p-5 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-slate-800 border-indigo-200 dark:border-indigo-800'
                    : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {m.points}
                  </span>
                  {isUnlocked ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <span className="text-xs text-slate-400 font-bold">Locked</span>
                  )}
                </div>

                <p className="font-bold text-xs text-indigo-700 dark:text-indigo-300 mt-2">
                  {m.title}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{m.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Score History Log */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
          Boost Score History Log
        </h3>

        {!scoreData?.history || scoreData.history.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No points transactions recorded yet.</p>
        ) : (
          <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
            {scoreData.history.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{item.reason}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.date}</p>
                  </div>
                </div>

                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                  +{item.points} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
