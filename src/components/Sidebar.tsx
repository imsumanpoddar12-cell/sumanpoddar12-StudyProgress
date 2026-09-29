import React from 'react';
import {
  LayoutDashboard,
  Award,
  Sparkles,
  CalendarCheck,
  BookOpen,
  Trophy,
  TrendingUp,
  Flame,
  Bell,
  User as UserIcon,
  LogOut,
  Users,
  FileCheck,
  BookMarked,
  BarChart3,
  Settings,
  X,
  GraduationCap,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeTab, onNavigate }) => {
  const { user, role, logout } = useAuth();

  const studentNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'marks', label: 'Previous Marks', icon: Award },
    { id: 'how-to-boost', label: 'How to Boost', icon: Sparkles, badge: 'Smart' },
    { id: 'daily-task', label: 'Daily Task', icon: CalendarCheck, badge: 'Daily' },
    { id: 'notes', label: 'My Notes', icon: BookOpen },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, badge: 'Public' },
    { id: 'weekly-challenge', label: 'Weekly Challenge', icon: Award },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'boost-score', label: 'Boost Score', icon: Flame },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'creator', label: 'About Creator', icon: Sparkles },
  ];

  const adminNavItems: NavItem[] = [
    { id: 'admin-students', label: 'Students & Performance', icon: Users },
    { id: 'admin-marks', label: 'Manage Marks', icon: Award },
    { id: 'admin-settings', label: 'Admin Security', icon: Settings },
    { id: 'admin-creator', label: 'About Creator', icon: Sparkles },
  ];

  const navItems = role === 'admin' ? adminNavItems : studentNavItems;

  const handleItemClick = (id: string) => {
    onNavigate(id);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand in sidebar */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              {role === 'admin' ? <Shield className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {role === 'admin' ? 'Admin Control' : 'Student Portal'}
              </span>
              <p className="text-[10px] text-slate-500 font-medium">StudyProgress</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Mini Profile Card in sidebar */}
        {role === 'student' && user && (
          <div className="p-4 mx-3 my-3 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-indigo-100/50 dark:from-slate-800/80 dark:to-slate-800/30 border border-indigo-100 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <img
                src={
                  user.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.studentId}`
                }
                alt={user.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/30 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  {user.studentId}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  Sem {user.semester || 4} • {user.branch || 'Engineering'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Admin Card */}
        {role === 'admin' && user && (
          <div className="p-4 mx-3 my-3 rounded-2xl bg-gradient-to-br from-amber-50/80 to-amber-100/50 dark:from-amber-950/40 dark:to-slate-800/40 border border-amber-200/60 dark:border-amber-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                  Academic Administrator
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  Official Marks &amp; Verification Auth
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              logout();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
