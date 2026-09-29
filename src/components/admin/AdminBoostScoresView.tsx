import React, { useState, useEffect } from 'react';
import {
  Flame,
  Sparkles,
  Trophy,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { User } from '../../types/index.ts';

export const AdminBoostScoresView: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [studentScores, setStudentScores] = useState<Record<string, any>>({});
  const [studentStreaks, setStudentStreaks] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const loadScores = async () => {
      setLoading(true);
      try {
        const stuList = await api.getStudents();
        setStudents(stuList);

        const scoreMap: Record<string, any> = {};
        const streakMap: Record<string, any> = {};

        await Promise.all(
          stuList.map(async (stu) => {
            const sid = stu.studentId || stu.id;
            try {
              const [score, streak] = await Promise.all([
                api.getBoostScore(sid),
                api.getStreak(sid),
              ]);
              scoreMap[sid] = score;
              streakMap[sid] = streak;
            } catch {
              // ignore
            }
          })
        );

        setStudentScores(scoreMap);
        setStudentStreaks(streakMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadScores();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.studentId && s.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Flame className="w-6 h-6 text-amber-500" />
            Student Boost Scores &amp; Streaks Leaderboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitoring study consistency, point history and active habit streak retention
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student by name or ID..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 sm:px-6">Student</th>
                <th className="py-3.5 px-4">Branch &amp; Semester</th>
                <th className="py-3.5 px-4 text-center">Current Boost Score</th>
                <th className="py-3.5 px-4 text-center">Milestone Status</th>
                <th className="py-3.5 px-4 text-center">Current Streak</th>
                <th className="py-3.5 px-4 text-center">Longest Streak</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Completed Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading student score rankings...
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => {
                  const sid = stu.studentId || stu.id;
                  const score = studentScores[sid]?.currentScore ?? 0;
                  const milestone = studentScores[sid]?.currentMilestone ?? 'Getting Started';
                  const streak = studentStreaks[sid]?.currentStreak ?? 0;
                  const longest = studentStreaks[sid]?.longestStreak ?? 0;
                  const completedDays = studentStreaks[sid]?.totalCompletedDays ?? 0;

                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              stu.avatar ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${stu.studentId}`
                            }
                            alt={stu.name}
                            className="w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-500/20"
                          />
                          <div>
                            <p>{stu.name}</p>
                            <span className="text-[10px] text-slate-400 font-mono font-normal">
                              {stu.studentId}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {stu.branch} • Sem {stu.semester}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                          {score}
                        </span>
                        <span className="text-[10px] text-slate-400"> / 1000</span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          {milestone}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-amber-500">
                        {streak} Days 🔥
                      </td>

                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {longest} Days
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-center font-bold text-emerald-600">
                        {completedDays} Days
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
