import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  ShieldAlert,
  Building2,
  User,
  ArrowLeftRight,
  HardHat,
  LogOut,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton.tsx';
import { WardLeadershipBanner } from './WardLeadershipBanner.tsx';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    setCitizenTab,
    adminUser,
    logoutAdmin,
    textScale,
    setTextScale,
    firebaseUser,
    currentUser,
    isCitizenLoggedIn,
    activeSupervisor,
    isSupervisorLoggedIn,
    logoutSupervisor,
  } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 backdrop-blur-md">
      {/* Official Ward Leadership Top Strip: Pic 1 (Left), Pic 2 (Right Above), Pic 3 (Right) & Syed Ali President attribution */}
      <WardLeadershipBanner variant="compact" />

      <div className="w-full max-w-[430px] mx-auto px-3.5 h-13 flex items-center justify-between gap-2">
        {/* Mobile Wordmark / Brand */}
        <button
          onClick={() => {
            if (currentView === 'admin') {
              setCurrentView('admin');
            } else {
              setCitizenTab('home');
              setCurrentView('citizen');
            }
          }}
          className="flex items-center gap-2 text-left shrink-0 focus:outline-none"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
              NagawaraSolver
            </span>
            <span className="text-[9px] font-mono text-emerald-400 mt-0.5 truncate max-w-[170px]">
              Ward-22 · Syed Ali Pres.
            </span>
          </div>
        </button>

        {/* Mobile Header Quick Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* PWA Install Button */}
          <PWAInstallButton variant="navbar" />

          {/* Quick text size control */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700/80 text-[9px] font-mono">
            <button
              type="button"
              title="Compact text"
              onClick={() => setTextScale('compact')}
              className={`px-1 py-0.5 rounded transition-colors ${
                textScale === 'compact' || textScale === 'tiny'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              A-
            </button>
            <button
              type="button"
              title="Regular text"
              onClick={() => setTextScale('regular')}
              className={`px-1 py-0.5 rounded transition-colors ${
                textScale === 'regular' || textScale === 'small'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              A+
            </button>
          </div>

          {currentView === 'supervisor' ? (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono">
                <HardHat className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="font-bold truncate max-w-[100px]">{activeSupervisor.name}</span>
              </div>
              <button
                type="button"
                onClick={logoutSupervisor}
                className="px-2 py-1 text-[10px] font-semibold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 rounded-lg transition-colors border border-rose-500/30 flex items-center gap-1 cursor-pointer"
                title="Log Out Supervisor"
              >
                <LogOut className="w-3 h-3 text-rose-400" />
                <span>Exit</span>
              </button>
            </div>
          ) : currentView === 'admin' ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentView('supervisor')}
                title="Switch to Supervisor Portal"
                className="px-2 py-1 text-[10px] font-semibold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg transition-colors border border-amber-500/40 flex items-center gap-1"
              >
                <HardHat className="w-3 h-3 text-amber-400" />
                <span>Supervisor</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentView('citizen');
                  setCitizenTab('home');
                }}
                title="Switch to Citizen Mobile"
                className="p-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 flex items-center gap-1"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px]">Citizen</span>
              </button>
              <button
                type="button"
                onClick={logoutAdmin}
                className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors rounded-lg bg-slate-800/80 border border-slate-700"
                title="Log Out Staff"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {/* Supervisor Field Portal Direct Button */}
              <button
                type="button"
                onClick={() => setCurrentView('supervisor')}
                className="px-2 py-1.5 text-[10px] font-bold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                title="Open Ward-22 Field Supervisor Portal"
              >
                <HardHat className="w-3 h-3 text-amber-400" />
                <span>Supervisor</span>
              </button>

              {/* User Avatar / Profile Button with verified badge if signed in */}
              <button
                type="button"
                onClick={() => setCitizenTab('profile')}
                className="relative p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title={
                  firebaseUser
                    ? `Signed in as ${firebaseUser.displayName}`
                    : isCitizenLoggedIn
                    ? `Signed in: ${currentUser.name} (${currentUser.phone})`
                    : 'Profile'
                }
              >
                {firebaseUser?.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt={firebaseUser.displayName || 'User'}
                    className="w-6 h-6 rounded-full border border-blue-400 object-cover"
                  />
                ) : (
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-slate-300 ${isCitizenLoggedIn ? 'bg-blue-600/30 border-blue-400 text-blue-300' : 'bg-slate-800 border-slate-700'}`}>
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
                {(firebaseUser || isCitizenLoggedIn) && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-slate-900" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('admin_login')}
                className="px-2.5 py-1.5 text-[10px] font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm flex items-center gap-1"
                title="Switch to Admin Console"
              >
                <Building2 className="w-3 h-3" />
                <span>Admin</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
