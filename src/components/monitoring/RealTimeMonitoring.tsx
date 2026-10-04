import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Activity,
  Gauge,
  Droplets,
  Radio,
  Clock,
  Battery,
  Wifi,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  BellRing,
  Save,
  Sparkles,
  Zap
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

interface CustomMonitoringThresholds {
  presetName: 'strict' | 'standard' | 'high_load' | 'custom';
  flowWarningLpm: number;
  flowCriticalLpm: number;
  pressureMinBar: number;
  pressureMaxBar: number;
  tankMinPercent: number;
  autoIsolateOnCriticalFlow: boolean;
  autoThrottlePrvOnPressure: boolean;
  visualBannerEnabled: boolean;
}

const DEFAULT_MONITORING_THRESHOLDS: CustomMonitoringThresholds = {
  presetName: 'standard',
  flowWarningLpm: 45.0,
  flowCriticalLpm: 62.0,
  pressureMinBar: 3.0,
  pressureMaxBar: 4.5,
  tankMinPercent: 25,
  autoIsolateOnCriticalFlow: true,
  autoThrottlePrvOnPressure: true,
  visualBannerEnabled: true
};

export const RealTimeMonitoring: React.FC = () => {
  const { telemetry, injectSimulationEvent } = useApp();
  const [streamHistory, setStreamHistory] = useState<any[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [breachHistory, setBreachHistory] = useState<
    { id: string; time: string; metric: string; value: string; threshold: string; severity: 'WARNING' | 'CRITICAL' }[]
  >([]);

  // Load persisted custom thresholds
  const [thresholds, setThresholds] = useState<CustomMonitoringThresholds>(() => {
    try {
      const saved = localStorage.getItem('jalrakshak_custom_monitoring_thresholds');
      if (saved) return { ...DEFAULT_MONITORING_THRESHOLDS, ...JSON.parse(saved) };
    } catch {
      // ignore parse errors
    }
    return DEFAULT_MONITORING_THRESHOLDS;
  });

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Apply preset helper
  const applyPreset = (preset: 'strict' | 'standard' | 'high_load') => {
    let next: CustomMonitoringThresholds;
    if (preset === 'strict') {
      next = {
        ...thresholds,
        presetName: 'strict',
        flowWarningLpm: 36.0,
        flowCriticalLpm: 48.0,
        pressureMinBar: 3.3,
        pressureMaxBar: 4.3,
        tankMinPercent: 35
      };
    } else if (preset === 'standard') {
      next = {
        ...thresholds,
        presetName: 'standard',
        flowWarningLpm: 45.0,
        flowCriticalLpm: 62.0,
        pressureMinBar: 3.0,
        pressureMaxBar: 4.5,
        tankMinPercent: 25
      };
    } else {
      next = {
        ...thresholds,
        presetName: 'high_load',
        flowWarningLpm: 58.0,
        flowCriticalLpm: 75.0,
        pressureMinBar: 2.5,
        pressureMaxBar: 4.8,
        tankMinPercent: 20
      };
    }
    setThresholds(next);
    localStorage.setItem('jalrakshak_custom_monitoring_thresholds', JSON.stringify(next));
    triggerToast(`Applied "${preset.replace('_', ' ').toUpperCase()}" pressure & flow alert thresholds.`);
  };

  const handleSaveThresholds = async () => {
    localStorage.setItem('jalrakshak_custom_monitoring_thresholds', JSON.stringify(thresholds));
    try {
      await api.updateLeakThresholds({
        pressureDropBar: Number((4.0 - thresholds.pressureMinBar).toFixed(2)),
        autoTripIsolationValve: thresholds.autoIsolateOnCriticalFlow
      });
    } catch {
      // local persistence already succeeded
    }
    triggerToast('Custom water pressure & flow rate thresholds saved and armed.');
  };

  // Evaluate live breaches against user-configured thresholds
  const activeBreaches = useMemo(() => {
    const flowVal = telemetry?.flowRateLpm ?? 48.5;
    const pressureVal = telemetry?.pressureBar ?? 2.7;
    const tankVal = telemetry?.tankLevelPercent ?? 78;

    const list: {
      id: string;
      metric: 'FLOW' | 'PRESSURE' | 'TANK';
      severity: 'CRITICAL' | 'WARNING';
      title: string;
      detail: string;
    }[] = [];

    if (flowVal >= thresholds.flowCriticalLpm) {
      list.push({
        id: 'flow-crit',
        metric: 'FLOW',
        severity: 'CRITICAL',
        title: `Critical Flow Surge Breached (${flowVal} L/min ≥ ${thresholds.flowCriticalLpm} L/min)`,
        detail: thresholds.autoIsolateOnCriticalFlow
          ? 'Auto-isolation solenoid armed for Block A trunk line.'
          : 'Immediate manual valve inspection recommended.'
      });
    } else if (flowVal >= thresholds.flowWarningLpm) {
      list.push({
        id: 'flow-warn',
        metric: 'FLOW',
        severity: 'WARNING',
        title: `High Flow Warning Threshold Exceeded (${flowVal} L/min ≥ ${thresholds.flowWarningLpm} L/min)`,
        detail: `Exceeds custom flow warning ceiling by +${(flowVal - thresholds.flowWarningLpm).toFixed(1)} L/min.`
      });
    }

    if (pressureVal <= thresholds.pressureMinBar) {
      list.push({
        id: 'pres-low',
        metric: 'PRESSURE',
        severity: pressureVal <= thresholds.pressureMinBar - 0.4 ? 'CRITICAL' : 'WARNING',
        title: `Low Hydraulic Pressure Alert (${pressureVal} bar ≤ ${thresholds.pressureMinBar} bar)`,
        detail: `Line pressure dropped ${(thresholds.pressureMinBar - pressureVal).toFixed(2)} bar below custom minimum floor—indicative of downstream leak.`
      });
    } else if (pressureVal >= thresholds.pressureMaxBar) {
      list.push({
        id: 'pres-high',
        metric: 'PRESSURE',
        severity: 'CRITICAL',
        title: `Over-Pressure Ceiling Breached (${pressureVal} bar ≥ ${thresholds.pressureMaxBar} bar)`,
        detail: thresholds.autoThrottlePrvOnPressure
          ? 'PRV-102 automatically throttling to relieve pipe stress.'
          : 'High pipe burst risk—reduce booster pump speed.'
      });
    }

    if (tankVal <= thresholds.tankMinPercent) {
      list.push({
        id: 'tank-low',
        metric: 'TANK',
        severity: 'WARNING',
        title: `Low Reservoir Reserve (${tankVal}% ≤ ${thresholds.tankMinPercent}%)`,
        detail: 'Activate booster pump replenishment cycle.'
      });
    }

    return list;
  }, [telemetry, thresholds]);

  // Maintain sliding window of the last 20 real-time readings & log breaches
  useEffect(() => {
    if (isPaused) return;

    const flowVal = telemetry?.flowRateLpm ?? 48.5;
    const pressureVal = telemetry?.pressureBar ?? 2.7;
    const tankVal = telemetry?.tankLevelPercent ?? 78;

    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' });
    setStreamHistory(prev => {
      const next = [
        ...prev,
        {
          time: timeStr,
          flow: flowVal,
          pressure: pressureVal,
          tank: tankVal,
          inlet: flowVal,
          outlet: Number((flowVal * 0.92).toFixed(1))
        }
      ];
      if (next.length > 20) next.shift();
      return next;
    });

    if (flowVal >= thresholds.flowWarningLpm || pressureVal <= thresholds.pressureMinBar || pressureVal >= thresholds.pressureMaxBar) {
      setBreachHistory(prev => {
        const entry = {
          id: `br-${Date.now()}`,
          time: timeStr,
          metric: flowVal >= thresholds.flowWarningLpm ? 'Flow Rate' : 'Hydraulic Pressure',
          value: flowVal >= thresholds.flowWarningLpm ? `${flowVal} L/min` : `${pressureVal} bar`,
          threshold: flowVal >= thresholds.flowWarningLpm ? `Max ${thresholds.flowWarningLpm} L/min` : `Min ${thresholds.pressureMinBar} bar`,
          severity: (flowVal >= thresholds.flowCriticalLpm || pressureVal <= thresholds.pressureMinBar - 0.4 ? 'CRITICAL' : 'WARNING') as 'CRITICAL' | 'WARNING'
        };
        return [entry, ...prev.slice(0, 5)];
      });
    }
  }, [telemetry, isPaused, thresholds.flowWarningLpm, thresholds.flowCriticalLpm, thresholds.pressureMinBar, thresholds.pressureMaxBar]);

  const isFlowBreached = (telemetry?.flowRateLpm ?? 48.5) >= thresholds.flowWarningLpm;
  const isPressureBreached =
    (telemetry?.pressureBar ?? 2.7) <= thresholds.pressureMinBar ||
    (telemetry?.pressureBar ?? 2.7) >= thresholds.pressureMaxBar;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto transition-colors">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl border border-slate-700 dark:border-slate-300 flex items-center gap-2.5 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Stream Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <Activity className="w-5 h-5 animate-pulse" />
              </span>
              Real-Time Water Monitoring &amp; Custom Threshold Guard
            </h1>
            <span className="text-[10px] font-mono uppercase bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 font-bold px-2.5 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800">
              3s Live IoT Stream
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Zero-latency telemetry ingestion with customizable hydraulic pressure and flow rate alert rules
          </p>
        </div>

        {/* Live Stream Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              showConfigPanel
                ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm shadow-cyan-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showConfigPanel ? 'Hide Threshold Config' : 'Configure Alert Thresholds'}</span>
          </button>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              isPaused
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            {isPaused ? 'Resume Stream' : 'Freeze Stream'}
          </button>

          <button
            onClick={() => injectSimulationEvent('RESET')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset telemetry baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Baseline
          </button>
        </div>
      </div>

      {/* Live Threshold Breach Alert Banner */}
      {thresholds.visualBannerEnabled && activeBreaches.length > 0 && (
        <div className="rounded-2xl border border-rose-300 dark:border-rose-800/80 bg-linear-to-r from-rose-50 via-amber-50/60 to-rose-50 dark:from-rose-950/50 dark:via-slate-900 dark:to-rose-950/40 p-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">
                    Active Custom Threshold Alert ({activeBreaches.length} Triggered)
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                    LIVE TELEMETRY BREACH
                  </span>
                </div>
                {activeBreaches.map(b => (
                  <div key={b.id} className="text-xs text-slate-800 dark:text-slate-200">
                    <strong className={b.severity === 'CRITICAL' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}>
                      [{b.severity}] {b.title}:
                    </strong>{' '}
                    <span className="text-slate-600 dark:text-slate-300">{b.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  injectSimulationEvent('RESET');
                  triggerToast('Stabilized hydraulic pressure & flow to nominal baseline.');
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors cursor-pointer"
              >
                Auto-Stabilize Line
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Telemetry Live Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        <div className={`p-4 rounded-2xl border shadow-xs transition-all ${
          isFlowBreached
            ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-400 dark:border-amber-700 ring-1 ring-amber-400/40'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Flow Rate</span>
            <Gauge className={`w-4 h-4 ${isFlowBreached ? 'text-amber-500 animate-pulse' : 'text-cyan-600 dark:text-cyan-400'}`} />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {telemetry.flowRateLpm} <span className="text-xs font-normal text-slate-500">L/min</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Limit: {thresholds.flowWarningLpm} L/m</span>
            {isFlowBreached && <span className="text-amber-600 dark:text-amber-400 font-bold">HIGH</span>}
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-xs transition-all ${
          isPressureBreached
            ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-400 dark:border-rose-700 ring-1 ring-rose-400/40'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Hydraulic Pressure</span>
            <Activity className={`w-4 h-4 ${isPressureBreached ? 'text-rose-500 animate-pulse' : 'text-blue-600 dark:text-blue-400'}`} />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {telemetry.pressureBar} <span className="text-xs font-normal text-slate-500">bar</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Band: {thresholds.pressureMinBar}–{thresholds.pressureMaxBar}b</span>
            {isPressureBreached && <span className="text-rose-600 dark:text-rose-400 font-bold">ALERT</span>}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Tank Storage</span>
            <Droplets className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {telemetry.tankLevelPercent}%
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Min Reserve: {thresholds.tankMinPercent}%</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Cumulative Inflow</span>
            <Droplets className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {(telemetry.inletVolumeLiters ?? 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">L</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Today's Ingress</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Outlet Delivered</span>
            <Droplets className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {(telemetry.outletVolumeLiters ?? 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">L</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Metered fixtures</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Hourly Rate</span>
            <Gauge className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {(telemetry.consumptionRateLph ?? 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">L/h</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Instantaneous velocity</div>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* NEW FEATURE: CUSTOM PRESSURE & FLOW RATE THRESHOLD CONFIGURATION PANEL*/}
      {/* ===================================================================== */}
      {showConfigPanel && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5 transition-colors">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Custom Pressure &amp; Flow Rate Threshold Alert Configuration
                </h2>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                  Real-Time Rule Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Set custom upper and lower operating bounds for water pressure (bar) and flow velocity (L/min) to trigger instant telemetry alerts
              </p>
            </div>

            {/* Preset Selector Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Quick Profile:</span>
              {([
                { id: 'strict', label: 'Strict Conservation' },
                { id: 'standard', label: 'Standard Campus' },
                { id: 'high_load', label: 'High-Load Lab' }
              ] as const).map(p => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    thresholds.presetName === p.id
                      ? 'bg-cyan-600 text-white border-cyan-500 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders Grid: 2 Columns for Flow Rate & Hydraulic Pressure */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Column 1: Flow Rate Alert Thresholds (L/min) */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Flow Rate Alert Thresholds (L/min)
                  </h3>
                </div>
                <span className="text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  Live: {telemetry.flowRateLpm} L/min
                </span>
              </div>

              {/* High Flow Warning Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label htmlFor="flow-warn-slider" className="font-semibold text-slate-700 dark:text-slate-300">
                    High Flow Warning Ceiling
                  </label>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {thresholds.flowWarningLpm} L/min
                  </span>
                </div>
                <input
                  id="flow-warn-slider"
                  type="range"
                  min={25}
                  max={85}
                  step={1}
                  value={thresholds.flowWarningLpm}
                  onChange={e =>
                    setThresholds({
                      ...thresholds,
                      presetName: 'custom',
                      flowWarningLpm: Number(e.target.value)
                    })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>25 L/min (Tight)</span>
                  <span>Triggers yellow warning banner</span>
                  <span>85 L/min</span>
                </div>
              </div>

              {/* Critical Burst Flow Slider */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200/70 dark:border-slate-700/60">
                <div className="flex justify-between text-xs">
                  <label htmlFor="flow-crit-slider" className="font-semibold text-slate-700 dark:text-slate-300">
                    Critical Pipe Burst / Surge Limit
                  </label>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    {thresholds.flowCriticalLpm} L/min
                  </span>
                </div>
                <input
                  id="flow-crit-slider"
                  type="range"
                  min={40}
                  max={110}
                  step={1}
                  value={thresholds.flowCriticalLpm}
                  onChange={e =>
                    setThresholds({
                      ...thresholds,
                      presetName: 'custom',
                      flowCriticalLpm: Number(e.target.value)
                    })
                  }
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>40 L/min</span>
                  <span>Dispatches critical burst alarm</span>
                  <span>110 L/min</span>
                </div>
              </div>
            </div>

            {/* Column 2: Hydraulic Pressure Alert Thresholds (bar) */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Hydraulic Pressure Thresholds (bar)
                  </h3>
                </div>
                <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                  Live: {telemetry.pressureBar} bar
                </span>
              </div>

              {/* Minimum Pressure Drop Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label htmlFor="pres-min-slider" className="font-semibold text-slate-700 dark:text-slate-300">
                    Minimum Pressure Drop Alert Floor
                  </label>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    {thresholds.pressureMinBar.toFixed(1)} bar
                  </span>
                </div>
                <input
                  id="pres-min-slider"
                  type="range"
                  min={1.5}
                  max={3.8}
                  step={0.1}
                  value={thresholds.pressureMinBar}
                  onChange={e =>
                    setThresholds({
                      ...thresholds,
                      presetName: 'custom',
                      pressureMinBar: Number(e.target.value)
                    })
                  }
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1.5 bar</span>
                  <span>Detects sudden line depressurization</span>
                  <span>3.8 bar</span>
                </div>
              </div>

              {/* Maximum Over-Pressure Slider */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200/70 dark:border-slate-700/60">
                <div className="flex justify-between text-xs">
                  <label htmlFor="pres-max-slider" className="font-semibold text-slate-700 dark:text-slate-300">
                    Maximum Over-Pressure Safety Ceiling
                  </label>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {thresholds.pressureMaxBar.toFixed(1)} bar
                  </span>
                </div>
                <input
                  id="pres-max-slider"
                  type="range"
                  min={4.0}
                  max={5.5}
                  step={0.1}
                  value={thresholds.pressureMaxBar}
                  onChange={e =>
                    setThresholds({
                      ...thresholds,
                      presetName: 'custom',
                      pressureMaxBar: Number(e.target.value)
                    })
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>4.0 bar</span>
                  <span>Prevents joint fatigue &amp; water hammer</span>
                  <span>5.5 bar</span>
                </div>
              </div>
            </div>

          </div>

          {/* Automated Protection Toggles & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={thresholds.autoIsolateOnCriticalFlow}
                  onChange={e =>
                    setThresholds({ ...thresholds, autoIsolateOnCriticalFlow: e.target.checked })
                  }
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Auto-Isolate Solenoid on Critical Flow Surge
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={thresholds.autoThrottlePrvOnPressure}
                  onChange={e =>
                    setThresholds({ ...thresholds, autoThrottlePrvOnPressure: e.target.checked })
                  }
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Auto-Modulate PRV on Pressure Breach
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => injectSimulationEvent('PRESSURE_DROP')}
                className="px-3 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 transition-colors cursor-pointer"
              >
                Simulate Pressure Drop
              </button>
              <button
                onClick={handleSaveThresholds}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-sm transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save &amp; Arm Thresholds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Streaming Charts Grid with Live Custom Threshold ReferenceLines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Real-Time Live Flow Velocity (L/min) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Inflow vs Outflow Velocity (L/min)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Plotted against custom warning ({thresholds.flowWarningLpm} L/m) and critical ({thresholds.flowCriticalLpm} L/m) ceilings
              </p>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-200/60 dark:border-cyan-800">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping"></span>
              3s stream
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={Array.isArray(streamHistory) ? streamHistory : []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis domain={[10, Math.max(80, thresholds.flowCriticalLpm + 10)]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                />
                <ReferenceLine
                  y={thresholds.flowWarningLpm}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{ value: `Warn (${thresholds.flowWarningLpm} L/m)`, fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }}
                />
                <ReferenceLine
                  y={thresholds.flowCriticalLpm}
                  stroke="#f43f5e"
                  strokeDasharray="3 3"
                  label={{ value: `Critical (${thresholds.flowCriticalLpm} L/m)`, fill: '#f43f5e', fontSize: 10, position: 'insideBottomRight' }}
                />
                <Line type="monotone" dataKey="inlet" name="Inlet Flow (L/min)" stroke="#0284c7" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="outlet" name="Outlet Metered (L/min)" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Hydraulic Pressure Stream (bar) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Hydraulic Line Pressure (bar)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monitored against custom safe pressure band ({thresholds.pressureMinBar} – {thresholds.pressureMaxBar} bar)
              </p>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              isPressureBreached
                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
            }`}>
              {isPressureBreached ? 'Threshold Breached' : 'Within Custom Band'}
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={Array.isArray(streamHistory) ? streamHistory : []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis domain={[1.0, 5.8]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                />
                <ReferenceLine
                  y={thresholds.pressureMinBar}
                  stroke="#f43f5e"
                  strokeDasharray="4 4"
                  label={{ value: `Min Floor (${thresholds.pressureMinBar} bar)`, fill: '#f43f5e', fontSize: 10, position: 'insideBottomRight' }}
                />
                <ReferenceLine
                  y={thresholds.pressureMaxBar}
                  stroke="#6366f1"
                  strokeDasharray="4 4"
                  label={{ value: `Max Ceiling (${thresholds.pressureMaxBar} bar)`, fill: '#6366f1', fontSize: 10, position: 'insideTopRight' }}
                />
                <Line type="monotone" dataKey="pressure" name="Line Pressure (bar)" stroke="#f43f5e" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Sensor Metadata & Transducer State Bar */}
      <div className="bg-slate-900 dark:bg-slate-900/90 text-white rounded-2xl p-5 border border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-bold text-sm">Active Transducer Telemetry Hub</span>
            <span className="text-xs text-slate-400 font-mono">ID: FLW-101-BLOCK-A</span>
          </div>
          <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            LoRaWAN Uplink: Nominal (SF7 / 868 MHz)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
          <div>
            <span className="text-slate-400 block">Battery Level</span>
            <span className="font-bold text-slate-200 flex items-center gap-1.5 mt-0.5">
              <Battery className="w-4 h-4 text-emerald-400" />
              98% (LiSOCl2 3.6V)
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">RSSI Signal Strength</span>
            <span className="font-bold text-slate-200 flex items-center gap-1.5 mt-0.5">
              <Wifi className="w-4 h-4 text-cyan-400" />
              -62 dBm (Excellent)
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Packet Error Rate</span>
            <span className="font-bold text-slate-200 mt-0.5 block font-mono">
              0.02% (0 dropped / 14,200)
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Last Transmission</span>
            <span className="font-bold text-slate-200 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
