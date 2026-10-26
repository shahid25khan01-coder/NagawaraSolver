import React from 'react';
import { Building2, ShieldCheck, Award } from 'lucide-react';

interface WardLeadershipBannerProps {
  variant?: 'card' | 'compact';
}

export const WardLeadershipBanner: React.FC<WardLeadershipBannerProps> = ({ variant = 'card' }) => {
  if (variant === 'compact') {
    return (
      <div className="w-full bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 text-white px-2.5 sm:px-3 py-2 flex items-center justify-between gap-1.5 sm:gap-2 shadow-md">
        {/* Left top corner photo: Shri K.J George */}
        <div className="flex items-center shrink-0">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 sm:w-11 sm:h-11 aspect-square rounded-full overflow-hidden border-2 border-emerald-400 ring-2 ring-emerald-500/25 shadow-md bg-slate-950">
              <img
                src="/assets/aistudio/1_bc640ef1.jpeg"
                alt="Shri K.J George"
                className="w-full h-full object-cover object-[center_20%] scale-135"
              />
            </div>
            <span className="text-[8px] font-bold text-emerald-300 whitespace-nowrap mt-1 leading-none tracking-tight">
              Shri K.J George
            </span>
          </div>
        </div>

        {/* Center message */}
        <div className="text-center min-w-0 flex-1 px-1">
          <div className="text-[10.5px] sm:text-xs font-black text-white leading-tight tracking-tight line-clamp-2">
            This app is from Syed Ali President Nagawara Ward
          </div>
          <div className="text-[8.5px] sm:text-[9px] text-blue-400 font-mono tracking-wider uppercase mt-0.5 font-semibold">
            Ward-22 Nagawara · NagawaraSolver
          </div>
        </div>

        {/* Right top corner (Shri Rana George) and right corner (Syed Ali President) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Right top corner: Shri Rana George (Zoomed Out) */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 sm:w-11 sm:h-11 aspect-square rounded-full overflow-hidden border-2 border-amber-400 ring-2 ring-amber-500/25 shadow-md bg-slate-950">
              <img
                src="/assets/aistudio/Screenshot_2026-10-21_at_5.49.01_PM_1311f9b4.png"
                alt="Shri Rana George"
                className="w-full h-full object-cover object-[center_16%] scale-[0.80]"
              />
            </div>
            <span className="text-[8px] font-bold text-amber-300 whitespace-nowrap mt-1 leading-none tracking-tight">
              Shri Rana George
            </span>
          </div>

          {/* 3rd pic in right corner: Syed Ali (President) */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 sm:w-11 sm:h-11 aspect-square rounded-full overflow-hidden border-2 border-blue-400 ring-2 ring-blue-500/35 shadow-md bg-slate-950">
              <img
                src="/assets/aistudio/Syed_Ali_1_d1820020.jpeg"
                alt="Syed Ali President Nagawara Ward"
                className="w-full h-full object-cover object-[center_16%]"
              />
            </div>
            <span className="text-[8px] font-bold text-blue-300 whitespace-nowrap mt-1 leading-none tracking-tight">
              Syed Ali
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Full Hero Card (default)
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 text-white p-4 sm:p-5 shadow-2xl">
      {/* Top Row with First Two Pics in Left and Right Above Corners with Names */}
      <div className="flex items-start justify-between pb-3.5 border-b border-slate-800/80">
        {/* Left top corner photo: Shri K.J George (Zoomed In) */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 aspect-square rounded-full overflow-hidden border-3 border-emerald-400 ring-3 ring-emerald-500/25 shadow-xl shadow-black/80 bg-slate-950">
              <img
                src="/assets/aistudio/1_bc640ef1.jpeg"
                alt="Shri K.J George"
                className="w-full h-full object-cover object-[center_20%] scale-135 group-hover:scale-145 transition-transform duration-300"
              />
            </div>
          </div>
          <span className="bg-slate-950/90 text-[10px] sm:text-[11px] font-bold text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/50 shadow-md whitespace-nowrap mt-2 tracking-tight">
            Shri K.J George
          </span>
        </div>

        {/* Center Emblem / Jurisdiction */}
        <div className="text-center px-1 pt-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/40 shadow-xs">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Ward-22 Nagawara</span>
          </span>
          <div className="text-[10px] font-mono text-slate-400 mt-1.5 uppercase tracking-wider font-semibold">
            Public Redressal Portal
          </div>
        </div>

        {/* Right top corner photo: Shri Rana George (Zoomed Out) */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 aspect-square rounded-full overflow-hidden border-3 border-amber-400 ring-3 ring-amber-500/25 shadow-xl shadow-black/80 bg-slate-950">
              <img
                src="/assets/aistudio/Screenshot_2026-10-21_at_5.49.01_PM_1311f9b4.png"
                alt="Shri Rana George"
                className="w-full h-full object-cover object-[center_16%] scale-[0.80] group-hover:scale-[0.86] transition-transform duration-300"
              />
            </div>
          </div>
          <span className="bg-slate-950/90 text-[10px] sm:text-[11px] font-bold text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/50 shadow-md whitespace-nowrap mt-2 tracking-tight">
            Shri Rana George
          </span>
        </div>
      </div>

      {/* Main Feature: Announcement on the Left, 3rd Pic (Syed Ali) in Right Corner */}
      <div className="mt-4 flex items-center justify-between gap-3 sm:gap-4">
        {/* Text information */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-mono uppercase text-emerald-400 font-bold mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Civic Initiative</span>
          </div>

          <h2 className="text-base sm:text-lg font-black text-white leading-snug tracking-tight">
            This app is from Syed Ali President Nagawara Ward
          </h2>

          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            Dedicated infrastructure grievance and redressal system for all residents of Ward-22 Nagawara. Submit potholes, streetlights, or drainage issues for direct municipal resolution.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600/30 border border-blue-500/50 text-blue-300 text-xs font-bold">
              <Award className="w-3.5 h-3.5 text-blue-400" />
              <span>Syed Ali · President</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Ward-22 Nagawara
            </span>
          </div>
        </div>

        {/* 3rd pic in right corner: Syed Ali (President Nagawara Ward) in matched circular medallion */}
        <div className="shrink-0 flex flex-col items-center">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 aspect-square rounded-full overflow-hidden border-3 sm:border-4 border-blue-400 ring-4 ring-blue-500/30 shadow-2xl shadow-blue-950/80 bg-slate-950">
              <img
                src="/assets/aistudio/Syed_Ali_1_d1820020.jpeg"
                alt="Syed Ali President Nagawara Ward"
                className="w-full h-full object-cover object-[center_16%] group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-black text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full shadow-xl whitespace-nowrap border border-blue-400/80 tracking-tight">
              Syed Ali
            </div>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-200 mt-3 text-center leading-tight">
            President<br />Nagawara Ward
          </span>
        </div>
      </div>
    </div>
  );
};

