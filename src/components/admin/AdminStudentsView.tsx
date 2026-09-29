import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  X,
  Mail,
  Phone,
  GraduationCap,
  Flame,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { User, MarkRecord } from '../../types/index.ts';

interface AdminStudentsViewProps {
  onNavigate?: (tab: string) => void;
}

export const AdminStudentsView: React.FC<AdminStudentsViewProps> = ({ onNavigate }) => {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [resettingStudent, setResettingStudent] = useState<User | null>(null);
  const [viewingStudent, setViewingStudent] = useState<User | null>(null);
  const [studentMarks, setStudentMarks] = useState<MarkRecord[]>([]);
  const [loadingMarks, setLoadingMarks] = useState<boolean>(false);

  // Form states
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formBranch, setFormBranch] = useState<string>('Computer Science & Engineering');
  const [formSemester, setFormSemester] = useState<number>(1);
  const [formCourse, setFormCourse] = useState<string>('Bachelor of Technology (B.Tech)');
  const [formPhone, setFormPhone] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('student123');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await api.getStudents({
        search: searchTerm || undefined,
        branch: branchFilter !== 'all' ? branchFilter : undefined,
        semester: semesterFilter !== 'all' ? semesterFilter : undefined,
      });
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchTerm, branchFilter, semesterFilter]);

  useEffect(() => {
    if (viewingStudent && (viewingStudent.studentId || viewingStudent.id)) {
      setLoadingMarks(true);
      const sid = viewingStudent.studentId || viewingStudent.id;
      api.getMarks({ studentId: sid })
        .then((res) => setStudentMarks(res.marks))
        .catch(console.error)
        .finally(() => setLoadingMarks(false));
    } else {
      setStudentMarks([]);
    }
  }, [viewingStudent]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createStudent({
        name: formName,
        email: formEmail,
        branch: formBranch,
        semester: formSemester,
        course: formCourse,
        phone: formPhone,
        password: newPassword,
      });
      setShowAddModal(false);
      setActionMessage('New student successfully registered and enrolled.');
      fetchStudents();
      // Reset form
      setFormName('');
      setFormEmail('');
      setFormPhone('');
    } catch (err: any) {
      alert(err.message || 'Error creating student');
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      await api.updateStudent(editingStudent.id, {
        name: formName,
        email: formEmail,
        branch: formBranch,
        semester: formSemester,
        course: formCourse,
        phone: formPhone,
      });
      setEditingStudent(null);
      setActionMessage('Student profile details updated.');
      fetchStudents();
    } catch (err: any) {
      alert(err.message || 'Error updating student');
    }
  };

  const handleToggleActive = async (student: User) => {
    try {
      await api.updateStudent(student.id, {
        isActive: !student.isActive,
      });
      fetchStudents();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingStudent) return;
    try {
      await api.resetStudentPassword(resettingStudent.id, newPassword);
      setResettingStudent(null);
      setActionMessage(`Password reset successfully for ${resettingStudent.name}.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-600" />
            Student Sign-Ups &amp; Performance Records
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Student directory with registered phone numbers, emails, and live academic performance metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onNavigate && (
            <button
              onClick={() => onNavigate('admin-marks')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-colors"
            >
              <Award className="w-4 h-4" />
              <span>Manage Marks</span>
            </button>
          )}

          <button
            onClick={() => {
              setFormName('');
              setFormEmail('');
              setFormPhone('');
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Registered Students</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {students.length}
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Self &amp; Admin Signups</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Accounts</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {students.filter((s) => s.isActive).length}
          </p>
          <span className="text-[10px] text-slate-500">Authorized learners</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Avg Boost Score</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {students.length > 0
              ? Math.round(
                  students.reduce((acc, s) => acc + (s.performance?.boostScore ?? 50), 0) /
                    students.length
                )
              : 0}
          </p>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Study momentum</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Avg Success Rate</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {students.length > 0
              ? (
                  students.reduce(
                    (acc, s) => acc + (s.performance?.successPercentage ?? 70),
                    0
                  ) / students.length
                ).toFixed(1)
              : 0}
            %
          </p>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Academic health</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, Phone number, Student ID, or Email..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Streams</option>
            <option value="Computer Science & Engineering">CSE</option>
            <option value="Electronics & Communication">ECE</option>
            <option value="Mechanical Engineering">Mechanical</option>
            <option value="Civil Engineering">Civil</option>
            <option value="Science / PCM">Science</option>
            <option value="Commerce">Commerce</option>
            <option value="Arts / Humanities">Arts</option>
          </select>

          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Semesters</option>
            <option value="1">Sem 1</option>
            <option value="2">Sem 2</option>
            <option value="3">Sem 3</option>
            <option value="4">Sem 4</option>
            <option value="5">Sem 5</option>
            <option value="6">Sem 6</option>
            <option value="7">Sem 7</option>
            <option value="8">Sem 8</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 sm:px-6">Student</th>
                <th className="py-3.5 px-4">Contact Info (Phone / Email)</th>
                <th className="py-3.5 px-4">Stream &amp; Sem</th>
                <th className="py-3.5 px-4">Live Performance</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Loading student directory &amp; performance metrics...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No matching students found.
                  </td>
                </tr>
              ) : (
                students.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            stu.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${stu.studentId}`
                          }
                          alt={stu.name}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/20"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{stu.name}</p>
                          <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                            {stu.studentId}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                          <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="font-semibold">{stu.phone || 'No phone'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{stu.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                        {stu.branch}
                      </p>
                      <p className="text-[11px] text-slate-500">Sem {stu.semester} • {stu.course}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1.5 min-w-[130px]">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                            <Flame className="w-3.5 h-3.5" />
                            {stu.performance?.boostScore ?? 50}
                          </span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {stu.performance?.successPercentage ?? 70}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${Math.min(100, stu.performance?.successPercentage ?? 70)}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span>{stu.performance?.streak ?? 0}d streak</span>
                          <span>•</span>
                          <span>{stu.performance?.marksCount ?? 0} marks records</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(stu)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                          stu.isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                        title="Click to toggle account status"
                      >
                        {stu.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right space-x-1.5">
                      <button
                        onClick={() => setViewingStudent(stu)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 transition-colors"
                        title="View Full Academic Performance & Marks Breakdown"
                      >
                        Performance
                      </button>

                      {onNavigate && (
                        <button
                          onClick={() => onNavigate('admin-marks')}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 transition-colors"
                          title="Change or Add Marks for this student"
                        >
                          Marks
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEditingStudent(stu);
                          setFormName(stu.name);
                          setFormEmail(stu.email);
                          setFormBranch(stu.branch || 'Computer Science & Engineering');
                          setFormSemester(stu.semester || 1);
                          setFormCourse(stu.course || 'Bachelor of Technology (B.Tech)');
                          setFormPhone(stu.phone || '');
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
                        title="Edit Student Info"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setResettingStudent(stu);
                          setNewPassword('student123');
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60 transition-colors"
                        title="Reset Student Password"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Register New Student</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Jordan Miller"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">College Email Address</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="jordan.miller@college.edu"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Branch</label>
                  <select
                    value={formBranch}
                    onChange={(e) => setFormBranch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Electronics & Communication">ECE</option>
                    <option value="Mechanical Engineering">Mechanical</option>
                    <option value="Civil Engineering">Civil</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Semester</label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Default Password</label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
                >
                  Confirm &amp; Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Edit Student ({editingStudent.studentId})
              </h3>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">College Email Address</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Branch</label>
                  <select
                    value={formBranch}
                    onChange={(e) => setFormBranch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Electronics & Communication">ECE</option>
                    <option value="Mechanical Engineering">Mechanical</option>
                    <option value="Civil Engineering">Civil</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Semester</label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resettingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Reset Password for {resettingStudent.name}
              </h3>
              <button onClick={() => setResettingStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="mt-4 space-y-3.5 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Set a temporary or new password for Student ID <strong className="font-mono">{resettingStudent.studentId}</strong>.
              </p>

              <div>
                <label className="block font-semibold mb-1">New Password</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResettingStudent(null)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student & Performance Inspector Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Student Academic Performance &amp; Sign-Up Profile
                </h3>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile banner */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3.5">
                <img
                  src={
                    viewingStudent.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${viewingStudent.studentId}`
                  }
                  alt={viewingStudent.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                />
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {viewingStudent.name}
                  </h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                    {viewingStudent.studentId}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {viewingStudent.branch} • Semester {viewingStudent.semester}
                  </p>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="font-semibold">{viewingStudent.phone || 'Phone not set'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{viewingStudent.email}</span>
                </div>
              </div>
            </div>

            {/* 4 Performance Metric Cards */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/50 text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Boost Score</span>
                </div>
                <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                  {viewingStudent.performance?.boostScore ?? 50}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/50 text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Success Rate</span>
                </div>
                <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                  {viewingStudent.performance?.successPercentage ?? 70}%
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50 text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                  <Flame className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Study Streak</span>
                </div>
                <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                  {viewingStudent.performance?.streak ?? 0} days
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  <Award className="w-3.5 h-3.5 text-slate-500" />
                  <span>Recorded Marks</span>
                </div>
                <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                  {studentMarks.length} subjects
                </p>
              </div>
            </div>

            {/* Subject Marks Section */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>Academic Subject Marks &amp; Official Exam Scores</span>
                </h5>
                <span className="text-[11px] text-slate-400">
                  {studentMarks.length} records published
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
                {loadingMarks ? (
                  <div className="p-6 text-center text-slate-500">Loading student marks...</div>
                ) : studentMarks.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">
                    No official examination marks recorded yet for this student. Use "Manage Marks" to publish marks.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 font-bold uppercase">
                        <th className="py-2.5 px-3">Subject</th>
                        <th className="py-2.5 px-3">Exam</th>
                        <th className="py-2.5 px-3 text-center">Score</th>
                        <th className="py-2.5 px-3 text-center">Percentage</th>
                        <th className="py-2.5 px-3 text-right">Grade Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {studentMarks.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                            {m.subjectName}
                            <span className="block text-[10px] text-slate-400 font-mono">{m.subjectCode}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{m.examType}</td>
                          <td className="py-2.5 px-3 text-center font-bold">
                            {m.marksObtained} / {m.maximumMarks}
                          </td>
                          <td className="py-2.5 px-3 text-center font-extrabold text-indigo-600 dark:text-indigo-400">
                            {m.percentage}%
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                m.percentage < 60
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : m.percentage >= 75
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                              }`}
                            >
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Close Inspector
              </button>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    setViewingStudent(null);
                    onNavigate('admin-marks');
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md shadow-amber-600/20 transition-all"
                >
                  <Award className="w-4 h-4" />
                  <span>Make Changes in Marks →</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
