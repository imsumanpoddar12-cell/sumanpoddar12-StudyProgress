import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  FileText,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { WeeklyChallenge } from '../../types/index.ts';

export const AdminWeeklyChallengesView: React.FC = () => {
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingChallenge, setEditingChallenge] = useState<WeeklyChallenge | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formDurationDays, setFormDurationDays] = useState<number>(7);
  const [formRequiredPages, setFormRequiredPages] = useState<number>(3);
  const [formRequiredMinutes, setFormRequiredMinutes] = useState<number>(30);
  const [formCompletionDays, setFormCompletionDays] = useState<number>(5);
  const [formRewardPoints, setFormRewardPoints] = useState<number>(100);
  const [formStartDate, setFormStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState<string>(
    new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const data = await api.getChallenges();
      setChallenges(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleOpenCreate = () => {
    setEditingChallenge(null);
    setFormTitle('');
    setFormDescription('');
    setFormDurationDays(7);
    setFormRequiredPages(3);
    setFormRequiredMinutes(30);
    setFormCompletionDays(5);
    setFormRewardPoints(100);
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate(new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]);
    setFormIsActive(true);
    setShowModal(true);
  };

  const handleOpenEdit = (ch: WeeklyChallenge) => {
    setEditingChallenge(ch);
    setFormTitle(ch.title);
    setFormDescription(ch.description);
    setFormDurationDays(ch.durationDays);
    setFormRequiredPages(ch.requiredPagesPerDay);
    setFormRequiredMinutes(ch.requiredStudyMinutesPerDay);
    setFormCompletionDays(ch.requiredCompletionDays);
    setFormRewardPoints(ch.rewardPoints);
    setFormStartDate(ch.startDate);
    setFormEndDate(ch.endDate);
    setFormIsActive(ch.isActive);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: formTitle,
        description: formDescription,
        durationDays: formDurationDays,
        requiredPagesPerDay: formRequiredPages,
        requiredStudyMinutesPerDay: formRequiredMinutes,
        requiredCompletionDays: formCompletionDays,
        rewardPoints: formRewardPoints,
        startDate: formStartDate,
        endDate: formEndDate,
        isActive: formIsActive,
      };

      if (editingChallenge) {
        await api.updateChallenge(editingChallenge.id, payload);
      } else {
        await api.createChallenge(payload);
      }
      setShowModal(false);
      fetchChallenges();
    } catch (err: any) {
      alert(err.message || 'Error saving challenge');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this weekly challenge?')) return;
    try {
      await api.deleteChallenge(id);
      fetchChallenges();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-purple-600" />
            Weekly Challenges Configuration
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create custom academic milestones, configure reward points and establish daily criteria
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Challenge</span>
        </button>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((ch) => (
          <div
            key={ch.id}
            className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    ch.isActive
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {ch.isActive ? 'Active Challenge' : 'Inactive'}
                </span>

                <span className="font-extrabold text-xs text-amber-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> +{ch.rewardPoints} Points
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">{ch.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{ch.description}</p>

              {/* Parameters Breakdown */}
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration:</span>
                  <span className="font-bold">{ch.durationDays} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Required Days:</span>
                  <span className="font-bold">{ch.requiredCompletionDays} of {ch.durationDays} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Required Pages/Day:</span>
                  <span className="font-bold">{ch.requiredPagesPerDay} Pages</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Daily Study Time:</span>
                  <span className="font-bold">&gt;= {ch.requiredStudyMinutesPerDay} mins</span>
                </div>
                <div className="flex justify-between text-[11px] pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400">Date Range:</span>
                  <span className="font-mono text-slate-500">{ch.startDate} to {ch.endDate}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(ch)}
                className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Edit Challenge"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(ch.id)}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Delete Challenge"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingChallenge ? 'Edit Weekly Challenge' : 'Create Weekly Challenge'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Challenge Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. 7-Day Study Streak"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description &amp; Goals</label>
                <textarea
                  required
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Specify rules for students..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={formDurationDays}
                    onChange={(e) => setFormDurationDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Required Completion Days</label>
                  <input
                    type="number"
                    min="1"
                    max={formDurationDays}
                    required
                    value={formCompletionDays}
                    onChange={(e) => setFormCompletionDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Required Notes (Pages/Day)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formRequiredPages}
                    onChange={(e) => setFormRequiredPages(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Daily Study (Minutes)</label>
                  <input
                    type="number"
                    min="15"
                    max="240"
                    required
                    value={formRequiredMinutes}
                    onChange={(e) => setFormRequiredMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Reward Points</label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    required
                    value={formRewardPoints}
                    onChange={(e) => setFormRewardPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-amber-600"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600"
                    />
                    <span className="font-semibold">Active Challenge</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md"
                >
                  Save Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
