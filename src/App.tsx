import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Navbar } from './components/common/Navbar.tsx';
import { SplashScreen } from './components/citizen/SplashScreen.tsx';
import { AuthModal } from './components/citizen/AuthModal.tsx';
import { CitizenHome } from './components/citizen/CitizenHome.tsx';
import { ReportProblem } from './components/citizen/ReportProblem.tsx';
import { TrackTicketView } from './components/citizen/TrackTicketView.tsx';
import { ProfileView } from './components/citizen/ProfileView.tsx';
import { ComplaintDetailModal } from './components/citizen/ComplaintDetailModal.tsx';
import { AdminLogin } from './components/admin/AdminLogin.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { AdminResolutionModal } from './components/admin/AdminResolutionModal.tsx';
import { SupervisorPortal } from './components/supervisor/SupervisorPortal.tsx';
import { SupervisorLogin } from './components/supervisor/SupervisorLogin.tsx';
import { UserLoginView } from './components/citizen/UserLoginView.tsx';
import { OfflineIndicator } from './components/common/OfflineIndicator.tsx';
import { AUTHORIZED_ADMINS } from './types.ts';
import {
  Home,
  PlusCircle,
  ClipboardList,
  User,
  MapPin,
  Users2,
  BarChart3,
  Wifi,
  BatteryMedium,
  Smartphone,
  ShieldAlert,
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    citizenTab,
    setCitizenTab,
    adminTab,
    setAdminTab,
    adminUser,
    selectedComplaintId,
    setSelectedComplaintId,
    adminResolutionComplaintId,
    setAdminResolutionComplaintId,
  } = useApp();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  // Google Maps Platform Quota Defense Listener
  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Top Mobile Device Status Bar (renders on PC/tablet to maintain mobile shell aesthetic)
  const MobilePhoneTopBar = (
    <div className="hidden sm:flex items-center justify-between px-6 py-2 bg-slate-900 text-slate-300 text-[10px] font-mono border-b border-slate-800/80 select-none">
      <span>9:41</span>
      <div className="w-20 h-4 bg-slate-950 rounded-full border border-slate-800/80 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-blue-500/60 animate-pulse" />
      </div>
      <div className="flex items-center gap-1.5 text-slate-400">
        <Wifi className="w-3 h-3" />
        <span className="text-[9px]">5G</span>
        <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
      </div>
    </div>
  );

  // Common maps quota warning banner
  const QuotaBanner = quotaExceeded ? (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-3 py-1.5 text-[10px] text-center sticky top-0 z-50">
      <span>
        Google Maps Platform quota reached.{' '}
        <a
          href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-semibold text-amber-950"
        >
          Update account
        </a>
      </span>
    </div>
  ) : null;

  // Render view body
  let content = null;

  if (currentView === 'splash') {
    content = (
      <div className="flex-1 flex flex-col bg-slate-950 text-white">
        <SplashScreen />
      </div>
    );
  } else if (currentView === 'user_login') {
    content = (
      <div className="flex-1 flex flex-col bg-slate-950 text-white">
        <UserLoginView />
      </div>
    );
  } else if (currentView === 'supervisor_login') {
    content = (
      <div className="flex-1 flex flex-col bg-slate-950 text-white">
        <SupervisorLogin />
      </div>
    );
  } else if (currentView === 'admin_login') {
    content = (
      <div className="flex-1 flex flex-col bg-slate-950 text-white pb-6">
        <Navbar />
        <main className="flex-1 flex flex-col justify-center">
          <AdminLogin />
        </main>
      </div>
    );
  } else if (currentView === 'admin') {
    const isAuthorized =
      adminUser &&
      AUTHORIZED_ADMINS.some(
        a => a.email.toLowerCase() === adminUser.email.toLowerCase()
      );

    if (!isAuthorized) {
      content = (
        <div className="flex-1 flex flex-col bg-slate-950 text-white pb-6">
          <Navbar />
          <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 text-center space-y-4 max-w-[360px] mx-auto animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border-2 border-rose-500/40 shadow-lg shadow-rose-950/60">
              <ShieldAlert className="w-8 h-8 text-rose-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Access Denied: Unauthorized</h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Only the authorized administrator can access this administration panel. All unauthorized access attempts are strictly blocked.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentView('admin_login')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md cursor-pointer"
            >
              Go to Administrator Sign In
            </button>
          </div>
        </div>
      );
    } else {
      content = (
        <div className="flex-1 flex flex-col bg-slate-50 text-slate-900 pb-16">
          <Navbar />
          <main className="flex-1">
            <AdminDashboard />
          </main>
          {/* Admin 5-stage resolution pipeline modal */}
          <AdminResolutionModal
            complaintId={adminResolutionComplaintId}
            onClose={() => setAdminResolutionComplaintId(null)}
          />
          {/* Mobile Fixed Bottom Navigation for Admin */}
          <div className="fixed sm:sticky bottom-0 left-0 right-0 sm:left-auto sm:right-auto z-40 w-full max-w-[430px] mx-auto bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-400">
            <div className="grid grid-cols-4 items-center h-14 w-full">
              <button
                type="button"
                onClick={() => setAdminTab('all_complaints')}
                className={`flex flex-col items-center justify-center h-full transition-colors ${
                  adminTab === 'all_complaints' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span className="text-[9px] mt-0.5">Complaints</span>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('live_map')}
                className={`flex flex-col items-center justify-center h-full transition-colors ${
                  adminTab === 'live_map' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span className="text-[9px] mt-0.5">Live Map</span>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('departments')}
                className={`flex flex-col items-center justify-center h-full transition-colors ${
                  adminTab === 'departments' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users2 className="w-4 h-4" />
                <span className="text-[9px] mt-0.5">Depts</span>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('reports')}
                className={`flex flex-col items-center justify-center h-full transition-colors ${
                  adminTab === 'reports' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-[9px] mt-0.5">Analytics</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
  } else if (currentView === 'supervisor') {
    // Ward-22 Field Supervisor Portal View
    content = (
      <div className="flex-1 flex flex-col bg-slate-950 text-white">
        <Navbar />
        <main className="flex-1">
          <SupervisorPortal />
        </main>
      </div>
    );
  } else {
    // Citizen Portal View (Pure Mobile Navigation)
    content = (
      <div className="flex-1 flex flex-col bg-slate-50 text-slate-900 pb-16">
        <Navbar />

        <main className="flex-1">
          {citizenTab === 'home' && <CitizenHome />}
          {citizenTab === 'report' && <ReportProblem />}
          {citizenTab === 'track' && <TrackTicketView />}
          {citizenTab === 'profile' && <ProfileView />}
        </main>

        {/* Citizen Personal Complaint Details Modal */}
        <ComplaintDetailModal
          complaintId={selectedComplaintId}
          onClose={() => setSelectedComplaintId(null)}
        />

        {/* Auth Modal if triggered */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />

        {/* Dedicated Mobile Fixed Bottom Navigation Bar (Always active, no desktop menu) */}
        <div className="fixed sm:sticky bottom-0 left-0 right-0 sm:left-auto sm:right-auto z-40 w-full max-w-[430px] mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200">
          <div className="grid grid-cols-4 items-center h-14 w-full">
            <button
              type="button"
              onClick={() => setCitizenTab('home')}
              className={`flex flex-col items-center justify-center h-full transition-colors ${
                citizenTab === 'home' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">Home</span>
            </button>

            <button
              type="button"
              onClick={() => setCitizenTab('report')}
              className={`flex flex-col items-center justify-center h-full transition-colors ${
                citizenTab === 'report' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span className="text-[9px] mt-0.5">Report</span>
            </button>

            <button
              type="button"
              onClick={() => setCitizenTab('track')}
              className={`flex flex-col items-center justify-center h-full transition-colors ${
                citizenTab === 'track' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">Track Ticket</span>
            </button>

            <button
              type="button"
              onClick={() => setCitizenTab('profile')}
              className={`flex flex-col items-center justify-center h-full transition-colors ${
                citizenTab === 'profile' ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">Profile</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    // Outer Container: on PC & Tablet, provides an authentic mobile viewport framing
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start sm:py-4 px-0 sm:px-2 selection:bg-blue-500 selection:text-white font-sans">
      {/* Visual Device Tag on wide screens */}
      <div className="hidden sm:flex items-center gap-2 mb-2 text-slate-400 text-xs font-medium">
        <Smartphone className="w-3.5 h-3.5 text-blue-400" />
        <span>NagawaraSolver Mobile App</span>
      </div>

      {/* Strict Mobile Phone Frame */}
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-[844px] bg-slate-50 sm:rounded-[36px] sm:border-[4px] sm:border-slate-800 sm:shadow-2xl sm:shadow-black/70 flex flex-col overflow-hidden relative">
        {MobilePhoneTopBar}
        {QuotaBanner}
        {content}
        <OfflineIndicator />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
