import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  PlusCircle,
  ClipboardList,
  Building2,
  Search,
  Lock,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton.tsx';
import { WardLeadershipBanner } from '../common/WardLeadershipBanner.tsx';
import { matchesTicketQuery } from '../../utils/caseCounter.ts';

export const CitizenHome: React.FC = () => {
  const {
    currentUser,
    setCitizenTab,
    complaints,
    viewComplaintDetails,
    firebaseUser,
    signInWithGoogle,
  } = useApp();

  const [searchTicketId, setSearchTicketId] = useState<string>('');
  const [ticketError, setTicketError] = useState<string | null>(null);

  // Filter ONLY issues submitted by the current logged in citizen
  const myOwnComplaints = complaints.filter(
    c => c.citizenEmail === currentUser.email || c.citizenName === currentUser.name
  );

  const handleLookupTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = searchTicketId.trim();
    if (!raw) return;
    const found = complaints.find(c => matchesTicketQuery(c, raw));
    if (found) {
      setTicketError(null);
      viewComplaintDetails(found.id);
    } else {
      setTicketError('Ticket ID not found. Please double-check your code (e.g. CP-1 or 1).');
    }
  };

  return (
    <div className="w-full max-w-[430px] mx-auto px-3.5 py-4 space-y-4">
      {/* Official Leadership Hero Card: First two pics in Left & Right above corner, 3rd pic in right corner */}
      <WardLeadershipBanner variant="card" />

      {/* Mobile Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-800 text-white p-5 shadow-lg">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-semibold mb-2.5 border border-blue-500/30">
            <Building2 className="w-3 h-3" />
            <span>{currentUser.ward}</span>
          </div>

          <h1 className="text-lg font-bold tracking-tight text-white leading-tight">
            Hello, {currentUser.name.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
            Report potholes, streetlights, or water leaks directly to city operations with Google Maps.
          </p>

          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setCitizenTab('report')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report a Problem Now</span>
            </button>

            <button
              type="button"
              onClick={() => setCitizenTab('track')}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ClipboardList className="w-4 h-4 text-blue-400" />
              <span>Lookup My Ticket</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 w-48 h-48 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* PWA Install Banner */}
      <PWAInstallButton variant="banner" />

      {/* Google Sign-In Connect Banner if guest */}
      {!firebaseUser && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between gap-2.5 shadow-md">
          <div className="min-w-0">
            <div className="text-xs font-bold flex items-center gap-1.5">
              <span>Secure with Google Sign-In</span>
            </div>
            <div className="text-[10px] text-blue-100 mt-0.5 leading-tight">
              Sync reported tickets &amp; civic points directly to Cloud Firestore.
            </div>
          </div>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-[11px] rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.34 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.43l4.03-3.14z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.57l4.03 3.14c.95-2.83 3.6-4.96 6.72-4.96z"/>
            </svg>
            <span>Sign In</span>
          </button>
        </div>
      )}

      {/* Reassuring Privacy Card */}
      <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 text-[11px] text-blue-900 flex items-start gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-blue-600/10 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
          <Lock className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 leading-snug">
          <strong className="text-blue-950 font-semibold">Private &amp; Confidential: </strong>
          Your reports are sent directly and securely to city dispatch. No public browsing of private reports.
        </div>
      </div>

      {/* Quick Private Ticket Lookup Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <h2 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-blue-600" />
          <span>Track Ticket Status</span>
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Enter ticket ID (e.g. <span className="font-mono text-blue-600 font-semibold">CP-1 or 1</span>):
        </p>

        <form onSubmit={handleLookupTicket} className="mt-3 flex flex-col gap-2">
          <input
            type="text"
            value={searchTicketId}
            onChange={e => setSearchTicketId(e.target.value)}
            placeholder="e.g. CP-1 or 1"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 uppercase font-mono focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Lookup Ticket
          </button>
        </form>

        {ticketError && (
          <p className="text-[11px] text-rose-600 mt-2 font-medium">{ticketError}</p>
        )}

        {/* Quick link to user's own submitted tickets */}
        {myOwnComplaints.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Your Recent Tickets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {myOwnComplaints.slice(0, 3).map(ticket => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => viewComplaintDetails(ticket.id)}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-700 text-[11px] font-mono font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>{ticket.id}</span>
                  <span className="text-[9px] text-slate-400 capitalize">({ticket.category})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3 Step "How it Works" Clean Mobile Stack */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <h2 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
          <span>How NagawaraSolver Works</span>
        </h2>

        <div className="space-y-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs">Snap Photo &amp; Drop Pin</div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Take a quick photo and mark the location accurately on Google Maps.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 font-bold text-[11px] flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs">Operations Dispatch</div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Verified by city staff and assigned to the active field maintenance crew.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs">Photo Resolution Proof</div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Crew uploads verification photos once the repair is completed.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
