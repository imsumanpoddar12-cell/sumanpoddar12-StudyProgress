import React, { useState, useEffect } from 'react';
import {
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lock,
  BarChart3,
  Search,
  Filter,
  Info,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { MarkRecord } from '../../types/index.ts';

interface PreviousMarksViewProps {
  onNavigate: (tab: string) => void;
}

export const PreviousMarksView: React.FC<PreviousMarksViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const fetchMarks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const studentId = user.studentId || user.id;
      const res = await api.getMarks({ studentId });
      setMarks(res.marks);
      setSummary(res.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarks();
  }, [user]);

  const filteredMarks = marks.filter((m) => {
    const matchesSearch =
      m.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.subjectCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      selectedFilter === 'all'
        ? true
        : selectedFilter === 'needs_attention'
        ? m.percentage < 60
        : selectedFilter === 'distinction'
        ? m.percentage >= 75
        : selectedFilter === 'pass'
        ? m.percentage >= 50 && m.percentage < 75
        : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-indigo-600" />
            Previous Marks &amp; Academic Records
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official recorded marks across all curriculum subjects and terms
          </p>
        </div>

        {/* Security badge: Students cannot modify marks */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Lock className="w-3.5 h-3.5 text-amber-500" />
          <span>Official Academic Records • Read-Only</span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Percentage */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Overall Percentage
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {summary?.overallPercentage ?? 0}%
            </span>
            <span className="text-xs font-semibold text-slate-400">cumulative</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across {marks.length} evaluated subjects</p>
        </div>

        {/* Highest Performing Subject */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Highest Performing
          </span>
          <div className="mt-2">
            <p className="text-base font-bold text-slate-900 dark:text-white truncate">
              {summary?.highestSubject?.subjectName || 'None'}
            </p>
            <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {summary?.highestSubject ? `${summary.highestSubject.percentage}%` : 'N/A'}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {summary?.highestSubject?.status || 'Exemplary performance'}
          </p>
        </div>

        {/* Subjects Requiring More Attention */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Needs Attention
          </span>
          <div className="mt-2">
            <p className="text-base font-bold text-slate-900 dark:text-white truncate">
              {summary?.lowestSubject?.subjectName || 'None'}
            </p>
            <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
              {summary?.lowestSubject ? `${summary.lowestSubject.percentage}%` : 'N/A'}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {summary?.requiresAttentionCount || 0} subject(s) below 60%
          </p>
        </div>

        {/* Boost Recommendation CTA */}
        <div
          onClick={() => onNavigate('how-to-boost')}
          className="cursor-pointer p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/60 dark:from-indigo-950/40 dark:to-slate-800/40 border border-indigo-200 dark:border-indigo-800 shadow-xs hover:border-indigo-400 transition-all flex flex-col justify-between"
        >
          <div>
            <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Boost Recommendations
            </span>
            <p className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
              Personalized Plan Generated
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Tailored study hours and practice sets based on marks.
            </p>
          </div>
          <div className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            View Study Plan →
          </div>
        </div>
      </div>

      {/* Visual Chart Section: Subject-Wise Performance Bar Chart */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Subject-Wise Performance Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Comparative percentage scores across all curriculum modules
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> &gt;=75%
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500" /> 60-74%
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" /> &lt;60%
            </span>
          </div>
        </div>

        {/* Visual Bar representation */}
        <div className="mt-6 space-y-4">
          {marks.map((mark) => {
            const isLow = mark.percentage < 60;
            const isHigh = mark.percentage >= 75;
            const barColor = isLow
              ? 'bg-rose-500'
              : isHigh
              ? 'bg-emerald-500'
              : 'bg-indigo-600';

            return (
              <div key={mark.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {mark.subjectName}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">({mark.subjectCode})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-[11px]">
                      {mark.marksObtained} / {mark.maximumMarks} marks
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs w-10 text-right">
                      {mark.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress track */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className={`${barColor} h-3 rounded-full transition-all duration-700`}
                    style={{ width: `${mark.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official Marks Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search subject or code..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Marks</option>
              <option value="distinction">Distinction (75%+)</option>
              <option value="pass">Pass (50-74%)</option>
              <option value="needs_attention">Needs Attention (Below 60%)</option>
            </select>
          </div>
        </div>

        {/* Table view */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 sm:px-6">Subject</th>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Exam Type</th>
                <th className="py-3.5 px-4 text-center">Previous Marks</th>
                <th className="py-3.5 px-4 text-center">Maximum Marks</th>
                <th className="py-3.5 px-4 text-center">Percentage</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading marks...
                  </td>
                </tr>
              ) : filteredMarks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No matching marks records found.
                  </td>
                </tr>
              ) : (
                filteredMarks.map((m) => {
                  const isNeedsAttention = m.percentage < 60;
                  const isDistinction = m.percentage >= 75;

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900 dark:text-white">
                        {m.subjectName}
                        {m.remarks && (
                          <p className="text-[10px] font-normal text-slate-500 mt-0.5 line-clamp-1">
                            {m.remarks}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">{m.subjectCode}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{m.examType}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-white">
                        {m.marksObtained}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500">{m.maximumMarks}</td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-slate-900 dark:text-white">
                        <span
                          className={
                            isNeedsAttention
                              ? 'text-rose-600 dark:text-rose-400'
                              : isDistinction
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-indigo-600 dark:text-indigo-400'
                          }
                        >
                          {m.percentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isNeedsAttention
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : isDistinction
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Protection Footer Disclaimer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-500">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            <strong>Official Record Notice:</strong> Students are strictly not permitted to modify
            official examination marks. Any corrections or re-evaluation adjustments must be verified
            and updated by authorized academic administrators or course faculty.
          </span>
        </div>
      </div>
    </div>
  );
};
