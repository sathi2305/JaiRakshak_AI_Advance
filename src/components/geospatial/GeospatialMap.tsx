import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  Layers,
  Activity,
  AlertOctagon,
  Droplets,
  Flame,
  Sliders,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
  Compass,
  Eye,
  Radio,
  ArrowUpRight
} from 'lucide-react';

export type HeatmapMetricMode = 'WATER_LOSS_LPH' | 'NRW_PERCENT' | 'PRESSURE_DEFICIT';

export interface DistrictZone {
  id: string;
  buildingId: string;
  code: string;
  name: string;
  districtName: string;
  x: number; // percentage 0..100
  y: number; // percentage 0..100
  polygonPoints: string; // SVG 0..1000 coordinate space
  baseWaterLossLph: number;
  inletFlowLpm: number;
  meteredFlowLpm: number;
  nrwPercent: number;
  pressureBar: number;
  targetPressureBar: number;
  risk: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  activeLeakHotspots: number;
  pipeMaterial: string;
  prvValveId: string;
  type: 'building' | 'utility' | 'reservoir';
  subHotspots: { dx: number; dy: number; weight: number }[];
}

const INITIAL_DISTRICTS: DistrictZone[] = [
  {
    id: 'dma-01',
    buildingId: 'bld-1',
    code: 'DMA-01 (NORTH-WEST)',
    name: 'Engineering & Innovation (Block A)',
    districtName: 'District 01 — North Academic & Lab Sector',
    x: 32,
    y: 38,
    polygonPoints: '80,140 460,140 440,510 80,490',
    baseWaterLossLph: 1240,
    inletFlowLpm: 48.5,
    meteredFlowLpm: 27.8,
    nrwPercent: 28.4,
    pressureBar: 2.7,
    targetPressureBar: 3.8,
    risk: 87,
    riskLevel: 'HIGH',
    activeLeakHotspots: 3,
    pipeMaterial: 'CPVC Schedule 80 (2018)',
    prvValveId: 'PRV-DMA01-A',
    type: 'building',
    subHotspots: [
      { dx: 0, dy: 0, weight: 1.0 },
      { dx: -5, dy: 4, weight: 0.72 },
      { dx: 6, dy: -3, weight: 0.65 }
    ]
  },
  {
    id: 'dma-02',
    buildingId: 'bld-2',
    code: 'DMA-02 (NORTH-EAST)',
    name: 'Science & Research Labs (Block B)',
    districtName: 'District 02 — East Research & Cryo Quarter',
    x: 68,
    y: 30,
    polygonPoints: '540,120 920,120 920,440 530,440',
    baseWaterLossLph: 410,
    inletFlowLpm: 32.1,
    meteredFlowLpm: 25.3,
    nrwPercent: 12.6,
    pressureBar: 3.5,
    targetPressureBar: 3.8,
    risk: 44,
    riskLevel: 'MEDIUM',
    activeLeakHotspots: 1,
    pipeMaterial: 'Ductile Iron DN150',
    prvValveId: 'PRV-DMA02-B',
    type: 'building',
    subHotspots: [
      { dx: 0, dy: 0, weight: 0.52 },
      { dx: 4, dy: 3, weight: 0.35 }
    ]
  },
  {
    id: 'dma-03',
    buildingId: 'bld-3',
    code: 'DMA-03 (SOUTH-WEST)',
    name: 'Administrative Complex (Block C)',
    districtName: 'District 03 — West Civic & Executive Sector',
    x: 24,
    y: 70,
    polygonPoints: '80,510 430,520 410,880 80,880',
    baseWaterLossLph: 115,
    inletFlowLpm: 14.8,
    meteredFlowLpm: 13.0,
    nrwPercent: 4.5,
    pressureBar: 3.9,
    targetPressureBar: 4.0,
    risk: 15,
    riskLevel: 'LOW',
    activeLeakHotspots: 0,
    pipeMaterial: 'HDPE PE100 SDR11',
    prvValveId: 'PRV-DMA03-C',
    type: 'building',
    subHotspots: [{ dx: 0, dy: 0, weight: 0.22 }]
  },
  {
    id: 'dma-04',
    buildingId: 'bld-4',
    code: 'DMA-04 (SOUTH-EAST)',
    name: 'Student Dining & Hostel D',
    districtName: 'District 04 — Southeast Residential & Culinary Zone',
    x: 74,
    y: 64,
    polygonPoints: '540,460 920,460 920,880 560,880',
    baseWaterLossLph: 680,
    inletFlowLpm: 38.4,
    meteredFlowLpm: 27.1,
    nrwPercent: 18.2,
    pressureBar: 3.1,
    targetPressureBar: 3.8,
    risk: 62,
    riskLevel: 'MEDIUM',
    activeLeakHotspots: 2,
    pipeMaterial: 'Galvanized Steel (2015)',
    prvValveId: 'PRV-DMA04-D',
    type: 'building',
    subHotspots: [
      { dx: 0, dy: 0, weight: 0.74 },
      { dx: -4, dy: 5, weight: 0.48 }
    ]
  },
  {
    id: 'dma-05',
    buildingId: 'bld-5',
    code: 'DMA-05 (SOUTH-CENTRAL)',
    name: 'Central Utility & Chiller Plant',
    districtName: 'District 05 — South HVAC & Greywater Reclamation Hub',
    x: 49,
    y: 82,
    polygonPoints: '420,620 555,620 555,920 415,920',
    baseWaterLossLph: 65,
    inletFlowLpm: 65.0,
    meteredFlowLpm: 63.9,
    nrwPercent: 2.1,
    pressureBar: 4.2,
    targetPressureBar: 4.2,
    risk: 8,
    riskLevel: 'LOW',
    activeLeakHotspots: 0,
    pipeMaterial: 'Stainless Steel 316L',
    prvValveId: 'PRV-DMA05-U',
    type: 'utility',
    subHotspots: [{ dx: 0, dy: 0, weight: 0.16 }]
  },
  {
    id: 'dma-06',
    buildingId: 'node-tank',
    code: 'DMA-06 (NORTH-CENTRAL)',
    name: 'Master Elevated Storage Reservoir',
    districtName: 'District 06 — North Headworks & Trunk Intake Zone',
    x: 50,
    y: 15,
    polygonPoints: '445,40 555,40 540,340 450,340',
    baseWaterLossLph: 40,
    inletFlowLpm: 120.0,
    meteredFlowLpm: 119.3,
    nrwPercent: 1.2,
    pressureBar: 4.8,
    targetPressureBar: 4.8,
    risk: 5,
    riskLevel: 'LOW',
    activeLeakHotspots: 0,
    pipeMaterial: 'Prestressed Concrete Cylinder',
    prvValveId: 'PRV-MAIN-HEAD',
    type: 'reservoir',
    subHotspots: [{ dx: 0, dy: 0, weight: 0.14 }]
  }
];

