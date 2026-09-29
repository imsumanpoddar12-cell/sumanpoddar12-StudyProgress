import express from 'express';
import type { Request, Response, NextFunction } from 'express';
const { Router } = express;
import { db, getMilestoneInfo, calculateSuccessPercentage } from './db.ts';
import type {
  User,
  Subject,
  RoutineSlot,
  MarkRecord,
  DailyTask,
  NoteItem,
  WeeklyChallenge,
  NotificationItem,
  BoostSuggestion,
  AdminAnalytics,
} from '../src/types/index.ts';

export const apiRouter = Router();

// Simple auth middleware reading Bearer token or x-user-id header
function getAuthUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  const userIdHeader = req.headers['x-user-id'] as string;

  const users = db.get().users;

  if (userIdHeader) {
    const user = users.find((u) => u.id === userIdHeader || u.studentId === userIdHeader);
    if (user && user.isActive) return user;
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Token can be userId directly or user:studentId
    const user = users.find((u) => u.id === token || u.studentId === token);
    if (user && user.isActive) return user;
  }

  return null;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please log in.' });
    return;
  }
  (req as any).user = user;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden. Admin privileges required.' });
    return;
  }
  (req as any).user = user;
  next();
}

// --------------------------------------------------------------------------
// 1. AUTHENTICATION & STUDENT SIGN-UP
// --------------------------------------------------------------------------
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, studentId: customStudentId, email, phone, password, confirmPassword, branch, course, semester, avatar } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'Please enter your full name.' });
    return;
  }

  // Password confirmation check
  if (confirmPassword && password !== confirmPassword) {
    res.status(400).json({ error: 'Passwords do not match. Please verify your password confirmation.' });
    return;
  }

  // Weak password check
  if (!password || typeof password !== 'string' || password.trim().length < 6) {
    res.status(400).json({ error: 'Weak password. Password must be at least 6 characters long.' });
    return;
  }

  const cleanPhone = phone ? String(phone).trim() : '';
  const cleanEmail = email ? String(email).trim().toLowerCase() : '';

  if (!cleanPhone && !cleanEmail) {
    res.status(400).json({ error: 'Please provide either a mobile phone number or an email address to create an account.' });
    return;
  }

  // Email format validation
  if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    res.status(400).json({ error: 'Invalid email address format.' });
    return;
  }

  const state = db.get();

  // Check custom student ID uniqueness if provided
  if (customStudentId && typeof customStudentId === 'string' && customStudentId.trim()) {
    const upperId = customStudentId.trim().toUpperCase();
    if (state.users.some((u) => u.studentId && u.studentId.toUpperCase() === upperId)) {
      res.status(400).json({ error: 'An account already exists with this Student ID. Please log in.' });
      return;
    }
  }

  // Check email uniqueness if email provided
  if (cleanEmail && state.users.some((u) => u.email && u.email.toLowerCase() === cleanEmail)) {
    res.status(400).json({ error: 'An account already exists with this email address. Please log in.' });
    return;
  }

  // Check phone uniqueness if phone provided
  if (cleanPhone) {
    const rawDigits = cleanPhone.replace(/\D/g, '');
    if (rawDigits.length >= 7) {
      const phoneExists = state.users.some((u) => {
        if (!u.phone) return false;
        const uDigits = u.phone.replace(/\D/g, '');
        return uDigits.length >= 7 && (uDigits === rawDigits || uDigits.endsWith(rawDigits) || rawDigits.endsWith(uDigits));
      });
      if (phoneExists) {
        res.status(400).json({ error: 'An account already exists with this mobile phone number. Please log in.' });
        return;
      }
    }
  }

  const currentYear = new Date().getFullYear();
  const nextNum = state.users.filter((u) => u.role === 'student').length + 1;
  const studentId = customStudentId && customStudentId.trim()
    ? customStudentId.trim().toUpperCase()
    : `STU${currentYear}${String(nextNum).padStart(3, '0')}`;
  const newUserId = `usr_stu_${Date.now()}`;
  const finalEmail = cleanEmail || `${studentId.toLowerCase()}@student.studyprogress.edu`;

  // Avatar format check (data URL or valid image URL)
  let validAvatar = avatar;
  if (avatar && typeof avatar === 'string') {
    if (!avatar.startsWith('data:image/') && !avatar.startsWith('http')) {
      validAvatar = undefined;
    }
  }

  const newStudent: User & { passwordHash: string } = {
    id: newUserId,
    studentId,
    name: name.trim(),
    email: finalEmail,
    role: 'student',
    course: course || 'Bachelor of Technology (B.Tech)',
    branch: branch || 'Computer Science & Engineering',
    semester: Number(semester) || 1,
    avatar: validAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentId}`,
    isActive: true,
    phone: cleanPhone || '',
    enrollmentYear: currentYear,
    createdAt: new Date().toISOString(),
    isPublicOnLeaderboard: true,
    passwordHash: password.trim(),
  };

  db.update((data) => {
    data.users.push(newStudent);
    // Initialize Boost score with 50 welcome points
    data.boostScores[studentId] = {
      studentId,
      currentScore: 50,
      pointsToday: 0,
      pointsThisWeek: 50,
      currentMilestone: 'Getting Started',
      nextMilestone: {
        points: 250,
        title: 'Bronze Scholar',
        remaining: 200,
      },
      history: [
        {
          id: `bsh_init_${Date.now()}`,
          studentId,
          date: new Date().toISOString().split('T')[0],
          points: 50,
          reason: 'Welcome bonus on portal registration!',
          category: 'admin_adjustment',
        },
      ],
    };

    // Initialize streak with Day 1
    data.streaks[studentId] = {
      studentId,
      currentStreak: 1,
      longestStreak: 1,
      totalCompletedDays: 1,
      missedDays: 0,
      lastCompletedDate: new Date().toISOString().split('T')[0],
      calendar: [
        {
          date: new Date().toISOString().split('T')[0],
          status: 'completed',
          studyDuration: 45,
          subjectName: 'Orientation',
        },
      ],
    };

    // Welcome notification
    data.notifications.unshift({
      id: `notif_${Date.now()}`,
      studentId,
      title: 'Welcome to StudyProgress!',
      message: `Your account (${studentId}) is ready. Start tracking your daily study tasks and boost score.`,
      type: 'system',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  });

  const { passwordHash: _, ...safeStudent } = newStudent;
  res.status(201).json({
    user: safeStudent,
    token: newStudent.id,
    message: `Account created successfully! Welcome to StudyProgress, ${safeStudent.name}.`,
  });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { identifier, password, role } = req.body; // identifier = phone, studentId or email
  if (!identifier || !password) {
    res.status(400).json({ error: 'Please enter your Phone/Email/ID and password.' });
    return;
  }

  const cleanIdent = String(identifier).trim();
  const rawIdentDigits = cleanIdent.replace(/\D/g, '');

  const users = db.get().users;
  const user = users.find((u) => {
    // Admin specific ID / alias check
    if (u.role === 'admin') {
      const lower = cleanIdent.toLowerCase();
      if (lower === 'suman12' || lower === 'suman01' || lower === 'admin' || lower === 'adm001') {
        return true;
      }
    }
    // 1. Email check
    if (u.email && u.email.toLowerCase() === cleanIdent.toLowerCase()) return true;
    // 2. Student ID / Admin ID check
    if (u.studentId && u.studentId.toUpperCase() === cleanIdent.toUpperCase()) return true;
    // 3. Phone check
    if (u.phone && rawIdentDigits.length >= 7) {
      const uDigits = u.phone.replace(/\D/g, '');
      if (uDigits === rawIdentDigits || uDigits.endsWith(rawIdentDigits) || rawIdentDigits.endsWith(uDigits)) {
        return true;
      }
    }
    return false;
  });

  if (!user) {
    res.status(401).json({ error: 'Invalid credentials. No account found matching this Phone, Email, or ID.' });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ error: 'Account disabled. Please contact your administrator.' });
    return;
  }

  // Check role match if requested
  if (role && user.role !== role) {
    res.status(401).json({
      error: `This account is registered as ${user.role}. Please switch to the ${user.role === 'admin' ? 'Admin' : 'Student'} login tab.`,
    });
    return;
  }

  // Password check (plain hash comparison for demo robustness)
  if (user.passwordHash !== password.trim()) {
    res.status(401).json({ error: 'Incorrect password. Please try again.' });
    return;
  }

  const { passwordHash, ...userProfile } = user;
  res.json({
    user: userProfile,
    token: user.id,
    message: `Welcome back, ${user.name}!`,
  });
});

apiRouter.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { identifier } = req.body;
  if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
    res.status(400).json({ error: 'Please enter your Student ID or Email.' });
    return;
  }

  const cleanId = identifier.trim().toLowerCase();
  const users = db.get().users;
  const user = users.find(
    (u) =>
      (u.email && u.email.toLowerCase() === cleanId) ||
      (u.studentId && u.studentId.toLowerCase() === cleanId)
  );

  if (!user) {
    res.status(404).json({ error: 'Account not found. Please verify your Student ID or Email.' });
    return;
  }

  res.json({
    success: true,
    studentId: user.studentId,
    email: user.email,
    name: user.name,
    message: `Account verified for ${user.name} (${user.studentId}). You may now reset your password.`,
  });
});

apiRouter.post('/auth/reset-password', (req: Request, res: Response) => {
  const { identifier, newPassword, confirmPassword } = req.body;

  if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
    res.status(400).json({ error: 'Please provide your Student ID or Email.' });
    return;
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 6) {
    res.status(400).json({ error: 'Weak password. Password must be at least 6 characters long.' });
    return;
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    res.status(400).json({ error: 'Passwords do not match. Please ensure both passwords match.' });
    return;
  }

  const cleanId = identifier.trim().toLowerCase();
  let updatedUser: User | null = null;

  db.update((data) => {
    const user = data.users.find(
      (u) =>
        (u.email && u.email.toLowerCase() === cleanId) ||
        (u.studentId && u.studentId.toLowerCase() === cleanId)
    );
    if (user) {
      user.passwordHash = newPassword.trim();
      const { passwordHash, ...safe } = user;
      updatedUser = safe;

      // Add security notification
      data.notifications.unshift({
        id: `notif_${Date.now()}_pwd`,
        studentId: user.studentId || user.id,
        title: 'Password Updated Successfully 🔐',
        message: 'Your account password was updated. If you did not make this request, contact administration.',
        type: 'system',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  });

  if (!updatedUser) {
    res.status(404).json({ error: 'Account not found. Please verify your Student ID or Email.' });
    return;
  }

  res.json({
    success: true,
    message: 'Password reset successful! You can now log in with your new password.',
  });
});

apiRouter.get('/auth/me', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser });
});

// --------------------------------------------------------------------------
// 2. STUDENTS (Admin management & Self Profile)
// --------------------------------------------------------------------------
apiRouter.get('/students', requireAdmin, (req: Request, res: Response) => {
  const { search, branch, semester } = req.query;
  let students = db.get().users.filter((u) => u.role === 'student');

  if (search) {
    const q = (search as string).toLowerCase();
    students = students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.studentId && s.studentId.toLowerCase().includes(q)) ||
        s.email.toLowerCase().includes(q)
    );
  }

  if (branch && branch !== 'all') {
    students = students.filter((s) => s.branch === branch);
  }

  if (semester && semester !== 'all') {
    students = students.filter((s) => s.semester === Number(semester));
  }

  const state = db.get();
  const safeStudents = students.map(({ passwordHash, ...s }) => {
    const studentId = s.studentId || s.id;
    const boost = state.boostScores[studentId];
    const streak = state.streaks[studentId];
    const studentMarks = state.marks.filter((m) => m.studentId === studentId);
    const totalObtained = studentMarks.reduce((sum, m) => sum + m.marksObtained, 0);
    const totalMax = studentMarks.reduce((sum, m) => sum + m.maximumMarks, 0);
    const overallPercentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(1)) : 0;
    const boostScore = boost ? boost.currentScore : 50;
    const successPercentage = Math.min(
      100,
      Math.max(
        0,
        Math.round((totalMax > 0 ? (totalObtained / totalMax) * 100 : 70) * 0.6 + (Math.min(boostScore, 1000) / 1000) * 100 * 0.4)
      )
    );

    return {
      ...s,
      performance: {
        boostScore,
        streak: streak ? streak.currentStreak : 0,
        marksCount: studentMarks.length,
        totalObtained,
        totalMax,
        overallPercentage,
        successPercentage,
      },
    };
  });
  res.json(safeStudents);
});

apiRouter.get('/students/:id', requireAuth, (req: Request, res: Response) => {
  const currentUser: User = (req as any).user;
  const requestedId = req.params.id;

  // Student can only see their own profile
  if (currentUser.role === 'student' && currentUser.id !== requestedId && currentUser.studentId !== requestedId) {
    res.status(403).json({ error: 'Students can only view their own profile.' });
    return;
  }

  const user = db.get().users.find((u) => u.id === requestedId || u.studentId === requestedId);
  if (!user) {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }

  const { passwordHash, ...safeUser } = user;
  res.json(safeUser);
});

apiRouter.post('/students', requireAdmin, (req: Request, res: Response) => {
  const { name, email, branch, semester, course, phone, password } = req.body;
  if (!name || !email) {
    res.status(400).json({ error: 'Name and email are required.' });
    return;
  }

  const state = db.get();
  if (state.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
    res.status(400).json({ error: 'User with this email already exists.' });
    return;
  }

  const nextIndex = state.users.filter((u) => u.role === 'student').length + 1;
  const studentId = `STU2024${String(nextIndex).padStart(3, '0')}`;
  const newUserId = `usr_stu_${Date.now()}`;

  const newStudent: User & { passwordHash: string } = {
    id: newUserId,
    studentId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: 'student',
    course: course || 'Bachelor of Technology (B.Tech)',
    branch: branch || 'Computer Science & Engineering',
    semester: Number(semester) || 1,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentId}`,
    isActive: true,
    phone: phone || '',
    enrollmentYear: new Date().getFullYear(),
    createdAt: new Date().toISOString(),
    passwordHash: password || 'student123',
  };

  db.update((data) => {
    data.users.push(newStudent);
    // Initialize Boost score
    data.boostScores[studentId] = {
      studentId,
      currentScore: 50,
      pointsToday: 0,
      pointsThisWeek: 50,
      currentMilestone: 'Getting Started',
      nextMilestone: {
        points: 250,
        title: 'Getting Started',
        remaining: 200,
      },
      history: [
        {
          id: `bsh_init_${Date.now()}`,
          studentId,
          date: new Date().toISOString().split('T')[0],
          points: 50,
          reason: 'Welcome bonus on portal registration!',
          category: 'admin_adjustment',
        },
      ],
    };
    // Initialize streak
    data.streaks[studentId] = {
      studentId,
      currentStreak: 0,
      longestStreak: 0,
      totalCompletedDays: 0,
      missedDays: 0,
      lastCompletedDate: '',
      calendar: [],
    };
  });

  const { passwordHash: _, ...safeStudent } = newStudent;
  res.status(201).json(safeStudent);
});

