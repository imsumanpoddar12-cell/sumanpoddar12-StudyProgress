import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Target,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  CalendarCheck,
  CheckSquare,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { BoostSuggestion } from '../../types/index.ts';

interface HowToBoostViewProps {
  onNavigate: (tab: string) => void;
}

export const HowToBoostView: React.FC<HowToBoostViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<BoostSuggestion[]>([]);
  const [disclaimer, setDisclaimer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const studentId = user.studentId || user.id;
        const res = await api.getBoostSuggestions(studentId);
        setSuggestions(res.suggestions);
        setDisclaimer(res.disclaimer);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, [user]);

  const toggleCheck = (id: string) => {
    setCompletedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const highAttentionList = suggestions.filter((s) => s.status === 'low');
  const moderateList = suggestions.filter((s) => s.status === 'moderate');
  const highList = suggestions.filter((s) => s.status === 'high');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-amber-500" />
            How to Boost Your Study Performance
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Personalized study habits, daily time allocation &amp; revision strategies derived from your
            marks
          </p>
        </div>

        <button
          onClick={() => onNavigate('daily-task')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-colors"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Apply in Daily Task</span>
        </button>
      </div>

      {/* Mandatory Academic Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-bold">Educational Study Guidance Notice:</span>{' '}
          {disclaimer ||
            'The recommendations below are structured to cultivate consistent study discipline and active learning habits. This system does NOT guarantee examination marks, grade outcomes, or university test scores.'}
        </div>
      </div>

      {/* Priority 1: Subjects Needing Immediate Attention */}
      {highAttentionList.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Subjects Requiring High Attention (Below 60%)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highAttentionList.map((sug) => (
              <div
                key={sug.subjectId}
                className="rounded-3xl bg-white dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-900/60 p-6 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                      {sug.attentionLevel}
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {sug.subjectName}
                    </h4>
                    <p className="text-xs text-rose-600 font-semibold mt-0.5">
                      Current Score: {sug.currentPercentage}%
                    </p>
                  </div>

                  <div className="text-right p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40">
                    <span className="text-[10px] text-slate-500 font-medium block">Suggested Time</span>
                    <span className="text-sm font-extrabold text-rose-700 dark:text-rose-300 flex items-center gap-1 justify-end">
                      <Clock className="w-3.5 h-3.5" />
                      {sug.suggestedDailyMinutes} mins/day
                    </span>
                  </div>
                </div>

                {/* Recommended Activities Checklist */}
                <div>
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                    Recommended Daily Activities
                  </h5>
                  <div className="space-y-1.5">
                    {sug.recommendedActivities.map((act, idx) => {
                      const checkKey = `${sug.subjectId}_act_${idx}`;
                      const isChecked = !!completedItems[checkKey];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleCheck(checkKey)}
                          className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 text-slate-500 line-through'
                              : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-0.5 rounded border-slate-300 text-indigo-600 w-3.5 h-3.5"
                          />
                          <span className="leading-relaxed">{act}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Weekly Improvement Target */}
                <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold mb-1">
                    <Target className="w-3.5 h-3.5" /> Weekly Target
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {sug.weeklyTarget}
                  </p>
                </div>

                {/* Revision Suggestions */}
                <div>
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    Revision &amp; Exam Strategy
                  </h5>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                    {sug.revisionSuggestions.map((rev, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {rev}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority 2: Moderate Subjects (60-74%) & Priority 3: Performing Well (>=75%) */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          Progress &amp; Maintenance Recommendations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...moderateList, ...highList].map((sug) => {
            const isHigh = sug.status === 'high';
            return (
              <div
                key={sug.subjectId}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isHigh
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                      }`}
                    >
                      {sug.attentionLevel}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Score: {sug.currentPercentage}%
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                    {sug.subjectName}
                  </h4>

                  <div className="mt-2 text-xs flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                    <Clock className="w-3.5 h-3.5" /> Suggested: {sug.suggestedDailyMinutes} mins daily
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Key Recommendations
                    </p>
                    <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      {sug.recommendedActivities.slice(0, 2).map((act, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-indigo-500 font-bold">•</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Target: </span>
                  {sug.weeklyTarget}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
