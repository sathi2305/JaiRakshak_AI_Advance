import React, { useState, useRef } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';

type NavCategory = 'ALL' | 'OPERATIONS' | 'INTELLIGENCE' | 'GOVERNANCE';

export const TopNavigationMatrix: React.FC = () => {
  const { activeTab, setActiveTab, alerts } = useApp();
  const { t } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedGroup, setSelectedGroup] = useState<NavCategory>('ALL');

  const activeAlertsCount = alerts.filter(a => a.status === 'NEW' || a.status === 'IN_PROGRESS').length;

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
    { id: 'audit', label: 'Audit Ledger', icon: ShieldAlert, group: 'GOVERNANCE' as NavCategory, badge: null },
  ];

  const visibleItems = selectedGroup === 'ALL'
    ? navItems
    : navItems.filter(item => item.group === selectedGroup);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const categoryPills: { id: NavCategory; label: string }[] = [
    { id: 'ALL', label: 'All Modules' },
    { id: 'OPERATIONS', label: 'Live Operations' },
    { id: 'INTELLIGENCE', label: 'AI & Forecasting' },
    { id: 'GOVERNANCE', label: 'ESG & Governance' }
  ];

  return (
    <nav className="w-full bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/90 text-slate-300 sticky top-16 z-30 select-none print:hidden shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
        
        {/* Left: Domain Group Filter Switcher (Desktop) */}
        <div className="hidden xl:flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800 shrink-0">
          <Layers className="w-3.5 h-3.5 text-cyan-400 ml-2 mr-1" />
          {categoryPills.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedGroup(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedGroup === cat.id
                  ? 'bg-slate-800 text-cyan-300 shadow-2xs border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t(cat.label)}
            </button>
          ))}
        </div>

        {/* Left Scroll Trigger */}
        <button
          onClick={() => handleScroll('left')}
          className="hidden md:flex p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all shrink-0 cursor-pointer"
          title="Scroll Left"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Horizontal Navigation Dock */}
        <div
          ref={scrollContainerRef}
          className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
        >
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const shortcutCombo = getShortcutBadgeForRoute(item.id);
            return (
              <button
                key={item.id}
                id={`top-nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                title={shortcutCombo ? `${item.label} (${shortcutCombo})` : item.label}
                className={`relative flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer group ${
                  selectedGroup !== 'ALL' ? 'flex-1' : ''
                } ${
                  isActive
                    ? 'bg-linear-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 text-white border border-cyan-400/50 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                  }`}
                />
                <span>{t(item.label)}</span>
                {shortcutCombo && (
                  <kbd
                    data-no-translate="true"
                    className={`hidden lg:inline-block text-[9px] font-mono px-1 py-0.2 rounded border transition-colors ${
                      isActive
                        ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-900/80 text-slate-500 border-slate-800 group-hover:text-slate-300'
                    }`}
                  >
                    {shortcutCombo}
                  </kbd>
                )}
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded-md ${
                      item.badgeColor || (isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-cyan-400')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Trigger */}
        <button
          onClick={() => handleScroll('right')}
          className="hidden md:flex p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all shrink-0 cursor-pointer"
          title="Scroll Right"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Live Telemetry Pulse Status Pill */}
        <div className="hidden 2xl:flex items-center gap-1.5 pl-3 border-l border-slate-800 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>ZERO-LATENCY SYNC</span>
          </div>
        </div>

      </div>
    </nav>
  );
};
