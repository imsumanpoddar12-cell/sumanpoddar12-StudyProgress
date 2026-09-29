import React from 'react';
import { Mail, MapPin, Heart, GraduationCap, Sparkles } from 'lucide-react';

interface FooterProps {
  onOpenCreatorModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenCreatorModal }) => {
  const creatorPhoto =
    'https://res.cloudinary.com/ttlyyejm/image/upload/v1789288192/WhatsApp_Image_2026-09-12_at_10.06.35_PM.jpg';

  return (
    <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & App Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-amber-500 text-white flex items-center justify-center shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
              StudyProgress
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              College Student Progress, Daily Notes &amp; Boost Score Platform
            </p>
          </div>
        </div>

        {/* Creator Info Card */}
        <div
          onClick={onOpenCreatorModal}
          className="flex items-center gap-4 p-3 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-all shadow-xs group"
        >
          <img
            src={creatorPhoto}
            alt="Suman Kumar (Poddar)"
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/30 group-hover:scale-105 transition-transform shrink-0"
          />
          <div className="text-left text-xs">
            <div className="flex items-center gap-1 font-extrabold text-sm text-slate-900 dark:text-white">
              <span>StudyProgress</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
              Made by Suman Kumar (Poddar)
            </p>
            <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
              App made by Suman Kumar (Poddar)
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3 text-rose-500" /> Begusarai, Bihar
              </span>
              <span>•</span>
              <a
                href="mailto:imsumanpoddar12@gmail.com"
                className="flex items-center gap-1 font-mono text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                onClick={(e) => e.stopPropagation()}
              >
                <Mail className="w-3 h-3" /> imsumanpoddar12@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Copyright / Stamp */}
        <div className="text-center md:text-right text-xs text-slate-400">
          <p className="flex items-center justify-center md:justify-end gap-1 font-medium">
            <span>Built with dedication for student success</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            © {new Date().getFullYear()} StudyProgress. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