apiRouter.put('/students/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, branch, semester, course, isActive, phone } = req.body;

  let updatedStudent: any = null;

  db.update((data) => {
    const idx = data.users.findIndex((u) => u.id === id || u.studentId === id);
    if (idx !== -1) {
      data.users[idx] = {
        ...data.users[idx],
        name: name !== undefined ? name : data.users[idx].name,
        email: email !== undefined ? email : data.users[idx].email,
        branch: branch !== undefined ? branch : data.users[idx].branch,
        semester: semester !== undefined ? Number(semester) : data.users[idx].semester,
        course: course !== undefined ? course : data.users[idx].course,
        isActive: isActive !== undefined ? Boolean(isActive) : data.users[idx].isActive,
        phone: phone !== undefined ? phone : data.users[idx].phone,
      };
      const { passwordHash, ...safe } = data.users[idx];
      updatedStudent = safe;
    }
  });

  if (!updatedStudent) {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }
  res.json(updatedStudent);
});

apiRouter.post('/students/:id/reset-password', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  let success = false;
  db.update((data) => {
    const user = data.users.find((u) => u.id === id || u.studentId === id);
    if (user) {
      user.passwordHash = newPassword || 'student123';
      success = true;
    }
  });

  if (!success) {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }
  res.json({ message: 'Password has been reset successfully.' });
});

