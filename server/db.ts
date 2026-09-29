import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  User,
  Subject,
  MarkRecord,
  DailyTask,
  NoteItem,
  BoostScoreData,
  StreakData,
  WeeklyChallenge,
  NotificationItem,
  RoutineSlot,
} from '../src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  subjects: Subject[];
  marks: MarkRecord[];
  dailyTasks: DailyTask[];
  notes: NoteItem[];
  boostScores: Record<string, BoostScoreData>;
  streaks: Record<string, StreakData>;
  challenges: WeeklyChallenge[];
  notifications: NotificationItem[];
  routines: Record<string, RoutineSlot[]>;
}

export function calculateSuccessPercentage(score: number): number {
  return Math.min(100, Math.max(0, Math.round((score / 1000) * 100)));
}

// Helper to calculate milestone from score
export function getMilestoneInfo(score: number): { current: string; next: { points: number; title: string; remaining: number } } {
  if (score < 250) {
    return {
      current: 'Getting Started',
      next: { points: 250, title: 'Getting Started', remaining: 250 - score },
    };
  } else if (score < 500) {
    return {
      current: 'Getting Started',
      next: { points: 500, title: 'Consistent', remaining: 500 - score },
    };
  } else if (score < 750) {
    return {
      current: 'Consistent',
      next: { points: 750, title: 'Strong Progress', remaining: 750 - score },
    };
  } else if (score < 1000) {
    return {
      current: 'Strong Progress',
      next: { points: 1000, title: 'Maximum Score', remaining: 1000 - score },
    };
  } else {
    return {
      current: 'Maximum Score',
      next: { points: 1000, title: 'Mastery Achieved', remaining: 0 },
    };
  }
}

// Generate past calendar dates
function generatePastCalendar(daysCount: number = 30) {
  const list = [];
  const today = new Date();
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    // Past 7 days completed, others mixed
    const isRecent7 = i >= 0 && i < 7;
    const isCompleted = isRecent7 || (i % 3 !== 0 && i < 20);
    list.push({
      date: dateStr,
      status: (isCompleted ? 'completed' : i === 0 ? 'completed' : i % 4 === 0 ? 'missed' : 'completed') as 'completed' | 'pending' | 'missed',
      studyDuration: isCompleted ? 45 + ((i * 7) % 35) : 0,
      subjectName: isCompleted ? ['Mathematics', 'Programming', 'Applied Chemistry', 'Mechanics'][i % 4] : undefined,
    });
  }
  return list;
}

