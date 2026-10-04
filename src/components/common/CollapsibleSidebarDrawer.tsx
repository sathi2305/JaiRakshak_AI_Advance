import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { getShortcutBadgeForRoute } from './KeyboardShortcutManager';
import {
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
  X,
  Droplets,
  Sparkles,
  Bot,
  Radio,
  Sliders,
  Bell,
  BellRing,
  CheckCheck,
  Trash2,
  User as UserIcon,
  Shield,
  LogOut,
  Monitor,
  Smartphone,
  ChevronRight,
  Search,
  Layers
} from 'lucide-react';

type NavCategory = 'ALL' | 'OPERATIONS' | 'INTELLIGENCE' | 'GOVERNANCE';

export const CollapsibleSidebarDrawer: React.FC = () => {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    activeTab,
    setActiveTab,
    alerts,
    telemetry,
    simulationMode,
    injectSimulationEvent,
    setIsSimulatorDrawerOpen,
    setIsCopilotOpen,
    openPageChatbot,
    currentUser,
    setUserRole,
    logout,
    notifications,
    unreadNotificationsCount,
    markAllNotificationsRead,
    markNotificationRead,
    clearAllNotifications,
    openNotificationCenter,
    openAppInstallModal
  } = useApp();

  const { t } = useLanguage();
  const [selectedGroup, setSelectedGroup] = useState<NavCategory>('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [showAllNotifs, setShowAllNotifs] = useState(false);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      } else if (e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsSidebarOpen(!isSidebarOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, setIsSidebarOpen]);

  if (!isSidebarOpen) return null;

  const activeAlertsCount = alerts.filter(a => a.status === 'NEW' || a.status === 'IN_PROGRESS').length;
  const leakRiskPercent = telemetry?.leakageRiskPercent ?? 87;
  const flowRate = telemetry?.flowRateLpm ?? 48.5;
  const pressure = telemetry?.pressureBar ?? 2.7;

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, group: 'OPERATIONS' as NavCategory, badge: null },
    { id: 'monitoring', label: 'Real-Time Telemetry', icon: Activity, group: 'OPERATIONS' as NavCategory, badge: 'LIVE', badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30' },
    { id: 'digital-twin', label: 'Digital Water Twin', icon: Network, group: 'OPERATIONS' as NavCategory, badge: null },
    { id: 'anomalies', label: 'Anomaly & Leak Risk', icon: AlertOctagon, group: 'OPERATIONS' as NavCategory, badge: activeAlertsCount > 0 ? `${activeAlertsCount}` : null, badgeColor: 'bg-rose-500 text-white animate-pulse' },
    { id: 'forecast', label: 'Forecast & Reservoir', icon: TrendingUp, group: 'INTELLIGENCE' as NavCategory, badge: 'AI', badgeColor: 'bg-indigo-500/25 text-indigo-300 border border-indigo-400/30' },
    { id: 'recommendations', label: 'Smart Actions', icon: Lightbulb, group: 'INTELLIGENCE' as NavCategory, badge: '4', badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-400/30' },
    { id: 'simulator', label: 'What-If Simulator', icon: SlidersHorizontal, group: 'INTELLIGENCE' as NavCategory, badge: null },
    { id: 'maintenance', label: 'Predictive Maint.', icon: Wrench, group: 'INTELLIGENCE' as NavCategory, badge: '3', badgeColor: 'bg-sky-500/20 text-sky-300 border border-sky-400/30' },
    { id: 'quality', label: 'Water Quality', icon: FlaskConical, group: 'OPERATIONS' as NavCategory, badge: '92%', badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' },
    { id: 'geospatial', label: 'Geo-Spatial Map', icon: MapPin, group: 'OPERATIONS' as NavCategory, badge: null },
    { id: 'comparison', label: 'Multi-Building', icon: BarChart3, group: 'GOVERNANCE' as NavCategory, badge: null },
    { id: 'sustainability', label: 'Sustainability & Leaderboard', icon: Leaf, group: 'GOVERNANCE' as NavCategory, badge: 'ESG', badgeColor: 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/30' },
    { id: 'reports', label: 'Reports & Summary', icon: FileText, group: 'GOVERNANCE' as NavCategory, badge: null },
    { id: 'sensors', label: 'Sensors & Thresholds', icon: Cpu, group: 'GOVERNANCE' as NavCategory, badge: null },
    { id: 'audit', label: 'Audit Ledger', icon: ShieldAlert, group: 'GOVERNANCE' as NavCategory, badge: null }
  ];

  const filteredNavItems = navItems.filter(item => {
    const matchesGroup = selectedGroup === 'ALL' || item.group === selectedGroup;
    const matchesSearch =
      !searchFilter.trim() ||
      item.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t(item.label).toLowerCase().includes(searchFilter.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const handleSelectModule = (moduleId: string) => {
    setActiveTab(moduleId);
    setIsSidebarOpen(false); // Auto-close sidebar after selecting module
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop Overlay — clicking outside closes the sidebar */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Slide-Over Off-Canvas Sidebar Panel */}
      <aside className="relative z-10 w-full max-w-md bg-slate-950 text-slate-100 border-r border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-left duration-200">
        
        {/* Sidebar Top Brand & Close Header */}
        <div className="px-5 py-4 bg-linear-to-r from-slate-950 via-slate-900 to-cyan-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-tight text-white">
                  JalRakshak<span className="text-cyan-400 ml-0.5">AI</span>
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                  Command Hub
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Select any module or action — auto-closes on use
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-sidebar-drawer-btn"
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
            title="Close Sidebar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Sidebar Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">
          
          {/* SECTION 1: LIVE LEAKAGE RISK & SIMULATION CONTROL CARD */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                <span>Live Leakage Risk & Twin Status</span>
              </span>
              <span
                className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${
                  leakRiskPercent >= 60
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {leakRiskPercent}% RISK ({simulationMode})
              </span>
            </div>

            {/* Live Telemetry Mini Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Leakage Risk</span>
                <span className={`text-sm font-black font-mono ${leakRiskPercent >= 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {leakRiskPercent}%
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Flow Rate</span>
                <span className="text-sm font-black font-mono text-cyan-300">
                  {flowRate} L/m
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/90 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Pressure</span>
                <span className="text-sm font-black font-mono text-indigo-300">
                  {pressure} bar
                </span>
              </div>
            </div>

            {/* Leakage Risk & Twin Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  injectSimulationEvent(simulationMode === 'LEAKAGE_RISK' ? 'RESET' : 'LEAK');
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  simulationMode === 'LEAKAGE_RISK'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{simulationMode === 'LEAKAGE_RISK' ? 'Clear Leak' : 'Simulate Leak'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSidebarOpen(false);
                  setIsSimulatorDrawerOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-all cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Twin Controls</span>
              </button>
            </div>
          </div>

          {/* SECTION 2: AI COPILOT & CONTEXTUAL ASSISTANT */}
          <div className="rounded-2xl bg-linear-to-r from-cyan-950/70 via-blue-950/70 to-indigo-950/70 border border-cyan-500/30 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Copilot & Query Intelligence</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-300 font-bold">Online</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSidebarOpen(false);
                  setIsCopilotOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-extrabold bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Copilot</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSidebarOpen(false);
                  openPageChatbot();
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-slate-800 text-cyan-200 border border-cyan-500/30 transition-all cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>Page AI Chat</span>
              </button>
            </div>
          </div>

          {/* SECTION 3: ALL 15 NAVIGATION BAR BUTTONS */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Platform Navigation Modules (15)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Auto-Close</span>
            </div>

            {/* Category Filter Tabs */}
            <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {([
                { id: 'ALL', label: 'All (15)' },
                { id: 'OPERATIONS', label: 'Ops' },
                { id: 'INTELLIGENCE', label: 'AI' },
                { id: 'GOVERNANCE', label: 'ESG' }
              ] as { id: NavCategory; label: string }[]).map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedGroup(cat.id)}
                  className={`py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    selectedGroup === cat.id
                      ? 'bg-cyan-600 text-white shadow-2xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Search navigation module..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            {/* All Navigation Buttons List */}
            <div className="space-y-1">
              {filteredNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const shortcutCombo = getShortcutBadgeForRoute(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    id={`sidebar-nav-tab-${item.id}`}
                    onClick={() => handleSelectModule(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-linear-to-r from-cyan-500/25 via-blue-500/20 to-indigo-500/20 text-white border border-cyan-400/50 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                        }`}
                      />
                      <span className="truncate">{t(item.label)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded-md ${
                            item.badgeColor || 'bg-slate-800 text-cyan-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {shortcutCombo && (
                        <kbd
                          data-no-translate="true"
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
                        >
                          {shortcutCombo}
                        </kbd>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: NOTIFICATIONS & PUSH ALERT CENTER */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-extrabold text-white">Notifications</span>
                {unreadNotificationsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white">
                    {unreadNotificationsCount} Unread
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadNotificationsCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Mark Read</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllNotifications}
                    className="text-[10px] font-bold text-slate-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-2">
                All caught up! No active notifications.
              </p>
            ) : (
              <div className="space-y-1.5">
                {notifications.slice(0, showAllNotifs ? 6 : 2).map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationRead(n.id);
                      if (n.route) {
                        setActiveTab(n.route);
                        setIsSidebarOpen(false);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      !n.read
                        ? 'bg-slate-950 border-cyan-500/40'
                        : 'bg-slate-950/50 border-slate-800/80 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-100 truncate">{n.title}</span>
                      <span className="text-[9px] text-slate-400 shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{n.body}</p>
                  </div>
                ))}

                {notifications.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setShowAllNotifs(!showAllNotifs)}
                    className="w-full text-center text-[11px] font-bold text-slate-400 hover:text-cyan-300 py-1 cursor-pointer"
                  >
                    {showAllNotifs ? 'Show Less' : `View ${notifications.length - 2} More Notifications`}
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setIsSidebarOpen(false);
                openNotificationCenter();
              }}
              className="w-full py-2 px-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Open Full Push Alert Center</span>
            </button>
          </div>

          {/* SECTION 5: USER DETAIL & ACCOUNT CONTROLS */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                {currentUser?.name
                  ? currentUser.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : 'SS'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-white truncate">
                    {currentUser?.name || 'Chief Hydrologist'}
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                    {currentUser?.role || 'ADMIN'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {currentUser?.email || 'sathiyamoorthisaravanan2006@gmail.com'}
                </p>
              </div>
            </div>

            {/* Role Switcher */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Access Privilege Level
              </span>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setUserRole('admin')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentUser?.role === 'admin'
                      ? 'bg-cyan-600 text-white shadow-2xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserRole('user')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentUser?.role === 'user'
                      ? 'bg-cyan-600 text-white shadow-2xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Standard</span>
                </button>
              </div>
            </div>

            {/* Workstation / Mobile Install & Sign Out */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsSidebarOpen(false);
                  openAppInstallModal('pc');
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[11px] font-bold transition-colors cursor-pointer"
              >
                <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                <span>PC App</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSidebarOpen(false);
                  openAppInstallModal('mobile');
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-[11px] font-bold transition-colors cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                <span>Mobile App</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsSidebarOpen(false);
                logout();
              }}
              className="w-full py-2 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Command Center</span>
            </button>
          </div>

        </div>
      </aside>
    </div>
  );
};
