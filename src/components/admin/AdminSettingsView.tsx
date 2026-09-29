import React, { useState } from 'react';
import {
  Settings,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Database,
  Calendar,
  Sparkles,
  Lock,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { api } from '../../services/api.ts';

export const AdminSettingsView: React.FC = () => {
  const [resetting, setResetting] = useState<boolean>(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.trim().length < 4) {
      setPasswordError('New password must be at least 4 characters.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.changeAdminPassword(currentPassword, newPassword);
      setPasswordSuccess(res.message || 'Administrator password successfully updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update admin password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleResetData = async () => {
    if (
      !confirm(
        'Are you sure you want to reset all data back to original seed demonstration state? This will restore Alex Turner and default marks.'
      )
    )
      return;

    setResetting(true);
    setResetMessage(null);
    try {
      const res = await api.resetDemoData();
      setResetMessage(res.message);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Error resetting data');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          Academic System Settings &amp; Configuration
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Scoring parameters, academic session control and database maintenance
        </p>
      </div>

      {resetMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Scoring Configuration Matrix Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Active Study Boost Scoring Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Daily Study Task Complete:</span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">+20 Points</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300">3–4 Pages Notes Verified:</span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">+10 Points</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300">30+ Mins Study Logged:</span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">+5 Points</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300">7-Day Study Streak Bonus:</span>
            <span className="font-extrabold text-amber-600 dark:text-amber-400">+50 Points</span>
          </div>

          <div className="sm:col-span-2 p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex justify-between">
            <span className="font-semibold text-purple-900 dark:text-purple-200">Weekly Challenge Completion:</span>
            <span className="font-extrabold text-purple-600 dark:text-purple-400">+100 Points</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 italic">
          Scoring rules prevent duplicate point accumulation on repeated uploads within the same calendar day.
        </p>
      </div>

      {/* Change Admin Password Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Administrator Password &amp; Credentials
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Admin ID: <strong className="text-amber-600 dark:text-amber-400 font-mono">suman01</strong>
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Manage and update the administrative credentials for <strong>Suman Kumar (Poddar)</strong> (<code>imsumanpoddar12@gmail.com</code>).
          The password is kept confidential and encrypted on the backend.
        </p>

        {passwordSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 4 characters"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-colors disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            <span>{passwordLoading ? 'Updating Password...' : 'Change Admin Password'}</span>
          </button>
        </form>
      </div>

      {/* Database Reset Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Database className="w-4 h-4 text-rose-600" />
          Demonstration Database Reset
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Restore the database back to clean university demo data. This reloads students Alex Turner,
          Priya Sharma, Marcus Chen, course marks, and default 7-day study streak history.
        </p>

        <button
          onClick={handleResetData}
          disabled={resetting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{resetting ? 'Resetting Database...' : 'Reset to Default Demo State'}</span>
        </button>
      </div>

      {/* Security Architecture */}
      <div className="p-5 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Institutional Security &amp; Access Controls Active</p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Role-Based Access Control (RBAC) is enforced on all endpoints. Students have strict isolation
            to their own academic records, submissions, and notes. Official marks can only be added or
            amended through administrator credentials.
          </p>
        </div>
      </div>
    </div>
  );
};
