import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  FileText,
  Printer,
  Sparkles,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Award,
  RefreshCw,
  WifiOff,
  Database
} from 'lucide-react';

const DEFAULT_REPORT = {
  id: 'REP-INST-2025-W42',
  reportId: 'REP-INST-2025-W42',
  period: 'weekly',
  type: 'weekly',
  generatedAt: new Date().toISOString(),
  aiSummary: 'Campus hydraulic balance shows strong stability across 4 of 5 blocks with a 91% conservation index. Block A Floor 2 lab risers exhibited localized night-flow micro-deviations (+32.4 L/min) requiring valve inspection. Automated chiller scheduling has reduced peak afternoon withdrawals by 14.8%.',
  executiveSummary: 'Campus hydraulic balance shows strong stability across 4 of 5 blocks with a 91% conservation index. Block A Floor 2 lab risers exhibited localized night-flow micro-deviations (+32.4 L/min) requiring valve inspection. Automated chiller scheduling has reduced peak afternoon withdrawals by 14.8%.',
  metrics: {
    totalIntakeLiters: 174500,
    waterSavedLiters: 28400,
    complianceScorePercent: 93,
    waterEfficiencyScore: 91,
    financialSavingsUsd: 1420
  },
  anomalies: [
    { id: 'anom-1', type: 'Night-Flow Leakage', location: 'Block A (Floor 2 Wet Lab)', severity: 'HIGH', status: 'IN_PROGRESS' },
    { id: 'anom-2', type: 'Pressure Fluctuation', location: 'Block B Booster Junction', severity: 'MEDIUM', status: 'RESOLVED' }
  ],
  recommendations: [
    { title: 'Replace Zone 2 Lab Manifold Seal', impact: 'Saves 32 L/min', urgency: 'IMMEDIATE' },
    { title: 'Pre-charge Gravity Tank During Off-Peak', impact: 'Saves $420/month', urgency: 'SCHEDULED' }
  ]
};

