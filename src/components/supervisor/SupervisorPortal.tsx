import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Complaint, Supervisor } from '../../types.ts';
import { InteractiveMap } from '../common/InteractiveMap.tsx';
import { PWAInstallButton } from '../common/PWAInstallButton.tsx';
import { CIVIC_PRESET_PHOTOS } from '../../data/imagePresets.ts';
import {
  HardHat,
  MapPin,
  Camera,
  CheckCircle2,
  Clock,
  Navigation,
  Phone,
  User,
  AlertTriangle,
  FileText,
  Upload,
  ArrowRight,
  Filter,
  Search,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  X,
  Layers,
  Check,
} from 'lucide-react';
import { matchesTicketQuery } from '../../utils/caseCounter.ts';

export const SupervisorPortal: React.FC = () => {
  const {
    complaints,
    supervisors,
    activeSupervisor,
    setActiveSupervisor,
    supervisorMarkInProgress,
    supervisorResolveComplaint,
    setCurrentView,
    setCitizenTab,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'assigned_to_me' | 'all_cases'>('assigned_to_me');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMapCaseId, setSelectedMapCaseId] = useState<string | null>(null);

  // Resolution modal state
  const [resolvingComplaint, setResolvingComplaint] = useState<Complaint | null>(null);
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string>('');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [resolutionSuccess, setResolutionSuccess] = useState<string | null>(null);

  // Image preview modal
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);

  // Filter complaints based on tab and filters
  const filteredCases = complaints.filter(c => {
    // Tab filter
    if (activeTab === 'assigned_to_me') {
      const isAssignedToMe = c.assignedSupervisorId === activeSupervisor.id;
      // Also show category match if unassigned so supervisor can claim it
      const isCategoryMatch = !c.assignedSupervisorId && c.category === activeSupervisor.category;
      if (!isAssignedToMe && !isCategoryMatch) return false;
    }

    // Status filter
    if (statusFilter === 'pending') {
      if (c.status !== 'submitted' && c.status !== 'verified') return false;
    } else if (statusFilter === 'in_progress') {
      if (c.status !== 'in_progress') return false;
    } else if (statusFilter === 'resolved') {
      if (c.status !== 'resolved') return false;
    }

    // Search query
    if (searchQuery.trim()) {
      return matchesTicketQuery(c, searchQuery);
    }

    return true;
  });

  // KPI calculations
  const myAssignedCount = complaints.filter(c => c.assignedSupervisorId === activeSupervisor.id).length;
  const myInProgressCount = complaints.filter(
    c => c.assignedSupervisorId === activeSupervisor.id && c.status === 'in_progress'
  ).length;
  const myResolvedCount = complaints.filter(
    c => c.assignedSupervisorId === activeSupervisor.id && c.status === 'resolved'
  ).length;
  const pendingActionCount = complaints.filter(
    c => (c.assignedSupervisorId === activeSupervisor.id || (!c.assignedSupervisorId && c.category === activeSupervisor.category)) &&
      (c.status === 'submitted' || c.status === 'verified')
  ).length;

  const handleOpenResolveModal = (c: Complaint) => {
    setResolvingComplaint(c);
    // Pre-fill realistic preset repair photo according to category
    const defaultPhoto =
      c.category === 'roads'
        ? CIVIC_PRESET_PHOTOS.pothole_after
        : c.category === 'streetlights'
        ? CIVIC_PRESET_PHOTOS.streetlight_after
        : c.category === 'sanitation'
        ? CIVIC_PRESET_PHOTOS.garbage_after
        : CIVIC_PRESET_PHOTOS.water_leak_after;

    setAfterPhotoUrl(c.afterPhotoUrl || defaultPhoto);
    setResolutionNotes(
      c.resolutionNotes ||
        `Work completed on-site by Supervisor ${activeSupervisor.name}. Defect rectified according to Ward-22 municipal engineering guidelines. Area restored and safe for public use.`
    );
    setResolutionSuccess(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAfterPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingComplaint) return;
    if (!afterPhotoUrl) {
      alert('Please upload an after-work photo as proof of resolution.');
      return;
    }

    setIsSubmitting(true);
    try {
      await supervisorResolveComplaint(resolvingComplaint.id, afterPhotoUrl, resolutionNotes);
      setResolutionSuccess(`Case #${resolvingComplaint.caseNumber || resolvingComplaint.id} marked as RESOLVED! Proof photo uploaded.`);
      setTimeout(() => {
        setResolvingComplaint(null);
        setResolutionSuccess(null);
        setIsSubmitting(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleStartWork = async (complaintId: string) => {
    await supervisorMarkInProgress(complaintId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return { label: 'New / Unverified', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'verified':
        return { label: 'Assigned / Ready', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'in_progress':
        return { label: 'Work In Progress', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'resolved':
        return { label: 'Resolved & Closed', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      default:
        return { label: status, color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  return (
    <div className="w-full bg-slate-950 text-white min-h-full pb-20">
      {/* Top Supervisor Command Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 px-3.5 py-4">
        {/* Supervisor Profile Card */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-400/80 flex items-center justify-center text-amber-400 font-black text-sm shrink-0 shadow-lg shadow-amber-950/50">
              <HardHat className="w-6 h-6 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-sm sm:text-base font-bold text-white truncate leading-tight">
                  {activeSupervisor.name}
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {activeSupervisor.badgeId}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {activeSupervisor.role}
              </p>
              <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>On-Duty · Ward-22 Nagawara Field Ops</span>
              </div>
            </div>
          </div>

          {/* Header Quick Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <PWAInstallButton variant="navbar" />
            <button
              type="button"
              onClick={() => {
                setCurrentView('citizen');
                setCitizenTab('home');
              }}
              className="px-2.5 py-1.5 text-[10px] font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700 shrink-0"
            >
              Citizen App
            </button>
          </div>
        </div>

        {/* Supervisor Switcher Dropdown */}
        <div className="mt-3.5 p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0 font-semibold pl-1">
            Active Supervisor:
          </span>
          <select
            value={activeSupervisor.id}
            onChange={(e) => {
              const selected = supervisors.find(s => s.id === e.target.value);
              if (selected) setActiveSupervisor(selected);
            }}
            className="flex-1 bg-slate-950 text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            {supervisors.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.department}) - {s.badgeId}
              </option>
            ))}
          </select>
        </div>

        {/* KPI Summary Tiles */}
        <div className="grid grid-cols-4 gap-2 mt-3.5 text-center">
          <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-xl">
            <span className="text-base font-bold text-amber-400">{pendingActionCount}</span>
            <span className="block text-[9px] text-slate-400 font-medium uppercase mt-0.5">Pending</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-xl">
            <span className="text-base font-bold text-purple-400">{myInProgressCount}</span>
            <span className="block text-[9px] text-slate-400 font-medium uppercase mt-0.5">In Progress</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-xl">
            <span className="text-base font-bold text-emerald-400">{myResolvedCount}</span>
            <span className="block text-[9px] text-slate-400 font-medium uppercase mt-0.5">Resolved</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-xl">
            <span className="text-base font-bold text-white">{myAssignedCount}</span>
            <span className="block text-[9px] text-slate-400 font-medium uppercase mt-0.5">Total Assigned</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="px-3.5 py-4 space-y-4">
        {/* Tab Switcher & Search */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('assigned_to_me')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'assigned_to_me'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Assigned to Me ({myAssignedCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all_cases')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'all_cases'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Ward Issues ({complaints.length})
            </button>
          </div>

          {/* Search and Status Filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Case #, ticket, street..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-900 text-xs text-slate-300 border border-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Complaints List for Supervisor */}
        {filteredCases.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400/60 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Cases Match Current Filter</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {activeTab === 'assigned_to_me'
                ? `No active cases currently assigned to Supervisor ${activeSupervisor.name}. Check the "All Ward Issues" tab to view all grievances in Ward-22.`
                : 'No complaints reported in this status.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredCases.map(c => {
              const statusBadge = getStatusBadge(c.status);
              const isAssignedToActive = c.assignedSupervisorId === activeSupervisor.id;

              return (
                <div
                  key={c.id}
                  className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg transition-all"
                >
                  {/* Card Header: Case number, Category, Status */}
                  <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-amber-400">
                        Case #{c.caseNumber || c.id.replace(/^CP[-_]?/i, '')}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        ({c.id})
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {c.category}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${statusBadge.color}`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Card Body: Data of the Issue */}
                  <div className="p-3.5 space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-white leading-snug">
                        {c.title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {c.description}
                      </p>
                    </div>

                    {/* Citizen Reporter Info */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="text-slate-300 font-semibold truncate">
                          {c.citizenName}
                        </span>
                      </div>
                      {c.citizenPhone && c.citizenPhone !== 'Confidential' && (
                        <a
                          href={`tel:${c.citizenPhone}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call Citizen</span>
                        </a>
                      )}
                    </div>

                    {/* Location Information & Navigation */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {c.location.address}
                            </span>
                            {c.location.landmark && (
                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                Landmark: {c.location.landmark}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                              GPS: {c.location.lat.toFixed(5)}, {c.location.lng.toFixed(5)} ({c.location.ward})
                            </span>
                          </div>
                        </div>

                        {/* Turn-by-Turn GPS Navigation Button */}
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${c.location.lat},${c.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 shrink-0 shadow-sm"
                          title="Open in Google Maps Navigation"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Navigate</span>
                        </a>
                      </div>

                      {/* Map Toggle Snippet */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedMapCaseId(selectedMapCaseId === c.id ? null : c.id)
                          }
                          className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Layers className="w-3 h-3" />
                          <span>{selectedMapCaseId === c.id ? 'Hide Map View' : 'Show Location on Interactive Map'}</span>
                        </button>
                        {selectedMapCaseId === c.id && (
                          <div className="mt-2 rounded-xl overflow-hidden border border-slate-800">
                            <InteractiveMap
                              pins={[c]}
                              selectedPinId={c.id}
                              heightClass="h-44"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Photos Preview: Before Photo & After Photo (if resolved) */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Before Photo */}
                      <div>
                        <span className="text-[9px] font-mono text-slate-400 block mb-1 uppercase font-semibold">
                          Citizen Photo Evidence
                        </span>
                        <div
                          onClick={() => setPreviewPhoto({ url: c.photoUrl, title: `Citizen Evidence: Case #${c.caseNumber || c.id}` })}
                          className="aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 relative cursor-pointer group"
                        >
                          <img
                            src={c.photoUrl}
                            alt="Citizen report"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <Camera className="w-4 h-4 text-white/80" />
                          </div>
                        </div>
                      </div>

                      {/* After Photo if available */}
                      {c.afterPhotoUrl ? (
                        <div>
                          <span className="text-[9px] font-mono text-emerald-400 block mb-1 uppercase font-semibold">
                            Resolution Proof (After)
                          </span>
                          <div
                            onClick={() =>
                              setPreviewPhoto({
                                url: c.afterPhotoUrl!,
                                title: `Resolution Proof: Case #${c.caseNumber || c.id}`,
                              })
                            }
                            className="aspect-video rounded-xl overflow-hidden bg-black border border-emerald-500/40 relative cursor-pointer group ring-1 ring-emerald-500/30"
                          >
                            <img
                              src={c.afterPhotoUrl}
                              alt="Resolved proof"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-0.5">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-2 text-center text-slate-500">
                          <Camera className="w-5 h-5 mb-1 text-slate-600" />
                          <span className="text-[10px] leading-tight">After-photo pending resolution</span>
                        </div>
                      )}
                    </div>

                    {/* Resolution Notes display if resolved */}
                    {c.status === 'resolved' && c.resolutionNotes && (
                      <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block mb-0.5">
                          Supervisor Resolution Report:
                        </span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {c.resolutionNotes}
                        </p>
                      </div>
                    )}

                    {/* Assigned Supervisor Status Bar */}
                    <div className="pt-1 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5 truncate">
                        <HardHat className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-[11px] truncate">
                          Supervisor:{' '}
                          <span className="font-bold text-white">
                            {c.assignedSupervisorName || 'Not specifically assigned'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer for Supervisor */}
                  <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-2">
                    {c.status !== 'resolved' ? (
                      <>
                        {c.status !== 'in_progress' ? (
                          <button
                            type="button"
                            onClick={() => handleStartWork(c.id)}
                            className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Mark In Progress</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-purple-300 font-semibold px-2">
                            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                            <span>Work Active On-Site</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenResolveModal(c)}
                          className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-950 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Resolve &amp; Upload Photo</span>
                        </button>
                      </>
                    ) : (
                      <div className="w-full flex items-center justify-between text-xs text-emerald-400 font-bold px-1">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Completed &amp; Signed Off</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {c.resolvedAt ? new Date(c.resolvedAt).toLocaleDateString() : 'Resolved'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SUPERVISOR RESOLUTION MODAL */}
      {resolvingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-[420px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-4 sm:p-5 text-white max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-amber-400">
                    Case #{resolvingComplaint.caseNumber || resolvingComplaint.id}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Supervisor Resolution
                  </span>
                </div>
                <h2 className="text-base font-bold text-white mt-1 leading-snug">
                  {resolvingComplaint.title}
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                  <span className="truncate">{resolvingComplaint.location.address}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResolvingComplaint(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Alert */}
            {resolutionSuccess && (
              <div className="my-3 p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-200 rounded-2xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{resolutionSuccess}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitResolution} className="space-y-4 my-3.5">
              {/* Photo Upload Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white flex items-center justify-between">
                  <span>1. Upload After-Work Photo Proof *</span>
                  <span className="text-[10px] text-amber-400 font-mono">Camera / Gallery</span>
                </label>

                {/* Preview Frame */}
                {afterPhotoUrl ? (
                  <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-emerald-500/60 bg-black shadow-lg">
                    <img
                      src={afterPhotoUrl}
                      alt="Resolution Proof"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-emerald-700/90 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-400 flex items-center gap-1 shadow-md">
                      <Check className="w-3 h-3" />
                      <span>Resolution Proof Selected</span>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                    <Camera className="w-8 h-8 text-slate-500 mb-1" />
                    <span className="text-xs text-slate-300 font-semibold">
                      Take photo of the repaired issue
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      Clear visual proof required for citizen validation
                    </span>
                  </div>
                )}

                {/* File picker button */}
                <div className="flex items-center gap-2">
                  <label className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload from Phone Camera / Files</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preset Fast Picker */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
                    Or select standard verified repair preset:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setAfterPhotoUrl(CIVIC_PRESET_PHOTOS.pothole_after)}
                      className={`p-1.5 rounded-lg border text-left truncate transition-colors ${
                        afterPhotoUrl === CIVIC_PRESET_PHOTOS.pothole_after
                          ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300'
                          : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      ✓ Repaired Asphalt Road
                    </button>
                    <button
                      type="button"
                      onClick={() => setAfterPhotoUrl(CIVIC_PRESET_PHOTOS.streetlight_after)}
                      className={`p-1.5 rounded-lg border text-left truncate transition-colors ${
                        afterPhotoUrl === CIVIC_PRESET_PHOTOS.streetlight_after
                          ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300'
                          : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      ✓ Energized LED Streetlight
                    </button>
                    <button
                      type="button"
                      onClick={() => setAfterPhotoUrl(CIVIC_PRESET_PHOTOS.garbage_after)}
                      className={`p-1.5 rounded-lg border text-left truncate transition-colors ${
                        afterPhotoUrl === CIVIC_PRESET_PHOTOS.garbage_after
                          ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300'
                          : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      ✓ Cleared & Sanitized Site
                    </button>
                    <button
                      type="button"
                      onClick={() => setAfterPhotoUrl(CIVIC_PRESET_PHOTOS.water_leak_after)}
                      className={`p-1.5 rounded-lg border text-left truncate transition-colors ${
                        afterPhotoUrl === CIVIC_PRESET_PHOTOS.water_leak_after
                          ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300'
                          : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      ✓ Replaced Valve Pipe
                    </button>
                  </div>
                </div>
              </div>

              {/* Resolution Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white flex items-center justify-between">
                  <span>2. Supervisor Resolution Summary *</span>
                  <span className="text-[10px] text-slate-400">Ward-22 Audit Record</span>
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Detail the work carried out, materials used, and site safety clearance..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Inspector Verification Sign-off */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-[11px] leading-tight">
                  <span className="text-white font-bold block">
                    Verified By Supervisor {activeSupervisor.name}
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    Badge: {activeSupervisor.badgeId} · {activeSupervisor.department}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingComplaint(null)}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-950 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Recording Resolution...' : 'Sign Off & Complete Case'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Photo Preview Modal */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div className="relative max-w-lg w-full max-h-[85vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-10 right-0 p-1.5 text-white hover:text-rose-400"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-xs font-mono text-slate-300 mb-2 truncate max-w-full">
              {previewPhoto.title}
            </div>
            <img
              src={previewPhoto.url}
              alt={previewPhoto.title}
              className="max-h-[75vh] w-auto rounded-2xl border border-slate-700 shadow-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
