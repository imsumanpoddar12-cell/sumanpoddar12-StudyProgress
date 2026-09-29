export type Role = 'student' | 'admin';

export interface User {
  id: string;
  studentId?: string; // e.g. STU2024001 (for student) or ADM001
  name: string;
  email: string;
  role: Role;
  course?: string; // e.g. B.Tech Computer Science & Engineering
  branch?: string; // e.g. CSE, ECE, ME, Civil
  semester?: number; // e.g. 4
  avatar?: string;
  isActive: boolean;
  isPublicOnLeaderboard?: boolean;
  phone?: string;
  enrollmentYear?: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  name: string;
  avatar?: string;
  branch?: string;
  semester?: number;
  boostScore: number;
  currentSuccessPercentage: number; // 0 - 100%
  successTrend: number; // e.g. +4 (percentage point increase)
  streak: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  facultyName: string;
  description?: string;
}

export interface MarkRecord {
  id: string;
  studentId: string; // STU ID
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  examType: 'Mid-Term 1' | 'Mid-Term 2' | 'Semester End Exam' | 'Continuous Assessment';
  marksObtained: number;
  maximumMarks: number;
  percentage: number;
  status: 'Distinction' | 'First Class' | 'Pass' | 'Needs Attention';
  examDate: string;
  academicYear: string;
  semester: number;
  remarks?: string;
}

export interface DailyTask {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  subjectId: string;
  subjectName: string;
  topic: string;
  studyDuration: number; // in minutes
  learningSummary: string; // What I learned today
  remarks?: string;
  pageCount: number; // minimum 3-4 pages required
  noteFiles: {
    id: string;
    fileName: string;
    fileType: 'image/jpeg' | 'image/png' | 'application/pdf';
    fileSize: number;
    url: string;
    pageCount: number;
  }[];
  status: 'COMPLETED' | 'PENDING';
  pendingReason?: string;
  boostPointsAwarded: number;
  submittedAt: string;
  verifiedByAdmin?: boolean;
}

export interface NoteItem {
  id: string;
  studentId: string;
  studentName?: string;
  taskId: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  fileUrl: string;
  fileName: string;
  fileType: 'image/jpeg' | 'image/png' | 'application/pdf';
  fileSize: number;
  pageCount: number;
  uploadDate: string;
  submissionStatus: 'COMPLETED' | 'PENDING';
  notesText?: string;
}

export interface BoostMilestone {
  points: number;
  title: string;
  unlocked: boolean;
  description: string;
}

export interface BoostScoreHistoryItem {
  id: string;
  studentId: string;
  date: string;
  points: number;
  reason: string;
  category: 'daily_task' | 'notes_pages' | 'study_duration' | 'streak_bonus' | 'challenge_reward' | 'admin_adjustment';
}

export interface BoostScoreData {
  studentId: string;
  currentScore: number; // 0 - 1000
  currentSuccessPercentage?: number; // 0 - 100%
  successTrend?: number; // compared to previous period e.g. +4% or -1%
  pointsToday: number;
  pointsThisWeek: number;
  currentMilestone: string;
  nextMilestone: {
    points: number;
    title: string;
    remaining: number;
  };
  history: BoostScoreHistoryItem[];
}

export interface StreakData {
  studentId: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletedDays: number;
  missedDays: number;
  lastCompletedDate: string;
  calendar: {
    date: string;
    status: 'completed' | 'pending' | 'missed';
    studyDuration?: number;
    subjectName?: string;
  }[];
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  requiredPagesPerDay: number;
  requiredStudyMinutesPerDay: number;
  requiredCompletionDays: number;
  rewardPoints: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  participantCount?: number;
  // student specific progress:
  studentProgress?: {
    completedDays: number;
    isCompleted: boolean;
    rewardClaimed: boolean;
  };
}

export interface NotificationItem {
  id: string;
  studentId: string;
  title: string;
  message: string;
  type: 'task_pending' | 'task_completed' | 'streak_alert' | 'challenge_update' | 'score_boost' | 'marks_update' | 'system';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface BoostSuggestion {
  subjectId: string;
  subjectName: string;
  status: 'low' | 'moderate' | 'high';
  currentPercentage: number;
  attentionLevel: 'High Attention Required' | 'Moderate Revision' | 'Maintain Consistency';
  suggestedDailyMinutes: number;
  recommendedActivities: string[];
  weeklyTarget: string;
  revisionSuggestions: string[];
}

export interface AdminAnalytics {
  totalStudents: number;
  activeStudents: number;
  dailySubmissionsToday: number;
  completedTasksToday: number;
  pendingTasksToday: number;
  averageBoostScore: number;
  studentsOnStreak: number;
  weeklyChallengeCompletions: number;
  subjectPerformance: {
    subjectName: string;
    averageMarks: number;
    passRate: number;
    studentCount: number;
  }[];
  recentActivity: {
    id: string;
    type: string;
    description: string;
    timestamp: string;
    studentName?: string;
  }[];
}
