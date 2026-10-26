import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { auth } from '../../firebase.ts';
import {
  Building2,
  ShieldAlert,
  Lock,
  Mail,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { loginAdmin, setCurrentView, signInWithGoogle, isAuthLoading, firebaseUser } = useApp();
  const [adminId, setAdminId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = loginAdmin(adminId, password);
    if (!res.success) {
      setErrorMessage(
        res.error || 'Access Denied: Invalid credentials. Only the authorized administrator can access this portal.'
      );
    }
  };

  const handleGoogleAdminAuth = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle();
      const currentEmail = auth.currentUser?.email || firebaseUser?.email || '';
      if (!currentEmail) {
        setErrorMessage('Unable to retrieve Google account details.');
        return;
      }
      const res = loginAdmin(currentEmail);
      if (!res.success) {
        setErrorMessage(
          'Access Denied: This Google account is not authorized to access the administration console. Access is strictly restricted.'
        );
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Google authentication cancelled or closed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-3.5 py-6 bg-slate-950 text-white w-full max-w-[430px] mx-auto">
      <div className="w-full">
        {/* Back to Login Hub button */}
        <button
          type="button"
          onClick={() => setCurrentView('splash')}
          className="mb-3.5 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login Hub</span>
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="text-center">
            {/* Security Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Ward-22 Nagawara · Protected Console</span>
            </div>

            <h1 className="text-lg font-bold tracking-tight text-white">
              Administrator Login
            </h1>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Authorized personnel only. Please enter your confidential administrator credentials to access the operations console.
            </p>
          </div>

          {/* Access Denied / Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border-2 border-rose-500 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in zoom-in-95 duration-200 shadow-lg shadow-rose-950/50">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <div className="font-bold text-rose-300 text-xs">Access Strictly Denied</div>
                <div className="text-[11px] text-rose-200 leading-snug">
                  {errorMessage}
                </div>
              </div>
            </div>
          )}

          {/* Secure Login Form (All credentials hidden & masked) */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Admin ID / Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={adminId}
                  onChange={e => setAdminId(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="Enter administrator ID..."
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter administrator password..."
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl py-2 pl-9 pr-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Verify &amp; Sign In</span>
            </button>
          </form>

          <div className="flex items-center gap-2 my-2 text-[10px] text-slate-500 uppercase tracking-wider font-mono">
            <div className="flex-1 h-px bg-slate-800" />
            <span>Or Authenticate with Google</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Google Admin Sign-In (Private, no email shown) */}
          <button
            type="button"
            disabled={isGoogleLoading || isAuthLoading}
            onClick={handleGoogleAdminAuth}
            className="w-full py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer border border-slate-200"
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
            <span>{isGoogleLoading ? 'Verifying Account...' : 'Sign In with Google Administrator Account'}</span>
          </button>

          {/* Security Notice */}
          <div className="pt-2 border-t border-slate-800 text-center">
            <div className="inline-flex items-center gap-1.5 text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Restricted Access · All unauthorized attempts are blocked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
