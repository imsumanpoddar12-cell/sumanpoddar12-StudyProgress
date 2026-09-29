import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Lock,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  HelpCircle,
  KeyRound,
  Sun,
  Moon,
  Phone,
  Mail,
  UserPlus,
  LogIn,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Footer } from './Footer.tsx';

export const AuthView: React.FC = () => {
  const { login, register, quickDemoLogin, theme, toggleTheme } = useAuth();
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [studentMode, setStudentMode] = useState<'signin' | 'signup'>('signin');

  // Sign In states
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Student Sign Up states
  const [signupName, setSignupName] = useState<string>('');
  const [signupPhone, setSignupPhone] = useState<string>('');
  const [signupEmail, setSignupEmail] = useState<string>('');
  const [signupBranch, setSignupBranch] = useState<string>('Computer Science & Engineering');
  const [signupSemester, setSignupSemester] = useState<number>(1);
  const [signupCourse, setSignupCourse] = useState<string>('Bachelor of Technology (B.Tech)');
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState<string>('');
  const [showSignupPassword, setShowSignupPassword] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [forgotInput, setForgotInput] = useState<string>('');
  const [forgotResult, setForgotResult] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleTabChange = (tab: 'student' | 'admin') => {
    setActiveTab(tab);
    setErrorMessage(null);
    setSuccessMessage(null);
    if (tab === 'student') {
      setIdentifier('');
      setPassword('');
    } else {
      setIdentifier('');
      setPassword('');
      setStudentMode('signin');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setErrorMessage('Please fill in both your identifier and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await login(identifier, password, activeTab);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!signupName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!signupPhone.trim() && !signupEmail.trim()) {
      setErrorMessage('Please provide either a Mobile Phone Number or an Email address.');
      return;
    }

    if (!signupPassword) {
      setErrorMessage('Please choose a password.');
      return;
    }

    if (signupPassword.length < 4) {
      setErrorMessage('Password should be at least 4 characters long.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-check.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: signupName.trim(),
        phone: signupPhone.trim(),
        email: signupEmail.trim(),
        branch: signupBranch,
        course: signupCourse,
        semester: Number(signupSemester),
        password: signupPassword.trim(),
      });
      setSuccessMessage('Account created successfully! Logging you in...');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput) return;
    try {
      const res = await api.forgotPassword(forgotInput);
      setForgotResult({ success: true, message: res.message });
    } catch (err: any) {
      setForgotResult({ success: false, message: err.message || 'Unable to process reset request.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 relative transition-colors duration-200">
      {/* Top right Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all backdrop-blur-md"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>☀ Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-600" />
              <span>🌙 Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Background ambient gradient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="my-auto py-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25">
              <GraduationCap className="w-9 h-9" />
            </div>
          </div>
          <h2 className="mt-5 text-center text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            StudyProgress
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            College Academic Performance, Daily Study Tasks &amp; Boost Score Platform
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl shadow-slate-200/50 dark:shadow-black/40 sm:rounded-3xl border border-slate-200 dark:border-slate-800">
            {/* Primary Role Tabs */}
            <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 mb-5 border border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => handleTabChange('student')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'student'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                Student Portal
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('admin')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'admin'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Admin Login
              </button>
            </div>

            {/* Student Mode Sub-Toggle (Sign In vs Sign Up) */}
            {activeTab === 'student' && (
              <div className="flex items-center justify-center gap-2 mb-5 p-1 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100/80 dark:border-indigo-900/50">
                <button
                  type="button"
                  onClick={() => {
                    setStudentMode('signin');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    studentMode === 'signin'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/50'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Student Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStudentMode('signup');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    studentMode === 'signup'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/50'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>New Student Sign Up</span>
                </button>
              </div>
            )}

            {/* Admin Helper Banner */}
            {activeTab === 'admin' && (
              <div className="mb-5 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Administrator Authentication:</span> Enter your official administrator credentials and secure password to access administrative controls.
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* FORM 1: STUDENT SIGN UP FORM */}
            {activeTab === 'student' && studentMode === 'signup' && (
              <form className="space-y-3.5" onSubmit={handleSignUp}>
                <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-[11px] text-indigo-900 dark:text-indigo-300">
                  <span className="font-bold">Student Self Registration:</span> Sign up with your phone number or email. Your details will be registered for academic performance &amp; marks tracking.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <UserIcon className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number <span className="text-slate-400 font-normal">(or Email)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address <span className="text-slate-400 font-normal">(or Phone)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="e.g. rahul@college.edu"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Stream / Branch
                    </label>
                    <select
                      value={signupBranch}
                      onChange={(e) => setSignupBranch(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Computer Science & Engineering">Computer Science &amp; Engg</option>
                      <option value="Electronics & Communication">Electronics &amp; Communication</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Science / PCM">Science / PCM</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Arts / Humanities">Arts / Humanities</option>
                      <option value="General Studies">General Studies</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Semester / Class
                    </label>
                    <select
                      value={signupSemester}
                      onChange={(e) => setSignupSemester(Number(e.target.value))}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={1}>Semester 1 (1st Year)</option>
                      <option value={2}>Semester 2 (1st Year)</option>
                      <option value={3}>Semester 3 (2nd Year)</option>
                      <option value={4}>Semester 4 (2nd Year)</option>
                      <option value={5}>Semester 5 (3rd Year)</option>
                      <option value={6}>Semester 6 (3rd Year)</option>
                      <option value={7}>Semester 7 (4th Year)</option>
                      <option value={8}>Semester 8 (4th Year)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Create Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Choose password"
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  {isSubmitting ? 'Registering Student Account...' : 'Complete Sign Up & Enter Portal'}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setStudentMode('signin')}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Already have an account? Sign In here →
                  </button>
                </div>
              </form>
            )}

            {/* FORM 2: SIGN IN FORM (FOR STUDENT OR ADMIN) */}
            {(! (activeTab === 'student' && studentMode === 'signup')) && (
              <form className="space-y-4" onSubmit={handleSignIn}>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {activeTab === 'student' ? 'Phone Number, Email, or Student ID' : 'Admin ID or Email'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={
                        activeTab === 'student'
                          ? 'e.g. 9876543210, STU2024001, or alex@college.edu'
                          : 'e.g. suman01 or imsumanpoddar12@gmail.com'
                      }
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    />
                    <UserIcon className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your secure password"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                    />
                    Remember me
                  </label>

                  {activeTab === 'student' && (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotInput(identifier);
                        setForgotResult(null);
                        setShowForgotModal(true);
                      }}
                      className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-md ${
                    activeTab === 'student'
                      ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
                      : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                  } disabled:opacity-50`}
                >
                  <Lock className="w-4 h-4" />
                  {isSubmitting ? 'Authenticating...' : `Sign In as ${activeTab === 'student' ? 'Student' : 'Administrator'}`}
                </button>

                {/* Switch to Sign Up option for students */}
                {activeTab === 'student' && (
                  <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setStudentMode('signup');
                        setErrorMessage(null);
                      }}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1.5 mx-auto"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>New Student? Sign up via Phone or Email →</span>
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* Quick Demo Evaluator Shortcuts (Student only) */}
            {activeTab === 'student' && studentMode === 'signin' && (
              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-center">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                  Demo Evaluator Quick Sign-In
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => quickDemoLogin('student', 'STU2024001')}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 text-[11px] font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-800 dark:text-slate-200 hover:text-indigo-600 transition-colors"
                  >
                    <span>Student Alex</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => quickDemoLogin('student', 'STU2024002')}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 text-[11px] font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-800 dark:text-slate-200 hover:text-indigo-600 transition-colors"
                  >
                    <span>Student Priya</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Security & Access Notice */}
          <p className="mt-4 text-center text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Role-Based Access Control: Students can strictly only view their own private records.
          </p>
        </div>
      </div>

      {/* Footer at bottom of login page */}
      <div className="w-full mt-auto">
        <Footer />
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Reset Student Password
                </h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleForgotPassword} className="mt-4 space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Enter your registered Student ID, Phone Number, or college email address to receive password reset guidance.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Student ID, Phone or Email
                </label>
                <input
                  type="text"
                  required
                  value={forgotInput}
                  onChange={(e) => setForgotInput(e.target.value)}
                  placeholder="e.g. 9876543210 or STU2024001 or alex@college.edu"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {forgotResult && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    forgotResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200'
                  }`}
                >
                  {forgotResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{forgotResult.message}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
