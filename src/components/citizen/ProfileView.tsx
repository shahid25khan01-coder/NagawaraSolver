import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { AuthModal } from './AuthModal.tsx';
import { PWAInstallButton } from '../common/PWAInstallButton.tsx';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Award,
  Bell,
  Smartphone,
  Building2,
  RefreshCw,
  LogOut,
  CheckCircle2,
  Cloud,
  Database,
  Lock,
  ShieldCheck,
  HardHat,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    updateUserProfile,
    complaints,
    setCurrentView,
    resetToDemoDefaults,
    textScale,
    setTextScale,
    firebaseUser,
    signInWithGoogle,
    signOutGoogle,
    isAuthLoading,
    isCitizenLoggedIn,
    logoutCitizen,
  } = useApp();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(currentUser.name);
  const [phone, setPhone] = useState<string>(currentUser.phone);
  const [email, setEmail] = useState<string>(currentUser.email);
  const [ward, setWard] = useState<string>(currentUser.ward);
  const [smsEnabled, setSmsEnabled] = useState<boolean>(true);
  const [pushEnabled, setPushEnabled] = useState<boolean>(true);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      name,
      phone,
      email,
      ward,
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const myComplaints = complaints.filter(
    c => c.citizenEmail === currentUser.email || c.citizenName === currentUser.name
  );
  const resolvedCount = myComplaints.filter(c => c.status === 'resolved').length;

  return (
    <div className="w-full max-w-[430px] mx-auto px-3.5 py-4 space-y-4">
      {/* Header */}
      <div>
        <div className="text-[10px] font-mono uppercase text-blue-600 font-semibold tracking-wider flex items-center justify-between">
          <span>Citizen ID &amp; Civic Profile</span>
          <span className="flex items-center gap-1 text-emerald-600">
            <Cloud className="w-3 h-3" />
            <span>Firestore Synced</span>
          </span>
        </div>
        <h1 className="text-base font-bold tracking-tight text-slate-900 mt-0.5">
          Citizen Profile &amp; Preferences
        </h1>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Securely managed via Google Firebase Authentication &amp; Firestore.
        </p>
      </div>

      {/* Authentication & Identity Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Security &amp; Identity
          </span>
          {firebaseUser ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Google Verified</span>
            </span>
          ) : isCitizenLoggedIn ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">
              <CheckCircle2 className="w-3 h-3 text-blue-600" />
              <span>Phone Verified</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]">
              Guest / Local Mode
            </span>
          )}
        </div>

        {firebaseUser ? (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {firebaseUser.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt={firebaseUser.displayName || 'Google Avatar'}
                    className="w-10 h-10 rounded-full border border-blue-500 object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                    {(firebaseUser.displayName || 'G')[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {firebaseUser.displayName || currentUser.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{firebaseUser.email}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={signOutGoogle}
                disabled={isAuthLoading}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-[11px] font-semibold transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <LogOut className="w-3 h-3 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-600 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Permanent session active — stay signed in on refresh.</span>
            </div>
          </div>
        ) : isCitizenLoggedIn ? (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-full bg-blue-600/10 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">{currentUser.phone}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  Switch
                </button>
                <button
                  type="button"
                  onClick={logoutCitizen}
                  className="px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  title="Log out of this device"
                >
                  <LogOut className="w-3 h-3 text-rose-600" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[10px] text-emerald-800 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>
                <strong>Persistent Session Active:</strong> You will not be logged out when reloading or reopening the app.
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <p className="text-[11px] text-slate-600 leading-snug">
              Sign in with your mobile number to receive instant SMS updates and never get logged out.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Phone Login</span>
              </button>

              <button
                type="button"
                disabled={isAuthLoading}
                onClick={signInWithGoogle}
                className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-300 shadow-xs transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
                <span>Google</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Citizen Card & Impact Score */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          {currentUser.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-14 h-14 rounded-xl object-cover border border-blue-400 shrink-0 shadow-md shadow-blue-500/20"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              {currentUser.name[0] || 'C'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</h2>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">{currentUser.ward}</div>
            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 mt-1">
              <Award className="w-3 h-3 text-blue-600" />
              <span>Civic Tier · {currentUser.points} Pts</span>
            </div>
          </div>
        </div>

        {/* Metric Counters */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-left">
          <div className="p-2.5 rounded-xl bg-slate-50">
            <div className="text-base font-bold font-mono text-slate-900">{myComplaints.length}</div>
            <div className="text-[10px] text-slate-500">Reported Tickets</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50">
            <div className="text-base font-bold font-mono text-emerald-700">{resolvedCount}</div>
            <div className="text-[10px] text-emerald-600">Resolved With Proof</div>
          </div>
        </div>
      </div>

      {/* Contact Details with Firestore Persistence */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-bold text-slate-900">Verified Contact Details</h3>
            {saveSuccess && (
              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Saved
              </span>
            )}
          </div>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Edit
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-700">Residential Ward</label>
                <span className="text-[9px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-semibold">
                  Ward-22 Exclusive
                </span>
              </div>
              <input
                type="text"
                readOnly
                value="Ward-22 Nagawara"
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium cursor-not-allowed select-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">This platform is dedicated exclusively to Ward-22 Nagawara.</p>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Save &amp; Sync to Database</span>
            </button>
          </form>
        ) : (
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <div>
                <span className="text-[9px] text-slate-400 block font-mono">PHONE</span>
                <span className="font-semibold text-slate-900 text-xs">{currentUser.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <div>
                <span className="text-[9px] text-slate-400 block font-mono">EMAIL</span>
                <span className="font-semibold text-slate-900 text-xs">{currentUser.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <div>
                <span className="text-[9px] text-slate-400 block font-mono">RESIDENTIAL WARD</span>
                <span className="font-semibold text-slate-900 text-xs">{currentUser.ward}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900">Notification Preferences</h3>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-slate-500" />
            <div>
              <div className="text-xs font-semibold text-slate-900">SMS Resolution Alerts</div>
              <div className="text-[10px] text-slate-500">Live text when field crews resolve ticket.</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={smsEnabled}
            onChange={e => setSmsEnabled(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-slate-500" />
            <div>
              <div className="text-xs font-semibold text-slate-900">City Roadwork Bulletins</div>
              <div className="text-[10px] text-slate-500">Water pressure tests and road paving.</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={pushEnabled}
            onChange={e => setPushEnabled(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 cursor-pointer"
          />
        </div>

        {/* Text Scaling */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-900">Text Density</span>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            {(['tiny', 'compact', 'small', 'regular'] as const).map(scale => (
              <button
                key={scale}
                type="button"
                onClick={() => setTextScale(scale)}
                className={`px-1.5 py-0.5 text-[9px] font-semibold rounded transition-colors ${
                  textScale === scale ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {scale === 'tiny' ? 'A--' : scale === 'compact' ? 'A-' : scale === 'small' ? 'A' : 'A+'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Android APK & Native Package */}
      <PWAInstallButton variant="card" />

      {/* Admin Switcher Card */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>City Operations Portal</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Switch to Admin console to inspect and dispatch.
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setCurrentView('supervisor_login')}
            className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl shadow-xs whitespace-nowrap cursor-pointer flex items-center gap-1"
          >
            <HardHat className="w-3 h-3" />
            <span>Supervisor</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('admin_login')}
            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-xs whitespace-nowrap cursor-pointer"
          >
            Admin Sign In
          </button>
          <button
            type="button"
            onClick={resetToDemoDefaults}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Reset Demo Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {/* Ward-22 Leadership Acknowledgment */}
      <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-center space-y-1">
        <div className="text-[11px] font-bold text-slate-800">
          This app is from Syed Ali President Nagawara Ward
        </div>
        <div className="text-[9px] text-slate-500 font-mono">
          Ward-22 Nagawara · Bengaluru Community Support System
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};