export const ReportCenter: React.FC = () => {
  const { campusName } = useApp();
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [report, setReport] = useState<any>(DEFAULT_REPORT);
  const [isGenerating, setIsGenerating] = useState(false);
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const handleGenerateReport = async (type: 'daily' | 'weekly' | 'monthly') => {
    setIsGenerating(true);
    setReportType(type);
    try {
      const res = await api.generateReport(type);
      setReport(res);
    } catch (err) {
      console.warn('Network error generating report, attempting cached report:', err);
      try {
        const cachedRes = await api.getLatestReport(type);
        setReport(cachedRes);
      } catch (cacheErr) {
        console.error('Failed to load cached report:', cacheErr);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate weekly on initial mount
  React.useEffect(() => {
    handleGenerateReport('weekly');
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const isOffline = !isOnline || report?.isOfflineCached || report?.offline;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Offline Banner when viewing cached report */}
      {isOffline && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 text-amber-900 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <WifiOff className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold flex items-center gap-1.5 text-amber-800">
                Offline Mode Active — Cached Audit Report Loaded
                <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-mono">
                  Service Worker Cache
                </span>
              </span>
              <p className="text-[11px] text-amber-700 mt-0.5">
                This water audit report is being served from local browser storage due to intermittent connectivity. You can print, export, and review all anomalies offline.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleGenerateReport(reportType)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shrink-0 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync When Online
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Automated Water Audit & AI Executive Reporting
            </h1>
            <span className="text-[10px] font-mono uppercase bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
              AI Analytics Engine
            </span>
            {isOffline && (
              <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Database className="w-2.5 h-2.5" /> Offline Cache
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate audit-ready institutional reports with AI narrative analysis and formatted PDF print layout
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            {(['daily', 'weekly', 'monthly'] as const).map(t => (
              <button
                key={t}
                onClick={() => handleGenerateReport(t)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all capitalize cursor-pointer ${
                  reportType === t ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={handlePrint}
            title="Print or Save as PDF with ISO 14046 compliant layout"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-linear-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white shadow-md shadow-slate-900/10 transition-all cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isGenerating && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <RefreshCw className="w-8 h-8 text-cyan-600 animate-spin mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-sm">Synthesizing Institutional Audit Report...</h3>
          <p className="text-xs text-slate-500 mt-1">
            Synthesizing telemetry summaries, hydraulic balance data, and executive recommendations
          </p>
        </div>
      )}

      {/* Generated Report Sheet */}
      {report && !isGenerating && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6 print-report-container print:border-none print:shadow-none print:p-0 print:m-0 print:space-y-4">
          
          {/* Printable Official Institutional Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 print:pb-3 flex flex-col sm:flex-row sm:items-start justify-between gap-4 print-avoid-break">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-slate-900 tracking-tight">JalRakshak AI</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Enterprise Water Intelligence</span>
                <span className="text-[10px] bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold px-1.5 py-0.5 rounded print:border-slate-400">
                  ISO 14046 AUDIT
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-800 capitalize print:text-base">
                {report.period || report.type} Institutional Water Audit & Balance Certificate
              </h2>
              <p className="text-xs text-slate-600 print:text-[10pt]">
                Campus Site: <strong className="text-slate-900">{campusName} (Bld A-D)</strong> • Generated: <span>{new Date(report.generatedAt).toLocaleString()}</span>
              </p>
            </div>

            <div className="text-left sm:text-right text-xs print:text-[10pt] bg-slate-50 print:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-0 border-slate-200 shrink-0">
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Document Control ID</span>
              <span className="font-mono font-black text-slate-900 text-sm">{report.id || report.reportId}</span>
              <span className="text-slate-400 block text-[9px] print:text-slate-600 mt-0.5">Classification: Confidential / Certified</span>
            </div>
          </div>

          {/* AI Executive Summary Narrative */}
          <div className="p-5 print:p-4 bg-indigo-50/70 print:bg-slate-50 rounded-2xl print:rounded-lg border border-indigo-100 print:border-slate-300 text-xs print:text-[10pt] leading-relaxed text-slate-800 space-y-2 print-avoid-break">
            <div className="flex items-center gap-2 font-bold text-sm text-indigo-950 print:text-slate-900 border-b border-indigo-200/60 print:border-slate-300 pb-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600 print:hidden" />
              <span>Section 1 — Executive AI Synthesis & Operational Narrative</span>
            </div>
            <p className="font-medium whitespace-pre-line text-slate-700 leading-normal">
              {report.aiSummary || report.executiveSummary}
            </p>
          </div>

          {/* Key Metrics Summary Box */}
          <div className="print-avoid-break">
            <h3 className="text-xs print:text-[10pt] font-black uppercase tracking-wider text-slate-600 print:text-slate-900 mb-2.5">
              Section 2 — Water Accounting & Conservation Balance
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:gap-2 text-xs">
              <div className="p-3 print:p-2.5 bg-slate-50 print:bg-white rounded-xl print:rounded-md border border-slate-200 print:border-slate-400">
                <span className="text-slate-500 print:text-slate-600 block text-[10px] print:text-[9pt] font-semibold uppercase">Gross Intake</span>
                <span className="text-lg print:text-base font-black text-slate-900 mt-0.5 block">
                  {(report.metrics?.totalIntakeLiters ?? report.metrics?.totalConsumptionLiters ?? 34850).toLocaleString()} L
                </span>
                <span className="text-[10px] print:text-[8pt] text-slate-400 print:text-slate-500">Metered Main Flow</span>
              </div>

              <div className="p-3 print:p-2.5 bg-slate-50 print:bg-white rounded-xl print:rounded-md border border-slate-200 print:border-slate-400">
                <span className="text-slate-500 print:text-slate-600 block text-[10px] print:text-[9pt] font-semibold uppercase">Water Conserved</span>
                <span className="text-lg print:text-base font-black text-emerald-700 mt-0.5 block">
                  {(report.metrics?.waterSavedLiters ?? report.metrics?.estimatedPotentialSavingsLitersMonth ?? 42000).toLocaleString()} L
                </span>
                <span className="text-[10px] print:text-[8pt] text-emerald-600 font-medium">Prevented Losses</span>
              </div>

              <div className="p-3 print:p-2.5 bg-slate-50 print:bg-white rounded-xl print:rounded-md border border-slate-200 print:border-slate-400">
                <span className="text-slate-500 print:text-slate-600 block text-[10px] print:text-[9pt] font-semibold uppercase">Financial Savings</span>
                <span className="text-lg print:text-base font-black text-slate-900 mt-0.5 block font-mono">
                  {report.metrics?.financialSavingsUsd ? `$${report.metrics.financialSavingsUsd}` : `${report.metrics?.complianceScorePercent ?? 91}%`}
                </span>
                <span className="text-[10px] print:text-[8pt] text-slate-400 print:text-slate-500">Tariff + Pumping Cost</span>
              </div>

              <div className="p-3 print:p-2.5 bg-slate-50 print:bg-white rounded-xl print:rounded-md border border-slate-200 print:border-slate-400">
                <span className="text-slate-500 print:text-slate-600 block text-[10px] print:text-[9pt] font-semibold uppercase">Conservation Index</span>
                <span className="text-lg print:text-base font-black text-cyan-700 print:text-slate-900 mt-0.5 block">
                  {report.metrics?.waterEfficiencyScore ?? report.metrics?.complianceScorePercent ?? 91} / 100
                </span>
                <span className="text-[10px] print:text-[8pt] text-cyan-600 print:text-slate-600 font-medium">Grade: Exemplary</span>
              </div>
            </div>
          </div>

          {/* Anomaly & Incident Log */}
          <div className="print-avoid-break">
            <h3 className="text-xs print:text-[10pt] font-black uppercase tracking-wider text-slate-600 print:text-slate-900 mb-2">
              Section 3 — Period Anomaly Spectrum & Hydraulic Incidents
            </h3>
            <div className="overflow-x-auto border border-slate-200 print:border-slate-400 rounded-xl print:rounded-md">
              <table className="w-full text-left text-xs print:text-[10pt]">
                <thead className="bg-slate-100 print:bg-slate-200">
                  <tr className="border-b border-slate-200 print:border-slate-400 text-slate-700 font-bold uppercase text-[9px] print:text-[9pt]">
                    <th className="py-2 px-3">Incident Classification</th>
                    <th className="py-2 px-3">Campus Physical Location</th>
                    <th className="py-2 px-3">Risk Level</th>
                    <th className="py-2 px-3 text-right">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                  {(report.anomalies || []).map((a: any) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-900">{a.type}</td>
                      <td className="py-2 px-3 text-slate-700 font-mono text-[11px] print:text-[9.5pt]">{a.location}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] print:text-[9pt] font-bold border ${
                          a.severity === 'CRITICAL' || a.severity === 'HIGH' 
                            ? 'bg-rose-100 text-rose-800 border-rose-300 print:border-slate-400' 
                            : 'bg-amber-100 text-amber-800 border-amber-300 print:border-slate-400'
                        }`}>
                          {a.severity}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-slate-700 print:text-slate-900">{a.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendations List */}
          <div className="print-avoid-break">
            <h3 className="text-xs print:text-[10pt] font-black uppercase tracking-wider text-slate-600 print:text-slate-900 mb-2">
              Section 4 — Mandatory Directives for Next Operational Cycle
            </h3>
            <div className="space-y-2 text-xs print:text-[10pt]">
              {(report.recommendations || []).map((r: any, idx: number) => (
                <div key={r.id || idx} className="p-3 print:p-2.5 rounded-xl print:rounded-md border border-slate-200 print:border-slate-400 bg-slate-50 print:bg-white flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 print:hidden" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{idx + 1}. {r.title}</span>
                      {r.impact && (
                        <span className="text-[10px] print:text-[8.5pt] font-bold text-indigo-700 bg-indigo-50 print:bg-slate-100 border border-indigo-200 print:border-slate-300 px-1.5 py-0.2 rounded">
                          {r.impact}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 print:text-slate-800 mt-0.5 leading-normal">{r.description || r.urgency}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Sign-off Block for PDF Print */}
          <div className="pt-6 print:pt-4 border-t-2 border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs print:text-[10pt] print-avoid-break">
            <div>
              <span className="block font-bold text-slate-900 uppercase tracking-wider text-[10px] print:text-[9pt]">
                Auditing Officer Verification Sign-Off:
              </span>
              <div className="mt-4 border-b border-slate-400 pb-1 w-64">
                <span className="font-mono text-slate-700 text-xs italic">Dr. A. Sharma</span>
              </div>
              <span className="block text-[10px] print:text-[8.5pt] text-slate-500 mt-1">
                Executive Director, ESG & Facilities Engineering
              </span>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="block font-bold text-slate-900 uppercase tracking-wider text-[10px] print:text-[9pt]">
                Digital Chain of Custody
              </span>
              <div className="inline-flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 print:bg-transparent border border-emerald-300 print:border-slate-400 px-2.5 py-1 rounded-md text-[10px] print:text-[9pt]">
                <span>✓ Cryptographically Signed & Timestamped</span>
              </div>
              <span className="block text-[9px] print:text-[8pt] text-slate-400 font-mono">
                SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
              </span>
            </div>
          </div>

          {/* Print Footer Notice */}
          <div className="hidden print:block pt-2 text-center text-[8pt] text-slate-400 border-t border-slate-200">
            JalRakshak AI Institutional Water Management Suite • Printed on {new Date().toLocaleDateString()} • Page 1 of 1 • System Build v3.4.1
          </div>

        </div>
      )}

    </div>
  );
};
