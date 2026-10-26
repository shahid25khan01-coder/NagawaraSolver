import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { Complaint, ComplaintStatus } from '../../types.ts';
import {
  Search,
  PlusCircle,
  Eye,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';

import { matchesTicketQuery } from '../../utils/caseCounter.ts';

export const MyComplaints: React.FC = () => {
  const { complaints, viewComplaintDetails, setCitizenTab } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = complaints.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      return matchesTicketQuery(item, searchQuery);
    }
    return true;
  });

  const getStatusStyle = (status: ComplaintStatus) => {
    switch (status) {
      case 'submitted':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'verified':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'in_progress':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'resolved':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-mono uppercase text-blue-600 font-semibold tracking-wider mb-1">
            Citizen Records
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            My Reported Issues
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track status progression, assigned city crew, and photographic resolution proof.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCitizenTab('report')}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-sm shadow-blue-600/30 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Problem</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Issues' },
            { id: 'submitted', label: 'Submitted' },
            { id: 'verified', label: 'Verified' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'resolved', label: 'Resolved' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by ID or keyword..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Complaints List Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
          <Clock className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <div className="text-sm font-bold text-slate-800">No Complaints Found</div>
          <div className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or filter criteria.
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map(item => (
            <div
              key={item.id}
              onClick={() => viewComplaintDetails(item.id)}
              className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-2xl p-4 sm:p-5 transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 flex-1">
                <img
                  src={item.photoUrl}
                  alt={item.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-slate-100 shrink-0"
                  referrerPolicy="no-referrer"
                />

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-blue-600">{item.id}</span>
                    <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                      Case #{item.caseNumber || item.id.replace(/^CP[-_]?/i, '')}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${getStatusStyle(
                        item.status
                      )}`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500 capitalize">{item.category}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-400 capitalize">{item.priority} Priority</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.location.address}</span>
                    </span>
                    <span className="text-slate-300 hidden sm:inline">|</span>
                    <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400 shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {item.status === 'resolved' && (
                    <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Resolution verified with after-repair photo</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  className="px-3.5 py-2 text-xs font-semibold text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Track Status</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
