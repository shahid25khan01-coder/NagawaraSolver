import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  HardHat,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Phone,
  Wrench,
  Trash2,
  Zap,
  Droplet,
  Lock,
} from 'lucide-react';
import { WardLeadershipBanner } from '../common/WardLeadershipBanner.tsx';
import { DEFAULT_SUPERVISORS, Supervisor } from '../../types.ts';

export const SupervisorLogin: React.FC = () => {
  const { loginSupervisor, setCurrentView, supervisors } = useApp();
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>(
    supervisors[0]?.id || DEFAULT_SUPERVISORS[0].id
  );
  const [pin, setPin] = useState<string>('1234');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeSupervisor =
    supervisors.find(s => s.id === selectedSupervisorId) || supervisors[0] || DEFAULT_SUPERVISORS[0];

  const handleLogin = (e?: React.FormEvent, supId?: string) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    const targetId = supId || selectedSupervisorId;
    const res = loginSupervisor(targetId, pin);
    if (!res.success) {
      setErrorMessage(res.error || 'Invalid supervisor credentials.');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'roads':
        return <Wrench className="w-4 h-4 text-amber-400" />;
      case 'streetlights':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'sanitation':
        return <Trash2 className="w-4 h-4 text-emerald-400" />;
      case 'water':
        return <Droplet className="w-4 h-4 text-cyan-400" />;
      default:
        return <HardHat className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-3.5 py-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white w-full max-w-[430px] mx-auto space-y-4">
      {/* Top Banner */}
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

      {/* Header */}
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-amber-950/40">
          <HardHat className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold tracking-tight text-white">
          Field Supervisor Login
        </h1>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Ward-22 Nagawara On-Site Repair &amp; Maintenance Command
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Supervisor Selection Cards */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
          <span>Select Supervisor Identity:</span>
          <span className="text-[10px] text-amber-400 font-mono">Ward-22 Field Staff</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {supervisors.map(sup => {
            const isSelected = selectedSupervisorId === sup.id;
            return (
              <div
                key={sup.id}
                onClick={() => {
                  setSelectedSupervisorId(sup.id);
                  setErrorMessage(null);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/70 shadow-md shadow-amber-950/40 ring-1 ring-amber-500/40'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {getCategoryIcon(sup.category)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">{sup.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold bg-slate-800 text-amber-300 border border-slate-700">
                        {sup.badgeId}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{sup.role}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{sup.phone}</div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center">
                  {isSelected ? (
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Supervisor Form */}
      <form onSubmit={handleLogin} className="space-y-3 pt-1">
        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">
            Supervisor Access PIN
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="password"
              required
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="Enter PIN (Default: 1234)"
              className="w-full bg-slate-800/90 border border-slate-700 focus:border-amber-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Demo quick PIN: <code className="text-amber-400">1234</code>
          </span>
        </div>

        {/* Permanent session note */}
        <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-[10px] text-amber-300 flex items-start gap-2">
          <Lock className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <strong className="text-amber-200">Permanent On-Field Session:</strong>
            <span className="text-amber-300/90 block mt-0.5">
              Once logged in, your session remains permanently active on this device even if you reload or reopen the browser.
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-950/60 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <HardHat className="w-4 h-4" />
          <span>Sign In as Supervisor {activeSupervisor.name}</span>
        </button>
      </form>

      {/* Leadership Footer Note */}
      <div className="pt-2 border-t border-slate-800 text-center">
        <div className="inline-flex items-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Official Ward-22 Nagawara Field Operations · Syed Ali President</span>
        </div>
      </div>
    </div>
  );
};
