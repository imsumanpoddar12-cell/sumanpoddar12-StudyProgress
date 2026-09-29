import React, { useState, useEffect, useRef } from 'react';
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
  Camera,
  Upload,
  LogIn,
  UserPlus,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';

export const StudentProfileView: React.FC = () => {
  const { user, login, register, updateProfile, logout, refreshUser } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'signup' | 'login'>('profile');

  // Profile data states
  const [boostScore, setBoostScore] = useState<any>(null);
  const [streak, setStreak] = useState<any>(null);
  const [marksSummary, setMarksSummary] = useState<any>(null);
  const [isPublic, setIsPublic] = useState<boolean>(user?.isPublicOnLeaderboard !== false);
  const [updatingVis, setUpdatingVis] = useState<boolean>(false);
  const [visMessage, setVisMessage] = useState<string | null>(null);

  // Photo upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signupFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [photoMessage, setPhotoMessage] = useState<string | null>(null);

  // Sign up form state
  const [signupPhoto, setSignupPhoto] = useState<string>('');
  const [signupName, setSignupName] = useState<string>('');
  const [signupPhone, setSignupPhone] = useState<string>('');
  const [signupEmail, setSignupEmail] = useState<string>('');
  const [signupBranch, setSignupBranch] = useState<string>('Computer Science & Engineering');
  const [signupCourse, setSignupCourse] = useState<string>('Bachelor of Technology (B.Tech)');
  const [signupSemester, setSignupSemester] = useState<number>(1);
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState<string>('');
  const [showSignupPass, setShowSignupPass] = useState<boolean>(false);
  const [signupLoading, setSignupLoading] = useState<boolean>(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPass, setShowLoginPass] = useState<boolean>(false);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const studentId = user.studentId || user.id;
    setIsPublic(user.isPublicOnLeaderboard !== false);
    Promise.all([
      api.getBoostScore(studentId).catch(() => null),
      api.getStreak(studentId).catch(() => null),
      api.getMarks({ studentId }).catch(() => null),
    ]).then(([score, strk, mrks]) => {
      if (score) setBoostScore(score);
      if (strk) setStreak(strk);
      if (mrks) setMarksSummary(mrks.summary);
    });
  }, [user]);

  // Helper to downscale and read image as Base64 Data URL
  const processImageFile = (file: File, callback: (dataUrl: string) => void) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, or WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Resize to maximum 300x300 for crisp display and minimal payload
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          callback(dataUrl);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setPhotoMessage(null);
    processImageFile(file, async (dataUrl) => {
      try {
        await updateProfile({ avatar: dataUrl });
        setPhotoMessage('Profile photo updated successfully!');
        setTimeout(() => setPhotoMessage(null), 3000);
      } catch (err: any) {
        alert(err.message || 'Error uploading photo');
      } finally {
        setUploadingPhoto(false);
      }
    });
  };

  const handleSignupPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file, (dataUrl) => {
      setSignupPhoto(dataUrl);
    });
  };

  const handleToggleLeaderboard = async () => {
    setUpdatingVis(true);
    setVisMessage(null);
    const nextVal = !isPublic;
    try {
      await api.updateLeaderboardVisibility(nextVal);
      setIsPublic(nextVal);
      await refreshUser();
      setVisMessage(
        nextVal
          ? 'Profile is now publicly visible on the leaderboard.'
          : 'Profile hidden from public leaderboard.'
      );
      setTimeout(() => setVisMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error updating visibility');
    } finally {
      setUpdatingVis(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    setSignupSuccess(null);

    if (!signupName.trim()) {
      setSignupError('Please enter your full name.');
      return;
    }

    if (!signupPhone.trim() && !signupEmail.trim()) {
      setSignupError('Please provide either a mobile phone number or an email address.');
      return;
    }

    if (signupPassword.length < 4) {
      setSignupError('Password must be at least 4 characters long.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match. Please verify.');
      return;
    }

    setSignupLoading(true);
    try {
      await register({
        name: signupName.trim(),
        phone: signupPhone.trim(),
        email: signupEmail.trim(),
        branch: signupBranch,
        course: signupCourse,
        semester: Number(signupSemester),
        password: signupPassword.trim(),
        avatar: signupPhoto || undefined,
      });

      setSignupSuccess('Account registered successfully! Welcome to StudyProgress.');
      setTimeout(() => {
        setActiveSubTab('profile');
      }, 1200);
    } catch (err: any) {
      setSignupError(err.message || 'Error creating account. Please try again.');
    } finally {
      setSignupLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setLoginError('Please enter your Phone, Email, or Student ID and password.');
      return;
    }

    setLoginLoading(true);
    try {
      await login(loginIdentifier.trim(), loginPassword.trim(), 'student');
      setLoginSuccess('Signed in successfully! Loading your personal study portal...');
      setTimeout(() => {
        setActiveSubTab('profile');
      }, 1000);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid login credentials. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Navigation Switcher: Profile / Sign Up / Login */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'profile'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>My Active Profile</span>
          </button>

          <button
            onClick={() => setActiveSubTab('signup')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'signup'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Student Sign Up</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold">
              Photo Upload
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('login')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'login'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Student Login</span>
          </button>
        </div>

        <button
          onClick={logout}
          className="text-xs font-bold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5 ml-auto"
          title="Switch account or logout"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Switch Account</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 1: MY PROFILE */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'profile' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Profile Header Card */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              {/* Avatar with Photo Upload Button */}
              <div className="relative group shrink-0">
                <img
                  src={
                    user?.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.studentId || 'STU001'}`
                  }
                  alt={user?.name || 'Student Avatar'}
                  className="w-28 h-28 rounded-3xl object-cover ring-4 ring-indigo-500/20 shadow-md transition-transform group-hover:scale-102"
                />

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleProfilePhotoChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute -bottom-2 -right-2 p-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center border-2 border-white dark:border-slate-900 cursor-pointer"
                  title="Upload or Change Photo"
                >
                  {uploadingPhoto ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {user?.name || 'Student Portal'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                    {user?.studentId || 'STU2024001'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60">
                    Active Student
                  </span>
                </div>

                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                  {user?.course || 'Bachelor of Technology (B.Tech)'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Department of {user?.branch || 'Computer Science & Engineering'} • Semester {user?.semester || 4}
                </p>

                <div className="mt-4 flex flex-wrap justify-center sm:justify-start items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Mail className="w-3.5 h-3.5 text-indigo-500" />
                    {user?.email || 'student@college.edu'}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Phone className="w-3.5 h-3.5 text-indigo-500" />
                    {user?.phone || '+1 (555) 234-5678'}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    Enrolled: {user?.enrollmentYear || 2023}
                  </span>
                </div>

                {photoMessage && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{photoMessage}</span>
                  </div>
                )}
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
              <p className="text-[10px] text-slate-500 mt-1">Official Academic Average</p>
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
              <p className="text-[10px] text-slate-500 mt-1">Daily Progress Indicator</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
              <Flame className="w-7 h-7 text-orange-500 mx-auto mb-2" />
              <span className="text-[11px] font-bold text-slate-400 uppercase">Active Streak</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {streak?.currentStreak ?? 7} <span className="text-xs font-normal text-slate-400">Days</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Best Streak: {streak?.longestStreak ?? 12}d</p>
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
                    Choose whether your photo, name, Boost Score, and Overall Current Success % appear on the public student leaderboard.
                    Private data (password, phone number, private study notes) are strictly hidden.
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

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Account Management</p>
              <p className="text-[11px] text-slate-500">Sign in with your own student details or register a new student account.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSubTab('signup')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up New Account</span>
              </button>
              <button
                onClick={() => setActiveSubTab('login')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 2: STUDENT SIGN UP (WITH PHOTO UPLOAD) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'signup' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Student Registration</h3>
                <p className="text-xs text-slate-500">
                  Self sign-up via mobile number or email with custom photo upload
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveSubTab('profile')}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Back to Profile
            </button>
          </div>

          {signupError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{signupError}</span>
            </div>
          )}

          {signupSuccess && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{signupSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSignupSubmit} className="space-y-4">
            {/* Photo Upload Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative">
                <img
                  src={
                    signupPhoto ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${signupName || 'newstudent'}`
                  }
                  alt="Student Photo Preview"
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500/20 shadow-md bg-white dark:bg-slate-700"
                />
                {signupPhoto && (
                  <button
                    type="button"
                    onClick={() => setSignupPhoto('')}
                    className="absolute -top-1 -right-1 p-1 rounded-full bg-rose-500 text-white hover:bg-rose-600 shadow-sm"
                    title="Remove custom photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Profile Photo</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Upload your real student photo (JPG, PNG, WebP). This will be shown on your profile and verified by Admin.
                </p>

                <input
                  type="file"
                  ref={signupFileInputRef}
                  onChange={handleSignupPhotoSelect}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => signupFileInputRef.current?.click()}
                  className="mt-2.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-indigo-500 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{signupPhoto ? 'Change Photo' : 'Select Photo from Device'}</span>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Mobile Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  College Email Address (Optional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Course & Branch & Semester */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Degree / Course
                </label>
                <select
                  value={signupCourse}
                  onChange={(e) => setSignupCourse(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Bachelor of Technology (B.Tech)">B.Tech</option>
                  <option value="Bachelor of Science (B.Sc)">B.Sc</option>
                  <option value="Bachelor of Computer Applications (BCA)">BCA</option>
                  <option value="Master of Technology (M.Tech)">M.Tech</option>
                  <option value="Polytechnic Diploma">Diploma</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Branch / Department
                </label>
                <select
                  value={signupBranch}
                  onChange={(e) => setSignupBranch(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Computer Science & Engineering">Computer Science (CSE)</option>
                  <option value="Electronics & Communication">ECE</option>
                  <option value="Mechanical Engineering">Mechanical</option>
                  <option value="Civil Engineering">Civil</option>
                  <option value="Electrical Engineering">Electrical</option>
                  <option value="Information Technology">IT</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Current Semester
                </label>
                <select
                  value={signupSemester}
                  onChange={(e) => setSignupSemester(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showSignupPass ? 'text' : 'password'}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 4 characters"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPass(!showSignupPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showSignupPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showSignupPass ? 'text' : 'password'}
                    required
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveSubTab('login')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Already have an account? Sign In
              </button>

              <button
                type="submit"
                disabled={signupLoading}
                className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {signupLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Complete Sign Up</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 3: STUDENT LOGIN */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'login' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs max-w-lg mx-auto animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Student Login</h3>
                <p className="text-xs text-slate-500">Sign in using your Mobile Phone, Email, or Student ID</p>
              </div>
            </div>
            <button
              onClick={() => setActiveSubTab('profile')}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Back
            </button>
          </div>

          {loginError && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {loginSuccess && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginSuccess}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Number, Email, or Student ID
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. +91 98765 43210 or STU2024001"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showLoginPass ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass(!showLoginPass)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveSubTab('signup')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                New here? Sign Up
              </button>

              <button
                type="submit"
                disabled={loginLoading}
                className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                {loginLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