export const GeospatialMap: React.FC = () => {
  const {
    telemetry,
    simulationMode,
    injectSimulationEvent,
    setActiveTab,
    setActiveBuildingId
  } = useApp();

  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('dma-01');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showDistrictPolygons, setShowDistrictPolygons] = useState<boolean>(true);
  const [showPipes, setShowPipes] = useState<boolean>(true);
  const [showSensors, setShowSensors] = useState<boolean>(true);
  const [metricMode, setMetricMode] = useState<HeatmapMetricMode>('WATER_LOSS_LPH');
  const [plumeRadius, setPlumeRadius] = useState<number>(95);
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(82);
  const [isolatedDistricts, setIsolatedDistricts] = useState<Record<string, boolean>>({});
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute real-time district water loss intensity modulated by live telemetry & isolated valves
  const districts = useMemo(() => {
    const liveFlowFactor = telemetry?.flowRateLpm ? telemetry.flowRateLpm / 48.5 : 1.0;
    const isLeakSim = simulationMode === 'LEAKAGE_RISK';

    return INITIAL_DISTRICTS.map(d => {
      const isIsolated = Boolean(isolatedDistricts[d.id]);
      let lossMultiplier = liveFlowFactor;
      if (d.id === 'dma-01' && isLeakSim) {
        lossMultiplier *= 1.22;
      }
      if (isIsolated) {
        lossMultiplier *= 0.12; // PRV throttled & isolated
      }

      const currentWaterLossLph = Math.round(d.baseWaterLossLph * lossMultiplier);
      const currentNrwPercent = Number(
        Math.min(48, Math.max(0.8, d.nrwPercent * (isIsolated ? 0.2 : lossMultiplier))).toFixed(1)
      );
      const currentPressureBar = isIsolated
        ? Number((d.targetPressureBar * 0.65).toFixed(2))
        : d.id === 'dma-01' && telemetry?.pressureBar
        ? Number(telemetry.pressureBar.toFixed(2))
        : d.pressureBar;
      const pressureDeficitBar = Number(
        Math.max(0, d.targetPressureBar - currentPressureBar).toFixed(2)
      );
      const currentRisk = isIsolated
        ? Math.max(8, Math.round(d.risk * 0.25))
        : d.id === 'dma-01' && telemetry?.leakageRiskPercent
        ? telemetry.leakageRiskPercent
        : d.risk;

      const currentRiskLevel: 'HIGH' | 'MEDIUM' | 'LOW' =
        currentRisk >= 65 ? 'HIGH' : currentRisk >= 35 ? 'MEDIUM' : 'LOW';

      return {
        ...d,
        currentWaterLossLph,
        currentNrwPercent,
        currentPressureBar,
        pressureDeficitBar,
        currentRisk,
        currentRiskLevel,
        isIsolated
      };
    });
  }, [telemetry, simulationMode, isolatedDistricts]);

  const selectedDistrict =
    districts.find(d => d.id === selectedDistrictId) || districts[0];

  const totalCampusLossLph = useMemo(
    () => districts.reduce((sum, d) => sum + d.currentWaterLossLph, 0),
    [districts]
  );

  // Render smooth 2D Kernel Density Thermal Heatmap on Canvas whenever parameters or telemetry change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (!showHeatmap) return;

    // 1. Create an offscreen grayscale alpha intensity buffer
    const alphaCanvas = document.createElement('canvas');
    alphaCanvas.width = width;
    alphaCanvas.height = height;
    const alphaCtx = alphaCanvas.getContext('2d');
    if (!alphaCtx) return;

    districts.forEach(d => {
      // Determine normalized intensity [0.08 .. 1.0] based on selected metric mode
      let normIntensity = 0.2;
      if (metricMode === 'WATER_LOSS_LPH') {
        normIntensity = Math.min(1, Math.max(0.1, d.currentWaterLossLph / 1300));
      } else if (metricMode === 'NRW_PERCENT') {
        normIntensity = Math.min(1, Math.max(0.1, d.currentNrwPercent / 30));
      } else {
        normIntensity = Math.min(1, Math.max(0.1, d.pressureDeficitBar / 1.4));
      }

      d.subHotspots.forEach(sub => {
        const cx = ((d.x + sub.dx) / 100) * width;
        const cy = ((d.y + sub.dy) / 100) * height;
        const r = plumeRadius * (0.75 + sub.weight * 0.45);
        const pointAlpha = Math.min(1, normIntensity * sub.weight);

        const grad = alphaCtx.createRadialGradient(cx, cy, r * 0.06, cx, cy, r);
        grad.addColorStop(0, `rgba(0, 0, 0, ${pointAlpha})`);
        grad.addColorStop(0.45, `rgba(0, 0, 0, ${pointAlpha * 0.55})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        alphaCtx.fillStyle = grad;
        alphaCtx.beginPath();
        alphaCtx.arc(cx, cy, r, 0, Math.PI * 2);
        alphaCtx.fill();
      });
    });

    // 2. Colorize the intensity field using a hydrological thermal LUT:
    // Low (Cyan/Teal) -> Moderate (Emerald/Yellow) -> Elevated (Amber/Orange) -> Critical (Crimson/Magenta)
    const imgData = alphaCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3]; // 0..255
      if (a < 4) {
        data[i + 3] = 0;
        continue;
      }
      const t = a / 255; // normalized 0..1
      let r = 0;
      let g = 0;
      let b = 0;

      if (t < 0.25) {
        // Deep Cyan -> Emerald
        const k = t / 0.25;
        r = Math.round(6 + k * 10);
        g = Math.round(182 + k * 3);
        b = Math.round(212 - k * 83);
      } else if (t < 0.55) {
        // Emerald -> Amber Yellow
        const k = (t - 0.25) / 0.3;
        r = Math.round(16 + k * 229);
        g = Math.round(185 - k * 27);
        b = Math.round(129 - k * 118);
      } else if (t < 0.8) {
        // Amber -> Vivid Orange/Red
        const k = (t - 0.55) / 0.25;
        r = Math.round(245 - k * 6);
        g = Math.round(158 - k * 90);
        b = Math.round(11 + k * 57);
      } else {
        // Vivid Red -> Critical Crimson/White-Hot Core
        const k = (t - 0.8) / 0.2;
        r = Math.round(239 + k * 16);
        g = Math.round(68 - k * 40);
        b = Math.round(68 + k * 60);
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = Math.min(245, Math.round(a * (heatmapOpacity / 100) * 1.15));
    }

    ctx.putImageData(imgData, 0, 0);
  }, [districts, showHeatmap, metricMode, plumeRadius, heatmapOpacity]);

  const handleToggleIsolateDistrict = (district: typeof districts[0]) => {
    const nextState = !district.isIsolated;
    setIsolatedDistricts(prev => ({ ...prev, [district.id]: nextState }));
    setStatusBanner(
      nextState
        ? `Actuated ${district.prvValveId}: Throttled pressure in ${district.districtName}, curbing water loss by 88%.`
        : `Restored nominal PRV opening for ${district.prvValveId} in ${district.districtName}.`
    );
    setTimeout(() => setStatusBanner(null), 4500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header & Layer Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              Geo-Spatial Water Loss Heatmap & District GIS
            </h1>
            <span className="text-[10px] font-mono uppercase bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-500" />
              Live Thermal Loss Layer
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time kernel-density water loss intensity across 6 District Metered Areas (DMAs) • Total Campus Unaccounted Loss:{' '}
            <strong className="text-rose-600 dark:text-rose-400 font-mono">{totalCampusLossLph.toLocaleString()} L/hr</strong>
          </p>
        </div>

        {/* Layer & Metric Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
              showHeatmap
                ? 'bg-linear-to-r from-rose-600 to-amber-600 text-white border-rose-500 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Loss Heatmap {showHeatmap ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDistrictPolygons(!showDistrictPolygons)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition-colors cursor-pointer ${
              showDistrictPolygons
                ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            District Boundaries {showDistrictPolygons ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            onClick={() => setShowPipes(!showPipes)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition-colors cursor-pointer ${
              showPipes
                ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            Hydraulic Mains {showPipes ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            onClick={() => setShowSensors(!showSensors)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition-colors cursor-pointer ${
              showSensors
                ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            DMA Nodes {showSensors ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Live Actuation Banner */}
      {statusBanner && (
        <div className="p-3.5 rounded-2xl bg-emerald-950 text-emerald-200 border border-emerald-700/60 flex items-center justify-between text-xs font-bold animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-emerald-400 hover:text-white text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Heatmap Parameter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs">
        {/* Metric Mode Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-cyan-500" />
            <span>Heatmap Intensity Layer:</span>
          </span>
          {(
            [
              { id: 'WATER_LOSS_LPH', label: 'Water Loss Intensity (L/hr)' },
              { id: 'NRW_PERCENT', label: 'Non-Revenue Water (NRW %)' },
              { id: 'PRESSURE_DEFICIT', label: 'Pressure Deficit (bar)' }
            ] as { id: HeatmapMetricMode; label: string }[]
          ).map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMetricMode(m.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                metricMode === m.id
                  ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Thermal Radius & Opacity Sliders */}
        <div className="flex flex-wrap items-center gap-5 text-xs">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-cyan-500" />
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Plume Radius:</span>
            <input
              type="range"
              min={55}
              max={145}
              value={plumeRadius}
              onChange={e => setPlumeRadius(Number(e.target.value))}
              className="w-24 accent-cyan-600 cursor-pointer"
            />
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 w-10">
              {plumeRadius}px
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Thermal Opacity:</span>
            <input
              type="range"
              min={35}
              max={100}
              value={heatmapOpacity}
              onChange={e => setHeatmapOpacity(Number(e.target.value))}
              className="w-24 accent-rose-600 cursor-pointer"
            />
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 w-10">
              {heatmapOpacity}%
            </span>
          </div>
        </div>
      </div>

      {/* Main GIS Map Viewport & District Telemetry Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Geographical Heatmap Canvas (2 Columns) */}
        <div className="lg:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 p-5 relative overflow-hidden shadow-2xl min-h-[500px] flex flex-col justify-between">
          
          {/* Subtle Topographic Grid Lines */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
              backgroundSize: '36px 36px'
            }}
          />

          {/* Top Bar Legend & Thermal Color Scale */}
          <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80 text-[11px] text-slate-300">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono uppercase text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" />
                <span>DMA Thermal Loss Scale:</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-cyan-300 font-mono">0 L/h</span>
                <div className="w-36 h-2.5 rounded-full bg-linear-to-r from-cyan-500 via-emerald-400 via-amber-400 to-rose-600 border border-white/15" />
                <span className="text-[10px] text-rose-400 font-mono font-bold">1,250+ L/h</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  injectSimulationEvent(simulationMode === 'LEAKAGE_RISK' ? 'RESET' : 'LEAK')
                }
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                  simulationMode === 'LEAKAGE_RISK'
                    ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-500'
                }`}
              >
                <Radio className="w-3 h-3" />
                <span>{simulationMode === 'LEAKAGE_RISK' ? 'Burst Plume Active' : 'Test Burst Plume'}</span>
              </button>
            </div>
          </div>

          {/* Central Spatial Stage: 2D Thermal Canvas + SVG District Polygons + Nodes */}
          <div className="relative flex-1 w-full min-h-[390px] my-2">
            {/* Layer 1: HTML5 2D Kernel Density Heatmap Canvas */}
            <canvas
              ref={canvasRef}
              width={900}
              height={520}
              className="absolute inset-0 w-full h-full pointer-events-none z-10 mix-blend-screen"
            />

            {/* Layer 2: SVG District Metered Area (DMA) Polygons & Underground Trunk Mains */}
            <svg
              viewBox="0 0 1000 1000"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full z-15"
            >
              <defs>
                <linearGradient id="pipeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.45" />
                </linearGradient>
              </defs>

              {/* District Polygon Boundaries */}
              {showDistrictPolygons &&
                districts.map(d => {
                  const isSelected = d.id === selectedDistrict.id;
                  const strokeColor =
                    d.currentRiskLevel === 'HIGH'
                      ? '#fb7185'
                      : d.currentRiskLevel === 'MEDIUM'
                      ? '#fbbf24'
                      : '#38bdf8';
                  return (
                    <g
                      key={d.id}
                      onClick={() => setSelectedDistrictId(d.id)}
                      className="cursor-pointer transition-opacity"
                    >
                      <polygon
                        points={d.polygonPoints}
                        fill={
                          isSelected
                            ? 'rgba(6, 182, 212, 0.10)'
                            : 'rgba(15, 23, 42, 0.18)'
                        }
                        stroke={isSelected ? '#22d3ee' : strokeColor}
                        strokeWidth={isSelected ? 4 : 2}
                        strokeDasharray={isSelected ? 'none' : '8 6'}
                      />
                    </g>
                  );
                })}

              {/* Hydraulic Distribution Mains */}
              {showPipes && (
                <g className="pointer-events-none">
                  <line x1="500" y1="150" x2="320" y2="380" stroke="url(#pipeGlow)" strokeWidth="5" strokeDasharray="10 5" />
                  <line x1="500" y1="150" x2="680" y2="300" stroke="url(#pipeGlow)" strokeWidth="5" strokeDasharray="10 5" />
                  <line x1="320" y1="380" x2="240" y2="700" stroke="url(#pipeGlow)" strokeWidth="5" />
                  <line x1="680" y1="300" x2="740" y2="640" stroke="url(#pipeGlow)" strokeWidth="5" />
                  <line x1="240" y1="700" x2="490" y2="820" stroke="url(#pipeGlow)" strokeWidth="6" />
                  <line x1="740" y1="640" x2="490" y2="820" stroke="url(#pipeGlow)" strokeWidth="6" />
                </g>
              )}
            </svg>

            {/* Layer 3: Interactive District Telemetry Markers & Labels */}
            {showSensors &&
              districts.map(d => {
                const isSelected = selectedDistrict.id === d.id;
                const isCritical = d.currentRiskLevel === 'HIGH';

                const badgeValue =
                  metricMode === 'WATER_LOSS_LPH'
                    ? `${d.currentWaterLossLph} L/h`
                    : metricMode === 'NRW_PERCENT'
                    ? `${d.currentNrwPercent}% NRW`
                    : `-${d.pressureDeficitBar} bar`;

                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDistrictId(d.id)}
                    style={{ left: `${d.x}%`, top: `${d.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                  >
                    {/* Pulse Halo for High Water Loss Districts */}
                    {isCritical && (
                      <span className="absolute -inset-3 rounded-full bg-rose-500/40 animate-ping pointer-events-none" />
                    )}

                    <div className="flex flex-col items-center">
                      {/* District Marker Icon */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-xl ${
                          d.isIsolated
                            ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                            : isCritical
                            ? 'bg-rose-600 text-white ring-2 ring-rose-300'
                            : d.currentRiskLevel === 'MEDIUM'
                            ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                            : 'bg-emerald-600 text-white ring-1 ring-emerald-300'
                        } ${isSelected ? 'scale-125 ring-4 ring-cyan-300' : 'group-hover:scale-110'}`}
                      >
                        {d.type === 'reservoir' ? (
                          <Droplets className="w-5 h-5" />
                        ) : d.type === 'utility' ? (
                          <Activity className="w-5 h-5" />
                        ) : (
                          <MapPin className="w-5 h-5" />
                        )}
                      </div>

                      {/* Always-Visible Compact District Loss Callout Pill */}
                      <div
                        className={`mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold whitespace-nowrap border shadow-md backdrop-blur-xs ${
                          isSelected
                            ? 'bg-cyan-950/95 text-cyan-200 border-cyan-400'
                            : isCritical
                            ? 'bg-rose-950/95 text-rose-200 border-rose-500/70'
                            : 'bg-slate-900/90 text-slate-200 border-slate-700'
                        }`}
                      >
                        <span>{d.id.toUpperCase()}</span>
                        <span className="mx-1 text-slate-500">•</span>
                        <span className={isCritical ? 'text-rose-300' : 'text-cyan-300'}>
                          {badgeValue}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Bottom Map Telemetry Bar */}
          <div className="relative z-20 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
            <span>Coordinate System: UTM Zone 43N • 6 District Metered Areas (DMAs)</span>
            <span className="text-rose-400 font-bold flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Peak Thermal Plume: District 01 — Block A Lab Riser ({districts[0].currentWaterLossLph} L/hr)</span>
            </span>
          </div>
        </div>

        {/* Right Column: Selected District Water Loss & DMA Inspector */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 px-2 py-0.5 rounded">
                  {selectedDistrict.code}
                </span>
                <span
                  className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full ${
                    selectedDistrict.currentRiskLevel === 'HIGH'
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      : selectedDistrict.currentRiskLevel === 'MEDIUM'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {selectedDistrict.currentRisk}% LOSS INTENSITY
                </span>
              </div>
              <h2 className="text-base font-black text-slate-900 dark:text-white mt-2">
                {selectedDistrict.districtName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Primary Facility: {selectedDistrict.name}
              </p>
            </div>

            {/* Water Loss Intensity Highlight Box */}
            <div
              className={`p-4 rounded-2xl border ${
                selectedDistrict.currentRiskLevel === 'HIGH'
                  ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <span>Real-Time Water Loss Intensity</span>
                </span>
                <span className="text-lg font-black font-mono text-rose-600 dark:text-rose-400">
                  {selectedDistrict.currentWaterLossLph.toLocaleString()} L/hr
                </span>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mt-2.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    selectedDistrict.currentRiskLevel === 'HIGH'
                      ? 'bg-linear-to-r from-amber-500 to-rose-600'
                      : selectedDistrict.currentRiskLevel === 'MEDIUM'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.round((selectedDistrict.currentWaterLossLph / 1400) * 100))}%`
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                <span>
                  Daily LossProj:{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {(selectedDistrict.currentWaterLossLph * 24).toLocaleString()} L/day
                  </strong>
                </span>
                <span>
                  NRW Share:{' '}
                  <strong className="text-rose-600 dark:text-rose-400">
                    {selectedDistrict.currentNrwPercent}%
                  </strong>
                </span>
              </div>
            </div>

            {/* District Hydraulic Balance Metrics */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">District Inlet Flow</span>
                <span className="text-sm font-black font-mono text-slate-900 dark:text-white mt-0.5 block">
                  {selectedDistrict.inletFlowLpm} L/min
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">Billed Metered Flow</span>
                <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {selectedDistrict.meteredFlowLpm} L/min
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">Operating Pressure</span>
                <span className="text-sm font-black font-mono text-slate-900 dark:text-white mt-0.5 block">
                  {selectedDistrict.currentPressureBar} bar
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">Pressure Deficit</span>
                <span className="text-sm font-black font-mono text-amber-600 dark:text-amber-400 mt-0.5 block">
                  -{selectedDistrict.pressureDeficitBar} bar
                </span>
              </div>
            </div>

            {/* Infrastructure Metadata */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Trunk Material:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedDistrict.pipeMaterial}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Boundary PRV Valve:</span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{selectedDistrict.prvValveId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Active Acoustic Plumes:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {selectedDistrict.activeLeakHotspots} Detected
                </span>
              </div>
            </div>
          </div>

          {/* District Control Actions */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => handleToggleIsolateDistrict(selectedDistrict)}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedDistrict.isIsolated
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>
                {selectedDistrict.isIsolated
                  ? `Restore Nominal PRV (${selectedDistrict.prvValveId})`
                  : `Throttle District PRV (${selectedDistrict.prvValveId})`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveBuildingId(selectedDistrict.buildingId);
                setActiveTab('digital-twin');
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Inspect District in Digital Twin</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Full-Width District Metered Area (DMA) Water Loss Intensity Comparison Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>District-by-District Water Loss Intensity Ranking (Live DMA Telemetry)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any district row to focus its geographical heatmap plume and inspect boundary valve telemetry
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
            6 Active Districts Monitored
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {districts.map(d => {
            const isSelected = d.id === selectedDistrict.id;
            return (
              <div
                key={d.id}
                onClick={() => setSelectedDistrictId(d.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-50/40 dark:bg-cyan-950/30 ring-1 ring-cyan-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-cyan-400/50 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-cyan-700 dark:text-cyan-300">
                    {d.code}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full ${
                      d.currentRiskLevel === 'HIGH'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : d.currentRiskLevel === 'MEDIUM'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {d.currentWaterLossLph} L/hr Loss
                  </span>
                </div>

                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white mt-1.5 truncate">
                  {d.districtName}
                </h3>

                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden my-2.5">
                  <div
                    className={`h-full rounded-full ${
                      d.currentRiskLevel === 'HIGH'
                        ? 'bg-rose-500'
                        : d.currentRiskLevel === 'MEDIUM'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.round((d.currentWaterLossLph / 1350) * 100))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>NRW: <strong className="text-slate-800 dark:text-slate-200">{d.currentNrwPercent}%</strong></span>
                  <span>Pressure: <strong className="text-slate-800 dark:text-slate-200">{d.currentPressureBar} bar</strong></span>
                  <span>Hotspots: <strong className="text-rose-600 dark:text-rose-400">{d.activeLeakHotspots}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
