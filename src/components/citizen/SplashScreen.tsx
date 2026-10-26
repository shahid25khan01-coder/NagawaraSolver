import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Smartphone,
  HardHat,
  ShieldAlert,
  ArrowRight,
  Camera,
  MapPin,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { WardLeadershipBanner } from '../common/WardLeadershipBanner.tsx';

interface SplashScreenProps {
  onOpenAuth?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = () => {
  const { setCurrentView } = useApp();

  return (
    <div className="flex-1 flex flex-col justify-between px-3.5 py-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white w-full max-w-[430px] mx-auto space-y-4">
      {/* Official Ward-22 Leadership Banner (Shri K.J George, Shri Rana George, Syed Ali President) */}
      <WardLeadershipBanner variant="card" />

      {/* Hero Header */}
      <div className="text-center pt-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-semibold mb-2.5">
          <MapPin className="w-3.5 h-3.5 text-blue-400" />
          <span>Ward-22 Nagawara · Bengaluru City Portal</span>
        </div>

        <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
          Civic Issue Reporting &amp; Field Resolution
        </h1>

        <p className="mt-1.5 text-xs text-slate-300 leading-relaxed max-w-[340px] mx-auto">
          Choose your dedicated portal to access civic services, field operations, or administrative command.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-2 my-4 text-center">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <Camera className="w-4 h-4 mx-auto text-blue-400 mb-1" />
            <div className="text-[10px] font-bold text-white">GPS Camera</div>
            <div className="text-[9px] text-slate-400 mt-0.5">Accurate location</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <HardHat className="w-4 h-4 mx-auto text-amber-400 mb-1" />
            <div className="text-[10px] font-bold text-white">Supervisors</div>
            <div className="text-[9px] text-slate-400 mt-0.5">On-site action</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
            <div className="text-[10px] font-bold text-white">Photo Proof</div>
            <div className="text-[9px] text-slate-400 mt-0.5">Verified fixes</div>
          </div>
        </div>
      </div>

      {/* 3 SEPARATE DEDICATED LOGIN PORTALS */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-1">
          Select Your Portal:
        </div>

        {/* 1. CITIZEN / USER LOGIN */}
        <button
          type="button"
          onClick={() => setCurrentView('user_login')}
          className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/40 via-blue-800/30 to-indigo-900/40 border border-blue-500/50 hover:border-blue-400 transition-all text-left flex items-center justify-between gap-3 shadow-lg shadow-blue-950/40 cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-400/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Smartphone className="w-5 h-5 text-blue-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Citizen / Resident Login</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Phone
                </span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                File complaints, track progress on Google Maps &amp; get SMS updates
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-blue-400 shrink-0 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* 2. FIELD SUPERVISOR LOGIN */}
        <button
          type="button"
          onClick={() => setCurrentView('supervisor_login')}
          className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/30 to-yellow-950/40 border border-amber-500/50 hover:border-amber-400 transition-all text-left flex items-center justify-between gap-3 shadow-lg shadow-amber-950/40 cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <HardHat className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Supervisor Login</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Field Staff
                </span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                Receive assigned work orders, navigate to sites &amp; upload resolution photos
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-400 shrink-0 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* 3. ADMINISTRATOR LOGIN */}
        <button
          type="button"
          onClick={() => setCurrentView('admin_login')}
          className="w-full p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all text-left flex items-center justify-between gap-3 shadow-md shadow-black/50 cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5 text-slate-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Administrator Login</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                  Executive
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Restricted operations panel to verify tickets, assign depts &amp; supervisors
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Session Persistence Reassurance */}
      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-center gap-2 text-center">
        <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>Once you log in, your session is saved permanently and will never log out.</span>
      </div>
    </div>
  );
};
