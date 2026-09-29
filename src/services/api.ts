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
  BoostSuggestion,
  AdminAnalytics,
  LeaderboardEntry,
} from '../types/index.ts';

const TOKEN_KEY = 'study_boost_token';
const USER_KEY = 'study_boost_user';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  getUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed (${response.status})`;
    try {
      const errData = await response.json();
      if (errData.error) errorMsg = errData.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials: { identifier: string; password: string; role?: 'student' | 'admin' }) =>
    request<{ user: User; token: string; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  forgotPassword: (identifier: string) =>
    request<{ success: boolean; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    }),

  getMe: () => request<{ user: User }>('/auth/me'),

  // Students
  getStudents: (params?: { search?: string; branch?: string; semester?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<User[]>(`/students${query ? `?${query}` : ''}`);
  },

  getStudentById: (id: string) => request<User>(`/students/${id}`),

  createStudent: (studentData: any) =>
    request<User>('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    }),

  updateStudent: (id: string, updates: any) =>
    request<User>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  resetStudentPassword: (id: string, newPassword?: string) =>
    request<{ message: string }>(`/students/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    }),

  // Subjects
  getSubjects: () => request<Subject[]>('/subjects'),

  createSubject: (data: Partial<Subject>) =>
    request<Subject>('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateSubject: (id: string, data: Partial<Subject>) =>
    request<Subject>(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteSubject: (id: string) =>
    request<{ message: string }>(`/subjects/${id}`, {
      method: 'DELETE',
    }),

  // Marks
  getMarks: (params?: { studentId?: string; subjectId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<{
      marks: MarkRecord[];
      summary: {
        totalSubjects: number;
        overallPercentage: number;
        highestSubject: MarkRecord | null;
        lowestSubject: MarkRecord | null;
        requiresAttentionCount: number;
      };
    }>(`/marks${query ? `?${query}` : ''}`);
  },

  addMarks: (data: any) =>
    request<MarkRecord>('/marks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMarks: (id: string, data: any) =>
    request<MarkRecord>(`/marks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteMarks: (id: string) =>
    request<{ message: string }>(`/marks/${id}`, {
      method: 'DELETE',
    }),

  // How to Boost
  getBoostSuggestions: (studentId?: string) => {
    const query = studentId ? `?studentId=${studentId}` : '';
    return request<{ suggestions: BoostSuggestion[]; disclaimer: string }>(`/boost-suggestions${query}`);
  },

  // Daily Tasks
  getDailyTasks: (params?: { studentId?: string; date?: string; status?: string; subjectId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<DailyTask[]>(`/daily-tasks${query ? `?${query}` : ''}`);
  },

  submitDailyTask: (taskData: any) =>
    request<{ task: DailyTask; isCompleted: boolean; pointsAwarded: number; message: string }>('/daily-tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),

  verifyDailyTask: (id: string, updates: { status?: 'COMPLETED' | 'PENDING'; verified?: boolean }) =>
    request<DailyTask>(`/daily-tasks/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Notes
  getNotes: (params?: { studentId?: string; subjectId?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<NoteItem[]>(`/notes${query ? `?${query}` : ''}`);
  },

  // Boost Score
  getBoostScore: (studentId?: string) => {
    const query = studentId ? `?studentId=${studentId}` : '';
    return request<BoostScoreData & { milestones: any[]; disclaimer: string }>(`/boost-score${query}`);
  },

  // Streak
  getStreak: (studentId?: string) => {
    const query = studentId ? `?studentId=${studentId}` : '';
    return request<StreakData>(`/streak${query}`);
  },

  // Challenges
  getChallenges: () => request<WeeklyChallenge[]>('/challenges'),

  createChallenge: (challengeData: any) =>
    request<WeeklyChallenge>('/challenges', {
      method: 'POST',
      body: JSON.stringify(challengeData),
    }),

  updateChallenge: (id: string, updates: any) =>
    request<WeeklyChallenge>(`/challenges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteChallenge: (id: string) =>
    request<{ message: string }>(`/challenges/${id}`, {
      method: 'DELETE',
    }),

  // Notifications
  getNotifications: () =>
    request<{ notifications: NotificationItem[]; unreadCount: number }>('/notifications'),

  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'POST',
    }),

  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/notifications/read-all', {
      method: 'POST',
    }),

  // Public Leaderboard
  getLeaderboard: () =>
    request<{ leaderboard: LeaderboardEntry[]; disclaimer: string }>('/leaderboard'),

  updateLeaderboardVisibility: (isPublicOnLeaderboard: boolean) =>
    request<{ success: boolean; user: User }>('/user/leaderboard-visibility', {
      method: 'PUT',
      body: JSON.stringify({ isPublicOnLeaderboard }),
    }),

  changeAdminPassword: (currentPassword: string, newPassword: string) =>
    request<{ success: boolean; message: string }>('/admin/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  // Admin Analytics
  getAdminAnalytics: () => request<AdminAnalytics>('/admin/analytics'),

  resetDemoData: () =>
    request<{ message: string }>('/admin/reset-demo-data', {
      method: 'POST',
    }),
};