// --------------------------------------------------------------------------
// 3. SUBJECTS (Student Personal & Global University Curriculum)
// --------------------------------------------------------------------------
apiRouter.get('/subjects', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const { semester, studentId } = req.query;
  const state = db.get();

  let subjects = state.subjects;

  if (user && user.role === 'student') {
    const sid = user.studentId || user.id;
    // Return global subjects + student's own custom subjects
    subjects = subjects.filter((s) => !s.studentId || s.studentId === sid);
  } else if (studentId) {
    subjects = subjects.filter((s) => !s.studentId || s.studentId === studentId);
  }

  if (semester) {
    subjects = subjects.filter((s) => !s.semester || s.semester === Number(semester));
  }

  res.json(subjects);
});

apiRouter.post('/subjects', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { code, name, credits, facultyName, description, priority, weeklyTargetHours, semester, color } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'Subject name is required.' });
    return;
  }

  const generatedCode = (code && code.trim()) ? code.trim().toUpperCase() : name.trim().slice(0, 4).toUpperCase() + Math.floor(100 + Math.random() * 900);

  const newSubject: Subject = {
    id: `sub_${Date.now()}`,
    code: generatedCode,
    name: name.trim(),
    credits: Number(credits) || 3,
    facultyName: facultyName || (user.role === 'student' ? 'Self-Directed / Faculty' : 'Faculty Assigned'),
    description: description || '',
    studentId: user.role === 'student' ? (user.studentId || user.id) : undefined,
    priority: (priority as any) || 'Medium',
    weeklyTargetHours: Number(weeklyTargetHours) || 4,
    semester: Number(semester) || user.semester || 1,
    color: color || '#4F46E5',
  };

  db.update((data) => {
    data.subjects.push(newSubject);
  });

  res.status(201).json(newSubject);
});

apiRouter.put('/subjects/:id', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { id } = req.params;
  const { code, name, credits, facultyName, description, priority, weeklyTargetHours, semester, color } = req.body;

  let updated: Subject | null = null;
  db.update((data) => {
    const idx = data.subjects.findIndex((s) => s.id === id);
    if (idx !== -1) {
      // Permission check: if student, must be their custom subject
      if (user.role === 'student' && data.subjects[idx].studentId && data.subjects[idx].studentId !== (user.studentId || user.id)) {
        return;
      }
      data.subjects[idx] = {
        ...data.subjects[idx],
        code: code !== undefined ? code.toUpperCase() : data.subjects[idx].code,
        name: name !== undefined ? name : data.subjects[idx].name,
        credits: credits !== undefined ? Number(credits) : data.subjects[idx].credits,
        facultyName: facultyName !== undefined ? facultyName : data.subjects[idx].facultyName,
        description: description !== undefined ? description : data.subjects[idx].description,
        priority: priority !== undefined ? priority : data.subjects[idx].priority,
        weeklyTargetHours: weeklyTargetHours !== undefined ? Number(weeklyTargetHours) : data.subjects[idx].weeklyTargetHours,
        semester: semester !== undefined ? Number(semester) : data.subjects[idx].semester,
        color: color !== undefined ? color : data.subjects[idx].color,
      };
      updated = data.subjects[idx];
    }
  });

  if (!updated) {
    res.status(404).json({ error: 'Subject not found or unauthorized to edit.' });
    return;
  }
  res.json(updated);
});

apiRouter.delete('/subjects/:id', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { id } = req.params;

  let removed = false;
  db.update((data) => {
    const sub = data.subjects.find((s) => s.id === id);
    if (!sub) return;

    if (user.role === 'student' && sub.studentId && sub.studentId !== (user.studentId || user.id)) {
      return;
    }

    data.subjects = data.subjects.filter((s) => s.id !== id);
    removed = true;
  });

  if (!removed) {
    res.status(404).json({ error: 'Subject not found or cannot be deleted.' });
    return;
  }

  res.json({ message: 'Subject removed successfully.' });
});

// --------------------------------------------------------------------------
// 3.5. MAKE YOUR ROUTINE & DEADLINE ENGINE
// --------------------------------------------------------------------------
function evaluateRoutineDeadlines(studentId: string) {
  const state = db.get();
  const studentRoutines = state.routines[studentId] || [];
  if (studentRoutines.length === 0) return;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
  const now = new Date();
  const todayDay = days[now.getDay()];
  const todayStr = now.toISOString().split('T')[0];

  const todaySlots = studentRoutines.filter((s) => s.dayOfWeek === todayDay);
  if (todaySlots.length === 0) return;

  db.update((data) => {
    if (!data.boostScores[studentId]) return;
    const scoreData = data.boostScores[studentId];

    todaySlots.forEach((slot) => {
      // Find existing task for this student, today, and this slot
      let existingTask = data.dailyTasks.find(
        (t) => t.studentId === studentId && t.date === todayStr && (t.routineSlotId === slot.id || t.subjectId === slot.subjectId)
      );

      // Parse end time to calculate deadline (End Time + 3 Hours)
      const [endH, endM] = slot.endTime.split(':').map(Number);
      const deadlineDate = new Date();
      deadlineDate.setHours(endH + (slot.deadlineHoursAfterEnd || 3), endM || 0, 0, 0);

      const deadlineIso = deadlineDate.toISOString();
      const isPastDeadline = now.getTime() > deadlineDate.getTime();

      if (!existingTask) {
        // Create scheduled task for today
        const newTask: DailyTask = {
          id: `task_rout_${Date.now()}_${slot.id}`,
          studentId,
          date: todayStr,
          subjectId: slot.subjectId,
          subjectName: slot.subjectName,
          topic: slot.topic || `Scheduled study session: ${slot.subjectName}`,
          studyDuration: 120,
          learningSummary: '',
          remarks: `Routine slot: ${slot.startTime} – ${slot.endTime}`,
          pageCount: 0,
          noteFiles: [],
          status: isPastDeadline ? 'MISSED' : 'PENDING',
          pendingReason: isPastDeadline ? `Today's ${slot.subjectName} task was not completed before the deadline. -8 points.` : `Scheduled study: ${slot.startTime} – ${slot.endTime}. Notes deadline: 3 hours after end.`,
          boostPointsAwarded: 0,
          submittedAt: now.toISOString(),
          verifiedByAdmin: false,
          routineSlotId: slot.id,
          scheduledStartTime: slot.startTime,
          scheduledEndTime: slot.endTime,
          uploadDeadline: deadlineIso,
          isMissed: isPastDeadline,
          penaltyApplied: isPastDeadline,
        };

        if (isPastDeadline) {
          // Apply -8 points penalty
          scoreData.currentScore = Math.max(0, scoreData.currentScore - 8);
          scoreData.history.unshift({
            id: `bsh_pen_${Date.now()}`,
            studentId,
            date: todayStr,
            points: -8,
            reason: `Today's ${slot.subjectName} task was not completed before the deadline. -8 points.`,
            category: 'admin_adjustment',
          });

          data.notifications.unshift({
            id: `notif_missed_${Date.now()}`,
            studentId,
            title: `Task Missed: ${slot.subjectName} (-8 pts) ⚠️`,
            message: `Today's ${slot.subjectName} task was not completed before the deadline. -8 points.`,
            type: 'task_pending',
            isRead: false,
            createdAt: now.toISOString(),
          });
        }

        data.dailyTasks.unshift(newTask);
      } else {
        // Task already exists: if still pending and past deadline, mark missed
        if (existingTask.status === 'PENDING' && existingTask.pageCount < 3 && isPastDeadline && !existingTask.penaltyApplied) {
          existingTask.status = 'MISSED';
          existingTask.isMissed = true;
          existingTask.penaltyApplied = true;
          existingTask.pendingReason = `Today's ${existingTask.subjectName} task was not completed before the deadline. -8 points.`;

          scoreData.currentScore = Math.max(0, scoreData.currentScore - 8);
          scoreData.history.unshift({
            id: `bsh_pen_${Date.now()}`,
            studentId,
            date: todayStr,
            points: -8,
            reason: `Today's ${existingTask.subjectName} task was not completed before the deadline. -8 points.`,
            category: 'admin_adjustment',
          });

          data.notifications.unshift({
            id: `notif_missed_${Date.now()}`,
            studentId,
            title: `Task Missed: ${existingTask.subjectName} (-8 pts) ⚠️`,
            message: `Today's ${existingTask.subjectName} task was not completed before the deadline. -8 points.`,
            type: 'task_pending',
            isRead: false,
            createdAt: now.toISOString(),
          });
        }
      }
    });
  });
}

