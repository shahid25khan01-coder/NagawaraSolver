import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  X,
  Phone,
  User,
  CheckCircle2,
  LogOut,
  AlertCircle,
  Smartphone,
  Lock,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    firebaseUser,
    isAuthLoading,
    signInWithGoogle,
    signOutGoogle,
    currentUser,
    loginWithPhone,
    isCitizenLoggedIn,
    logoutCitizen,
    setCurrentView,
    setCitizenTab,
  } = useApp();

  const [phoneNumber, setPhoneNumber] = useState<string>(
    currentUser.phone && currentUser.phone !== '+1 (555) 234-8901'
      ? currentUser.phone
      : '+91 98450 12345'
  );
  const [citizenName, setCitizenName] = useState<string>(
    currentUser.name || 'Shahid Khan'
  );
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState<boolean>(false);

  if (!isOpen) return null;

  // Direct Phone Login (Zero OTP)
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      const res = await loginWithPhone(phoneNumber, citizenName);
      if (!res.success) {
        setAuthError(res.error || 'Please enter a valid phone number.');
        setIsSubmitting(false);
        return;
      }
      setCitizenTab('home');
      setCurrentView('citizen');
      onClose();
    } catch (err: unknown) {
      console.error('Phone login error:', err);
      setAuthError('An error occurred during sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsConnectingGoogle(true);
    try {
      await signInWithGoogle();
      setCitizenTab('home');
      setCurrentView('citizen');
      onClose();
    } catch (err: unknown) {
      console.error('Google Sign-in issue:', err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('popup-closed-by-user')) {
        setAuthError('Sign-in cancelled. You can sign in using your Phone Number.');
      } else {
        setAuthError('Google Sign-in failed. Please use Phone Number sign-in.');
      }
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const isUserAuthenticated = isCitizenLoggedIn || !!firebaseUser;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[420px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 text-white max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-2">
            <Smartphone className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white">
            {isUserAuthenticated ? 'Citizen Account Active' : 'Resident Sign In'}
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isUserAuthenticated
              ? 'Your session is permanently active on this device.'
              : 'Sign in with your phone number to report issues & track progress.'}
          </p>
        </div>

        {/* ALREADY SIGNED IN CARD */}
        {isUserAuthenticated ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center gap-3">
              {firebaseUser?.photoURL ? (
                <img
                  src={firebaseUser.photoURL}
                  alt={firebaseUser.displayName || 'Google User'}
                  className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
                  {(currentUser.name || 'C')[0]}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-white truncate">
                    {firebaseUser?.displayName || currentUser.name}
                  </span>
                  <span className="px-1.5 py-0.2 text-[9px] font-semibold text-emerald-400 bg-emerald-950/80 rounded border border-emerald-800 flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {firebaseUser ? 'Google Verified' : 'Phone Verified'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {currentUser.phone || firebaseUser?.phoneNumber || firebaseUser?.email}
                </div>
                <div className="text-[10px] text-blue-400 font-mono mt-0.5">
                  Ward-22 Nagawara · {currentUser.points} Civic Karma Pts
                </div>
              </div>
            </div>

            {/* Permanent Session Badge */}
            <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-[10px] text-blue-300 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span>
                <strong>Persistent Session Active:</strong> You remain logged in permanently on this device.
              </span>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setCitizenTab('home');
                  setCurrentView('citizen');
                  onClose();
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              >
                Continue to Citizen Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  if (firebaseUser) signOutGoogle();
                  logoutCitizen();
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Log Out Citizen Session</span>
              </button>
            </div>
          </div>
        ) : (
          /* NOT YET LOGGED IN */
          <div className="space-y-3.5">
            {authError && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            {/* Direct Phone Number Login Form (NO OTP) */}
            <form onSubmit={handlePhoneLogin} className="space-y-3">
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
                    className="w-full bg-slate-800/80 border border-slate-700 focus:border-blue-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                  />
                </div>
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
                    value={citizenName}
                    onChange={e => setCitizenName(e.target.value)}
                    placeholder="Shahid Khan"
                    className="w-full bg-slate-800/80 border border-slate-700 focus:border-blue-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[10px] text-slate-300 flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-emerald-400">Never Gets Logged Out:</span>
                  <span className="text-slate-400 block mt-0.5">
                    Direct login with no OTP required. Your session stays permanently active.
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-blue-950/50 cursor-pointer flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Signing In...' : 'Sign In with Phone Number'}</span>
              </button>
            </form>

            {/* Google alternative */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <button
                type="button"
                disabled={isConnectingGoogle || isAuthLoading}
                onClick={handleGoogleSignIn}
                className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer border border-slate-200"
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
                <span>{isConnectingGoogle ? 'Connecting...' : 'Sign In with Google'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
