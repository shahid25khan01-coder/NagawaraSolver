import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  ExternalLink,
  Copy,
  Check,
  X,
  FileCode,
  ShieldCheck,
  Layers,
  Terminal,
  Sparkles,
  Info,
  FolderArchive,
  PlayCircle,
  FileCheck,
  Wrench
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall.ts';

interface APKDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const APKDownloadModal: React.FC<APKDownloadModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'studio' | 'direct' | 'pwabuilder' | 'bubblewrap'>('studio');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-loflshmm2nxz25v554pvvm-921852625945.asia-east1.run.app';
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?url=${encodeURIComponent(currentOrigin)}`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDirectInstall = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        onClose();
      }
    }
  };

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const capacitorConfig = JSON.stringify({
    appId: "org.nagawara.ward22.solver",
    appName: "NagawaraSolver",
    webDir: "dist",
    bundledWebRuntime: false,
    server: {
      androidScheme: "https"
    },
    android: {
      allowMixedContent: true
    }
  }, null, 2);

  const twaManifest = JSON.stringify({
    packageId: "org.nagawara.ward22.solver",
    host: currentOrigin.replace(/^https?:\/\//, ''),
    name: "NagawaraSolver",
    launcherName: "NagawaraSolver",
    themeColor: "#2563EB",
    themeColorDark: "#0F172A",
    navigationColor: "#0F172A",
    navigationColorDark: "#000000",
    backgroundColor: "#FFFFFF",
    enableNotifications: true,
    startUrl: "/",
    iconUrl: `${currentOrigin}/pwa-512x512.png`,
    maskableIconUrl: `${currentOrigin}/pwa-maskable-512x512.png`,
    appVersionName: "1.0.0",
    appVersionCode: 1,
    generatorApp: "bubblewrap-cli"
  }, null, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 overflow-hidden relative my-auto">
        {/* Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-emerald-950/80 via-blue-950/70 to-slate-900 border-b border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" />
                  Android Studio Ready
                </span>
                <span className="text-[10px] font-mono text-slate-400">Gradle 8 · SDK 36</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                Android Studio &amp; APK Hub
              </h2>
              <p className="text-xs text-slate-300">
                NagawaraSolver · Ward-22 Civic Resolution Platform
              </p>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-1.5 mt-5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] font-semibold overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('studio')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'studio'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Android Studio Project</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('direct')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'direct'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Direct Phone WebAPK</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pwabuilder')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'pwabuilder'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>1-Click PWABuilder</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bubblewrap')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'bubblewrap'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Bubblewrap CLI</span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[62vh] overflow-y-auto">
          {/* TAB 1: Android Studio Project (PRIMARY) */}
          {activeTab === 'studio' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <Wrench className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Native Android Studio Project Generated</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  The complete native Android Studio project is configured in the <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded font-mono">android/</code> directory. You can open it straight in Android Studio, connect a phone or start an emulator, and build debug or production release APKs with one click.
                </p>
              </div>

              {/* Clarity Notice */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-amber-300">Where does Android Studio run?</div>
                  <div className="text-slate-300 text-[11px] leading-relaxed">
                    <strong>Android Studio is a desktop program on your computer (PC or Mac)</strong>, while this preview runs in your browser. To open this project, simply download the project ZIP below, unzip it, and open the <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded font-mono">android</code> folder inside Android Studio!
                  </div>
                </div>
              </div>

              {/* Download Buttons (.ZIP & .tar.gz) */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FolderArchive className="w-4 h-4 text-emerald-400" />
                    <span>Download Native Android Project Archive</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Complete Android Studio workspace with Gradle 8.2, Java Activity, AndroidManifest, and bundled app assets.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <a
                    href="/nagawarasolver-android-studio.zip"
                    download="nagawarasolver-android-studio.zip"
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .ZIP (Windows/Mac)</span>
                  </a>
                  <a
                    href="/nagawarasolver-android-studio.tar.gz"
                    download="nagawarasolver-android-studio.tar.gz"
                    className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-slate-400" />
                    <span>Download .tar.gz (Linux)</span>
                  </a>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                <span className="text-[11px] font-bold text-slate-300 block uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <PlayCircle className="w-3.5 h-3.5 text-blue-400" />
                  3 Steps to Open in Android Studio
                </span>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <div>
                      <strong className="text-white">Download &amp; Extract:</strong> Click <em>"Download .ZIP"</em> above. Right-click the downloaded file on your computer and select <strong>"Extract All"</strong>.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <div>
                      <strong className="text-white">Open in Android Studio:</strong> Launch Android Studio on your PC/Mac. Click <strong>Open</strong> (or go to <code className="text-blue-300 bg-slate-900 px-1 rounded">File &rarr; Open...</code>). Browse to the extracted folder and select the <strong className="text-emerald-400">android</strong> folder.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                    <div>
                      <strong className="text-white">Build &amp; Run:</strong> Android Studio will automatically run Gradle Sync. Click <strong className="text-white">Build &rarr; Build Bundle(s) / APK(s) &rarr; Build APK(s)</strong> to generate your native <code className="text-emerald-400">app-debug.apk</code>!
                    </div>
                  </div>
                </div>
              </div>

              {/* Terminal CLI Snippet */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5 font-mono text-[11px]">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Terminal / CLI Commands</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`npm run android:sync\nnpx cap open android\ncd android && ./gradlew assembleDebug`, 'studio_commands')}
                    className="text-[10px] text-emerald-400 hover:text-white flex items-center gap-1 cursor-pointer font-mono"
                  >
                    {copiedKey === 'studio_commands' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'studio_commands' ? 'Copied' : 'Copy Commands'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed border border-slate-800/80">
{`# 1. Update web build and sync into Android Studio
npm run android:sync

