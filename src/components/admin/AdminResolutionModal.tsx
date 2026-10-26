import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Complaint, PriorityLevel } from '../../types.ts';
import { InteractiveMap } from '../common/InteractiveMap.tsx';
import { CIVIC_PRESET_PHOTOS } from '../../data/imagePresets.ts';
import {
  X,
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Send,
  Upload,
  UserCheck,
  Building2,
  FileCheck2,
  HardHat,
} from 'lucide-react';

interface AdminResolutionModalProps {
  complaintId: string | null;
  onClose: () => void;
}

export const AdminResolutionModal: React.FC<AdminResolutionModalProps> = ({
  complaintId,
  onClose,
}) => {
  const {
    complaints,
    departments,
    supervisors,
    verifyAndAssignComplaint,
    markInProgress,
    markResolved,
  } = useApp();

  if (!complaintId) return null;

  const complaint = complaints.find(c => c.id === complaintId);
  if (!complaint) return null;

  // Active step in resolution pipeline
  // Flowchart: View Photo and Location -> Verify and Assign -> In Progress -> Upload After Photo -> Mark Resolved -> Citizen Notified
  const [activePipelineStep, setActivePipelineStep] = useState<
    'view_photo' | 'verify_assign' | 'in_progress' | 'upload_after' | 'resolved_notified'
  >(() => {
    if (complaint.status === 'submitted') return 'view_photo';
    if (complaint.status === 'verified') return 'in_progress';
    if (complaint.status === 'in_progress') return 'upload_after';
    return 'resolved_notified';
  });

  // Verify and Assign form state
  const defaultDept = departments.find(d => d.category === complaint.category) || departments[0];
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    complaint.assignedDepartmentId || defaultDept.id
  );
  const currentDept = departments.find(d => d.id === selectedDeptId) || defaultDept;
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>(
    complaint.assignedOfficerId || currentDept.officers[0]?.id || ''
  );
  const defaultSupervisor =
    supervisors.find(s => s.category === complaint.category) || supervisors[0];
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>(
    complaint.assignedSupervisorId || defaultSupervisor.id
  );
  const [priority, setPriority] = useState<PriorityLevel>(complaint.priority);
  const [assignNotes, setAssignNotes] = useState<string>(
    'Field inspection team dispatched for emergency maintenance.'
  );

  // In Progress state
  const [progressNotes, setProgressNotes] = useState<string>(
    'Asphalt repair truck arrived on-site. Work zone cones deployed.'
  );

  // After Photo & Resolution state
  const defaultAfterPhoto =
    complaint.category === 'roads'
      ? CIVIC_PRESET_PHOTOS.pothole_after
      : complaint.category === 'streetlights'
      ? CIVIC_PRESET_PHOTOS.streetlight_after
      : complaint.category === 'sanitation'
      ? CIVIC_PRESET_PHOTOS.garbage_after
      : CIVIC_PRESET_PHOTOS.water_leak_after;

  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string>(
    complaint.afterPhotoUrl || defaultAfterPhoto
  );
  const [resolutionNotes, setResolutionNotes] = useState<string>(
    complaint.resolutionNotes ||
      'Defect repaired in full compliance with city engineering standards. Site cleaned and reopened for pedestrian and vehicular traffic.'
  );

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

  // Pipeline execution handlers
  const handleExecuteVerifyAssign = () => {
    verifyAndAssignComplaint(
      complaint.id,
      selectedDeptId,
      selectedOfficerId,
      priority,
      assignNotes,
      selectedSupervisorId
    );
    setActivePipelineStep('in_progress');
  };

  const handleExecuteInProgress = () => {
    markInProgress(complaint.id, progressNotes);
    setActivePipelineStep('upload_after');
  };

  const handleExecuteMarkResolved = () => {
    markResolved(complaint.id, afterPhotoUrl, resolutionNotes);
    setActivePipelineStep('resolved_notified');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-[420px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-4 sm:p-5 text-white max-h-[92vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-blue-400">{complaint.id}</span>
              <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                Case #{complaint.caseNumber || complaint.id.replace(/^CP[-_]?/i, '')}
              </span>
              <span className="text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                Current: {complaint.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400 capitalize">· {complaint.category}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1">{complaint.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pipeline Step Tabs (Explicit route map sequence) */}
        <div className="my-6 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
          <div className="flex items-center justify-between gap-1 min-w-[500px]">
            {[
              { id: 'view_photo', label: '1. View Photo & Map' },
              { id: 'verify_assign', label: '2. Verify & Assign' },
              { id: 'in_progress', label: '3. In Progress' },
              { id: 'upload_after', label: '4. Upload After Photo' },
              { id: 'resolved_notified', label: '5. Mark Resolved & Notify' },
            ].map((tab, idx) => {
              const isActive = activePipelineStep === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePipelineStep(tab.id as any)}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* STAGE 1: View Photo and Location */}
        {activePipelineStep === 'view_photo' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Photo */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase font-mono">
                  Citizen Photo Evidence
                </span>
                <div className="aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img
                    src={complaint.photoUrl}
                    alt="Inspection Evidence"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Location & Citizen details */}
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                <span className="text-xs font-semibold text-slate-400 uppercase font-mono block">
                  Incident GPS Location
                </span>

                <div className="flex items-start gap-2 text-slate-200">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white text-sm">{complaint.location.address}</div>
                    {complaint.location.landmark && (
                      <div className="text-slate-400 mt-0.5">Landmark: {complaint.location.landmark}</div>
                    )}
                    <div className="text-blue-400 font-mono mt-1">
                      {complaint.location.ward} · Lat: {complaint.location.lat.toFixed(4)}° / Lng: {complaint.location.lng.toFixed(4)}°
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase font-mono block">
                    Citizen Submitter Info
                  </span>
                  <div className="text-slate-300">Name: <span className="font-semibold text-white">{complaint.citizenName}</span></div>
                  <div className="text-slate-300">Phone: <span className="font-mono text-slate-300">{complaint.citizenPhone}</span></div>
                  <div className="text-slate-300">Logged: <span className="font-mono text-slate-400">{new Date(complaint.createdAt).toLocaleString()}</span></div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase font-mono block mb-1">
                    Description
                  </span>
                  <p className="text-slate-300 leading-relaxed italic">
                    "{complaint.description}"
                  </p>
                </div>
              </div>
            </div>

            {/* Google Map of incident location */}
            <div className="rounded-2xl overflow-hidden border border-slate-800">
              <InteractiveMap
                pins={[complaint]}
                selectedPinId={complaint.id}
                heightClass="h-[180px]"
                showLegend={false}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActivePipelineStep('verify_assign')}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-sm shadow-blue-600/30 cursor-pointer"
              >
                <span>Proceed to Verify &amp; Assign</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: Verify and Assign */}
        {activePipelineStep === 'verify_assign' && (
          <div className="space-y-5">
            <div className="p-3.5 bg-blue-950/60 border border-blue-800/80 rounded-2xl text-xs text-blue-200 flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                Select the responding city department and assign a certified field officer to dispatch.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Assigned Department
                </label>
                <select
                  value={selectedDeptId}
                  onChange={e => {
                    setSelectedDeptId(e.target.value);
                    const newDept = departments.find(d => d.id === e.target.value);
                    if (newDept && newDept.officers[0]) {
                      setSelectedOfficerId(newDept.officers[0].id);
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code} · SLA: {dept.slaHours}h)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Designated Field Officer
                </label>
                <select
                  value={selectedOfficerId}
                  onChange={e => setSelectedOfficerId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {currentDept.officers.map(off => (
                    <option key={off.id} value={off.id}>
                      {off.name} - {off.role} {off.isOnDuty ? '(On Duty)' : '(Off Duty)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Field Supervisor Assignment */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-amber-500/40 space-y-1.5">
              <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <HardHat className="w-4 h-4 text-amber-400" />
                  <span>Assign Ward-22 Field Supervisor *</span>
                </span>
                <span className="text-[10px] text-amber-400 font-mono">Dispatches to Supervisor</span>
              </label>
              <select
                value={selectedSupervisorId}
                onChange={e => setSelectedSupervisorId(e.target.value)}
                className="w-full bg-slate-900 border border-amber-500/50 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {supervisors.map(sup => (
                  <option key={sup.id} value={sup.id}>
                    👷 {sup.name} ({sup.role}) · {sup.phone}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 block">
                The supervisor receives complete issue data, GPS location, citizen contact, and can resolve with after-photo proof.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Priority Calibration
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['low', 'medium', 'high', 'urgent'] as PriorityLevel[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                      priority === p
                        ? 'border-blue-500 bg-blue-600/30 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Verification &amp; Dispatch Instructions
              </label>
              <textarea
                rows={3}
                value={assignNotes}
                onChange={e => setAssignNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                placeholder="Include equipment requirements, safety cordons, or contractor dispatches..."
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActivePipelineStep('view_photo')}
                className="text-xs text-slate-400 hover:text-white font-medium"
              >
                Back to Inspection
              </button>
              <button
                type="button"
                onClick={handleExecuteVerifyAssign}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Verify &amp; Assign Work Order</span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: In Progress */}
        {activePipelineStep === 'in_progress' && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-800 text-xs text-purple-200">
              <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                <Clock className="w-4 h-4 text-purple-400" />
                Field Crew Dispatch in Progress
              </div>
              <p>
                Work order is currently assigned to{' '}
                <span className="font-semibold text-white">
                  {complaint.assignedOfficerName || 'Field Officer'}
                </span>{' '}
                ({complaint.assignedDepartmentName || 'Department'}). Confirm crew on-site arrival to update public telemetry.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Field Activity Log / On-Site Notes
              </label>
              <textarea
                rows={3}
                value={progressNotes}
                onChange={e => setProgressNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                placeholder="Details of machinery deployed, lane closures, excavation underway..."
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActivePipelineStep('verify_assign')}
                className="text-xs text-slate-400 hover:text-white font-medium"
              >
                Back to Assignment
              </button>
              <button
                type="button"
                onClick={handleExecuteInProgress}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>Update Status to 'In Progress'</span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 4: Upload After Photo */}
        {activePipelineStep === 'upload_after' && (
          <div className="space-y-5">
            <div className="p-3.5 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Upload completion proof photo. Citizen will be notified with side-by-side photographic validation.
              </span>
            </div>

            {/* Side by side Before and After Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-mono font-semibold text-amber-400 block mb-1">
                  1. CITIZEN INITIAL PHOTO (BEFORE)
                </span>
                <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img
                    src={complaint.photoUrl}
                    alt="Before"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono font-semibold text-emerald-400 block mb-1">
                  2. PROOF OF RESOLUTION (AFTER)
                </span>
                <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-950 border-2 border-emerald-500 relative">
                  <img
                    src={afterPhotoUrl}
                    alt="After Photo"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    VERIFIED FIX
                  </div>
                </div>
              </div>
            </div>

            {/* Upload or Preset Selection */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Upload From Officer Device</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                type="button"
                onClick={() => setAfterPhotoUrl(defaultAfterPhoto)}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300"
              >
                Load Certified Repair Proof Asset
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Resolution Certification Notes
              </label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={e => setResolutionNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                placeholder="Material specifications, test readings, inspection sign-off..."
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActivePipelineStep('in_progress')}
                className="text-xs text-slate-400 hover:text-white font-medium"
              >
                Back to Progress
              </button>
              <button
                type="button"
                onClick={handleExecuteMarkResolved}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Resolved &amp; Notify Citizen</span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 5: Resolved & Citizen Notified */}
        {activePipelineStep === 'resolved_notified' && (
          <div className="py-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <FileCheck2 className="w-8 h-8" />
            </div>

            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-1">
                Workflow Complete
              </div>
              <h3 className="text-xl font-bold text-white">Complaint Marked Resolved!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Citizen <span className="text-white font-semibold">{complaint.citizenName}</span> was notified. Side-by-side verification photos and inspection sign-off have been recorded to the civic public ledger.
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Ticket Number:</span>
                <span className="font-mono text-white font-bold">{complaint.id}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Lead Department:</span>
                <span className="text-white">{complaint.assignedDepartmentName || 'City Operations Division'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status Update Dispatched:</span>
                <span className="text-emerald-400 font-semibold">SMS &amp; In-App Notification Sent</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/30 cursor-pointer"
              >
                Close &amp; Return to Admin Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
