import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Keyboard,
  Search,
  X,
  Command,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  LayoutDashboard,
  Activity,
  Network,
  AlertOctagon,
  TrendingUp,
  Lightbulb,
  SlidersHorizontal,
  Wrench,
  FlaskConical,
  MapPin,
  BarChart3,
  Leaf,
  FileText,
  Cpu,
  ShieldAlert,
  Sun
} from 'lucide-react';

export interface ShortcutDefinition {
  id: string;
  key: string; // e.g. '1', '2', 'g', 'j'
  modifier: 'Ctrl' | 'Alt';
  label: string;
  description: string;
  category: 'MODULES' | 'ACTIONS';
  route?: string;
  iconName: string;
}

export const DEFAULT_SHORTCUTS: ShortcutDefinition[] = [
  {
    id: 'sc-dashboard',
    key: '1',
    modifier: 'Ctrl',
    label: 'Master Command Center',
    description: 'Switch to macro campus water balance & live KPIs',
    category: 'MODULES',
    route: 'dashboard',
    iconName: 'dashboard'
  },
  {
    id: 'sc-monitoring',
    key: '2',
    modifier: 'Ctrl',
    label: 'Real-Time Telemetry',
    description: 'Open high-density flow & pressure curves and threshold alerts',
    category: 'MODULES',
    route: 'monitoring',
    iconName: 'monitoring'
  },
  {
    id: 'sc-digital-twin',
    key: '3',
    modifier: 'Ctrl',
    label: 'Digital Water Twin',
    description: 'Inspect EPANET 2.2 hydraulic nodes and pipe segments',
    category: 'MODULES',
    route: 'digital-twin',
    iconName: 'digital-twin'
  },
  {
    id: 'sc-anomalies',
    key: '4',
    modifier: 'Ctrl',
    label: 'Anomaly & Leak Risk',
    description: 'Open acoustic waveform & leak triaging center',
    category: 'MODULES',
    route: 'anomalies',
    iconName: 'anomalies'
  },
  {
    id: 'sc-forecast',
    key: '5',
    modifier: 'Ctrl',
    label: 'Forecast & Optimization',
    description: 'View AI demand predictions, weather telemetry & reservoir correlation',
    category: 'MODULES',
    route: 'forecast',
    iconName: 'forecast'
  },
  {
    id: 'sc-recommendations',
    key: '6',
    modifier: 'Ctrl',
    label: 'Smart Recommendations',
    description: 'Review prescriptive conservation engineering & ROI actions',
    category: 'MODULES',
    route: 'recommendations',
    iconName: 'recommendations'
  },
  {
    id: 'sc-simulator',
    key: '7',
    modifier: 'Ctrl',
    label: 'What-If Simulator',
    description: 'Run hydraulic stress tests and pipe burst scenarios',
    category: 'MODULES',
    route: 'simulator',
    iconName: 'simulator'
  },
  {
    id: 'sc-maintenance',
    key: '8',
    modifier: 'Ctrl',
    label: 'Predictive Maintenance',
    description: 'Monitor pump vibration diagnostics and asset health',
    category: 'MODULES',
    route: 'maintenance',
    iconName: 'maintenance'
  },
  {
    id: 'sc-quality',
    key: '9',
    modifier: 'Ctrl',
    label: 'Water Quality Module',
    description: 'Inspect real-time potability, pH, turbidity & TDS',
    category: 'MODULES',
    route: 'quality',
    iconName: 'quality'
  },
  {
    id: 'sc-sustainability',
    key: '0',
    modifier: 'Ctrl',
    label: 'Sustainability & Leaderboard',
    description: 'Track department water-saving leaderboard & ESG goals',
    category: 'MODULES',
    route: 'sustainability',
    iconName: 'sustainability'
  },
  {
    id: 'sc-geospatial',
    key: 'g',
    modifier: 'Alt',
    label: 'Geo-Spatial GIS Map',
    description: 'View underground pipeline topography & spatial risk zones',
    category: 'MODULES',
    route: 'geospatial',
    iconName: 'geospatial'
  },
  {
    id: 'sc-comparison',
    key: 'b',
    modifier: 'Alt',
    label: 'Multi-Building Analytics',
    description: 'Compare per-capita water efficiency across campus blocks',
    category: 'MODULES',
    route: 'comparison',
    iconName: 'comparison'
  },
  {
    id: 'sc-reports',
    key: 'r',
    modifier: 'Alt',
    label: 'Reports & AI Summary',
    description: 'Generate ISO 14046 certified institutional water audit reports',
    category: 'MODULES',
    route: 'reports',
    iconName: 'reports'
  },
  {
    id: 'sc-sensors',
    key: 's',
    modifier: 'Alt',
    label: 'Sensors & Thresholds',
    description: 'Inspect LoRaWAN sensor fleet battery & signal health',
    category: 'MODULES',
    route: 'sensors',
    iconName: 'sensors'
  },
  {
    id: 'sc-audit',
    key: 'l',
    modifier: 'Alt',
    label: 'Security & Audit Ledger',
    description: 'View tamper-evident SHA-256 operational audit trail',
    category: 'MODULES',
    route: 'audit',
    iconName: 'audit'
  },
  {
    id: 'sc-copilot',
    key: 'j',
    modifier: 'Ctrl',
    label: 'Toggle AI Water Copilot',
    description: 'Open or close the JalRakshak AI conversational assistant',
    category: 'ACTIONS',
    iconName: 'copilot'
  },
  {
    id: 'sc-theme',
    key: 'd',
    modifier: 'Alt',
    label: 'Toggle Light / Dark Theme',
    description: 'Switch between high-contrast light and dark SCADA themes',
    category: 'ACTIONS',
    iconName: 'theme'
  },
  {
    id: 'sc-focus',
    key: 'f',
    modifier: 'Alt',
    label: 'Toggle Focus Mode',
    description: 'Hide navigation matrix, chat & secondary UI for distraction-free dashboards',
    category: 'ACTIONS',
    iconName: 'dashboard'
  }
];

