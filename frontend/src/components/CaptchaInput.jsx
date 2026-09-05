import React from 'react';
import { RotateCw, ShieldAlert, Sparkles, Image as ImageIcon } from 'lucide-react';

export default function CaptchaInput({
  captchaImage,
  captchaValue,
  onChange,
  onRefresh,
  isLoadingCaptcha,
  disabled,
  error
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="captcha-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          Security CAPTCHA <span className="text-rose-400">*</span>
        </label>
        <span className="text-[11px] text-slate-400">Manual Verification</span>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* CAPTCHA Image Container */}
        <div className="relative flex-shrink-0 flex items-center justify-center bg-white rounded-xl p-1.5 border border-slate-200 shadow-inner h-[46px] min-w-[150px] overflow-hidden group">
          {isLoadingCaptcha ? (
            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs animate-pulse">
              <RotateCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Fetching...</span>
            </div>
          ) : captchaImage ? (
            <img
              src={captchaImage}
              alt="SRM AP Security CAPTCHA"
              className="h-full w-auto object-contain select-none transition-transform group-hover:scale-105"
              draggable="false"
            />
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <ImageIcon className="w-4 h-4" />
              <span>Unavailable</span>
            </div>
          )}

          {/* Refresh overlay button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoadingCaptcha || disabled}
            title="Refresh CAPTCHA image"
            className="absolute right-1 top-1 bottom-1 px-2 bg-slate-800/80 hover:bg-slate-900 text-white rounded-lg flex items-center justify-center transition-all opacity-80 hover:opacity-100 disabled:opacity-40 disabled:cursor-not-allowed shadow"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoadingCaptcha ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* CAPTCHA Text Input */}
        <div className="relative flex-1">
          <input
            id="captcha-input"
            type="text"
            value={captchaValue}
            onChange={(e) => onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            maxLength={6}
            placeholder="Enter Captcha Text"
            disabled={disabled || isLoadingCaptcha}
            autoComplete="off"
            className={`w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-center sm:text-left tracking-widest font-mono text-base font-semibold placeholder:font-sans placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-500 uppercase focus:outline-none transition-all ${
              error ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20' : ''
            }`}
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-rose-400 font-medium flex items-center gap-1 mt-1">
          <ShieldAlert className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
