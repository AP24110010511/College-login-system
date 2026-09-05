import React from 'react';
import { CheckCircle2, User, LogOut, ShieldCheck, Award } from 'lucide-react';

export default function SuccessCard({ studentName, onReset }) {
  return (
    <div className="w-full max-w-xl mx-auto glass-panel rounded-3xl p-6 sm:p-8 shadow-premium animate-slide-up border border-emerald-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950/95 relative overflow-hidden text-center">
      {/* Background ambient glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Success Icon */}
      <div className="relative mx-auto mb-6 w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-emerald-400">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      {/* Header messages */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/20">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Authentication Verified</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
        Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">{studentName || 'Student'}</span>
      </h2>

      <p className="text-emerald-400 font-semibold text-sm sm:text-base mb-6 tracking-wide">
        SRM AP Student Portal Login Successful
      </p>

      {/* Details Box */}
      <div className="rounded-2xl bg-slate-950/60 border border-white/10 p-5 mb-8 text-left space-y-3">
        <div className="flex items-center justify-between py-1.5 border-b border-white/5">
          <span className="text-xs text-slate-400 font-medium">Student Name</span>
          <span className="text-sm text-white font-semibold flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-400" />
            {studentName}
          </span>
        </div>
        <div className="flex items-center justify-between py-1.5 border-b border-white/5">
          <span className="text-xs text-slate-400 font-medium">Verification Status</span>
          <span className="text-xs text-emerald-400 font-semibold inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Authenticated Live via SRM AP Systems
          </span>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <span className="text-xs text-slate-400 font-medium">Security Notice</span>
          <span className="text-xs text-slate-400">Session context cleanly closed</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-all border border-white/10 shadow-md hover:shadow-lg w-full sm:w-auto"
      >
        <LogOut className="w-4 h-4 text-slate-400" />
        <span>Return to Login</span>
      </button>
    </div>
  );
}
