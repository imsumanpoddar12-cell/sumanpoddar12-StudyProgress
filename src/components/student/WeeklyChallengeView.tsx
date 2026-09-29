import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Flame,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { WeeklyChallenge } from '../../types/index.ts';

interface WeeklyChallengeViewProps {
  onNavigate: (tab: string) => void;
}

export const WeeklyChallengeView: React.FC<WeeklyChallengeViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchChallenges = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.getChallenges();
      setChallenges(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [user]);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-semibold text-slate-500">
        Loading weekly challenges...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-purple-600" />
            Weekly Academic Challenges &amp; Boost Milestones
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete structured weekly habit goals to unlock high-yield Boost Score bonuses
          </p>
        </div>

        <button
          onClick={() => onNavigate('daily-task')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          <span>Contribute to Challenge</span>
        </button>
      </div>

      {/* Challenges List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((ch) => {
          const compDays = ch.studentProgress?.completedDays ?? 0;
          const reqDays = ch.requiredCompletionDays;
          const isCompleted = ch.studentProgress?.isCompleted ?? false;
          const percent = Math.min(100, Math.round((compDays / reqDays) * 100));

          return (
            <div
              key={ch.id}
              className={`rounded-3xl border p-6 flex flex-col justify-between shadow-xs transition-all ${
                isCompleted
                  ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/40 dark:from-emerald-950/30 dark:to-slate-800 border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      isCompleted
                        ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                    }`}
                  >
                    {isCompleted ? 'Completed 🏆' : 'In Progress'}
                  </span>

                  <span className="flex items-center gap-1 text-xs font-extrabold text-amber-500">
                    <Sparkles className="w-3.5 h-3.5" /> +{ch.rewardPoints} Points
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">
                  {ch.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {ch.description}
                </p>

                {/* Requirements list */}
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5" /> Target Days:
                    </span>
                    <strong className="text-slate-900 dark:text-white">{ch.requiredCompletionDays} Days</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <FileText className="w-3.5 h-3.5" /> Required Notes:
                    </span>
                    <strong className="text-slate-900 dark:text-white">{ch.requiredPagesPerDay}–4 Pages daily</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5" /> Study Time:
                    </span>
                    <strong className="text-slate-900 dark:text-white">&gt;= {ch.requiredStudyMinutesPerDay} mins/day</strong>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Progress:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {compDays} / {reqDays} Days ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-700 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-purple-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer action */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Ends: {ch.endDate}
                </span>

                {isCompleted ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Reward Awarded!
                  </span>
                ) : (
                  <button
                    onClick={() => onNavigate('daily-task')}
                    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                  >
                    Complete Today’s Task <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