apiRouter.get('/routine', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const targetStudentId = (req.query.studentId as string) || user.studentId || user.id;

  // Run routine deadline evaluator
  evaluateRoutineDeadlines(targetStudentId);

  const state = db.get();
  const routines = state.routines[targetStudentId] || [];

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
  const now = new Date();
  const todayDay = days[now.getDay()];
  const todaySlots = routines.filter((r) => r.dayOfWeek === todayDay);

  // Compute active countdown for today's sessions
  let activeDeadline: any = null;
  todaySlots.forEach((slot) => {
    const [endH, endM] = slot.endTime.split(':').map(Number);
    const deadlineDate = new Date();
    deadlineDate.setHours(endH + (slot.deadlineHoursAfterEnd || 3), endM || 0, 0, 0);

    const diffMs = deadlineDate.getTime() - now.getTime();
    const remainingMinutes = Math.max(0, Math.floor(diffMs / 60000));
    const hours = Math.floor(remainingMinutes / 60);
    const mins = remainingMinutes % 60;

    const todayStr = now.toISOString().split('T')[0];
    const task = state.dailyTasks.find((t) => t.studentId === targetStudentId && t.date === todayStr && t.routineSlotId === slot.id);
    const isCompleted = task && task.status === 'COMPLETED';

    if (!activeDeadline || (diffMs > 0 && !isCompleted)) {
      activeDeadline = {
        slotId: slot.id,
        subjectName: slot.subjectName,
        topic: slot.topic,
        startTime: slot.startTime,
        endTime: slot.endTime,
        deadlineIso: deadlineDate.toISOString(),
        deadlineText: `${deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        remainingText: `${hours}h ${mins}m remaining`,
        remainingMinutes,
        isCompleted: Boolean(isCompleted),
        isMissed: diffMs <= 0 && !isCompleted,
        penaltyApplied: task?.penaltyApplied || false,
      };
    }
  });

  res.json({
    routines,
    todaySlots,
    activeDeadline,
  });
});

apiRouter.post('/routine', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const studentId = user.studentId || user.id;

  const { dayOfWeek, subjectId, subjectName, topic, startTime, endTime, studyTarget, notesRequirementPages, priority, deadlineHoursAfterEnd } = req.body;

  if (!dayOfWeek || !subjectName || !startTime || !endTime) {
    res.status(400).json({ error: 'Day of week, subject, start time and end time are required.' });
    return;
  }

  const newSlot: RoutineSlot = {
    id: `rout_${Date.now()}`,
    studentId,
    dayOfWeek,
    subjectId: subjectId || `sub_${Date.now()}`,
    subjectName: subjectName.trim(),
    topic: (topic || '').trim(),
    startTime: startTime.trim(),
    endTime: endTime.trim(),
    studyTarget: (studyTarget || '').trim(),
    notesRequirementPages: Number(notesRequirementPages) || 3,
    priority: priority || 'Medium',
    deadlineHoursAfterEnd: Number(deadlineHoursAfterEnd) || 3,
    createdAt: new Date().toISOString(),
  };

  db.update((data) => {
    if (!data.routines[studentId]) {
      data.routines[studentId] = [];
    }
    data.routines[studentId].push(newSlot);
  });

  res.status(201).json(newSlot);
});

apiRouter.put('/routine/:id', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const studentId = user.studentId || user.id;
  const { id } = req.params;
  const updates = req.body;

  let updated: RoutineSlot | null = null;
  db.update((data) => {
    const list = data.routines[studentId] || [];
    const idx = list.findIndex((r) => r.id === id);
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        ...updates,
      };
      updated = list[idx];
    }
  });

  if (!updated) {
    res.status(404).json({ error: 'Routine slot not found.' });
    return;
  }
  res.json(updated);
});

apiRouter.delete('/routine/:id', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const studentId = user.studentId || user.id;
  const { id } = req.params;

  let deleted = false;
  db.update((data) => {
    if (data.routines[studentId]) {
      data.routines[studentId] = data.routines[studentId].filter((r) => r.id !== id);
      deleted = true;
    }
  });

  if (!deleted) {
    res.status(404).json({ error: 'Routine slot not found.' });
    return;
  }

  res.json({ message: 'Routine slot removed.' });
});

// Admin penalty override
apiRouter.post('/daily-tasks/:id/override-penalty', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;

  let modifiedTask: DailyTask | null = null;
  db.update((data) => {
    const task = data.dailyTasks.find((t) => t.id === id);
    if (task && task.penaltyApplied && !task.penaltyOverridden) {
      task.penaltyOverridden = true;
      task.status = 'PENDING';
      task.pendingReason = 'Penalty reviewed and forgiven by Administrator.';

      // Restore 8 points to student
      const scoreObj = data.boostScores[task.studentId];
      if (scoreObj) {
        scoreObj.currentScore = Math.min(1000, scoreObj.currentScore + 8);
        scoreObj.history.unshift({
          id: `bsh_over_${Date.now()}`,
          studentId: task.studentId,
          date: new Date().toISOString().split('T')[0],
          points: 8,
          reason: `Admin Penalty Override: +8 points restored for ${task.subjectName}`,
          category: 'admin_adjustment',
        });
      }

      data.notifications.unshift({
        id: `notif_over_${Date.now()}`,
        studentId: task.studentId,
        title: 'Missed Task Penalty Forgiven ✓',
        message: `Administrator reviewed your penalty for ${task.subjectName}. +8 Boost Points have been restored.`,
        type: 'score_boost',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      modifiedTask = task;
    }
  });

  if (!modifiedTask) {
    res.status(400).json({ error: 'Task not found or penalty was not applied/already overridden.' });
    return;
  }

  res.json({ task: modifiedTask, message: 'Penalty overridden successfully. +8 points restored.' });
});

// --------------------------------------------------------------------------
// 4. MARKS MANAGEMENT (Official Records - Admin only can modify)
// --------------------------------------------------------------------------
apiRouter.get('/marks', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { studentId, subjectId } = req.query;

  let marks = db.get().marks;

  // Student can strictly ONLY see their own marks
  if (user.role === 'student') {
    const targetStudentId = user.studentId || user.id;
    marks = marks.filter((m) => m.studentId === targetStudentId);
  } else {
    // Admin can filter by student
    if (studentId) {
      marks = marks.filter((m) => m.studentId === studentId);
    }
  }

  if (subjectId) {
    marks = marks.filter((m) => m.subjectId === subjectId);
  }

  // Calculate summary metrics
  const totalObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
  const totalMax = marks.reduce((sum, m) => sum + m.maximumMarks, 0);
  const overallPercentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(1)) : 0;

  // Find highest & lowest subjects
  let highestSubject = null;
  let lowestSubject = null;
  if (marks.length > 0) {
    const sorted = [...marks].sort((a, b) => b.percentage - a.percentage);
    highestSubject = sorted[0];
    lowestSubject = sorted[sorted.length - 1];
  }

  res.json({
    marks,
    summary: {
      totalSubjects: marks.length,
      overallPercentage,
      highestSubject,
      lowestSubject,
      requiresAttentionCount: marks.filter((m) => m.percentage < 60).length,
    },
  });
});

apiRouter.post('/marks', requireAdmin, (req: Request, res: Response) => {
  const { studentId, subjectId, examType, marksObtained, maximumMarks, academicYear, semester, remarks } = req.body;

  if (!studentId || !subjectId || marksObtained === undefined || !maximumMarks) {
    res.status(400).json({ error: 'Student ID, Subject, Marks Obtained and Maximum Marks are required.' });
    return;
  }

  const subjects = db.get().subjects;
  const subject = subjects.find((s) => s.id === subjectId || s.code === subjectId);
  if (!subject) {
    res.status(400).json({ error: 'Valid subject is required.' });
    return;
  }

  const obtained = Number(marksObtained);
  const max = Number(maximumMarks);
  const percentage = Number(((obtained / max) * 100).toFixed(1));

  let status: 'Distinction' | 'First Class' | 'Pass' | 'Needs Attention' = 'Pass';
  if (percentage >= 75) status = 'Distinction';
  else if (percentage >= 65) status = 'First Class';
  else if (percentage >= 50) status = 'Pass';
  else status = 'Needs Attention';

  const newMark: MarkRecord = {
    id: `mrk_${Date.now()}`,
    studentId,
    subjectId: subject.id,
    subjectName: subject.name,
    subjectCode: subject.code,
    examType: examType || 'Semester End Exam',
    marksObtained: obtained,
    maximumMarks: max,
    percentage,
    status,
    examDate: new Date().toISOString().split('T')[0],
    academicYear: academicYear || '2025-2026',
    semester: Number(semester) || 3,
    remarks: remarks || '',
  };

  db.update((data) => {
    data.marks.push(newMark);
    // Push notification to student
    data.notifications.unshift({
      id: `notif_${Date.now()}`,
      studentId,
      title: 'New Official Marks Published',
      message: `Your marks for ${subject.name} (${obtained}/${max} - ${percentage}%) have been officially published.`,
      type: 'marks_update',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  });

  res.status(201).json(newMark);
});

apiRouter.put('/marks/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { marksObtained, maximumMarks, examType, remarks } = req.body;

  let updated: MarkRecord | null = null;
  db.update((data) => {
    const idx = data.marks.findIndex((m) => m.id === id);
    if (idx !== -1) {
      const current = data.marks[idx];
      const obtained = marksObtained !== undefined ? Number(marksObtained) : current.marksObtained;
      const max = maximumMarks !== undefined ? Number(maximumMarks) : current.maximumMarks;
      const percentage = Number(((obtained / max) * 100).toFixed(1));

      let status: 'Distinction' | 'First Class' | 'Pass' | 'Needs Attention' = 'Pass';
      if (percentage >= 75) status = 'Distinction';
      else if (percentage >= 65) status = 'First Class';
      else if (percentage >= 50) status = 'Pass';
      else status = 'Needs Attention';

      data.marks[idx] = {
        ...current,
        marksObtained: obtained,
        maximumMarks: max,
        percentage,
        status,
        examType: examType || current.examType,
        remarks: remarks !== undefined ? remarks : current.remarks,
      };
      updated = data.marks[idx];
    }
  });

  if (!updated) {
    res.status(404).json({ error: 'Mark record not found.' });
    return;
  }
  res.json(updated);
});

apiRouter.delete('/marks/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  db.update((data) => {
    data.marks = data.marks.filter((m) => m.id !== id);
  });
  res.json({ message: 'Marks record deleted successfully.' });
});

// --------------------------------------------------------------------------
// 5. HOW TO BOOST (Personalized Study Guidance Engine)
// --------------------------------------------------------------------------
apiRouter.get('/boost-suggestions', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const targetStudentId = (req.query.studentId as string) || user.studentId || user.id;

  const marks = db.get().marks.filter((m) => m.studentId === targetStudentId);
  const subjects = db.get().subjects;

  const suggestions: BoostSuggestion[] = subjects.map((sub) => {
    const subMarks = marks.filter((m) => m.subjectId === sub.id || m.subjectCode === sub.code);
    const avgPercentage =
      subMarks.length > 0
        ? subMarks.reduce((sum, m) => sum + m.percentage, 0) / subMarks.length
        : 65; // default benchmark if not taken yet

    if (avgPercentage < 60) {
      return {
        subjectId: sub.id,
        subjectName: sub.name,
        status: 'low',
        currentPercentage: Math.round(avgPercentage),
        attentionLevel: 'High Attention Required',
        suggestedDailyMinutes: 50,
        recommendedActivities: [
          `Increase ${sub.name} daily practice to 50+ minutes.`,
          'Complete 10 focused practice numerical/code questions daily.',
          'Revise foundational weak topics and textbook step-by-step proofs.',
          'Take a weekly timed self-assessment mock test under exam conditions.',
        ],
        weeklyTarget: 'Solve 60 curated problems and complete 3 full chapter summaries.',
        revisionSuggestions: [
          'Break complex theorems down into visual 3-page summary flowcharts.',
          'Formulate dedicated formula and theorem recall flashcards.',
          'Clarify recurring doubts during weekly faculty office hours.',
        ],
      };
    } else if (avgPercentage < 75) {
      return {
        subjectId: sub.id,
        subjectName: sub.name,
        status: 'moderate',
        currentPercentage: Math.round(avgPercentage),
        attentionLevel: 'Moderate Revision',
        suggestedDailyMinutes: 35,
        recommendedActivities: [
          'Maintain 35 minutes daily structured review.',
          'Review previous semester mid-term questions for this module.',
          'Target tricky edge cases and numerical derivations.',
        ],
        weeklyTarget: 'Consolidate 2 core chapters and attempt 1 mid-term past paper.',
        revisionSuggestions: [
          'Focus on application-oriented problem sets rather than pure theory.',
          'Produce clean handwritten revision sheets every weekend.',
        ],
      };
    } else {
      return {
        subjectId: sub.id,
        subjectName: sub.name,
        status: 'high',
        currentPercentage: Math.round(avgPercentage),
        attentionLevel: 'Maintain Consistency',
        suggestedDailyMinutes: 25,
        recommendedActivities: [
          'Maintain current study consistency and high standards.',
          'Focus on advanced conceptual exercises and peer group discussions.',
          'Regularly write short review summaries to preserve long-term memory.',
        ],
        weeklyTarget: 'Complete advanced problem bank and assist study peers.',
        revisionSuggestions: [
          'Execute a quick 20-minute weekly recall session to avoid decay.',
          'Explore real-world industrial and project applications.',
        ],
      };
    }
  });

  // Sort by lowest percentage first so weakest subjects appear prominently
  suggestions.sort((a, b) => a.currentPercentage - b.currentPercentage);

  res.json({
    suggestions,
    disclaimer:
      'Notice: Study Boost suggestions are tailored learning recommendations designed to cultivate healthy study habits and daily consistency. These suggestions do not guarantee examination marks or specific grade outcomes.',
  });
});

// --------------------------------------------------------------------------
// 6. DAILY STUDY TASKS & AUTOMATIC VALIDATION
// --------------------------------------------------------------------------
apiRouter.get('/daily-tasks', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { studentId, date, status, subjectId } = req.query;

  let tasks = db.get().dailyTasks;

  if (user.role === 'student') {
    const targetStudentId = user.studentId || user.id;
    tasks = tasks.filter((t) => t.studentId === targetStudentId);
  } else {
    if (studentId) {
      tasks = tasks.filter((t) => t.studentId === studentId);
    }
  }

  if (date) {
    tasks = tasks.filter((t) => t.date === date);
  }
  if (status) {
    tasks = tasks.filter((t) => t.status === status);
  }
  if (subjectId) {
    tasks = tasks.filter((t) => t.subjectId === subjectId);
  }

  // Sort by date descending
  tasks.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  res.json(tasks);
});

apiRouter.post('/daily-tasks', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const studentId = user.studentId || user.id;

  const { subjectId, topic, studyDuration, learningSummary, remarks, noteFiles, pageCount } = req.body;

  if (!subjectId || !topic) {
    res.status(400).json({ error: 'Subject and Topic studied are required.' });
    return;
  }

  const subjects = db.get().subjects;
  const subject = subjects.find((s) => s.id === subjectId || s.name === subjectId);
  const subjectName = subject ? subject.name : 'General Studies';

  const durationNum = Number(studyDuration) || 0;
  const totalPages = Number(pageCount) || (Array.isArray(noteFiles) ? noteFiles.reduce((acc: number, f: any) => acc + (f.pageCount || 1), 0) : 0);

  // AUTOMATIC VALIDATION RULES
  // Requirement: Minimum 3-4 pages of study notes uploaded, summary provided, duration logged
  const pendingReasons: string[] = [];

  if (totalPages < 3) {
    pendingReasons.push(`Upload your 3–4 pages of study notes to complete today's task. (Currently uploaded: ${totalPages} pages).`);
  }
  if (!learningSummary || learningSummary.trim().length < 15) {
    pendingReasons.push('Please provide a substantive summary of what you learned today (minimum 15 characters).');
  }
  if (durationNum < 30) {
    pendingReasons.push('Log at least 30 minutes of dedicated study time for today.');
  }

  const isCompleted = pendingReasons.length === 0;
  const status = isCompleted ? 'COMPLETED' : 'PENDING';
  const pendingReason = isCompleted ? undefined : pendingReasons.join(' ');

  // Calculate points
  let boostPointsAwarded = 0;
  if (isCompleted) {
    boostPointsAwarded += 20; // Daily task completed: +20
    if (totalPages >= 3) {
      boostPointsAwarded += 10; // 3-4 pages notes submitted: +10
    }
    if (durationNum >= 30) {
      boostPointsAwarded += 5; // 30+ minutes study logged: +5
    }
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Safeguard: Check duplicate tasks on the same day for same topic
  const existingToday = db.get().dailyTasks.filter((t) => t.studentId === studentId && t.date === todayStr);
  const isDuplicate = existingToday.some((t) => t.topic.toLowerCase() === topic.toLowerCase() && t.status === 'COMPLETED');

  if (isDuplicate) {
    // Avoid double awarding points
    boostPointsAwarded = 0;
  }

  const taskId = `task_${Date.now()}`;
  const newTask: DailyTask = {
    id: taskId,
    studentId,
    date: todayStr,
    subjectId: subject ? subject.id : 'sub_gen',
    subjectName,
    topic: topic.trim(),
    studyDuration: durationNum,
    learningSummary: (learningSummary || '').trim(),
    remarks: remarks || '',
    pageCount: totalPages,
    noteFiles: Array.isArray(noteFiles) ? noteFiles : [],
    status,
    pendingReason,
    boostPointsAwarded,
    submittedAt: new Date().toISOString(),
    verifiedByAdmin: false,
  };

  db.update((data) => {
    data.dailyTasks.unshift(newTask);

    // Save notes entry
    if (totalPages > 0) {
      data.notes.unshift({
        id: `note_${Date.now()}`,
        studentId,
        studentName: user.name,
        taskId,
        subjectId: subject ? subject.id : 'sub_gen',
        subjectName,
        topic: topic.trim(),
        fileUrl: noteFiles && noteFiles[0] ? noteFiles[0].url : 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
        fileName: noteFiles && noteFiles[0] ? noteFiles[0].fileName : `${subjectName}_Notes_${totalPages}Pages.pdf`,
        fileType: noteFiles && noteFiles[0] ? noteFiles[0].fileType : 'application/pdf',
        fileSize: noteFiles && noteFiles[0] ? noteFiles[0].fileSize : 450000,
        pageCount: totalPages,
        uploadDate: new Date().toISOString(),
        submissionStatus: status,
        notesText: learningSummary,
      });
    }

    // Award Boost Score if completed and not duplicate
    if (isCompleted && boostPointsAwarded > 0) {
      if (!data.boostScores[studentId]) {
        data.boostScores[studentId] = {
          studentId,
          currentScore: 0,
          pointsToday: 0,
          pointsThisWeek: 0,
          currentMilestone: 'Getting Started',
          nextMilestone: { points: 250, title: 'Getting Started', remaining: 250 },
          history: [],
        };
      }
      const scoreObj = data.boostScores[studentId];
      scoreObj.currentScore = Math.min(1000, scoreObj.currentScore + boostPointsAwarded);
      scoreObj.pointsToday += boostPointsAwarded;
      scoreObj.pointsThisWeek += boostPointsAwarded;

      const mInfo = getMilestoneInfo(scoreObj.currentScore);
      scoreObj.currentMilestone = mInfo.current;
      scoreObj.nextMilestone = mInfo.next;

      scoreObj.history.unshift({
        id: `bsh_${Date.now()}`,
        studentId,
        date: todayStr,
        points: boostPointsAwarded,
        reason: `Daily task completed: ${subjectName} (+${boostPointsAwarded} pts)`,
        category: 'daily_task',
      });

      // Update study streak
      if (!data.streaks[studentId]) {
        data.streaks[studentId] = {
          studentId,
          currentStreak: 0,
          longestStreak: 0,
          totalCompletedDays: 0,
          missedDays: 0,
          lastCompletedDate: '',
          calendar: [],
        };
      }
      const streakObj = data.streaks[studentId];
      if (streakObj.lastCompletedDate !== todayStr) {
        streakObj.currentStreak += 1;
        streakObj.longestStreak = Math.max(streakObj.longestStreak, streakObj.currentStreak);
        streakObj.totalCompletedDays += 1;
        streakObj.lastCompletedDate = todayStr;

        // Check if 7-day streak milestone hit
        if (streakObj.currentStreak === 7 || streakObj.currentStreak % 7 === 0) {
          const streakBonus = 50;
          scoreObj.currentScore = Math.min(1000, scoreObj.currentScore + streakBonus);
          scoreObj.pointsToday += streakBonus;
          scoreObj.history.unshift({
            id: `bsh_streak_${Date.now()}`,
            studentId,
            date: todayStr,
            points: streakBonus,
            reason: `🔥 ${streakObj.currentStreak}-Day Study Streak Bonus! (+50 pts)`,
            category: 'streak_bonus',
          });

          data.notifications.unshift({
            id: `notif_${Date.now()}_streak`,
            studentId,
            title: `🔥 ${streakObj.currentStreak}-Day Study Streak Maintained!`,
            message: `Congratulations! You unlocked a +50 Boost Score bonus for your outstanding consistency.`,
            type: 'streak_alert',
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Add to calendar
      const calIdx = streakObj.calendar.findIndex((c) => c.date === todayStr);
      if (calIdx !== -1) {
        streakObj.calendar[calIdx].status = 'completed';
        streakObj.calendar[calIdx].studyDuration = durationNum;
        streakObj.calendar[calIdx].subjectName = subjectName;
      } else {
        streakObj.calendar.unshift({
          date: todayStr,
          status: 'completed',
          studyDuration: durationNum,
          subjectName,
        });
      }

      // Check weekly challenges progress
      data.challenges.forEach((ch) => {
        if (ch.isActive && ch.studentProgress) {
          if (!ch.studentProgress.isCompleted) {
            ch.studentProgress.completedDays = Math.min(
              ch.requiredCompletionDays,
              ch.studentProgress.completedDays + 1
            );
            if (ch.studentProgress.completedDays >= ch.requiredCompletionDays) {
              ch.studentProgress.isCompleted = true;
              if (!ch.studentProgress.rewardClaimed) {
                ch.studentProgress.rewardClaimed = true;
                scoreObj.currentScore = Math.min(1000, scoreObj.currentScore + ch.rewardPoints);
                scoreObj.history.unshift({
                  id: `bsh_chal_${Date.now()}`,
                  studentId,
                  date: todayStr,
                  points: ch.rewardPoints,
                  reason: `Completed Weekly Challenge: ${ch.title} (+${ch.rewardPoints} pts)`,
                  category: 'challenge_reward',
                });
                data.notifications.unshift({
                  id: `notif_${Date.now()}_chal`,
                  studentId,
                  title: `🏆 Weekly Challenge Completed!`,
                  message: `You completed "${ch.title}" and earned +${ch.rewardPoints} Boost Points!`,
                  type: 'challenge_update',
                  isRead: false,
                  createdAt: new Date().toISOString(),
                });
              }
            }
          }
        }
      });

      // Notification for score boost
      data.notifications.unshift({
        id: `notif_${Date.now()}`,
        studentId,
        title: 'Daily Task Completed ✅',
        message: `Your study task for ${subjectName} was validated. You earned +${boostPointsAwarded} Boost Points!`,
        type: 'score_boost',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    } else if (!isCompleted) {
      // Pending notification
      data.notifications.unshift({
        id: `notif_${Date.now()}`,
        studentId,
        title: 'Daily Task Pending ⏳',
        message: pendingReason || 'Upload your 3–4 pages of study notes to complete today’s task.',
        type: 'task_pending',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  });

  res.status(201).json({
    task: newTask,
    isCompleted,
    pointsAwarded: boostPointsAwarded,
    message: isCompleted
      ? `Task validated and completed! +${boostPointsAwarded} Boost Points awarded.`
      : `Task saved as PENDING. ${pendingReason}`,
  });
});

apiRouter.put('/daily-tasks/:id/verify', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, verified } = req.body;

  let updatedTask: DailyTask | null = null;
  db.update((data) => {
    const task = data.dailyTasks.find((t) => t.id === id);
    if (task) {
      if (status) task.status = status;
      if (verified !== undefined) task.verifiedByAdmin = Boolean(verified);
      updatedTask = task;
    }
  });

  if (!updatedTask) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }
  res.json(updatedTask);
});

// --------------------------------------------------------------------------
// 7. MY NOTES
// --------------------------------------------------------------------------
apiRouter.get('/notes', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { studentId, subjectId, search } = req.query;

  let notes = db.get().notes;

  if (user.role === 'student') {
    const targetStudentId = user.studentId || user.id;
    notes = notes.filter((n) => n.studentId === targetStudentId);
  } else {
    if (studentId) {
      notes = notes.filter((n) => n.studentId === studentId);
    }
  }

  if (subjectId && subjectId !== 'all') {
    notes = notes.filter((n) => n.subjectId === subjectId);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    notes = notes.filter(
      (n) =>
        n.topic.toLowerCase().includes(q) ||
        n.subjectName.toLowerCase().includes(q) ||
        n.fileName.toLowerCase().includes(q) ||
        (n.notesText && n.notesText.toLowerCase().includes(q))
    );
  }

  res.json(notes);
});

// --------------------------------------------------------------------------
// 8. BOOST SCORE, OVERALL CURRENT SUCCESS & LEADERBOARD
// --------------------------------------------------------------------------
apiRouter.get('/boost-score', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const targetStudentId = (req.query.studentId as string) || user.studentId || user.id;

  let scoreData = db.get().boostScores[targetStudentId];
  if (!scoreData) {
    scoreData = {
      studentId: targetStudentId,
      currentScore: 0,
      currentSuccessPercentage: 0,
      successTrend: 0,
      pointsToday: 0,
      pointsThisWeek: 0,
      currentMilestone: 'Getting Started',
      nextMilestone: { points: 250, title: 'Getting Started', remaining: 250 },
      history: [],
    };
  }

  const currentSuccessPercentage = calculateSuccessPercentage(scoreData.currentScore);
  const successTrend = scoreData.successTrend ?? (scoreData.currentScore > 500 ? 4 : 2);

  const milestones = [
    { points: 250, title: 'Getting Started', unlocked: scoreData.currentScore >= 250, description: 'Established daily study habit setup' },
    { points: 500, title: 'Consistent', unlocked: scoreData.currentScore >= 500, description: 'Demonstrated regular study sessions & note submission' },
    { points: 750, title: 'Strong Progress', unlocked: scoreData.currentScore >= 750, description: 'High weekly engagement and consecutive streak bonus' },
    { points: 1000, title: 'Maximum Score', unlocked: scoreData.currentScore >= 1000, description: 'Elite academic preparation & consistent streak mastery' },
  ];

  res.json({
    ...scoreData,
    currentSuccessPercentage,
    successTrend,
    milestones,
    disclaimer:
      'Notice: Overall Current Success (0–100%) and Study Boost Score (0–1000) are study-progress and consistency indicators based on task completions, note submissions and study duration. They are NOT an examination percentage or guarantee of test marks.',
  });
});

// PUBLIC LEADERBOARD
apiRouter.get('/leaderboard', requireAuth, (_req: Request, res: Response) => {
  const state = db.get();
  // Filter students who have public profile enabled
  const students = state.users.filter(
    (u) => u.role === 'student' && u.isActive && (u.isPublicOnLeaderboard !== false)
  );

  const list = students.map((stu) => {
    const sid = stu.studentId || stu.id;
    const scoreData = state.boostScores[sid];
    const streakData = state.streaks[sid];

    const boostScore = scoreData ? scoreData.currentScore : 0;
    const currentSuccessPercentage = calculateSuccessPercentage(boostScore);
    const successTrend = scoreData?.successTrend ?? (boostScore > 500 ? 5 : 2);
    const streak = streakData ? streakData.currentStreak : 0;

    return {
      studentId: sid,
      name: stu.name,
      avatar: stu.avatar,
      branch: stu.branch,
      semester: stu.semester,
      boostScore,
      currentSuccessPercentage,
      successTrend,
      streak,
    };
  });

  // Rank by Boost Score descending
  list.sort((a, b) => b.boostScore - a.boostScore);

  const ranked = list.map((item, idx) => ({
    rank: idx + 1,
    ...item,
  }));

  res.json({
    leaderboard: ranked,
    disclaimer:
      'The Public Leaderboard reflects student study habit engagement and consistent Boost Points. This is a motivational study indicator, not an academic examination ranking.',
  });
});

// Student toggle for public profile visibility on leaderboard
apiRouter.put('/user/leaderboard-visibility', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { isPublicOnLeaderboard } = req.body;

  let updatedUser: any = null;
  db.update((data) => {
    const u = data.users.find((usr) => usr.id === user.id || usr.studentId === user.studentId);
    if (u) {
      u.isPublicOnLeaderboard = Boolean(isPublicOnLeaderboard);
      const { passwordHash, ...safe } = u;
      updatedUser = safe;
    }
  });

  if (!updatedUser) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  res.json({ success: true, user: updatedUser });
});

// Student profile update (avatar photo, phone, branch, semester)
apiRouter.put('/user/profile', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { avatar, name, phone, branch, semester } = req.body;

  let updatedUser: any = null;
  db.update((data) => {
    const u = data.users.find((usr) => usr.id === user.id || usr.studentId === user.studentId);
    if (u) {
      if (avatar) u.avatar = avatar;
      if (name && typeof name === 'string' && name.trim()) u.name = name.trim();
      if (phone !== undefined) u.phone = String(phone).trim();
      if (branch) u.branch = branch;
      if (semester) u.semester = Number(semester);
      const { passwordHash, ...safe } = u;
      updatedUser = safe;
    }
  });

  if (!updatedUser) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  res.json({ success: true, user: updatedUser, message: 'Profile updated successfully.' });
});

// Admin change password
apiRouter.post('/admin/change-password', requireAdmin, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Both current password and new password are required.' });
    return;
  }
  if (newPassword.trim().length < 4) {
    res.status(400).json({ error: 'New password must be at least 4 characters.' });
    return;
  }

  const users = db.get().users;
  const adminUser = users.find((u) => u.id === user.id || (u.role === 'admin' && (u.studentId === user.studentId || u.email === user.email)));

  if (!adminUser || adminUser.passwordHash !== currentPassword.trim()) {
    res.status(400).json({ error: 'Current admin password does not match.' });
    return;
  }

  db.update((data) => {
    const target = data.users.find((u) => u.id === adminUser.id);
    if (target) {
      target.passwordHash = newPassword.trim();
    }
  });

  res.json({ success: true, message: 'Admin password successfully updated.' });
});

// --------------------------------------------------------------------------
// 9. STUDY STREAK
// --------------------------------------------------------------------------
apiRouter.get('/streak', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const targetStudentId = (req.query.studentId as string) || user.studentId || user.id;

  let streakData = db.get().streaks[targetStudentId];
  if (!streakData) {
    streakData = {
      studentId: targetStudentId,
      currentStreak: 0,
      longestStreak: 0,
      totalCompletedDays: 0,
      missedDays: 0,
      lastCompletedDate: '',
      calendar: [],
    };
  }

  res.json(streakData);
});

// --------------------------------------------------------------------------
// 10. WEEKLY CHALLENGES
// --------------------------------------------------------------------------
apiRouter.get('/challenges', requireAuth, (_req: Request, res: Response) => {
  res.json(db.get().challenges);
});

apiRouter.post('/challenges', requireAdmin, (req: Request, res: Response) => {
  const {
    title,
    description,
    durationDays,
    requiredPagesPerDay,
    requiredStudyMinutesPerDay,
    requiredCompletionDays,
    rewardPoints,
    startDate,
    endDate,
  } = req.body;

  if (!title || !description) {
    res.status(400).json({ error: 'Challenge title and description are required.' });
    return;
  }

  const newChallenge: WeeklyChallenge = {
    id: `chal_${Date.now()}`,
    title: title.trim(),
    description: description.trim(),
    durationDays: Number(durationDays) || 7,
    requiredPagesPerDay: Number(requiredPagesPerDay) || 3,
    requiredStudyMinutesPerDay: Number(requiredStudyMinutesPerDay) || 30,
    requiredCompletionDays: Number(requiredCompletionDays) || 5,
    rewardPoints: Number(rewardPoints) || 100,
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    isActive: true,
    participantCount: 0,
    studentProgress: {
      completedDays: 0,
      isCompleted: false,
      rewardClaimed: false,
    },
  };

  db.update((data) => {
    data.challenges.unshift(newChallenge);
    // Broadcast notification to students
    data.users
      .filter((u) => u.role === 'student')
      .forEach((stu) => {
        data.notifications.unshift({
          id: `notif_chal_${Date.now()}_${stu.studentId}`,
          studentId: stu.studentId || stu.id,
          title: 'New Weekly Challenge Available!',
          message: `Participate in "${newChallenge.title}" to earn +${newChallenge.rewardPoints} Boost Points.`,
          type: 'challenge_update',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      });
  });

  res.status(201).json(newChallenge);
});

apiRouter.put('/challenges/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  let updated: WeeklyChallenge | null = null;
  db.update((data) => {
    const idx = data.challenges.findIndex((c) => c.id === id);
    if (idx !== -1) {
      data.challenges[idx] = { ...data.challenges[idx], ...updates };
      updated = data.challenges[idx];
    }
  });

  if (!updated) {
    res.status(404).json({ error: 'Challenge not found.' });
    return;
  }
  res.json(updated);
});

apiRouter.delete('/challenges/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  db.update((data) => {
    data.challenges = data.challenges.filter((c) => c.id !== id);
  });
  res.json({ message: 'Challenge removed successfully.' });
});

