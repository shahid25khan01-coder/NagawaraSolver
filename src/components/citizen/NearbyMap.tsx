import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Complaint, ComplaintCategory } from '../../types.ts';
import { InteractiveMap } from '../common/InteractiveMap.tsx';
import {
  MapPin,
  Filter,
  Eye,
  ThumbsUp,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Share2,
} from 'lucide-react';

export const NearbyMap: React.FC = () => {
  const { complaints, upvoteComplaint, viewComplaintDetails, setCitizenTab } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPin, setSelectedPin] = useState<Complaint | null>(complaints[0] || null);

  const filteredPins = complaints.filter(c => {
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-mono uppercase text-blue-600 font-semibold tracking-wider mb-1">
            Community GIS Telemetry
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Nearby Issues Map
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse verified municipal reports across the city. Upvote issues to alert council dispatchers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCitizenTab('report')}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-sm shadow-blue-600/30 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Problem in Your Ward</span>
        </button>
      </div>

      {/* Filter Chips Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-3">
        {/* Category filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'roads', label: 'Roads' },
            { id: 'streetlights', label: 'Lighting' },
            { id: 'sanitation', label: 'Sanitation' },
            { id: 'water', label: 'Water' },
          ].map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-slate-400 mr-1 hidden sm:inline">Status:</span>
          {['all', 'submitted', 'in_progress', 'resolved'].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-colors cursor-pointer ${
                selectedStatus === st
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Split: Interactive Map & Selected Issue Popover */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Map View */}
        <div className="lg:col-span-2">
          <InteractiveMap
            pins={filteredPins}
            selectedPinId={selectedPin?.id}
            onSelectPin={pin => setSelectedPin(pin)}
            heightClass="h-[520px]"
            showLegend={true}
          />
        </div>

        {/* Selected Pin Details Card */}
        <div className="lg:col-span-1">
          {selectedPin ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-blue-600">
                    {selectedPin.id}
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                    Case #{selectedPin.caseNumber || selectedPin.id.replace(/^CP[-_]?/i, '')}
                  </span>
                </div>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {selectedPin.status.replace('_', ' ')}
                </span>
              </div>

              {/* Photo */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
                <img
                  src={selectedPin.status === 'resolved' && selectedPin.afterPhotoUrl ? selectedPin.afterPhotoUrl : selectedPin.photoUrl}
                  alt={selectedPin.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {selectedPin.status === 'resolved' && (
                  <div className="absolute top-2 left-2 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    AFTER REPAIR PHOTO
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                  {selectedPin.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                  {selectedPin.description}
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{selectedPin.location.address}</span>
                </div>
                <div className="font-mono text-[11px] text-slate-400">
                  {selectedPin.location.ward}
                </div>
              </div>

              {/* Upvote & Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => upvoteComplaint(selectedPin.id)}
                  className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Upvote ({selectedPin.upvotes})</span>
                </button>

                <button
                  type="button"
                  onClick={() => viewComplaintDetails(selectedPin.id)}
                  className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-blue-600/30 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Track Status</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-400">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <div className="text-xs font-semibold text-slate-600">Select an Incident Pin</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Click any marker on the map to inspect details.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
