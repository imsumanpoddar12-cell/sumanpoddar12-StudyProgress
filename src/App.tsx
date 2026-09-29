/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { AdminLoginModal } from './components/AdminLoginModal.tsx';

// Student Views
import { StudentDashboard } from './components/student/StudentDashboard.tsx';
import { PreviousMarksView } from './components/student/PreviousMarksView.tsx';
import { HowToBoostView } from './components/student/HowToBoostView.tsx';
import { DailyTaskView } from './components/student/DailyTaskView.tsx';
import { MyNotesView } from './components/student/MyNotesView.tsx';
import { LeaderboardView } from './components/student/LeaderboardView.tsx';
import { WeeklyChallengeView } from './components/student/WeeklyChallengeView.tsx';
import { ProgressView } from './components/student/ProgressView.tsx';
import { BoostScoreView } from './components/student/BoostScoreView.tsx';
import { NotificationsView } from './components/student/NotificationsView.tsx';
import { StudentProfileView } from './components/student/StudentProfileView.tsx';
import { CreatorView } from './components/CreatorView.tsx';
import { Footer } from './components/Footer.tsx';

// Admin Views
import { AdminStudentsView } from './components/admin/AdminStudentsView.tsx';
import { AdminMarksView } from './components/admin/AdminMarksView.tsx';
import { AdminDailySubmissionsView } from './components/admin/AdminDailySubmissionsView.tsx';
import { AdminSettingsView } from './components/admin/AdminSettingsView.tsx';

const MainAppContent: React.FC = () => {
  const { user, role, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState<boolean>(false);

  // Sync activeTab when role changes
  useEffect(() => {
    if (role === 'admin') {
      if (!activeTab.startsWith('admin-')) {
        setActiveTab('admin-students');
      }
    } else {
      if (activeTab.startsWith('admin-')) {
        setActiveTab('dashboard');
      }
    }
  }, [role]);

  const handleNavigate = (tab: string) => {
    if (tab === 'admin-panel') {
      if (role === 'admin') {
        setActiveTab('admin-students');
      } else {
        setAdminLoginModalOpen(true);
      }
      return;
    }
    setActiveTab(tab);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs font-semibold text-slate-500">Initializing StudyProgress...</p>
      </div>
    );
  }

  const renderContent = () => {
    if (role === 'admin') {
      switch (activeTab) {
        case 'admin-students':
          return <AdminStudentsView onNavigate={setActiveTab} />;
        case 'admin-marks':
          return <AdminMarksView />;
        case 'admin-submissions':
          return <AdminDailySubmissionsView />;
        case 'admin-settings':
          return <AdminSettingsView />;
        case 'admin-creator':
          return <CreatorView />;
        default:
          return <AdminStudentsView onNavigate={setActiveTab} />;
      }
    } else {
      switch (activeTab) {
        case 'dashboard':
          return <StudentDashboard onNavigate={handleNavigate} />;
        case 'marks':
          return <PreviousMarksView onNavigate={handleNavigate} />;
        case 'how-to-boost':
          return <HowToBoostView onNavigate={handleNavigate} />;
        case 'daily-task':
          return <DailyTaskView onNavigate={handleNavigate} />;
        case 'notes':
          return <MyNotesView onNavigate={handleNavigate} />;
        case 'leaderboard':
          return <LeaderboardView />;
        case 'weekly-challenge':
          return <WeeklyChallengeView onNavigate={handleNavigate} />;
        case 'progress':
          return <ProgressView onNavigate={handleNavigate} />;
        case 'boost-score':
          return <BoostScoreView onNavigate={handleNavigate} />;
        case 'notifications':
          return <NotificationsView />;
        case 'profile':
          return <StudentProfileView />;
        case 'creator':
          return <CreatorView />;
        default:
          return <StudentDashboard onNavigate={handleNavigate} />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onOpenAdminLogin={() => setAdminLoginModalOpen(true)}
      />

      <div className="flex flex-1 relative">
        {/* Responsive Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          onNavigate={handleNavigate}
          onOpenAdminLogin={() => setAdminLoginModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-72 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16 flex flex-col justify-between">
          <div className="flex-1">
            {renderContent()}
          </div>
          <Footer
            onOpenCreatorModal={() => setActiveTab(role === 'admin' ? 'admin-creator' : 'creator')}
          />
        </main>
      </div>

      {/* Admin Login Modal (Triggered by menu or navbar) */}
      <AdminLoginModal
        isOpen={adminLoginModalOpen}
        onClose={() => setAdminLoginModalOpen(false)}
        onSuccess={() => setActiveTab('admin-students')}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
