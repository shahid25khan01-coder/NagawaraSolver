import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Complaint } from '../../types.ts';
import { InteractiveMap } from '../common/InteractiveMap.tsx';
import {
  X,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Star,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaintId: string | null;
  onClose: () => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaintId,
  onClose,
}) => {
  const { complaints, rateComplaint } = useApp();
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  if (!complaintId) return null;

  const complaint = complaints.find(c => c.id === complaintId);
  if (!complaint) return null;

  const handleRateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    rateComplaint(complaint.id, rating, feedback);
    setFeedbackSubmitted(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return { label: 'Submitted', color: 'text-orange-700 bg-orange-50 border-orange-200' };
      case 'verified':
        return { label: 'Verified & Assigned', color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'in_progress':
        return { label: 'In Progress', color: 'text-purple-700 bg-purple-50 border-purple-200' };
      case 'resolved':
        return { label: 'Resolved & Closed', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      default:
        return { label: status, color: 'text-slate-700 bg-slate-50 border-slate-200' };
    }
  };

  const badge = getStatusBadge(complaint.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-[420px] bg-white border border-slate-200 rounded-3xl shadow-2xl p-4 sm:p-5 text-slate-900 max-h-[92vh] overflow-y-auto">
        {/* Header bar */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-blue-600">{complaint.id}</span>
              <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                Case #{complaint.caseNumber || complaint.id.replace(/^CP[-_]?/i, '')}
              </span>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                {badge.label}
              </span>
              <span className="text-xs text-slate-400 capitalize">{complaint.priority} Priority</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">{complaint.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location & Metadata */}
        <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="font-semibold text-slate-900">{complaint.location.address}</span>
              {complaint.location.landmark && (
                <span className="text-slate-500"> ({complaint.location.landmark})</span>
              )}
            </div>
          </div>
          <div className="font-mono text-[11px] text-slate-500 shrink-0">
            {complaint.location.ward} · {new Date(complaint.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Description text */}
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
          {complaint.description}
        </div>

        {/* Google Map of Complaint Location */}
        <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200">
          <InteractiveMap
            pins={[complaint]}
            selectedPinId={complaint.id}
            heightClass="h-[180px]"
            showLegend={false}
          />
        </div>

        {/* Visual Proof Section (Before vs After) */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Photographic Verification Proof
          </h3>

          {complaint.status === 'resolved' && complaint.afterPhotoUrl ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Before Photo */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900">
                <div className="p-2 bg-slate-900/90 text-[11px] font-mono font-semibold text-amber-400 flex items-center justify-between">
                  <span>BEFORE (Citizen Report)</span>
                  <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="aspect-4/3 overflow-hidden">
                  <img
                    src={complaint.photoUrl}
                    alt="Before Resolution"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* After Photo */}
              <div className="rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-900 shadow-md shadow-emerald-500/10">
                <div className="p-2 bg-emerald-950 text-[11px] font-mono font-semibold text-emerald-400 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    AFTER (Field Repair Proof)
                  </span>
                  <span>{complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleDateString() : 'Verified'}</span>
                </div>
                <div className="aspect-4/3 overflow-hidden">
                  <img
                    src={complaint.afterPhotoUrl}
                    alt="After Resolution"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-w-sm">
              <div className="p-2 bg-slate-900/90 text-[11px] font-mono font-semibold text-amber-400">
                CITIZEN SUBMITTED EVIDENCE PHOTO
              </div>
              <div className="aspect-4/3 overflow-hidden">
                <img
                  src={complaint.photoUrl}
                  alt="Citizen report"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Resolution Notes if Resolved */}
        {complaint.status === 'resolved' && complaint.resolutionNotes && (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Official Resolution Sign-off Notes:
            </div>
            <div className="leading-relaxed">{complaint.resolutionNotes}</div>
            <div className="text-[11px] text-emerald-700 mt-2 font-mono">
              Signed by: {complaint.assignedOfficerName || 'Field Maintenance Supervisor'}
            </div>
          </div>
        )}

        {/* Track Status Timeline (Flowchart: Complaint Details -> Track Status) */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Track Status Timeline
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              Department: {complaint.assignedDepartmentName || 'Triage Queue'}
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {complaint.timeline.map((event, index) => {
              const isLast = index === complaint.timeline.length - 1;
              return (
                <div key={index} className="relative group">
                  {/* Dot */}
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                      event.status === 'resolved'
                        ? 'bg-emerald-500 border-white text-white'
                        : isLast
                        ? 'bg-blue-600 border-white text-white'
                        : 'bg-white border-slate-400 text-slate-500'
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  </div>

                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900">{event.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(event.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {event.description}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      By: <span className="font-medium text-slate-600">{event.updatedBy}</span>
                      {event.role && ` (${event.role})`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Citizen Feedback Form if Resolved */}
        {complaint.status === 'resolved' && (
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500" />
              Citizen Resolution Satisfaction Rating
            </h3>

            {complaint.citizenRating || feedbackSubmitted ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                <div className="flex items-center gap-1 font-bold text-amber-900 mb-1">
                  {[1, 2, 3, 4, 5].map(st => (
                    <Star
                      key={st}
                      className={`w-4 h-4 ${
                        st <= (complaint.citizenRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2">Thank you! Your feedback was recorded.</span>
                </div>
                {complaint.citizenFeedback && (
                  <p className="mt-1 text-slate-700 italic">"{complaint.citizenFeedback}"</p>
                )}
              </div>
            ) : (
              <form onSubmit={handleRateSubmit} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">How satisfied are you with this repair?</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setRating(st)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            st <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Share details on the quality and speed of the repair..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Submit Civic Rating
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