const initialSeedData: DatabaseSchema = {
  users: [
    {
      id: 'usr_admin_1',
      studentId: 'suman12',
      name: 'Suman Kumar (Poddar)',
      email: 'imsumanpoddar12@gmail.com',
      role: 'admin',
      passwordHash: process.env.ADMIN_INITIAL_PASSWORD || 'a@12',
      isActive: true,
      phone: '+91 98765 43210',
      createdAt: '2024-01-01T08:00:00Z',
    },
    {
      id: 'usr_stu_1',
      studentId: 'STU2024001',
      name: 'Alex Turner',
      email: 'alex.turner@college.edu',
      role: 'student',
      passwordHash: 'student123',
      course: 'Bachelor of Technology (B.Tech)',
      branch: 'Computer Science & Engineering',
      semester: 4,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      isActive: true,
      isPublicOnLeaderboard: true,
      phone: '+1 (555) 234-5678',
      enrollmentYear: 2023,
      createdAt: '2024-01-10T10:00:00Z',
    },
    {
      id: 'usr_stu_2',
      studentId: 'STU2024002',
      name: 'Priya Sharma',
      email: 'priya.sharma@college.edu',
      role: 'student',
      passwordHash: 'student123',
      course: 'Bachelor of Technology (B.Tech)',
      branch: 'Electronics & Communication',
      semester: 4,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      isActive: true,
      isPublicOnLeaderboard: true,
      phone: '+1 (555) 345-6789',
      enrollmentYear: 2023,
      createdAt: '2024-01-10T11:00:00Z',
    },
    {
      id: 'usr_stu_3',
      studentId: 'STU2024003',
      name: 'Marcus Chen',
      email: 'marcus.chen@college.edu',
      role: 'student',
      passwordHash: 'student123',
      course: 'Bachelor of Technology (B.Tech)',
      branch: 'Mechanical Engineering',
      semester: 4,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      isActive: true,
      isPublicOnLeaderboard: true,
      phone: '+1 (555) 456-7890',
      enrollmentYear: 2023,
      createdAt: '2024-01-11T09:00:00Z',
    },
    {
      id: 'usr_stu_4',
      studentId: 'STU2024004',
      name: 'Sophia Rodriguez',
      email: 'sophia.r@college.edu',
      role: 'student',
      passwordHash: 'student123',
      course: 'Bachelor of Technology (B.Tech)',
      branch: 'Civil Engineering',
      semester: 4,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      isActive: true,
      isPublicOnLeaderboard: true,
      phone: '+1 (555) 567-8901',
      enrollmentYear: 2023,
      createdAt: '2024-01-12T14:00:00Z',
    },
  ],
  subjects: [
    {
      id: 'sub_math',
      code: 'MATH201',
      name: 'Mathematics',
      credits: 4,
      facultyName: 'Prof. Alan Turing',
      description: 'Calculus, Differential Equations, Linear Algebra & Numerical Analysis',
    },
    {
      id: 'sub_chem',
      code: 'CHEM102',
      name: 'Applied Chemistry',
      credits: 3,
      facultyName: 'Dr. Marie Curie',
      description: 'Thermodynamics, Electrochemistry, Polymers and Material Sciences',
    },
    {
      id: 'sub_mech',
      code: 'MECH103',
      name: 'Mechanics',
      credits: 3,
      facultyName: 'Prof. Isaac Newton',
      description: 'Engineering Mechanics, Statics, Dynamics and Friction Analysis',
    },
    {
      id: 'sub_elec',
      code: 'ELEC204',
      name: 'Electronics',
      credits: 4,
      facultyName: 'Dr. Nikola Tesla',
      description: 'Semiconductor Devices, Analog circuits, Logic gates & Op-Amps',
    },
    {
      id: 'sub_prog',
      code: 'CS105',
      name: 'Programming',
      credits: 4,
      facultyName: 'Prof. Ada Lovelace',
      description: 'Data Structures, Algorithms, Object-Oriented Design & Problem Solving',
    },
    {
      id: 'sub_comm',
      code: 'COMM106',
      name: 'Professional Communication',
      credits: 2,
      facultyName: 'Dr. Maya Angelou',
      description: 'Technical Writing, Presentation Skills, Ethics and Team Collaboration',
    },
  ],
  marks: [
    {
      id: 'mrk_1',
      studentId: 'STU2024001',
      subjectId: 'sub_math',
      subjectName: 'Mathematics',
      subjectCode: 'MATH201',
      examType: 'Semester End Exam',
      marksObtained: 54,
      maximumMarks: 100,
      percentage: 54,
      status: 'Needs Attention',
      examDate: '2026-05-15',
      academicYear: '2025-2026',
      semester: 3,
      remarks: 'Needs dedicated daily problem solving in Multivariable Calculus.',
    },
    {
      id: 'mrk_2',
      studentId: 'STU2024001',
      subjectId: 'sub_chem',
      subjectName: 'Applied Chemistry',
      subjectCode: 'CHEM102',
      examType: 'Semester End Exam',
      marksObtained: 68,
      maximumMarks: 100,
      percentage: 68,
      status: 'Pass',
      examDate: '2026-05-18',
      academicYear: '2025-2026',
      semester: 3,
      remarks: 'Good grasp on thermodynamics; revise electrochemistry formulas.',
    },
    {
      id: 'mrk_3',
      studentId: 'STU2024001',
      subjectId: 'sub_mech',
      subjectName: 'Mechanics',
      subjectCode: 'MECH103',
      examType: 'Semester End Exam',
      marksObtained: 72,
      maximumMarks: 100,
      percentage: 72,
      status: 'First Class',
      examDate: '2026-05-20',
      academicYear: '2025-2026',
      semester: 3,
      remarks: 'Strong free body diagram analysis. Continue practice.',
    },
    {
      id: 'mrk_4',
      studentId: 'STU2024001',
      subjectId: 'sub_elec',
      subjectName: 'Electronics',
      subjectCode: 'ELEC204',
      examType: 'Semester End Exam',
      marksObtained: 63,
      maximumMarks: 100,
      percentage: 63,
      status: 'Pass',
      examDate: '2026-05-23',
      academicYear: '2025-2026',
      semester: 3,
      remarks: 'Review transistor biassing and digital logic minimization.',
    },
    {
      id: 'mrk_5',
      studentId: 'STU2024001',
      subjectId: 'sub_prog',
      subjectName: 'Programming',
      subjectCode: 'CS105',
      examType: 'Semester End Exam',
      marksObtained: 92,
      maximumMarks: 100,
      percentage: 92,
      status: 'Distinction',
      examDate: '2026-05-26',
      academicYear: '2025-2026',
      semester: 3,
      remarks: 'Outstanding performance in trees and graph algorithmic implementation.',
    },
    {
      id: 'mrk_6',
      studentId: 'STU2024001',
      subjectId: 'sub_comm',
      subjectName: 'Professional Communication',
      subjectCode: 'COMM106',
      examType: 'Semester End Exam',
      marksObtained: 85,
      maximumMarks: 100,
      percentage: 85,
      status: 'Distinction',
      examDate: '2026-05-28',
      academicYear: '2025-2026',
      semester: 3,
      remarks: 'Excellent technical presentations and case study writeups.',
    },
    // Priya Sharma Marks
    {
      id: 'mrk_p1',
      studentId: 'STU2024002',
      subjectId: 'sub_math',
      subjectName: 'Mathematics',
      subjectCode: 'MATH201',
      examType: 'Semester End Exam',
      marksObtained: 88,
      maximumMarks: 100,
      percentage: 88,
      status: 'Distinction',
      examDate: '2026-05-15',
      academicYear: '2025-2026',
      semester: 3,
    },
    {
      id: 'mrk_p2',
      studentId: 'STU2024002',
      subjectId: 'sub_elec',
      subjectName: 'Electronics',
      subjectCode: 'ELEC204',
      examType: 'Semester End Exam',
      marksObtained: 94,
      maximumMarks: 100,
      percentage: 94,
      status: 'Distinction',
      examDate: '2026-05-23',
      academicYear: '2025-2026',
      semester: 3,
    },
  ],
  dailyTasks: [
    {
      id: 'task_alex_today',
      studentId: 'STU2024001',
      date: new Date().toISOString().split('T')[0],
      subjectId: 'sub_math',
      subjectName: 'Mathematics',
      topic: 'Double Integrals and Surface Area Computation',
      studyDuration: 45,
      learningSummary: 'Worked through Cartesian to Polar transformation for circular integration domains. Solved 12 textbook examples.',
      remarks: 'Mastered boundary limits setup for polar coordinates.',
      pageCount: 3,
      noteFiles: [
        {
          id: 'nf_1',
          fileName: 'Math_Double_Integrals_P1.jpg',
          fileType: 'image/jpeg',
          fileSize: 420000,
          url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
          pageCount: 1,
        },
        {
          id: 'nf_2',
          fileName: 'Math_Double_Integrals_P2.jpg',
          fileType: 'image/jpeg',
          fileSize: 390000,
          url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
          pageCount: 1,
        },
        {
          id: 'nf_3',
          fileName: 'Math_Double_Integrals_P3.jpg',
          fileType: 'image/jpeg',
          fileSize: 410000,
          url: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&auto=format&fit=crop&q=80',
          pageCount: 1,
        },
      ],
      status: 'COMPLETED',
      boostPointsAwarded: 35, // 20 task + 10 notes + 5 duration
      submittedAt: new Date().toISOString(),
      verifiedByAdmin: true,
    },
    {
      id: 'task_alex_yest',
      studentId: 'STU2024001',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      subjectId: 'sub_prog',
      subjectName: 'Programming',
      topic: 'AVL Tree Rotations and Balance Factor',
      studyDuration: 60,
      learningSummary: 'Implemented Left-Right and Right-Left double rotations. Verified height balance invariants with unit tests.',
      pageCount: 4,
      noteFiles: [
        {
          id: 'nf_y1',
          fileName: 'AVL_Tree_Rotations_Notes.pdf',
          fileType: 'application/pdf',
          fileSize: 850000,
          url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
          pageCount: 4,
        },
      ],
      status: 'COMPLETED',
      boostPointsAwarded: 35,
      submittedAt: new Date(Date.now() - 86400000).toISOString(),
      verifiedByAdmin: true,
    },
  ],
  notes: [
    {
      id: 'note_1',
      studentId: 'STU2024001',
      studentName: 'Alex Turner',
      taskId: 'task_alex_today',
      subjectId: 'sub_math',
      subjectName: 'Mathematics',
      topic: 'Double Integrals and Surface Area Computation',
      fileUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
      fileName: 'Math_Double_Integrals_3Pages.pdf',
      fileType: 'application/pdf',
      fileSize: 1220000,
      pageCount: 3,
      uploadDate: new Date().toISOString(),
      submissionStatus: 'COMPLETED',
      notesText: 'Page 1: Polar coordinate transformations. Page 2: Solved boundary conditions. Page 3: Verification formulas.',
    },
    {
      id: 'note_2',
      studentId: 'STU2024001',
      studentName: 'Alex Turner',
      taskId: 'task_alex_yest',
      subjectId: 'sub_prog',
      subjectName: 'Programming',
      topic: 'AVL Tree Rotations and Balance Factor',
      fileUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
      fileName: 'AVL_Trees_Algorithms_4Pages.pdf',
      fileType: 'application/pdf',
      fileSize: 1450000,
      pageCount: 4,
      uploadDate: new Date(Date.now() - 86400000).toISOString(),
      submissionStatus: 'COMPLETED',
      notesText: 'Complete pseudo-code, rotation diagram trees and time complexity breakdowns.',
    },
    {
      id: 'note_3',
      studentId: 'STU2024001',
      studentName: 'Alex Turner',
      taskId: 'task_alex_prev',
      subjectId: 'sub_chem',
      subjectName: 'Applied Chemistry',
      topic: 'Gibbs Free Energy & Reaction Spontaneity',
      fileUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
      fileName: 'Chemistry_Thermodynamics_Summary.pdf',
      fileType: 'application/pdf',
      fileSize: 980000,
      pageCount: 3,
      uploadDate: new Date(Date.now() - 86400000 * 3).toISOString(),
      submissionStatus: 'COMPLETED',
      notesText: 'Enthalpy and Entropy mathematical expressions with standard temperature variations.',
    },
    {
      id: 'note_4',
      studentId: 'STU2024001',
      studentName: 'Alex Turner',
      taskId: 'task_alex_prev2',
      subjectId: 'sub_elec',
      subjectName: 'Electronics',
      topic: 'Operational Amplifier (Op-Amp) Inverting & Non-Inverting Circuits',
      fileUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      fileName: 'OpAmps_Circuit_Schematics.pdf',
      fileType: 'application/pdf',
      fileSize: 1100000,
      pageCount: 4,
      uploadDate: new Date(Date.now() - 86400000 * 5).toISOString(),
      submissionStatus: 'COMPLETED',
      notesText: 'Virtual ground approximation and closed-loop gain derivation.',
    },
  ],
  boostScores: {
    STU2024001: {
      studentId: 'STU2024001',
      currentScore: 640,
      pointsToday: 35,
      pointsThisWeek: 175,
      currentMilestone: 'Consistent',
      nextMilestone: {
        points: 750,
        title: 'Strong Progress',
        remaining: 110,
      },
      history: [
        {
          id: 'bsh_1',
          studentId: 'STU2024001',
          date: new Date().toISOString().split('T')[0],
          points: 20,
          reason: "Daily task completed: Mathematics (Double Integrals)",
          category: 'daily_task',
        },
        {
          id: 'bsh_2',
          studentId: 'STU2024001',
          date: new Date().toISOString().split('T')[0],
          points: 10,
          reason: '3-4 pages notes uploaded and validated',
          category: 'notes_pages',
        },
        {
          id: 'bsh_3',
          studentId: 'STU2024001',
          date: new Date().toISOString().split('T')[0],
          points: 5,
          reason: '45 minutes active study logged',
          category: 'study_duration',
        },
        {
          id: 'bsh_4',
          studentId: 'STU2024001',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          points: 35,
          reason: 'Daily task completed with 4 pages notes (Programming)',
          category: 'daily_task',
        },
        {
          id: 'bsh_5',
          studentId: 'STU2024001',
          date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
          points: 50,
          reason: '7-Day Study Streak Achievement Bonus! 🔥',
          category: 'streak_bonus',
        },
        {
          id: 'bsh_6',
          studentId: 'STU2024001',
          date: new Date(Date.now() - 86400000 * 6).toISOString().split('T')[0],
          points: 100,
          reason: 'Completed Weekly Challenge: 7-Day Study Streak',
          category: 'challenge_reward',
        },
      ],
    },
    STU2024002: {
      studentId: 'STU2024002',
      currentScore: 820,
      pointsToday: 35,
      pointsThisWeek: 210,
      currentMilestone: 'Strong Progress',
      nextMilestone: {
        points: 1000,
        title: 'Maximum Score',
        remaining: 180,
      },
      history: [],
    },
    STU2024003: {
      studentId: 'STU2024003',
      currentScore: 430,
      pointsToday: 0,
      pointsThisWeek: 120,
      currentMilestone: 'Getting Started',
      nextMilestone: {
        points: 500,
        title: 'Consistent',
        remaining: 70,
      },
      history: [],
    },
    STU2024004: {
      studentId: 'STU2024004',
      currentScore: 510,
      pointsToday: 35,
      pointsThisWeek: 155,
      currentMilestone: 'Consistent',
      nextMilestone: {
        points: 750,
        title: 'Strong Progress',
        remaining: 240,
      },
      history: [],
    },
  },
  streaks: {
    STU2024001: {
      studentId: 'STU2024001',
      currentStreak: 7,
      longestStreak: 12,
      totalCompletedDays: 24,
      missedDays: 3,
      lastCompletedDate: new Date().toISOString().split('T')[0],
      calendar: generatePastCalendar(30),
    },
    STU2024002: {
      studentId: 'STU2024002',
      currentStreak: 14,
      longestStreak: 18,
      totalCompletedDays: 28,
      missedDays: 1,
      lastCompletedDate: new Date().toISOString().split('T')[0],
      calendar: generatePastCalendar(30),
    },
  },
  challenges: [
    {
      id: 'chal_default',
      title: '7-Day Study Streak',
      description: 'Complete daily study tasks for 7 consecutive days, uploading 3-4 pages of notes and logging at least 30 minutes of study each day.',
      durationDays: 7,
      requiredPagesPerDay: 3,
      requiredStudyMinutesPerDay: 30,
      requiredCompletionDays: 7,
      rewardPoints: 100,
      startDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
      isActive: true,
      participantCount: 42,
      studentProgress: {
        completedDays: 4,
        isCompleted: false,
        rewardClaimed: false,
      },
    },
    {
      id: 'chal_mastery',
      title: 'Weekend Deep-Dive Sprint',
      description: 'Spend 90+ minutes across Saturday & Sunday revising weak subject topics with comprehensive 4-page synthesized diagrams.',
      durationDays: 2,
      requiredPagesPerDay: 4,
      requiredStudyMinutesPerDay: 90,
      requiredCompletionDays: 2,
      rewardPoints: 75,
      startDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
      isActive: true,
      participantCount: 18,
      studentProgress: {
        completedDays: 0,
        isCompleted: false,
        rewardClaimed: false,
      },
    },
    {
      id: 'chal_notes_champion',
      title: 'Notes Excellence Challenge',
      description: 'Upload 4 pages of handwritten structured notes for 5 consecutive study days to reinforce retention.',
      durationDays: 5,
      requiredPagesPerDay: 4,
      requiredStudyMinutesPerDay: 45,
      requiredCompletionDays: 5,
      rewardPoints: 120,
      startDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      isActive: true,
      participantCount: 29,
      studentProgress: {
        completedDays: 2,
        isCompleted: false,
        rewardClaimed: false,
      },
    },
  ],
  notifications: [
    {
      id: 'notif_1',
      studentId: 'STU2024001',
      title: 'Study Streak Maintained! 🔥',
      message: 'You have maintained a 7-day study streak! Keep up the great consistency.',
      type: 'streak_alert',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif_2',
      studentId: 'STU2024001',
      title: 'Boost Score Increased',
      message: 'Your Boost Score increased by 35 points after validating today’s 3-page study submission.',
      type: 'score_boost',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'notif_3',
      studentId: 'STU2024001',
      title: 'Weekly Challenge Progress',
      message: 'Weekly Challenge: 3 days remaining. You have completed 4 of 7 days!',
      type: 'challenge_update',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'notif_4',
      studentId: 'STU2024001',
      title: 'Daily Task Reminder',
      message: 'Upload your 3–4 pages of study notes to complete today’s task and protect your streak.',
      type: 'task_pending',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
  routines: {
    STU2024001: [
      {
        id: 'rout_1',
        studentId: 'STU2024001',
        dayOfWeek: 'Monday',
        subjectId: 'sub_math',
        subjectName: 'Mathematics',
        topic: 'Multivariable Calculus & Double Integrals',
        startTime: '18:00',
        endTime: '20:00',
        studyTarget: 'Complete 5 practice problems and formula derivation',
        notesRequirementPages: 3,
        priority: 'High',
        deadlineHoursAfterEnd: 3,
        createdAt: '2024-01-10T10:00:00Z',
      },
      {
        id: 'rout_2',
        studentId: 'STU2024001',
        dayOfWeek: 'Tuesday',
        subjectId: 'sub_chem',
        subjectName: 'Applied Chemistry',
        topic: 'Thermodynamics & Reaction Kinetics',
        startTime: '18:00',
        endTime: '20:00',
        studyTarget: 'Summarize Gibbs Free Energy equations and standard state reactions',
        notesRequirementPages: 3,
        priority: 'Medium',
        deadlineHoursAfterEnd: 3,
        createdAt: '2024-01-10T10:00:00Z',
      },
      {
        id: 'rout_3',
        studentId: 'STU2024001',
        dayOfWeek: 'Wednesday',
        subjectId: 'sub_prog',
        subjectName: 'Programming',
        topic: 'AVL Trees & Dynamic Programming',
        startTime: '19:00',
        endTime: '21:00',
        studyTarget: 'Implement balanced tree rotations and time complexity breakdown',
        notesRequirementPages: 3,
        priority: 'High',
        deadlineHoursAfterEnd: 3,
        createdAt: '2024-01-10T10:00:00Z',
      },
      {
        id: 'rout_4',
        studentId: 'STU2024001',
        dayOfWeek: 'Thursday',
        subjectId: 'sub_elec',
        subjectName: 'Electronics',
        topic: 'Operational Amplifiers & Frequency Response',
        startTime: '18:00',
        endTime: '20:00',
        studyTarget: 'Draw clean circuit schematics and derive inverting gain formula',
        notesRequirementPages: 3,
        priority: 'Medium',
        deadlineHoursAfterEnd: 3,
        createdAt: '2024-01-10T10:00:00Z',
      },
      {
        id: 'rout_5',
        studentId: 'STU2024001',
        dayOfWeek: 'Friday',
        subjectId: 'sub_mech',
        subjectName: 'Mechanics',
        topic: 'Friction Analysis & Moment of Inertia',
        startTime: '17:00',
        endTime: '19:00',
        studyTarget: 'Review 3 statics problems and free body diagrams',
        notesRequirementPages: 3,
        priority: 'Low',
        deadlineHoursAfterEnd: 3,
        createdAt: '2024-01-10T10:00:00Z',
      },
    ],
  },
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        const data: DatabaseSchema = {
          ...initialSeedData,
          ...parsed,
          users: parsed.users || initialSeedData.users,
          subjects: parsed.subjects || initialSeedData.subjects,
          marks: parsed.marks || initialSeedData.marks,
          dailyTasks: parsed.dailyTasks || initialSeedData.dailyTasks,
          notes: parsed.notes || initialSeedData.notes,
          boostScores: parsed.boostScores || initialSeedData.boostScores,
          streaks: parsed.streaks || initialSeedData.streaks,
          challenges: parsed.challenges || initialSeedData.challenges,
          notifications: parsed.notifications || initialSeedData.notifications,
          routines: parsed.routines || initialSeedData.routines,
        };

        // Guarantee suman12 admin is configured as requested
        const adminIdx = data.users.findIndex((u) => u.role === 'admin');
        if (adminIdx !== -1) {
          data.users[adminIdx].studentId = 'suman12';
          data.users[adminIdx].email = 'imsumanpoddar12@gmail.com';
          data.users[adminIdx].name = 'Suman Kumar (Poddar)';
          data.users[adminIdx].passwordHash = 'a@12';
        } else {
          data.users.unshift(initialSeedData.users[0]);
        }

        // Ensure students have isPublicOnLeaderboard
        data.users.forEach((u) => {
          if (u.role === 'student' && u.isPublicOnLeaderboard === undefined) {
            u.isPublicOnLeaderboard = true;
          }
        });

        // Ensure boost scores have currentSuccessPercentage
        Object.keys(data.boostScores).forEach((sid) => {
          const bs = data.boostScores[sid];
          if (bs) {
            bs.currentSuccessPercentage = calculateSuccessPercentage(bs.currentScore);
            if (bs.successTrend === undefined) {
              bs.successTrend = 4;
            }
          }
        });

        this.saveData(data);
        return data;
      }
    } catch (e) {
      console.error('Error loading db.json, using seed data:', e);
    }
    this.saveData(initialSeedData);
    return initialSeedData;
  }

  private saveData(data: DatabaseSchema) {
    this.ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  public get(): DatabaseSchema {
    return this.data;
  }

  public update(modifier: (data: DatabaseSchema) => void): DatabaseSchema {
    modifier(this.data);
    this.saveData(this.data);
    return this.data;
  }

  public resetToDefaults(): DatabaseSchema {
    this.data = JSON.parse(JSON.stringify(initialSeedData));
    this.saveData(this.data);
    return this.data;
  }
}

export const db = new Database();
