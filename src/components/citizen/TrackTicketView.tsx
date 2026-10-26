import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Search,
  ClipboardList,
  Lock,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Eye,
} from 'lucide-react';

export const TrackTicketView: React.FC = () => {
  const { complaints, currentUser, viewComplaintDetails, fetchComplaintById } = useApp();

  const [ticketInput, setTicketInput] = useState<string>('');
  const [searchedId, setSearchedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Filter only complaints submitted by the current logged-in user
  const myReceipts = complaints.filter(
    c => c.citizenEmail === currentUser.email || c.citizenName === currentUser.name
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = ticketInput.trim().toUpperCase();
    if (!clean) return;

    setIsSearching(true);
    setErrorMessage(null);
    try {
      const matched = await fetchComplaintById(clean);
      if (matched) {
        setSearchedId(matched.id);
        setErrorMessage(null);
      } else {
        setErrorMessage(`No record found in database for "${clean}". Please verify your ticket code (e.g. CP-1 or 1).`);
        setSearchedId(null);
      }
    } catch {
      setErrorMessage(`Unable to query ticket "${clean}". Please verify your connection.`);
    } finally {
      setIsSearching(false);
    }
  };

  const currentResult = searchedId ? complaints.find(c => c.id === searchedId) : null;

  return (
    <div className="w-full max-w-[430px] mx-auto px-3.5 py-4 space-y-4">
      {/* Header */}
      <div>
        <div className="text-[10px] font-mono uppercase text-blue-600 font-semibold tracking-wider">
          Private Issue Status
        </div>
        <h1 className="text-base font-bold tracking-tight text-slate-900 mt-0.5">
          Track Your Ticket by ID
        </h1>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Issues are kept confidential. Enter your ticket code to check resolution progress.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <form onSubmit={handleSearch} className="flex flex-col gap-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={ticketInput}
              onChange={e => setTicketInput(e.target.value)}
              placeholder="e.g. CP-1 or 1"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-mono uppercase text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {isSearching ? 'Searching...' : 'Check Status'}
          </button>
        </form>

        {errorMessage && (
          <p className="text-xs text-rose-600 mt-2 font-medium">{errorMessage}</p>
        )}

        {/* Quick select your own receipts */}
        {myReceipts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block mb-2">
              Your Filed Issue Receipts:
            </span>
            <div className="flex flex-wrap gap-2">
              {myReceipts.map(rec => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => {
                    setTicketInput(rec.id);
                    setSearchedId(rec.id);
                    setErrorMessage(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                    searchedId === rec.id
                      ? 'bg-blue-600 text-white border-blue-600 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {rec.id} ({rec.status.replace('_', ' ')})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Result Card if found */}
      {currentResult && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-blue-600">
                  {currentResult.id}
                </span>
                <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                  Case #{currentResult.caseNumber || currentResult.id.replace(/^CP[-_]?/i, '')}
                </span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {currentResult.status.replace('_', ' ')}
                </span>
                <span className="text-slate-400 text-xs capitalize">· {currentResult.category}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">{currentResult.title}</h2>
            </div>

            <button
              type="button"
              onClick={() => viewComplaintDetails(currentResult.id)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Full Details &amp; Timeline</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentResult.location.address}</span>
              </div>
              <div className="text-slate-500">
                Logged: {new Date(currentResult.createdAt).toLocaleDateString()}
              </div>
              <div className="text-slate-500">
                Assigned Team: {currentResult.assignedDepartmentName || 'Triage Dispatch'}
              </div>
            </div>

            {/* Photo preview */}
            <div className="aspect-video max-w-xs rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
              <img
                src={
                  currentResult.status === 'resolved' && currentResult.afterPhotoUrl
                    ? currentResult.afterPhotoUrl
                    : currentResult.photoUrl
                }
                alt="Ticket proof"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Notice */}
      <div className="p-4 rounded-2xl bg-slate-100 text-slate-600 text-xs flex items-center gap-2">
        <Lock className="w-4 h-4 text-slate-500 shrink-0" />
        <span>
          Community issues are confidential to safeguard neighborhood privacy. Only designated city operations administrators have access to the city-wide issue map and logs.
        </span>
      </div>
    </div>
  );
};
