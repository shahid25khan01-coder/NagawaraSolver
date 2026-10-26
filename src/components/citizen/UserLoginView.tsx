import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Phone,
  User,
  ArrowLeft,
  Smartphone,
  Lock,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { WardLeadershipBanner } from '../common/WardLeadershipBanner.tsx';

export const UserLoginView: React.FC = () => {
  const { loginWithPhone, signInWithGoogle, isAuthLoading, setCurrentView } = useApp();
  const [phoneNumber, setPhoneNumber] = useState<string>('+91 98450 12345');
  const [fullName, setFullName] = useState<string>('Shahid Khan');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await loginWithPhone(phoneNumber, fullName);
      if (!res.success) {
        setErrorMessage(res.error || 'Please enter a valid phone number.');
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage('Unable to complete phone sign-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      setCurrentView('citizen');
    } catch (err: unknown) {
      console.error('Google Sign-In failed:', err);
      setErrorMessage('Google Sign-In was cancelled or not completed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-3.5 py-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white w-full max-w-[430px] mx-auto space-y-4">
      {/* Ward Leadership Banner */}
      <WardLeadershipBanner variant="card" />

      {/* Back button */}
      <button
        type="button"
        onClick={() => setCurrentView('splash')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer self-start"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Login Hub</span>
      </button>

      {/* Card Header */}
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-blue-950/50">
          <Smartphone className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold tracking-tight text-white">
          Resident &amp; Citizen Login
        </h1>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Sign in with your mobile phone number to file and track civic issues
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Direct Phone Login Form (No OTP - Direct 1-Click Access) */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">
            Mobile Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-blue-400" />
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder="+91 98450 12345"
              className="w-full bg-slate-800/90 border border-slate-700 focus:border-blue-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Enter 10-digit mobile number with +91 country prefix.
          </span>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">
            Resident Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Shahid Khan"
              className="w-full bg-slate-800/90 border border-slate-700 focus:border-blue-500 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Permanent session guarantee */}
        <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-[10px] text-blue-300 flex items-start gap-2">
          <Lock className="w-3.5 h-3.5 shrink-0 text-emerald-400 mt-0.5" />
          <div>
            <strong className="text-emerald-400">Never Gets Logged Out:</strong>
            <span className="text-slate-300 block mt-0.5">
              Once logged in, your session is permanently preserved on this device. You will stay signed in across all reloads and app restarts.
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-950/60 cursor-pointer flex items-center justify-center gap-2"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>{isSubmitting ? 'Signing In...' : 'Sign In with Phone Number'}</span>
        </button>
      </form>

      {/* Google Sign In option */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider font-mono">
          <div className="flex-1 h-px bg-slate-800" />
          <span>Or Continue with Google</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        <button
          type="button"
          disabled={isGoogleLoading || isAuthLoading}
          onClick={handleGoogleSignIn}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer border border-slate-200"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.43l4.03-3.14z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.57l4.03 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
            />
          </svg>
          <span>{isGoogleLoading ? 'Connecting...' : 'Sign In with Google Account'}</span>
        </button>
      </div>

      {/* Leadership Footer Note */}
      <div className="pt-2 border-t border-slate-800 text-center">
        <div className="inline-flex items-center gap-1.5 text-[10px] text-slate-400">
          <Building2 className="w-3 h-3 text-blue-400" />
          <span>Ward-22 Nagawara Community Platform · Syed Ali President</span>
        </div>
      </div>
    </div>
  );
};
