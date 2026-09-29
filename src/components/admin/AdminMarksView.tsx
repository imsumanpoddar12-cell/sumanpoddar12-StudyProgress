import React, { useState, useEffect } from 'react';
import {
  Award,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  Filter,
  BarChart3,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { MarkRecord, Subject, User } from '../../types/index.ts';

export const AdminMarksView: React.FC = () => {
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  // Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingMark, setEditingMark] = useState<MarkRecord | null>(null);

  // Form State
  const [formStudentId, setFormStudentId] = useState<string>('STU2024001');
  const [formSubjectId, setFormSubjectId] = useState<string>('');
  const [formExamType, setFormExamType] = useState<any>('Semester End Exam');
  const [formObtained, setFormObtained] = useState<number>(75);
  const [formMax, setFormMax] = useState<number>(100);
  const [formSemester, setFormSemester] = useState<number>(3);
  const [formRemarks, setFormRemarks] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [marksRes, subsRes, stusRes] = await Promise.all([
        api.getMarks({
          studentId: selectedStudent !== 'all' ? selectedStudent : undefined,
          subjectId: selectedSubject !== 'all' ? selectedSubject : undefined,
        }),
        api.getSubjects(),
        api.getStudents(),
      ]);
      setMarks(marksRes.marks);
      setSubjects(subsRes);
      setStudents(stusRes);
      if (subsRes.length > 0 && !formSubjectId) {
        setFormSubjectId(subsRes[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStudent, selectedSubject]);

  const handleCreateMark = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addMarks({
        studentId: formStudentId,
        subjectId: formSubjectId,
        examType: formExamType,
        marksObtained: formObtained,
        maximumMarks: formMax,
        semester: formSemester,
        remarks: formRemarks,
      });
      setShowAddModal(false);
      setActionSuccess('Official mark record published successfully.');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error publishing marks');
    }
  };

  const handleUpdateMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMark) return;
    try {
      await api.updateMarks(editingMark.id, {
        marksObtained: formObtained,
        maximumMarks: formMax,
        examType: formExamType,
        remarks: formRemarks,
      });
      setEditingMark(null);
      setActionSuccess('Mark record successfully updated.');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error updating marks');
    }
  };

  const handleDeleteMark = async (id: string) => {
    if (!confirm('Are you sure you want to delete this official mark record?')) return;
    try {
      await api.deleteMarks(id);
      fetchData();
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
            <Award className="w-6 h-6 text-indigo-600" />
            Official Academic Marks Administration
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Faculty-level authority to record, publish, and audit semester marks
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddModal(true);
            setFormObtained(75);
            setFormMax(100);
            setFormRemarks('');
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Marks</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-xs font-bold text-slate-400">✕</button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filter Student:</span>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Students</option>
            {students.map((s) => (
              <option key={s.id} value={s.studentId}>
                {s.name} ({s.studentId})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filter Subject:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Marks Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 sm:px-6">Student</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Exam Type</th>
                <th className="py-3.5 px-4 text-center">Score</th>
                <th className="py-3.5 px-4 text-center">Percentage</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">Loading marks...</td>
                </tr>
              ) : marks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">No marks records matching filter.</td>
                </tr>
              ) : (
                marks.map((m) => {
                  const stu = students.find((s) => s.studentId === m.studentId);
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900 dark:text-white">
                        {stu?.name || m.studentId}
                        <span className="block text-[10px] text-slate-400 font-mono font-normal">
                          {m.studentId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {m.subjectName} ({m.subjectCode})
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{m.examType}</td>
                      <td className="py-3.5 px-4 text-center font-bold">
                        {m.marksObtained} / {m.maximumMarks}
                      </td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-indigo-600">
                        {m.percentage}%
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                      <td className="py-3.5 px-4 sm:px-6 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingMark(m);
                            setFormObtained(m.marksObtained);
                            setFormMax(m.maximumMarks);
                            setFormExamType(m.examType);
                            setFormRemarks(m.remarks || '');
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                          title="Edit Marks"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMark(m.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Marks Modal */}
      {(showAddModal || editingMark) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingMark ? 'Edit Academic Marks' : 'Publish Official Marks'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingMark(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingMark ? handleUpdateMark : handleCreateMark} className="mt-4 space-y-3.5 text-xs">
              {!editingMark && (
                <>
                  <div>
                    <label className="block font-semibold mb-1">Target Student</label>
                    <select
                      value={formStudentId}
                      onChange={(e) => setFormStudentId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      {students.map((stu) => (
                        <option key={stu.id} value={stu.studentId}>
                          {stu.name} ({stu.studentId} • {stu.branch})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Subject</label>
                    <select
                      value={formSubjectId}
                      onChange={(e) => setFormSubjectId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name} ({sub.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Marks Obtained</label>
                  <input
                    type="number"
                    min="0"
                    max={formMax}
                    required
                    value={formObtained}
                    onChange={(e) => setFormObtained(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Maximum Marks</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={formMax}
                    onChange={(e) => setFormMax(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Exam Type</label>
                <select
                  value={formExamType}
                  onChange={(e) => setFormExamType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="Semester End Exam">Semester End Exam</option>
                  <option value="Mid-Term 1">Mid-Term 1</option>
                  <option value="Mid-Term 2">Mid-Term 2</option>
                  <option value="Continuous Assessment">Continuous Assessment</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Faculty Remarks &amp; Feedback</label>
                <input
                  type="text"
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  placeholder="e.g. Needs revision in calculus problem solving"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingMark(null);
                  }}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
                >
                  {editingMark ? 'Save Updates' : 'Publish Marks'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
