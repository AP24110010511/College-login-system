import React from 'react';
import { Shield, Lock, Info } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full max-w-xl mx-auto mt-8 text-center text-slate-500 text-xs space-y-3 pb-8">
      <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Shield className="w-3 h-3 text-emerald-400" />
          Zero-Storage Credentials
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Lock className="w-3 h-3 text-blue-400" />
          Direct SRM AP Bridge
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3 text-indigo-400" />
          Playwright Powered
        </span>
      </div>

      <p className="leading-relaxed text-[11px] text-slate-400 max-w-md mx-auto">
        <strong>Disclaimer:</strong> This is an independent student developer project built to authenticate against the official SRM AP Student Portal and is not officially affiliated with SRM University-AP.
      </p>
    </footer>
  );
}