// --------------------------------------------------------------------------
// 11. NOTIFICATIONS
// --------------------------------------------------------------------------
apiRouter.get('/notifications', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const targetStudentId = user.studentId || user.id;

  const notifs = db.get().notifications.filter((n) => n.studentId === targetStudentId);
  const unreadCount = notifs.filter((n) => !n.isRead).length;

  res.json({ notifications: notifs, unreadCount });
});

apiRouter.post('/notifications/:id/read', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  db.update((data) => {
    const item = data.notifications.find((n) => n.id === id);
    if (item) item.isRead = true;
  });
  res.json({ success: true });
});

apiRouter.post('/notifications/read-all', requireAuth, (req: Request, res: Response) => {
  const user: User = (req as any).user;
  const targetStudentId = user.studentId || user.id;

  db.update((data) => {
    data.notifications.forEach((n) => {
      if (n.studentId === targetStudentId) n.isRead = true;
    });
  });
  res.json({ success: true });
});

// --------------------------------------------------------------------------
// 12. ADMIN ANALYTICS
// --------------------------------------------------------------------------
apiRouter.get('/admin/analytics', requireAdmin, (_req: Request, res: Response) => {
  const state = db.get();
  const students = state.users.filter((u) => u.role === 'student');
  const activeStudents = students.filter((s) => s.isActive).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = state.dailyTasks.filter((t) => t.date === todayStr);
  const completedToday = todayTasks.filter((t) => t.status === 'COMPLETED').length;
  const pendingToday = todayTasks.filter((t) => t.status === 'PENDING').length;

  // Average boost score
  const scores = Object.values(state.boostScores);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s.currentScore, 0) / scores.length) : 0;

  // Students on streak (streak >= 3)
  const streaks = Object.values(state.streaks);
  const studentsOnStreak = streaks.filter((s) => s.currentStreak >= 3).length;

  // Weekly challenge completions
  const challengeCompletions = state.challenges.reduce((sum, c) => sum + (c.studentProgress?.isCompleted ? 1 : 0), 0);

  // Subject performance
  const subjectPerformance = state.subjects.map((sub) => {
    const subMarks = state.marks.filter((m) => m.subjectId === sub.id || m.subjectCode === sub.code);
    const avgMarks = subMarks.length > 0 ? Math.round(subMarks.reduce((sum, m) => sum + m.marksObtained, 0) / subMarks.length) : 70;
    const passedCount = subMarks.filter((m) => m.percentage >= 50).length;
    const passRate = subMarks.length > 0 ? Math.round((passedCount / subMarks.length) * 100) : 100;
    return {
      subjectName: sub.name,
      averageMarks: avgMarks,
      passRate,
      studentCount: subMarks.length || students.length,
    };
  });

  const analytics: AdminAnalytics = {
    totalStudents: students.length,
    activeStudents,
    dailySubmissionsToday: todayTasks.length,
    completedTasksToday: completedToday,
    pendingTasksToday: pendingToday,
    averageBoostScore: avgScore,
    studentsOnStreak,
    weeklyChallengeCompletions: challengeCompletions,
    subjectPerformance,
    recentActivity: state.dailyTasks.slice(0, 10).map((t) => ({
      id: t.id,
      type: t.status === 'COMPLETED' ? 'Task Completed' : 'Task Pending',
      description: `${t.subjectName} (${t.pageCount} pages, ${t.studyDuration} mins) - ${t.status}`,
      timestamp: t.submittedAt,
      studentName: state.users.find((u) => u.studentId === t.studentId)?.name || t.studentId,
    })),
  };

  res.json(analytics);
});

// Reset demo data utility endpoint
apiRouter.post('/admin/reset-demo-data', requireAdmin, (_req: Request, res: Response) => {
  db.resetToDefaults();
  res.json({ message: 'Database reset to default seed demonstration state.' });
});
