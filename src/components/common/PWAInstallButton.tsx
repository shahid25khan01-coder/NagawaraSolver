import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall.ts';
import { Smartphone, Download, Sparkles } from 'lucide-react';
import { APKDownloadModal } from './APKDownloadModal.tsx';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'banner' | 'card' | 'badge';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'navbar' }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showAPKModal, setShowAPKModal] = useState<boolean>(false);

  const handleAction = async () => {
    // If browser has native install prompt available, try it; otherwise open the APK modal
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setShowAPKModal(true);
      }
    } else {
      setShowAPKModal(true);
    }
  };

  if (variant === 'banner') {
    return (
      <>
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-lg border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20 text-emerald-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-blue-200 bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
                  Android Studio &amp; APK
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                  Ready
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                Open in Android Studio or Download APK
              </h3>
              <p className="text-[11px] text-blue-100/90 mt-0.5 max-w-md leading-relaxed">
                Native Android project generated with Gradle 8, AndroidManifest permissions, and full camera/GPS support.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAPKModal(true)}
              className="flex-1 sm:flex-initial px-4 py-2 bg-white hover:bg-blue-50 text-slate-900 font-bold text-xs rounded-xl shadow-md inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Get Android APK</span>
            </button>
          </div>
        </div>

        <APKDownloadModal
          isOpen={showAPKModal}
          onClose={() => setShowAPKModal(false)}
        />
      </>
    );
  }

  if (variant === 'card') {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowAPKModal(true)}
          className="w-full p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-left border border-slate-800 flex items-center justify-between gap-3 transition-colors cursor-pointer text-white shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Convert / Download APK</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono font-semibold">
                  Android
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                1-Click PWABuilder, WebAPK &amp; Capacitor package
              </div>
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] shrink-0">
            Open
          </div>
        </button>

        <APKDownloadModal
          isOpen={showAPKModal}
          onClose={() => setShowAPKModal(false)}
        />
      </>
    );
  }

  // Default navbar variant
  return (
    <>
      <button
        type="button"
        onClick={() => setShowAPKModal(true)}
        title="Open in Android Studio or Download APK"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-[10px] shadow-sm transition-all cursor-pointer border border-emerald-400/40"
      >
        <Smartphone className="w-3.5 h-3.5 text-white shrink-0" />
        <span className="font-bold">Android</span>
      </button>

      <APKDownloadModal
        isOpen={showAPKModal}
        onClose={() => setShowAPKModal(false)}
      />
    </>
  );
};
