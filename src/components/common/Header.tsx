import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Droplets,
  Building2,
  Sun,
  Moon,
  WifiOff,
  Edit3,
  Check,
  Monitor,
  Keyboard,
  Maximize2,
  Minimize2,
  Mic,
  MicOff,
  Menu
} from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { RemoteSensorBatteryMonitor } from './RemoteSensorBatteryMonitor';
import { LanguageSelector } from './LanguageSelector';

export const Header: React.FC = () => {
  const {
    unreadNotificationsCount,
    setActiveTab,
    isDarkMode,
    toggleDarkMode,
    campusName,
    setCampusName,
    openAppInstallModal,
    isPwaInstalled,
    isFocusMode,
    toggleFocusMode,
    toggleSidebar,
    alerts
  } = useApp();

  const [isEditingCampus, setIsEditingCampus] = useState(false);
  const [campusInput, setCampusInput] = useState(campusName);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  useEffect(() => {
    const handleVoiceState = (e: any) => {
      setIsVoiceListening(Boolean(e.detail?.isListening));
    };
    window.addEventListener('jalrakshak:voice-state-changed', handleVoiceState);
    return () => window.removeEventListener('jalrakshak:voice-state-changed', handleVoiceState);
  }, []);

  const { isOnline } = useOnlineStatus();
  const activeAlertsCount = alerts.filter(a => a.status === 'NEW' || a.status === 'IN_PROGRESS').length;
  const totalBadgeCount = unreadNotificationsCount + activeAlertsCount;

  const handleSaveCampusName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (campusInput.trim()) {
      setCampusName(campusInput.trim());
    }
    setIsEditingCampus(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs print:hidden transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Open/Close Sidebar Menu Button & Brand Logo */}
        <div className="flex items-center gap-3">
          {/* Open/Close Sidebar Drawer Trigger Button */}
          <button
            type="button"
            id="open-sidebar-drawer-btn"
            onClick={toggleSidebar}
            className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 dark:bg-cyan-950/90 hover:bg-slate-800 dark:hover:bg-cyan-900 text-white border border-slate-800 dark:border-cyan-700/60 shadow-sm transition-all cursor-pointer"
            title="Open Command Sidebar (Navigation, Leakage Risk, AI Copilot, Notifications & User Profile) [Alt+M]"
          >
            <Menu className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-extrabold tracking-tight">Menu</span>
            {totalBadgeCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black bg-rose-500 text-white">
                {totalBadgeCount}
              </span>
            )}
          </button>

          {/* Brand Logo & Campus Identity */}
          <div className="flex items-center gap-3 text-left">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 hover:scale-105 transition-transform cursor-pointer shrink-0"
            >
              <Droplets className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="font-black text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white cursor-pointer"
                >
                  JalRakshak<span className="bg-linear-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent ml-0.5">AI</span>
                </button>
                <span className="hidden md:inline-block text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/25 px-2 py-0.5 rounded-full">
                  Hydraulic Twin v4.2
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3 h-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
                {isEditingCampus ? (
                  <form onSubmit={handleSaveCampusName} className="flex items-center gap-1">
                    <input
                      type="text"
                      value={campusInput}
                      onChange={(e) => setCampusInput(e.target.value)}
                      className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 dark:bg-slate-900 border border-cyan-500 rounded-md text-slate-900 dark:text-white focus:outline-hidden w-52"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="p-0.5 rounded bg-cyan-600 text-white hover:bg-cyan-500 cursor-pointer"
                      title="Save Campus Name"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-1.5 group/campus">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{campusName}</span>
                    <span className="hidden lg:inline">• Autonomous Water Grid</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCampusInput(campusName);
                        setIsEditingCampus(true);
                      }}
                      className="opacity-70 hover:opacity-100 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 p-0.5 rounded transition-all cursor-pointer"
                      title="Rename Campus"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Clean Header Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Distraction-Free Focus Mode Toggle Button */}
          <button
            type="button"
            id="focus-mode-toggle-btn"
            onClick={toggleFocusMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isFocusMode
                ? 'bg-linear-to-r from-cyan-600 to-blue-600 text-white border-cyan-400 shadow-md shadow-cyan-500/20'
                : 'bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800'
            }`}
            title={
              isFocusMode
                ? 'Exit Focus Mode (Alt+F)'
                : 'Enter Focus Mode — Distraction-free view (Alt+F)'
            }
            aria-pressed={isFocusMode}
          >
            {isFocusMode ? (
              <Minimize2 className="w-3.5 h-3.5 text-white" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            )}
            <span className="hidden sm:inline">
              {isFocusMode ? 'Exit Focus' : 'Focus Mode'}
            </span>
          </button>

          {/* Install Desktop App Button */}
          {!isPwaInstalled && !isFocusMode && (
            <button
              id="header-install-desktop-btn"
              onClick={() => openAppInstallModal('pc')}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-cyan-950/80 hover:bg-slate-800 dark:hover:bg-cyan-900/80 text-white dark:text-cyan-300 border border-slate-800 dark:border-cyan-700/60 shadow-2xs transition-all cursor-pointer"
              title="Install JalRakshak AI Desktop Workstation App"
            >
              <Monitor className="w-3.5 h-3.5 text-cyan-400" />
              <span>Install Desktop App</span>
            </button>
          )}

          {/* Multi-Language Page Switcher */}
          <LanguageSelector />

          {/* Hands-Free Voice Navigation Control Pill */}
          <div className="flex items-center bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5">
            <button
              type="button"
              id="voice-navigation-toggle-btn"
              onClick={() => window.dispatchEvent(new CustomEvent('jalrakshak:toggle-voice'))}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isVoiceListening
                  ? 'bg-rose-600 text-white shadow-sm animate-pulse'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800'
              }`}
              title={
                isVoiceListening
                  ? 'Hands-Free Voice Navigation Active — Click to stop (Alt+V)'
                  : 'Start Hands-Free Voice Command Navigation (Alt+V)'
              }
            >
              {isVoiceListening ? (
                <MicOff className="w-3.5 h-3.5 text-white" />
              ) : (
                <Mic className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              )}
              <span className="hidden lg:inline text-[11px]">
                {isVoiceListening ? 'Listening...' : 'Voice'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('jalrakshak:open-voice-modal'))}
              className="px-1.5 py-1 rounded-lg text-[10px] font-mono font-bold text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Open Hands-Free Voice Commands Directory"
            >
              ?
            </button>
          </div>

          {/* Global Keyboard Shortcuts Button */}
          <button
            type="button"
            id="keyboard-shortcuts-header-btn"
            onClick={() => window.dispatchEvent(new CustomEvent('jalrakshak:open-shortcuts'))}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title="Open Global Keyboard Shortcut Manager (Ctrl+K or ?)"
          >
            <Keyboard className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <kbd className="hidden xl:inline font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-cyan-300">
              Ctrl+K
            </kbd>
          </button>

          {/* Theme Toggle Button (Light / Dark) */}
          <button
            id="theme-toggle-btn"
            onClick={toggleDarkMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-slate-900 text-amber-300 border-slate-700 hover:bg-slate-800 shadow-2xs'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/80'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-600" />
            )}
            <span className="hidden md:inline text-[11px] font-bold">
              {isDarkMode ? 'Light' : 'Dark'}
            </span>
          </button>

          {/* Remote IoT Sensor Battery & Power Fleet Monitor (Hidden in Focus Mode) */}
          {!isFocusMode && <RemoteSensorBatteryMonitor />}

          {/* Connectivity Status Badge */}
          {!isOnline && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span className="hidden sm:inline">Offline Cached</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
