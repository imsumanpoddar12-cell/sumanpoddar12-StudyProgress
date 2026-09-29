import React from 'react';
import {
  MapPin,
  Mail,
  GraduationCap,
  Sparkles,
  Heart,
  Code2,
  CheckCircle2,
  ShieldCheck,
  Send,
} from 'lucide-react';

export const CreatorView: React.FC = () => {
  const creatorPhoto =
    'https://res.cloudinary.com/ttlyyejm/image/upload/v1789288192/WhatsApp_Image_2026-09-12_at_10.06.35_PM.jpg';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-900 text-white p-8 sm:p-10 shadow-xl shadow-indigo-600/15 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <img
            src={creatorPhoto}
            alt="Suman Kumar (Poddar)"
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-white/30 shadow-2xl shrink-0"
          />

          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-xs">
              Lead Architect &amp; Creator
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Suman Kumar (Poddar)
            </h1>

            <p className="text-sm font-semibold text-indigo-100">
              App made by Suman Kumar (Poddar)
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-indigo-200 pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-amber-300" /> Begusarai, Bihar
              </span>
              <span>•</span>
              <a
                href="mailto:imsumanpoddar12@gmail.com"
                className="flex items-center gap-1.5 font-mono text-white hover:underline font-semibold"
              >
                <Mail className="w-4 h-4 text-amber-300" /> imsumanpoddar12@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Creator Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            About the Creator
          </h3>

          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
            <p>
              <strong>StudyProgress</strong> was conceptualized and developed by{' '}
              <strong>Suman Kumar (Poddar)</strong> from <strong>Begusarai, Bihar</strong> with a clear
              vision: to help university and college students transform passive studying into daily,
              measurable progress and tangible academic success.
            </p>
            <p>
              Recognizing that consistent note-taking and daily habit discipline are the highest
              predictors of academic retention, Suman designed the mandatory 3–4 page notes verification
              engine, the 0–1000 Study Boost Score, and the Public Leaderboard to provide motivating,
              transparent study accountability.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">Developer</span>
              <p className="text-slate-600 dark:text-slate-400">Made by Suman Kumar (Poddar)</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">Location</span>
              <p className="text-slate-600 dark:text-slate-400">Begusarai, Bihar</p>
            </div>
          </div>
        </div>

        {/* Contact Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-600" />
              Direct Inquiries
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Have feedback, academic suggestions or partnership inquiries? Reach out directly:
            </p>
            <a
              href="mailto:imsumanpoddar12@gmail.com"
              className="mt-3 block p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold text-center hover:bg-indigo-100 transition-colors"
            >
              imsumanpoddar12@gmail.com
            </a>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Official StudyProgress Developer Verification</span>
          </div>
        </div>
      </div>
    </div>
  );
};
