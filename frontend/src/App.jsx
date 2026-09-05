import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import SuccessCard from './components/SuccessCard';
import ErrorAlert from './components/ErrorAlert';
import Footer from './components/Footer';
import { api } from './services/api';
import { ShieldCheck, Info } from 'lucide-react';

export default function App() {
  const [sessionId, setSessionId] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [isLoadingCaptcha, setIsLoadingCaptcha] = useState(false);

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [errors, setErrors] = useState({});

  // Submission & Result State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [studentName, setStudentName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);

  // Load live CAPTCHA on initial load
  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    setIsLoadingCaptcha(true);
    setApiError('');
    try {
      const data = await api.getCaptcha();
      if (data.success && data.sessionId) {
        setSessionId(data.sessionId);
        setCaptchaImage(data.captchaImage);
        setCaptcha('');
        setIsBackendHealthy(true);
      } else {
        setApiError(data.error || 'Unable to connect to SRM AP portal. Please try again.');
        setIsBackendHealthy(false);
      }
    } catch (err) {
      setApiError('Failed to fetch CAPTCHA from server.');
      setIsBackendHealthy(false);
    } finally {
      setIsLoadingCaptcha(false);
    }
  };

  const handleRefreshCaptcha = async () => {
    if (!sessionId) {
      return fetchCaptcha();
    }

    setIsLoadingCaptcha(true);
    try {
      const data = await api.refreshCaptcha(sessionId);
      if (data.success && data.sessionId) {
        setSessionId(data.sessionId);
        setCaptchaImage(data.captchaImage);
        setCaptcha('');
      } else {
        // Fallback to fresh session
        await fetchCaptcha();
      }
    } catch {
      await fetchCaptcha();
    } finally {
      setIsLoadingCaptcha(false);
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!username.trim()) {
      errs.username = 'Please enter your Register Number or Application Number.';
    } else if (username.trim().length < 4) {
      errs.username = 'Register / Application Number is too short.';
    }

    if (!password.trim()) {
      errs.password = 'Please enter your password.';
    }

    if (!captcha.trim()) {
      errs.captcha = 'Please enter the CAPTCHA text shown.';
    } else if (captcha.trim().length < 3) {
      errs.captcha = 'CAPTCHA must be 4 to 6 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    setApiError('');
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const result = await api.login({
        sessionId,
        username: username.trim(),
        password,
        captcha: captcha.trim()
      });

      if (result.success) {
        setStudentName(result.name || username);
        setIsLoggedIn(true);
        // Clear sensitive password from memory immediately
        setPassword('');
        setCaptcha('');
      } else {
        setApiError(result.error || 'Authentication failed. Please check your credentials.');
        // CAPTCHA is consumed by the portal, so fetch a fresh one for the user
        await handleRefreshCaptcha();
      }
    } catch (err) {
      setApiError('An unexpected network error occurred while connecting to the portal.');
      await handleRefreshCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsLoggedIn(false);
    setStudentName('');
    setPassword('');
    setCaptcha('');
    setErrors({});
    setApiError('');
    fetchCaptcha();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Background Decorative Gradient Orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="w-full max-w-xl mx-auto flex-1 flex flex-col justify-center my-auto">
        <Header isOnline={isBackendHealthy} />

        {isLoggedIn ? (
          <SuccessCard studentName={studentName} onReset={handleReset} />
        ) : (
          <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-premium border border-white/10 bg-slate-900/80 backdrop-blur-xl">
            <ErrorAlert
              message={apiError}
              onRetry={handleRefreshCaptcha}
              onDismiss={() => setApiError('')}
            />

            <LoginForm
              username={username}
              setUsername={(val) => {
                setUsername(val);
                if (errors.username) setErrors(prev => ({ ...prev, username: '' }));
              }}
              password={password}
              setPassword={(val) => {
                setPassword(val);
                if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
              }}
              captcha={captcha}
              setCaptcha={(val) => {
                setCaptcha(val);
                if (errors.captcha) setErrors(prev => ({ ...prev, captcha: '' }));
              }}
              captchaImage={captchaImage}
              isLoadingCaptcha={isLoadingCaptcha}
              onRefreshCaptcha={handleRefreshCaptcha}
              onSubmit={handleLogin}
              isSubmitting={isSubmitting}
              errors={errors}
            />
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}
