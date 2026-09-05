import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn, Loader2, Sparkles, KeyRound } from 'lucide-react';
import CaptchaInput from './CaptchaInput';

export default function LoginForm({
  username,
  setUsername,
  password,
  setPassword,
  captcha,
  setCaptcha,
  captchaImage,
  isLoadingCaptcha,
  onRefreshCaptcha,
  onSubmit,
  isSubmitting,
  errors = {}
}) {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
      {/* Username / Reg Number Input */}
      <div className="space-y-1.5">
        <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          Registration / Application No. <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <User className="w-4 h-4" />
          </div>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            maxLength={16}
            placeholder="e.g. AP24110010511"
            disabled={isSubmitting}
            autoComplete="username"
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-white placeholder:text-slate-500 font-medium text-sm focus:outline-none uppercase ${
              errors.username ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20' : ''
            }`}
          />
        </div>
        {errors.username && (
          <p className="text-xs text-rose-400 font-medium">{errors.username}</p>
        )}
        <p className="text-[11px] text-slate-400">
          Senior students: Reg Number (e.g. AP24...) • Freshers: Application Number
        </p>
      </div>

      {/* Password Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Portal Password <span className="text-rose-400">*</span>
          </label>
          <span className="text-[11px] text-slate-400">Default: DOB (DDMMYYYY)</span>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your student portal password"
            disabled={isSubmitting}
            autoComplete="current-password"
            className={`w-full pl-10 pr-11 py-2.5 rounded-xl glass-input text-white placeholder:text-slate-500 text-sm font-medium focus:outline-none ${
              errors.password ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20' : ''
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-rose-400 font-medium">{errors.password}</p>
        )}
      </div>

      {/* CAPTCHA Input */}
      <CaptchaInput
        captchaImage={captchaImage}
        captchaValue={captcha}
        onChange={setCaptcha}
        onRefresh={onRefreshCaptcha}
        isLoadingCaptcha={isLoadingCaptcha}
        disabled={isSubmitting}
        error={errors.captcha}
      />

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting || isLoadingCaptcha}
          className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 text-white font-semibold py-3 px-4 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-white" />
              <span>Logging into SRM AP Portal...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-0.5" />
              <span>Log In to SRM AP</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
