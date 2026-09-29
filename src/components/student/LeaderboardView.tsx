import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Flame,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Search,
  CheckCircle2,
  Lock,
  Globe,
  Eye,
  EyeOff,
  Medal,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { LeaderboardEntry } from '../../types/index.ts';

export const LeaderboardView: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [disclaimer, setDisclaimer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isPublic, setIsPublic] = useState<boolean>(user?.isPublicOnLeaderboard !== false);
  const [updatingVisibility, setUpdatingVisibility] = useState<boolean>(false);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.getLeaderboard();
      setLeaderboard(res.leaderboard);
      setDisclaimer(res.disclaimer);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleToggleVisibility = async () => {
    setUpdatingVisibility(true);
    const nextVal = !isPublic;
    try {
      await api.updateLeaderboardVisibility(nextVal);
      setIsPublic(nextVal);
      await refreshUser();
      fetchLeaderboard();
    } catch (err: any) {
      alert(err.message || 'Error updating privacy setting');
    } finally {
      setUpdatingVisibility(false);
    }
  };

  const filtered = leaderboard.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.branch && item.branch.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-500" />
            StudyProgress Public Leaderboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time rankings based on Boost Score consistency, study tasks and study streak
          </p>
        </div>

        {/* Public Profile Visibility Toggle Setting */}
        <div className="flex items-center gap-3 p-3 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Show on Leaderboard
            </span>
            <span className="text-[10px] text-slate-500">
              {isPublic ? 'Publicly visible' : 'Hidden from public'}
            </span>
          </div>

          <button
            onClick={handleToggleVisibility}
            disabled={updatingVisibility}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isPublic ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isPublic ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Metric & Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 text-xs text-indigo-950 dark:text-indigo-200 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Study Habit Indicator Notice:</span>{' '}
          {disclaimer ||
            'The Overall Current Success percentage (0–100%) and Boost Score (0–1000) represent study engagement and daily task completion. These metrics are NOT official examination marks or guaranteed grade predictions. Private details such as email, phone, passwords and private study notes are strictly never exposed.'}
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {leaderboard.length >= 3 && !searchTerm && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* #2 Rank */}
          {leaderboard[1] && (
            <div className="order-2 sm:order-1 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center text-center relative overflow-hidden">
              <span className="absolute top-3 left-3 text-xs font-black px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                #2 Rank
              </span>
              <img
                src={
                  leaderboard[1].avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${leaderboard[1].studentId}`
                }
                alt={leaderboard[1].name}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-300 dark:ring-slate-700 my-2"
              />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1 truncate max-w-full">
                {leaderboard[1].name}
              </h3>
              <p className="text-[11px] text-slate-500">{leaderboard[1].branch}</p>

              <div className="mt-3 flex items-center gap-3">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Boost Score</span>
                  <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                    {leaderboard[1].boostScore}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Success %</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {leaderboard[1].currentSuccessPercentage}%
                  </span>
                </div>
              </div>

              <span className="mt-3 text-xs font-bold text-amber-500 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> {leaderboard[1].streak} Days Streak
              </span>
            </div>
          )}

          {/* #1 Rank (Champion) */}
          {leaderboard[0] && (
            <div className="order-1 sm:order-2 p-6 rounded-3xl bg-gradient-to-b from-amber-500/10 via-white to-amber-500/5 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 border-2 border-amber-400 dark:border-amber-600 shadow-md flex flex-col items-center text-center relative overflow-hidden">
              <span className="absolute top-3 left-3 text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 flex items-center gap-1 shadow-xs">
                <CrownIcon className="w-3 h-3" /> #1 Champion
              </span>

              <div className="relative my-2">
                <img
                  src={
                    leaderboard[0].avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${leaderboard[0].studentId}`
                  }
                  alt={leaderboard[0].name}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-amber-400 shadow-xl"
                />
                <span className="absolute -bottom-2 -right-2 text-lg">👑</span>
              </div>

              <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1 truncate max-w-full">
                {leaderboard[0].name}
              </h3>
              <p className="text-xs text-slate-500">{leaderboard[0].branch}</p>

              <div className="mt-3 flex items-center gap-4 p-2 px-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60">
                <div className="text-center">
                  <span className="text-[10px] text-amber-800 dark:text-amber-300 block font-semibold uppercase">Boost Score</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {leaderboard[0].boostScore}
                  </span>
                </div>
                <div className="h-6 w-px bg-amber-300 dark:bg-amber-800" />
                <div className="text-center">
                  <span className="text-[10px] text-amber-800 dark:text-amber-300 block font-semibold uppercase">Success %</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {leaderboard[0].currentSuccessPercentage}%
                  </span>
                </div>
              </div>

              <span className="mt-3 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Flame className="w-4 h-4 text-amber-500" /> {leaderboard[0].streak} Days Streak 🔥
              </span>
            </div>
          )}

          {/* #3 Rank */}
          {leaderboard[2] && (
            <div className="order-3 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center text-center relative overflow-hidden">
              <span className="absolute top-3 left-3 text-xs font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                #3 Rank
              </span>
              <img
                src={
                  leaderboard[2].avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${leaderboard[2].studentId}`
                }
                alt={leaderboard[2].name}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-amber-300/60 my-2"
              />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1 truncate max-w-full">
                {leaderboard[2].name}
              </h3>
              <p className="text-[11px] text-slate-500">{leaderboard[2].branch}</p>

              <div className="mt-3 flex items-center gap-3">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Boost Score</span>
                  <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                    {leaderboard[2].boostScore}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Success %</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {leaderboard[2].currentSuccessPercentage}%
                  </span>
                </div>
              </div>

              <span className="mt-3 text-xs font-bold text-amber-500 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> {leaderboard[2].streak} Days Streak
              </span>
            </div>
          )}
        </div>
      )}

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search leaderboard by student or branch..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="text-xs text-slate-500">
          Showing <strong className="text-slate-900 dark:text-white">{filtered.length}</strong> public students
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 sm:px-6 text-center w-16">Rank</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Branch &amp; Term</th>
                <th className="py-3.5 px-4 text-center">Boost Score</th>
                <th className="py-3.5 px-4 text-center">Overall Current Success %</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Study Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Loading leaderboard...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No public student profiles found. Enable "Show on Leaderboard" in your profile to appear here.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isCurrentUser = item.studentId === user?.studentId || item.studentId === user?.id;

                  return (
                    <tr
                      key={item.studentId}
                      className={`transition-colors ${
                        isCurrentUser
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 font-semibold'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 sm:px-6 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-black text-xs ${
                            item.rank === 1
                              ? 'bg-amber-400 text-slate-950 shadow-xs'
                              : item.rank === 2
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                              : item.rank === 3
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                              : 'text-slate-500'
                          }`}
                        >
                          #{item.rank}
                        </span>
                      </td>

                      {/* Student Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item.avatar ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.studentId}`
                            }
                            alt={item.name}
                            className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/20"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {item.name}
                              </span>
                              {isCurrentUser && (
                                <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-indigo-600 text-white">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Verified Student
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Branch & Semester */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {item.branch || 'Engineering'} • Sem {item.semester || 4}
                      </td>

                      {/* Boost Score */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                          {item.boostScore}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium"> / 1000</span>
                      </td>

                      {/* Overall Current Success % */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                              {item.currentSuccessPercentage}%
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                              ▲ +{item.successTrend}%
                            </span>
                          </div>
                          {/* Mini visual bar */}
                          <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full"
                              style={{ width: `${item.currentSuccessPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Study Streak */}
                      <td className="py-3.5 px-4 sm:px-6 text-center font-bold text-amber-500">
                        <span className="inline-flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5" />
                          {item.streak} Days
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Protection Note */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>
            Privacy Protected: Email addresses, phone numbers, and private notes are completely excluded from public endpoints.
          </span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            Auto-Ranked by Boost Score
          </span>
        </div>
      </div>
    </div>
  );
};

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
    </svg>
  );
}
