import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Complaint, ComplaintStatus, PriorityLevel, Department } from '../../types.ts';
import { InteractiveMap } from '../common/InteractiveMap.tsx';
import {
  ClipboardList,
  MapPin,
  Users2,
  BarChart3,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Eye,
  Download,
  ShieldCheck,
  TrendingUp,
  ChevronRight,
  RotateCcw,
  Sparkles,
  HardHat,
  Smartphone,
} from 'lucide-react';
import { APKDownloadModal } from '../common/APKDownloadModal.tsx';
import { matchesTicketQuery } from '../../utils/caseCounter.ts';

export const AdminDashboard: React.FC = () => {
  const {
    complaints,
    departments,
    supervisors,
    assignComplaintToSupervisor,
    adminTab,
    setAdminTab,
    openAdminResolutionFlow,
    toggleOfficerDuty,
    updateDepartmentSla,
    adminUser,
    loadSampleCases,
    resetCaseCounter,
    nextCasePreview,
  } = useApp();

  // Search & filter states for 'All Complaints'
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [supervisorFilter, setSupervisorFilter] = useState<string>('all');

  // Selected complaint on live map
  const [selectedMapPin, setSelectedMapPin] = useState<Complaint | null>(complaints[0] || null);
  const [showAPKModal, setShowAPKModal] = useState<boolean>(false);

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (deptFilter !== 'all' && c.assignedDepartmentId !== deptFilter && c.category !== deptFilter)
      return false;
    if (supervisorFilter !== 'all') {
      if (supervisorFilter === 'unassigned' && c.assignedSupervisorId) return false;
      if (supervisorFilter !== 'unassigned' && c.assignedSupervisorId !== supervisorFilter) return false;
    }
    if (searchQuery.trim()) {
      return matchesTicketQuery(c, searchQuery);
    }
    return true;
  });

  // KPI summaries
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'submitted').length;
  const inProgressCount = complaints.filter(c => c.status === 'in_progress' || c.status === 'verified').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  // Export CSV report
  const handleExportCsv = () => {
    const headers = 'ID,Title,Category,Status,Priority,Ward,Address,Citizen,Created\n';
    const rows = complaints
      .map(
        c =>
          `"${c.id}","${c.title.replace(/"/g, '""')}","${c.category}","${c.status}","${c.priority}","${c.location.ward}","${c.location.address.replace(/"/g, '""')}","${c.citizenName}","${c.createdAt}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `city_complaints_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return { label: 'Submitted', color: 'text-orange-700 bg-orange-50 border-orange-200' };
      case 'verified':
        return { label: 'Verified', color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'in_progress':
        return { label: 'In Progress', color: 'text-purple-700 bg-purple-50 border-purple-200' };
      case 'resolved':
        return { label: 'Resolved', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      default:
        return { label: status, color: 'text-slate-700 bg-slate-50 border-slate-200' };
    }
  };

  return (
    <div className="w-full max-w-[430px] mx-auto px-3.5 py-4 space-y-4">
      {/* Mobile Operations Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <div className="text-[10px] font-mono uppercase text-blue-600 font-semibold tracking-wider flex items-center gap-1">
            <span>Ward-22 Nagawara Command · Syed Ali President</span>
          </div>
          <h1 className="text-base font-bold tracking-tight text-slate-900 mt-0.5">
            Operations Console
          </h1>
          <p className="text-[11px] text-slate-500">
            {adminUser?.name || 'Administrator'} ({adminUser?.role || 'Authority'})
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowAPKModal(true)}
            title="Convert and package Android APK"
            className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-[11px] rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android APK</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-[11px] rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats 2x2 Mobile Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-semibold text-slate-500">Total Work Orders</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{totalCount}</div>
          <div className="text-[10px] text-slate-400">Ward-22 Nagawara</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-semibold text-orange-600">Pending Triage</div>
          <div className="text-xl font-bold font-mono text-orange-600 mt-0.5">{pendingCount}</div>
          <div className="text-[10px] text-slate-400">Awaiting review</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-semibold text-purple-600">In Progress</div>
          <div className="text-xl font-bold font-mono text-purple-600 mt-0.5">{inProgressCount}</div>
          <div className="text-[10px] text-slate-400">Crews dispatched</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <div className="text-[10px] font-semibold text-emerald-600">Resolved Proof</div>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
            {resolvedCount} <span className="text-[10px] font-normal text-slate-400">({resolutionRate}%)</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">Avg SLA: 31h</div>
        </div>
      </div>

      {/* Ward-22 Case Counting Engine & Restart Status Card */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-3.5 border border-blue-900/50 shadow-sm space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[10px] font-mono uppercase text-blue-400 font-bold tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Ward-22 Case Counting Engine</span>
            </div>
            <div className="text-xs font-semibold text-white mt-0.5">
              Starts from 1 · Restarts in 1st Month (January)
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              Active Cases: <span className="font-mono text-emerald-400 font-bold">{complaints.length}</span> · Next Ticket: <span className="font-mono text-blue-300 font-bold">{nextCasePreview.id}</span> (Case #{nextCasePreview.caseNumber})
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 block">
              Cycle: {nextCasePreview.cycleKey}
            </span>
            <span className="text-[9px] text-slate-400 block mt-1">
              {nextCasePreview.isFirstMonth ? '1st Month Active' : 'Restarts in Jan'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
          <button
            type="button"
            onClick={resetCaseCounter}
            className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            title="Reset active case list to 0 so the next case starts from Case #1"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Restart from 1 (1st Month Simulation)</span>
          </button>

          {complaints.length === 0 && (
            <button
              type="button"
              onClick={loadSampleCases}
              className="py-1.5 px-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
              title="Load sample ward complaints numbered sequentially Case #1 to #4"
            >
              <Sparkles className="w-3 h-3 text-white" />
              <span>Load 4 Sample Cases</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Tab Segment Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 overflow-x-auto no-scrollbar">
        {[
          { id: 'all_complaints' as const, label: 'Tickets' },
          { id: 'live_map' as const, label: 'Live Map' },
          { id: 'departments' as const, label: 'Depts' },
          { id: 'reports' as const, label: 'Analytics' },
        ].map(tab => {
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAdminTab(tab.id)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all text-center cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ALL COMPLAINTS (MOBILE CARDS - NO DESKTOP TABLE) */}
      {adminTab === 'all_complaints' && (
        <div className="space-y-3">
          {/* Mobile Search & Filters */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search ticket, address, citizen..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-8 pr-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Quick Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'submitted', label: 'Submitted' },
                { id: 'verified', label: 'Verified' },
                { id: 'in_progress', label: 'Active' },
                { id: 'resolved', label: 'Resolved' },
              ].map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatusFilter(s.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    statusFilter === s.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Supervisor Filter Dropdown */}
            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold flex items-center gap-1">
                <HardHat className="w-3 h-3 text-amber-600" />
                <span>Supervisor:</span>
              </span>
              <select
                value={supervisorFilter}
                onChange={e => setSupervisorFilter(e.target.value)}
                className="flex-1 bg-slate-50 text-[11px] font-semibold text-slate-800 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="all">All Supervisors (Ward-22)</option>
                <option value="unassigned">⚠️ Unassigned to Supervisor</option>
                {supervisors.map(sup => (
                  <option key={sup.id} value={sup.id}>
                    👷 {sup.name} ({sup.badgeId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Counter */}
          <div className="text-[11px] text-slate-500 font-medium px-1 flex items-center justify-between">
            <span>Showing {filteredComplaints.length} tickets</span>
            {statusFilter !== 'all' && (
              <span className="text-blue-600 font-semibold capitalize">Filtered: {statusFilter}</span>
            )}
          </div>

          {/* Native Mobile Complaint Cards (No table horizontal scroll) */}
          <div className="space-y-2.5">
            {filteredComplaints.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500">
                No complaints found matching criteria.
              </div>
            ) : (
              filteredComplaints.map(item => {
                const badge = getStatusBadge(item.status);
                return (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2 hover:border-blue-400 transition-all"
                  >
                    {/* Top Row: Ticket ID + Priority + Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-blue-600">{item.id}</span>
                        <span className="text-[9px] font-mono font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                          Case #{item.caseNumber || item.id.replace(/^CP[-_]?/i, '')}
                        </span>
                        <span
                          className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full border ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase ${
                          item.priority === 'urgent'
                            ? 'text-rose-600'
                            : item.priority === 'high'
                            ? 'text-amber-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>

                    {/* Middle: Title & Category */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="text-[10px] text-slate-400 capitalize mt-0.5">
                        Category: {item.category} · Citizen: {item.citizenName}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-1.5 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <div className="truncate">
                        <span className="font-medium text-slate-900">{item.location.address}</span>
                        <span className="text-slate-400 block text-[10px] font-mono">{item.location.ward}</span>
                      </div>
                    </div>

                    {/* Field Supervisor Assignment Strip */}
                    <div className="bg-amber-500/10 border border-amber-500/25 p-2 rounded-xl flex items-center justify-between gap-1.5 text-[11px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <HardHat className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <div className="truncate">
                          <span className="font-bold text-slate-900 block truncate">
                            {item.assignedSupervisorName ? `Supervisor: ${item.assignedSupervisorName}` : 'No Supervisor Assigned'}
                          </span>
                        </div>
                      </div>

                      <select
                        value={item.assignedSupervisorId || ''}
                        onChange={e => {
                          if (e.target.value) {
                            assignComplaintToSupervisor(item.id, e.target.value);
                          }
                        }}
                        className="text-[10px] bg-white border border-amber-400 rounded-md px-1.5 py-0.5 text-slate-800 font-semibold focus:outline-none shrink-0 cursor-pointer"
                      >
                        <option value="">{item.assignedSupervisorId ? 'Reassign' : '+ Assign Supervisor'}</option>
                        {supervisors.map(sup => (
                          <option key={sup.id} value={sup.id}>
                            {sup.name} ({sup.badgeId})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Department Assignment & Action Button */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-[10px] text-slate-500 truncate max-w-[170px]">
                        {item.assignedDepartmentName ? (
                          <span>
                            <strong className="text-slate-700">{item.assignedDepartmentName}</strong>
                            <span className="block text-slate-400">{item.assignedOfficerName || 'Assigned'}</span>
                          </span>
                        ) : (
                          <span className="text-orange-600 italic font-semibold">Triage Required</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => openAdminResolutionFlow(item.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
                      >
                        <span>Resolve</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE MAP (MOBILE SIZED) */}
      {adminTab === 'live_map' && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Live Incident Map</span>
              <span className="font-mono text-slate-500 text-[10px]">{complaints.length} active pins</span>
            </div>

            <InteractiveMap
              pins={complaints}
              selectedPinId={selectedMapPin?.id}
              onSelectPin={pin => setSelectedMapPin(pin)}
              heightClass="h-72"
              showLegend={false}
            />

            {/* Selected Pin Bottom Card */}
            {selectedMapPin && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={selectedMapPin.photoUrl}
                    alt={selectedMapPin.title}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="font-mono font-bold text-blue-600">{selectedMapPin.id}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600 capitalize">{selectedMapPin.category}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 truncate">{selectedMapPin.title}</div>
                    <div className="text-[10px] text-slate-500 truncate">{selectedMapPin.location.address}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openAdminResolutionFlow(selectedMapPin.id)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Execute Resolution Pipeline</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE DEPARTMENTS (MOBILE CARDS) */}
      {adminTab === 'departments' && (
        <div className="space-y-3">
          {departments.map(dept => (
            <div
              key={dept.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {dept.code}
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 mt-1">{dept.name}</h3>
                  <div className="text-[10px] text-slate-500">Head: {dept.headName}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Active Tasks</div>
                  <div className="text-base font-bold font-mono text-orange-600">
                    {dept.activeComplaintsCount}
                  </div>
                </div>
              </div>

              {/* Officers Mobile Roster */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="text-[10px] font-bold text-slate-600 uppercase">Field Officers:</div>
                {dept.officers.map(off => (
                  <div
                    key={off.id}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">{off.name}</span>
                      <span className="text-[10px] text-slate-400 block">{off.role}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-slate-500">{off.activeTasks} tasks</span>
                      <button
                        type="button"
                        onClick={() => toggleOfficerDuty(dept.id, off.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                          off.isOnDuty
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {off.isOnDuty ? 'Active' : 'Off'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Adjust SLA Target */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Target SLA:</span>
                <div className="flex items-center gap-1">
                  {[12, 24, 48].map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => updateDepartmentSla(dept.id, h)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        dept.slaHours === h
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: REPORTS AND ANALYTICS (MOBILE CARDS) */}
      {adminTab === 'reports' && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
            <div className="text-[10px] font-semibold text-slate-500">Average Turnaround Time</div>
            <div className="text-2xl font-mono font-bold text-slate-900">
              27.8 <span className="text-xs font-normal text-slate-400">Hours</span>
            </div>
            <div className="text-[11px] text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>14% faster than target SLA</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
            <div className="text-[10px] font-semibold text-slate-500">Citizen Satisfaction Score</div>
            <div className="text-2xl font-mono font-bold text-amber-500">
              4.8 <span className="text-xs font-normal text-slate-400">/ 5.0</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Based on verified ratings after resolution proof
            </div>
          </div>

          {/* Civic Category Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900">Volume by Civic Category</h3>
            <div className="space-y-2">
              {[
                { name: 'Roads & Potholes', count: 18, color: 'bg-blue-600', pct: 40 },
                { name: 'Solid Waste & Sanitation', count: 12, color: 'bg-emerald-600', pct: 28 },
                { name: 'Street Lighting & Power', count: 8, color: 'bg-amber-500', pct: 18 },
                { name: 'Water & Sewerage', count: 5, color: 'bg-cyan-500', pct: 10 },
              ].map(cat => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-medium text-slate-700">{cat.name}</span>
                    <span className="font-mono text-slate-500">
                      {cat.count} ({cat.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${cat.color} rounded-full`}
                      style={{ width: `${cat.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* APK Export & Conversion Modal */}
      <APKDownloadModal
        isOpen={showAPKModal}
        onClose={() => setShowAPKModal(false)}
      />
    </div>
  );
};