# 2. Open Android Studio directly
npm run android:open

# 3. Or build debug APK directly via Gradle wrapper
cd android && ./gradlew assembleDebug

# Output APK path:
# android/app/build/outputs/apk/debug/app-debug.apk`}
                </pre>
              </div>

              {/* App Identifier info */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Application ID: <code className="text-emerald-400">org.nagawara.ward22.solver</code></span>
                <span className="text-slate-400">Min SDK: 24 (Android 7.0+)</span>
              </div>
            </div>
          )}

          {/* TAB 2: Direct Android WebAPK Install */}
          {activeTab === 'direct' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant Native WebAPK Installation</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  On Android devices, Chrome compiles this verified PWA into an official Android <strong>WebAPK</strong> registered directly in Android OS Settings. It behaves exactly like an installed APK from Google Play with standalone launch, camera permissions, and offline caching.
                </p>
              </div>

              {isInstallable ? (
                <button
                  type="button"
                  onClick={handleDirectInstall}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Install WebAPK on Android Device Now</span>
                </button>
              ) : isInstalled ? (
                <div className="p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-xl text-center text-xs text-emerald-300 font-semibold flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Already Installed as Native Android App!</span>
                </div>
              ) : (
                <div className="space-y-2.5 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-300 block uppercase font-mono tracking-wider">
                    How to Install on Android in 2 Steps:
                  </span>
                  <div className="flex items-start gap-3 text-xs text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                    <span>Open this website in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong> on your Android phone.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                    <span>Tap the <strong>three dots (⋮)</strong> menu in the top-right corner of Chrome, then tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">✓</span>
                    <span>Android will automatically build and install the native <strong>NagawaraSolver</strong> icon into your phone's app drawer!</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PWABuilder 1-Click APK Generator */}
          {activeTab === 'pwabuilder' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-800/40 text-xs text-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>1-Click Cloud APK Generator (PWABuilder)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  PWABuilder (official open-source tool backed by Google &amp; Microsoft) takes the live URL, tests its manifest, and automatically packages signed <strong>.apk</strong> (sideloading) and <strong>.aab</strong> (Google Play Store) files ready for download in under 30 seconds with no SDK required.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Target App URL:</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(currentOrigin, 'app_url')}
                    className="text-[10px] font-mono text-blue-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'app_url' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'app_url' ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>
                <div className="font-mono text-emerald-400 text-[11px] truncate bg-slate-900 p-2 rounded-lg border border-slate-800">
                  {currentOrigin}
                </div>
              </div>

              <a
                href={pwaBuilderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Generate Signed APK via PWABuilder</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <div className="font-bold text-slate-300">PWABuilder Instructions:</div>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Click the button above to launch PWABuilder for this app URL.</li>
                  <li>Click <strong>"Package for Stores"</strong> &rarr; <strong>"Android"</strong>.</li>
                  <li>Click <strong>"Download Package"</strong> to download the zip containing your signed <code className="text-emerald-400">app-release.apk</code>!</li>
                  <li>Transfer the APK to your phone and tap to install.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 4: Google Bubblewrap CLI (TWA) */}
          {activeTab === 'bubblewrap' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Official Google Bubblewrap CLI</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`npm install -g @bubblewrap/cli\nbubblewrap build`, 'bubblewrap_commands')}
                    className="text-[10px] text-blue-400 hover:text-white flex items-center gap-1 cursor-pointer font-mono"
                  >
                    {copiedKey === 'bubblewrap_commands' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'bubblewrap_commands' ? 'Copied' : 'Copy Commands'}</span>
                  </button>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Bubblewrap is Google's official command line tool to wrap Progressive Web Apps in a Trusted Web Activity (TWA) Android APK without touching Java code.
                </p>
                <pre className="p-3 bg-slate-900 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed border border-slate-800/80">
{`# 1. Install Google Bubblewrap CLI
npm install -g @bubblewrap/cli

# 2. Build the APK using the pre-configured twa-manifest.json
bubblewrap build

# Output: app-release-signed.apk`}
                </pre>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadFile('twa-manifest.json', twaManifest, 'application/json')}
                  className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download twa-manifest.json</span>
                </button>
              </div>
            </div>
          )}

          {/* Sideloading hint */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[10px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Installing .apk on Android:</strong> When opening a built <code className="text-slate-300">.apk</code> on an Android phone, tap <em>"Install unknown apps"</em> &rarr; <em>"Allow"</em> when prompted.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-[10px] text-slate-400 font-mono">
            Ward-22 Nagawara · Syed Ali President
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
