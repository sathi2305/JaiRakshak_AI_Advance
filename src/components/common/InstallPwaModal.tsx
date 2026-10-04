import React, { useState } from 'react';
import {
  Laptop,
  Download,
  CheckCircle2,
  X,
  Monitor,
  ShieldCheck,
  Zap,
  Wifi,
  Copy,
  Check,
  Sparkles,
  HardDriveDownload,
  Terminal
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
  isInstalled?: boolean;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  isInstalled
}) => {
  const { campusName } = useApp();
  const [selectedOs, setSelectedOs] = useState<'windows' | 'macos' | 'linux'>('windows');
  const [installing, setInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-2tb5ct4pyxnxbfvnbvyrox-168745840816.asia-southeast1.run.app';

  // Trigger native browser beforeinstallprompt or download standalone Desktop App Launcher
  const handleInstallDesktopApp = async () => {
    setInstalling(true);
    try {
      if (deferredPrompt && typeof deferredPrompt.prompt === 'function') {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice?.outcome === 'accepted') {
          setInstallSuccess(true);
          setInstalling(false);
          return;
        }
      }

      // Generate & download a real Desktop App Shortcut (.url for Windows / standalone .html launcher)
      const shortcutContent = `[InternetShortcut]\r\nURL=${appUrl}\r\nIconIndex=0\r\n`;
      const blob = new Blob([shortcutContent], { type: 'application/internet-shortcut' });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = selectedOs === 'windows' ? 'JalRakshak-AI-Desktop.url' : 'JalRakshak-AI-Desktop.webloc.url';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      setInstallSuccess(true);
    } catch (err) {
      console.warn('Desktop install error:', err);
    } finally {
      setInstalling(false);
    }
  };

  const handleDownloadStandaloneHtml = () => {
    const htmlLauncher = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>JalRakshak AI — Desktop Command Center (${campusName})</title>
  <style>
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #020617; font-family: system-ui, sans-serif; }
    iframe { width: 100%; height: 100%; border: none; }
  </style>
</head>
<body>
  <iframe src="${appUrl}" allow="microphone; geolocation; clipboard-write"></iframe>
</body>
</html>`;
    const blob = new Blob([htmlLauncher], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'JalRakshak-AI-Desktop-App.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setInstallSuccess(true);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Top Banner */}
        <div className="p-6 bg-linear-to-r from-slate-950 via-cyan-950 to-blue-950 text-white flex items-start justify-between border-b border-cyan-800/40">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 shrink-0">
              <Monitor className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Install JalRakshak AI Desktop App
                </h2>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-bold">
                  PC / Workstation v4.2
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Dedicated standalone desktop workstation app for <strong>{campusName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Close installer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Desktop Capabilities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
              <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-extrabold text-slate-900 dark:text-white">Native Taskbar & Dock</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Launches in a frameless standalone window directly from Windows Taskbar or macOS Dock.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
              <Wifi className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-extrabold text-slate-900 dark:text-white">Offline Telemetry Cache</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Service Worker caches EPANET models, sensor history, and audit logs for zero-downtime operation.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-extrabold text-slate-900 dark:text-white">Hardware Accelerated</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Full-screen multi-monitor SCADA telemetry with instant desktop alert notifications.
                </p>
              </div>
            </div>
          </div>

          {/* Primary 1-Click Desktop Install Box */}
          <div className="p-5 rounded-2xl bg-linear-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-cyan-700 dark:text-cyan-300">
                <Sparkles className="w-4 h-4" />
                <span>
                  {isInstalled
                    ? 'Desktop App Already Installed on This Workstation'
                    : deferredPrompt
                    ? 'Ready for 1-Click Native Browser Desktop Install'
                    : 'Direct Desktop App Installer & Shortcut Generator'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {deferredPrompt
                  ? 'Click "Install Desktop App Now" to trigger the native OS application installation prompt.'
                  : 'Click below to install the desktop shortcut or download the standalone Desktop App launcher for your PC.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleInstallDesktopApp}
                disabled={installing}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all cursor-pointer disabled:opacity-60"
              >
                <Download className="w-4 h-4" />
                <span>{installing ? 'Installing...' : deferredPrompt ? 'Install Desktop App Now' : 'Install Desktop Shortcut'}</span>
              </button>

              <button
                onClick={handleDownloadStandaloneHtml}
                className="flex items-center gap-1.5 px-3.5 py-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
                title="Download standalone HTML desktop launcher"
              >
                <HardDriveDownload className="w-4 h-4 text-cyan-400" />
                <span>Standalone App (.html)</span>
              </button>
            </div>
          </div>

          {installSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                Desktop App package triggered! Open the downloaded launcher or click the install icon in your browser&apos;s address bar to pin JalRakshak AI to your Desktop &amp; Taskbar.
              </span>
            </div>
          )}

          {/* Desktop OS Selector Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Desktop Operating System Setup Guide
              </span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                {(
                  [
                    { id: 'windows', label: 'Windows 10 / 11' },
                    { id: 'macos', label: 'macOS Sonoma / Sequoia' },
                    { id: 'linux', label: 'Linux Workstation' }
                  ] as const
                ).map((os) => (
                  <button
                    key={os.id}
                    onClick={() => setSelectedOs(os.id)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      selectedOs === os.id
                        ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {os.label}
                  </button>
                ))}
              </div>
            </div>

            {selectedOs === 'windows' && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Windows 10 / 11 Native Desktop App Installation (Chrome / Edge)</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300">
                  <li>
                    Click <strong>&quot;Install Desktop Shortcut&quot;</strong> above, or open the live URL in <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>.
                  </li>
                  <li>
                    Look at the right side of the browser address bar and click the <strong>Install JalRakshak AI (Monitor with Down-Arrow)</strong> icon.
                  </li>
                  <li>
                    Click <strong>Install</strong> in the confirmation dialog — the app will launch in its own native Windows window and pin to your <strong>Start Menu &amp; Taskbar</strong>.
                  </li>
                </ol>
              </div>
            )}

            {selectedOs === 'macos' && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>macOS Dock Application Installation (Chrome / Safari)</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300">
                  <li>
                    <strong>In Chrome / Edge on Mac:</strong> Click the <strong>Install Desktop App</strong> icon inside the right side of the address bar and select <strong>Install</strong>.
                  </li>
                  <li>
                    <strong>In Safari (macOS Sonoma+):</strong> Click <strong>File → Add to Dock...</strong> from the top Apple menu bar, then click <strong>Add</strong>.
                  </li>
                  <li>
                    JalRakshak AI will appear in your <strong>macOS Dock &amp; Applications folder</strong> as a standalone desktop app.
                  </li>
                </ol>
              </div>
            )}

            {selectedOs === 'linux' && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Linux Workstation (Ubuntu / Fedora / Chromium)</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300">
                  <li>
                    Click <strong>&quot;Standalone App (.html)&quot;</strong> above to save the local desktop launcher, or open the app URL in Chromium/Chrome.
                  </li>
                  <li>
                    In Chromium/Chrome, open the menu <strong>(⋮) → Save and Share → Install JalRakshak AI...</strong> to create a native `.desktop` launcher entry.
                  </li>
                </ol>
              </div>
            )}
          </div>

          {/* Direct Desktop URL Copy Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="truncate">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Desktop Workstation Direct Endpoint URL
              </span>
              <span className="text-xs font-mono text-cyan-700 dark:text-cyan-300 truncate block">
                {appUrl}
              </span>
            </div>
            <button
              onClick={handleCopyUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold shrink-0 cursor-pointer transition-colors"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy URL</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Verified PWA Manifest v4.2 • Standalone Desktop Mode Enabled</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