export function getShortcutBadgeForRoute(routeId: string): string | null {
  const found = DEFAULT_SHORTCUTS.find((s) => s.route === routeId);
  if (!found) return null;
  return `${found.modifier}+${found.key.toUpperCase()}`;
}

export const KeyboardShortcutManager: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isCopilotOpen,
    setIsCopilotOpen,
    toggleDarkMode,
    isFocusMode,
    toggleFocusMode
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shortcutsEnabled, setShortcutsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('jalrakshak_shortcuts_enabled') !== 'false';
  });

  const [shortcuts, setShortcuts] = useState<ShortcutDefinition[]>(() => {
    const saved = localStorage.getItem('jalrakshak_custom_shortcuts_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_SHORTCUTS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [hudToast, setHudToast] = useState<{ combo: string; label: string } | null>(null);

  // Listen for custom event from Header button to open the Shortcut Manager Modal
  useEffect(() => {
    const handleOpenEvent = () => setIsModalOpen(true);
    window.addEventListener('jalrakshak:open-shortcuts', handleOpenEvent);
    return () => window.removeEventListener('jalrakshak:open-shortcuts', handleOpenEvent);
  }, []);

  const triggerHudNotification = (combo: string, label: string) => {
    setHudToast({ combo, label });
  };

  useEffect(() => {
    if (!hudToast) return;
    const timer = setTimeout(() => setHudToast(null), 2200);
    return () => clearTimeout(timer);
  }, [hudToast]);

  const executeShortcutAction = (sc: ShortcutDefinition) => {
    const comboLabel = `${sc.modifier}+${sc.key.toUpperCase()}`;
    if (sc.route) {
      setActiveTab(sc.route);
      triggerHudNotification(comboLabel, `Switched to ${sc.label}`);
    } else if (sc.id === 'sc-copilot') {
      setIsCopilotOpen(!isCopilotOpen);
      triggerHudNotification(comboLabel, isCopilotOpen ? 'Closed AI Copilot' : 'Opened AI Copilot');
    } else if (sc.id === 'sc-theme') {
      toggleDarkMode();
      triggerHudNotification(comboLabel, 'Toggled Display Theme');
    } else if (sc.id === 'sc-focus') {
      toggleFocusMode();
      triggerHudNotification(comboLabel, isFocusMode ? 'Exited Focus Mode' : 'Entered Focus Mode');
    }
  };

  // Global keydown listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      // Handle custom shortcut key recording mode inside the modal
      if (recordingId) {
        e.preventDefault();
        e.stopPropagation();
        const pressedKey = e.key.toLowerCase();
        if (['control', 'alt', 'shift', 'meta'].includes(pressedKey)) return;
        if (pressedKey === 'escape') {
          setRecordingId(null);
          return;
        }
        const newMod: 'Ctrl' | 'Alt' = e.altKey ? 'Alt' : 'Ctrl';
        const updated = shortcuts.map((item) =>
          item.id === recordingId ? { ...item, key: pressedKey.slice(0, 1), modifier: newMod } : item
        );
        setShortcuts(updated);
        localStorage.setItem('jalrakshak_custom_shortcuts_v1', JSON.stringify(updated));
        setRecordingId(null);
        return;
      }

      // Open/Close Shortcut Manager Modal with Ctrl+K or Ctrl+/
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'k' || e.key === '/')) {
        e.preventDefault();
        setIsModalOpen((prev) => !prev);
        return;
      }

      // Open Shortcut Manager Modal with '?' when not typing in an input
      if (!isInputFocused && e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        setIsModalOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
        return;
      }

      if (!shortcutsEnabled) return;

      // Cycle modules with '[' and ']' when not typing in an input
      if (!isInputFocused && !e.ctrlKey && !e.altKey && !e.metaKey && (e.key === '[' || e.key === ']')) {
        e.preventDefault();
        const moduleRoutes = shortcuts.filter((s) => s.route).map((s) => s.route!);
        const currentIdx = moduleRoutes.indexOf(activeTab);
        if (currentIdx !== -1) {
          const nextIdx =
            e.key === ']'
              ? (currentIdx + 1) % moduleRoutes.length
              : (currentIdx - 1 + moduleRoutes.length) % moduleRoutes.length;
          const nextRoute = moduleRoutes[nextIdx];
          const nextSc = shortcuts.find((s) => s.route === nextRoute);
          setActiveTab(nextRoute);
          if (nextSc) {
            triggerHudNotification(e.key === ']' ? 'Next [ ]' : 'Prev [ ]', `Switched to ${nextSc.label}`);
          }
        }
        return;
      }

      // Match Ctrl+<key> or Alt+<key> (for numeric keys 0-9, accept either Ctrl or Alt so browser tab conflicts are avoided)
      const pressedKey = e.key.toLowerCase();
      const hasCtrlOrMeta = e.ctrlKey || e.metaKey;
      const hasAlt = e.altKey;

      if (!hasCtrlOrMeta && !hasAlt) return;

      const matched = shortcuts.find((s) => {
        if (s.key.toLowerCase() !== pressedKey) return false;
        const isDigit = /^[0-9]$/.test(s.key);
        if (isDigit) {
          return hasCtrlOrMeta || hasAlt;
        }
        return s.modifier === 'Ctrl' ? hasCtrlOrMeta : hasAlt;
      });

      if (matched) {
        e.preventDefault();
        e.stopPropagation();
        executeShortcutAction(matched);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [shortcuts, shortcutsEnabled, recordingId, isModalOpen, activeTab, isCopilotOpen]);

  const handleToggleEnabled = () => {
    const next = !shortcutsEnabled;
    setShortcutsEnabled(next);
    localStorage.setItem('jalrakshak_shortcuts_enabled', String(next));
  };

  const handleResetDefaults = () => {
    setShortcuts(DEFAULT_SHORTCUTS);
    localStorage.removeItem('jalrakshak_custom_shortcuts_v1');
    setRecordingId(null);
  };

  const filteredShortcuts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return shortcuts;
    return shortcuts.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        `${s.modifier}+${s.key}`.toLowerCase().includes(q)
    );
  }, [shortcuts, searchQuery]);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'dashboard':
        return <LayoutDashboard className="w-4 h-4 text-cyan-500" />;
      case 'monitoring':
        return <Activity className="w-4 h-4 text-emerald-500" />;
      case 'digital-twin':
        return <Network className="w-4 h-4 text-blue-500" />;
      case 'anomalies':
        return <AlertOctagon className="w-4 h-4 text-rose-500" />;
      case 'forecast':
        return <TrendingUp className="w-4 h-4 text-indigo-500" />;
      case 'recommendations':
        return <Lightbulb className="w-4 h-4 text-amber-500" />;
      case 'simulator':
        return <SlidersHorizontal className="w-4 h-4 text-purple-500" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4 text-sky-500" />;
      case 'quality':
        return <FlaskConical className="w-4 h-4 text-teal-500" />;
      case 'geospatial':
        return <MapPin className="w-4 h-4 text-cyan-500" />;
      case 'comparison':
        return <BarChart3 className="w-4 h-4 text-blue-500" />;
      case 'sustainability':
        return <Leaf className="w-4 h-4 text-emerald-500" />;
      case 'reports':
        return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'sensors':
        return <Cpu className="w-4 h-4 text-amber-500" />;
      case 'audit':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'copilot':
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
      default:
        return <Sun className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <>
      {/* Live Hotkey Feedback HUD Toast */}
      {hudToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-150">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-950/95 text-white border border-cyan-500/50 shadow-2xl shadow-cyan-950/60 backdrop-blur-md">
            <kbd className="px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono text-xs font-black">
              {hudToast.combo}
            </kbd>
            <span className="text-xs font-bold tracking-tight text-slate-100">
              {hudToast.label}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>
        </div>
      )}

      {/* Keyboard Shortcut Manager & Quick Command Palette Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-linear-to-r from-slate-950 via-slate-900 to-cyan-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
                  <Keyboard className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                      Global Keyboard Shortcut Manager
                    </h2>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-bold">
                      Ctrl+K / ?
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Rapidly switch between application modules using <code className="text-cyan-300 font-mono">Ctrl+1..9</code> (or <code className="text-cyan-300 font-mono">Alt+1..9</code>) hotkeys
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleEnabled}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-colors cursor-pointer ${
                    shortcutsEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {shortcutsEnabled ? 'Hotkeys: ACTIVE' : 'Hotkeys: PAUSED'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search & Quick Jump Input Bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredShortcuts.length > 0) {
                      e.preventDefault();
                      executeShortcutAction(filteredShortcuts[0]);
                      setIsModalOpen(false);
                    }
                  }}
                  placeholder="Type a module name or hotkey (e.g., Forecast, Ctrl+1, Twin) and press Enter to jump..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                  autoFocus
                />
              </div>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-bold transition-colors cursor-pointer shrink-0"
                title="Reset all hotkeys to factory defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>

            {/* Shortcuts Grid */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
              {/* Module Navigation Shortcuts */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Module Navigation Hotkeys (Press Ctrl+Num or Alt+Num)
                  </span>
                  <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">
                    Click any row to jump or customize key
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {filteredShortcuts
                    .filter((s) => s.category === 'MODULES')
                    .map((sc) => {
                      const isCurrent = sc.route === activeTab;
                      const isRecording = recordingId === sc.id;
                      return (
                        <div
                          key={sc.id}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            isCurrent
                              ? 'bg-cyan-50/70 dark:bg-cyan-950/40 border-cyan-400/60 dark:border-cyan-700'
                              : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:border-cyan-400/40'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              executeShortcutAction(sc);
                              setIsModalOpen(false);
                            }}
                            className="flex items-center gap-3 text-left flex-1 min-w-0 cursor-pointer group"
                          >
                            <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              {renderIcon(sc.iconName)}
                            </div>
                            <div className="truncate">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                                  {sc.label}
                                </span>
                                {isCurrent && (
                                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-700 dark:text-cyan-300">
                                    Active
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {sc.description}
                              </p>
                            </div>
                          </button>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setRecordingId(isRecording ? null : sc.id)}
                              className={`px-2.5 py-1 rounded-lg font-mono text-xs font-black border transition-all cursor-pointer ${
                                isRecording
                                  ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-cyan-300 border-slate-300 dark:border-slate-700 hover:border-cyan-500 shadow-2xs'
                              }`}
                              title="Click to rebind shortcut key"
                            >
                              {isRecording ? 'Press Key...' : `${sc.modifier}+${sc.key.toUpperCase()}`}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                executeShortcutAction(sc);
                                setIsModalOpen(false);
                              }}
                              className="p-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                              title={`Jump to ${sc.label}`}
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Global Command & Utility Shortcuts */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                  Global Platform Utility Shortcuts
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {filteredShortcuts
                    .filter((s) => s.category === 'ACTIONS')
                    .map((sc) => (
                      <div
                        key={sc.id}
                        className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                            {renderIcon(sc.iconName)}
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white block truncate">
                              {sc.label}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                              {sc.description}
                            </span>
                          </div>
                        </div>
                        <kbd className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-cyan-300 border border-slate-300 dark:border-slate-700 font-mono text-xs font-black shrink-0">
                          {sc.modifier}+{sc.key.toUpperCase()}
                        </kbd>
                      </div>
                    ))}

                  <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                        <Command className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white block truncate">
                          Cycle Previous / Next Module
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                          Step sequentially through all 15 platform modules
                        </span>
                      </div>
                    </div>
                    <kbd className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-cyan-300 border border-slate-300 dark:border-slate-700 font-mono text-xs font-black shrink-0">
                      [ or ]
                    </kbd>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span>Pro Tip: Both</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[10px] font-bold">
                  Ctrl + 1..9
                </kbd>
                <span>and</span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[10px] font-bold">
                  Alt + 1..9
                </kbd>
                <span>work globally from any view.</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-cyan-600 text-white font-bold text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
