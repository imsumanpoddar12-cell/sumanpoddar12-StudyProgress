import React, { useState, useEffect } from 'react';
import {
  BookMarked,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  Search,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { Subject } from '../../types/index.ts';

export const AdminSubjectsView: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form
  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [credits, setCredits] = useState<number>(3);
  const [facultyName, setFacultyName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const data = await api.getSubjects();
      setSubjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setCode('');
    setName('');
    setCredits(3);
    setFacultyName('');
    setDescription('');
    setShowModal(true);
  };

  const handleOpenEdit = (sub: Subject) => {
    setEditingSubject(sub);
    setCode(sub.code);
    setName(sub.name);
    setCredits(sub.credits);
    setFacultyName(sub.facultyName);
    setDescription(sub.description || '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await api.updateSubject(editingSubject.id, {
          code,
          name,
          credits,
          facultyName,
          description,
        });
      } else {
        await api.createSubject({
          code,
          name,
          credits,
          facultyName,
          description,
        });
      }
      setShowModal(false);
      fetchSubjects();
    } catch (err: any) {
      alert(err.message || 'Error saving subject');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this academic subject?')) return;
    try {
      await api.deleteSubject(id);
      fetchSubjects();
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
            <BookMarked className="w-6 h-6 text-indigo-600" />
            Curriculum Subject Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Maintain college academic catalog, module codes, course credits and assigned faculty
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((sub) => (
          <div
            key={sub.id}
            className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {sub.code}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {sub.credits} Academic Credits
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">{sub.name}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {sub.description || 'Core engineering curriculum module.'}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Faculty In-Charge: </span>
                {sub.facultyName}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(sub)}
                className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Edit Subject"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(sub.id)}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Delete Subject"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingSubject ? 'Edit Subject' : 'Add Academic Subject'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="MATH201"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Applied Mechanics"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Assigned Faculty In-Charge</label>
                <input
                  type="text"
                  required
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  placeholder="Prof. Isaac Newton"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Syllabus Summary</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key topics and domains covered..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
