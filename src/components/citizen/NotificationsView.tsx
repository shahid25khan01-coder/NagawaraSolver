import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Bell,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  Info,
  CheckCheck,
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    viewComplaintDetails,
  } = useApp();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-mono uppercase text-blue-600 font-semibold tracking-wider mb-1">
            Dispatch Center Feed
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Citizen Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Direct alerts on complaint verification, crew dispatches, and resolved work orders.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-slate-500" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <div className="text-sm font-bold text-slate-800">No Notifications</div>
          <div className="text-xs text-slate-500 mt-1">
            You are all caught up with city dispatches.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(item => (
            <div
              key={item.id}
              onClick={() => {
                markNotificationRead(item.id);
                if (item.complaintId) {
                  viewComplaintDetails(item.complaintId);
                }
              }}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                !item.isRead
                  ? 'bg-blue-50/50 border-blue-200 hover:border-blue-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Type icon */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  item.type === 'resolved'
                    ? 'bg-emerald-100 text-emerald-600'
                    : item.type === 'status_change'
                    ? 'bg-purple-100 text-purple-600'
                    : item.type === 'civic_alert'
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-blue-100 text-blue-600'
                }`}
              >
                {item.type === 'resolved' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : item.type === 'civic_alert' ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>

              {/* Notification Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{item.title}</h3>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>

                {item.complaintId && (
                  <div className="mt-2.5 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                    <span>View Complaint #{item.complaintId}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
