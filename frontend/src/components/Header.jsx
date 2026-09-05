import React from 'react';
import { GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';

export default function Header({ isOnline = true }) {
  return (
    <header className="w-full max-w-xl mx-auto mb-6 text-center">
      {/* Top Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4 backdrop-blur-md shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
        </span>
        <span className="font-semibold tracking-wide">SRM AP STUDENT CORNER</span>
        <span className="text-slate-500">•</span>
        <span className="text-slate-300">Live Portal Bridge</span>
      </div>

      {/* Main Title */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Student Portal Login
        </h1>
      </div>

      <p className="text-slate-400 text-sm max-w-md mx-auto">
        Official authentication tool verifying your credentials directly against SRM AP Student Systems.
      </p>
    </header>
  );
}
