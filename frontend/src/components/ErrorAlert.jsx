import React from 'react';
import { AlertCircle, RotateCcw, X } from 'lucide-react';

export default function ErrorAlert({ message, onRetry, onDismiss }) {
  if (!message) return null;

  return (
    <div className="rounded-xl bg-rose-950/40 border border-rose-500/30 p-4 mb-5 text-rose-200 animate-slide-up shadow-lg shadow-rose-950/30 backdrop-blur-md">
      <div className="flex items-start gap-3">
        <div className="p-1 rounded-lg bg-rose-500/20 text-rose-400 mt-0.5 flex-shrink-0">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
          <p className="font-semibold text-rose-300 mb-0.5">Authentication Error</p>
          <p className="text-rose-200/90">{message}</p>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-rose-400 hover:text-rose-200 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {onRetry && (
        <div className="mt-3 pt-2.5 border-t border-rose-500/20 flex justify-end">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold transition-all border border-rose-500/30"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}
    </div>
  );
}
