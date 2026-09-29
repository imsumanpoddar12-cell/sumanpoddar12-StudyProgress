import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type { NoteItem, Subject } from '../../types/index.ts';

interface MyNotesViewProps {
  onNavigate: (tab: string) => void;
}

export const MyNotesView: React.FC<MyNotesViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [previewNote, setPreviewNote] = useState<NoteItem | null>(null);

  const fetchNotes = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const studentId = user.studentId || user.id;
      const [notesRes, subsRes] = await Promise.all([
        api.getNotes({ studentId }),
        api.getSubjects(),
      ]);
      setNotes(notesRes);
      setSubjects(subsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || n.subjectId === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleDownload = (note: NoteItem) => {
    // Generate text or dummy download link
    const blob = new Blob(
      [
        `Study Notes Document\nStudent: ${note.studentName || user?.name}\nSubject: ${
          note.subjectName
        }\nTopic: ${note.topic}\nPages: ${note.pageCount}\nDate: ${note.uploadDate}\n\nNotes Content Summary:\n${
          note.notesText || 'Handwritten study notes uploaded and verified.'
        }`,
      ],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = note.fileName.endsWith('.pdf') ? note.fileName.replace('.pdf', '_export.txt') : `${note.fileName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            My Study Notes &amp; Submissions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, inspect, and download your uploaded 3–4 page notes repository
          </p>
        </div>

        <button
          onClick={() => onNavigate('daily-task')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-colors"
        >
          <span>Upload New Notes</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes by topic, subject or file..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading your notes...</div>
      ) : filteredNotes.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-sm text-slate-700 dark:text-slate-300">No notes found</p>
          <p className="text-xs text-slate-500 mt-1">
            Submit your daily study task and upload 3–4 pages of notes to populate this repository.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {note.subjectName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      note.submissionStatus === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {note.submissionStatus}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-3 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {note.topic}
                </h3>

                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {note.notesText || 'Comprehensive handwritten & formula notes uploaded for daily task.'}
                </p>

                {/* File Details Badge */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="truncate font-semibold">{note.fileName}</span>
                  </div>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400 shrink-0">
                    {note.pageCount} Pages
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  {note.uploadDate.slice(0, 10)}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewNote(note)}
                    className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Preview Notes"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDownload(note)}
                    className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Download Notes"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note Document Preview Modal */}
      {previewNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {previewNote.topic}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {previewNote.subjectName} • {previewNote.pageCount} Pages • {previewNote.uploadDate.slice(0, 10)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewNote(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Multi-Page Preview */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase text-[10px] tracking-wider">
                  Summary &amp; Key Concept Notes
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {previewNote.notesText || 'Handwritten and typed notes structured for this module.'}
                </p>
              </div>

              {/* Multi-page visual layout mock */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Uploaded Document Pages ({previewNote.pageCount} Pages):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: previewNote.pageCount }).map((_, pIdx) => (
                    <div
                      key={pIdx}
                      className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800 shadow-xs flex flex-col justify-between h-44"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 border-b pb-1.5">
                        <span className="font-mono">Page {pIdx + 1} of {previewNote.pageCount}</span>
                        <span className="font-bold text-indigo-600">{previewNote.subjectName}</span>
                      </div>
                      <div className="my-2 space-y-1.5 text-[10px] text-slate-500">
                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded w-5/6" />
                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded w-full" />
                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded w-4/6" />
                        <div className="h-10 bg-slate-50 dark:bg-slate-900 rounded border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] text-slate-400">
                          Formula &amp; Graph Diagram Section
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 text-right">
                        Verified Notes Stamp
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setPreviewNote(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => handleDownload(previewNote)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Notes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
