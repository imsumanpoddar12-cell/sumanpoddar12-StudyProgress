import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  Flame,
  Award,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';

export const StudentProfileView: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [boostScore, setBoostScore] = useState<any>(null);
  const [streak, setStreak] = useState<any>(null);
  const [marksSummary, setMarksSummary] = useState<any>(null);
  const [isPublic, setIsPublic] = useState<boolean>(user?.isPublicOnLeaderboard !== false);
  const [updatingVis, setUpdatingVis] = useState<boolean>(false);
  const [visMessage, setVisMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const studentId = user.studentId || user.id;
    setIsPublic(user.isPublicOnLeaderboard !== false);
    Promise.all([
      api.getBoostScore(studentId),
      api.getStreak(studentId),
      api.getMarks({ studentId }),
    ]).then(([score, strk, mrks]) => {
      setBoostScore(score);
      setStreak(strk);
      setMarksSummary(mrks.summary);
    });
  }, [user]);

  const handleToggleLeaderboard = async () => {
    setUpdatingVis(true);
    setVisMessage(null);
    const nextVal = !isPublic;
    try {
      await api.updateLeaderboardVisibility(nextVal);
      setIsPublic(nextVal);
      await refreshUser();
      setVisMessage(nextVal ? 'Profile is now publicly visible on the leaderboard.' : 'Profile hidden from public leaderboard.');
      setTimeout(() => setVisMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error updating visibility');
    } finally {
      setUpdatingVis(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <img
            src={
              user?.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.studentId}`
            }
            alt={user?.name}
            className="w-24 h-24 rounded-3xl object-cover ring-4 ring-indigo-500/20 shadow-md"
          />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {user?.studentId}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Active Student
              </span>
            </div>

            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
              {user?.course || 'Bachelor of Technology (B.Tech)'}
            </p>
            <p className="text-xs text-slate-500">
              Department of {user?.branch || 'Computer Science & Engineering'} • Semester {user?.semester || 4}
            </p>

            <div className="mt-4 flex flex-wrap justify-center sm:justify-start items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user?.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {user?.phone || '+1 (555) 234-5678'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Enrollment: {user?.enrollmentYear || 2023}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Highlights Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
          <Award className="w-7 h-7 text-indigo-600 mx-auto mb-2" />
          <span className="text-[11px] font-bold text-slate-400 uppercase">Overall Marks</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {marksSummary?.overallPercentage ?? 72.3}%
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Academic Average</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
          <Sparkles className="w-7 h-7 text-amber-500 mx-auto mb-2" />
          <span className="text-[11px] font-bold text-slate-400 uppercase">Boost Score</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {boostScore?.currentScore ?? 640} <span className="text-xs font-normal text-slate-400">/ 1000</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-1">{boostScore?.currentMilestone || 'Consistent'}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
          <TrendingUp className="w-7 h-7 text-emerald-600 mx-auto mb-2" />
          <span className="text-[11px] font-bold text-slate-400 uppercase">Current Success</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {boostScore?.currentSuccessPercentage ?? 64}%
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Progress Indicator</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
          <Flame className="w-7 h-7 text-orange-500 mx-auto mb-2" />
          <span className="text-[11px] font-bold text-slate-400 uppercase">Active Streak</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {streak?.currentStreak ?? 7} <span className="text-xs font-normal text-slate-400">Days</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Best: {streak?.longestStreak ?? 12}d</p>
        </div>
      </div>

      {/* Public Profile & Leaderboard Privacy Setting */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Public Profile / Show on Leaderboard</span>
                {isPublic && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    Visible
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Choose whether your name, avatar, Boost Score, and Overall Current Success % appear on the public student leaderboard.
                Private data (password, email, phone number, private study notes) are strictly hidden and never made public.
              </p>
              {visMessage && (
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {visMessage}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleToggleLeaderboard}
            disabled={updatingVis}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none self-end sm:self-center ${
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

      {/* Identity & Privacy Notice */}
      <div className="p-5 rounded-3xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-900 dark:text-white">College Data Isolation Active</p>
          <p className="mt-0.5 leading-relaxed">
            Your account profile and study history are secured by student-level authentication. You can
            only access your own private records. Official curriculum revisions and marks are maintained
            by the university academic office.
          </p>
        </div>
      </div>
    </div>
  );
};
