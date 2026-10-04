import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import {
  DepartmentStanding,
  DepartmentBadge,
  DepartmentInitiative
} from '../../types';
import {
  INITIAL_DEPARTMENT_BADGES,
  INITIAL_DEPARTMENT_STANDINGS,
  PRESET_PLEDGE_INITIATIVES
} from '../../data/departmentSustainability';
import {
  Leaf,
  Award,
  Zap,
  TrendingDown,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Trophy,
  Target,
  Sparkles,
  Flame,
  ShieldCheck,
  Droplets,
  Users,
  Building,
  Building2,
  ChevronRight,
  X,
  Plus,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  BarChart2,
  Star,
  ThumbsUp,
  Heart,
  Share2,
  Medal,
  Crown,
  Moon,
  AlertTriangle,
  Eye,
  ArrowUpDown,
  ChevronDown
} from 'lucide-react';

const DEFAULT_SUSTAINABILITY = {
  score: 84,
  waterSavedYtdLiters: 1240000,
  energySavedKwh: 4850,
  co2AvoidedKg: 3980,
  costSavingsUsd: 18600
};

export const SustainabilityCenter: React.FC = () => {
  const [data, setData] = useState<any>(DEFAULT_SUSTAINABILITY);
  const [departments, setDepartments] = useState<DepartmentStanding[]>(INITIAL_DEPARTMENT_STANDINGS);
  const [badges, setBadges] = useState<DepartmentBadge[]>(INITIAL_DEPARTMENT_BADGES);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Tabs
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'efficiency' | 'savings' | 'perCapita' | 'cheers'>('efficiency');
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [badgeCategoryFilter, setBadgeCategoryFilter] = useState<string>('ALL');

  // Modals state
  const [selectedDeptForDetail, setSelectedDeptForDetail] = useState<DepartmentStanding | null>(null);
  const [isPledgeModalOpen, setIsPledgeModalOpen] = useState(false);
  const [pledgeTargetDeptId, setPledgeTargetDeptId] = useState<string>('');
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareDeptAId, setCompareDeptAId] = useState<string>('dept-biotech');
  const [compareDeptBId, setCompareDeptBId] = useState<string>('dept-admin');

  // Pledge Form State
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [customTitle, setCustomTitle] = useState('');
  const [customSavingsLpd, setCustomSavingsLpd] = useState<number>(1800);
  const [customCategory, setCustomCategory] = useState('Hardware Retrofit');
  const [customDescription, setCustomDescription] = useState('');
  const [isSubmittingPledge, setIsSubmittingPledge] = useState(false);

  // Fetch Sustainability & Department Data
  const loadData = () => {
    setIsLoading(true);
    api.getSustainability()
      .then(res => {
        if (res && typeof res === 'object') {
          const normalized = {
            score: res.score ?? res.efficiencyScore?.score ?? DEFAULT_SUSTAINABILITY.score,
            waterSavedYtdLiters: res.waterSavedYtdLiters ?? res.impact?.totalWaterSavedLiters ?? DEFAULT_SUSTAINABILITY.waterSavedYtdLiters,
            energySavedKwh: res.energySavedKwh ?? res.impact?.energySavedKwh ?? DEFAULT_SUSTAINABILITY.energySavedKwh,
            co2AvoidedKg: res.co2AvoidedKg ?? res.impact?.carbonAvoidedKgCo2e ?? DEFAULT_SUSTAINABILITY.co2AvoidedKg,
            costSavingsUsd: res.costSavingsUsd ?? res.impact?.costSavingsUsd ?? DEFAULT_SUSTAINABILITY.costSavingsUsd
          };
          setData(normalized);

          if (Array.isArray(res.departments) && res.departments.length > 0) {
            setDepartments(res.departments);
          }
          if (Array.isArray(res.departmentBadges) && res.departmentBadges.length > 0) {
            setBadges(res.departmentBadges);
          }
        }
      })
      .catch(err => {
        console.warn('Using baseline sustainability data:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Cheer / Endorse a Department
  const handleCheer = async (e: React.MouseEvent, deptId: string) => {
    e.stopPropagation();
    try {
      await api.cheerDepartment(deptId);
      setDepartments(prev =>
        prev.map(d => (d.id === deptId ? { ...d, cheerCount: d.cheerCount + 1 } : d))
      );
      const target = departments.find(d => d.id === deptId);
      triggerToast(`🎉 Cheered for ${target?.name || 'Department'}! Morale score boosted.`);
    } catch {
      // Local fallback
      setDepartments(prev =>
        prev.map(d => (d.id === deptId ? { ...d, cheerCount: d.cheerCount + 1 } : d))
      );
    }
  };

  // Submit Pledge / Initiative
  const handleSubmitPledge = async (e: React.FormEvent) => {
    e.preventDefault();
    const deptId = pledgeTargetDeptId || departments[0]?.id;
    if (!deptId) return;

    setIsSubmittingPledge(true);
    const preset = PRESET_PLEDGE_INITIATIVES[selectedPresetIndex];
    const title = customTitle.trim() || preset.title;
    const category = customCategory || preset.category;
    const savingsLpd = customSavingsLpd || preset.estimatedDailySavingsLiters;
    const efficiencyBoost = preset.efficiencyBoostPercent || 1.8;
    const description = customDescription.trim() || preset.description;

    try {
      const res = await api.submitConservationPledge({
        departmentId: deptId,
        title,
        category,
        savingsEstimatedLpd: savingsLpd,
        efficiencyBoostPercent: efficiencyBoost,
        impactDescription: description
      });

      if (res && res.departments) {
        setDepartments(res.departments);
      } else {
        // Local simulation fallback
        setDepartments(prev => {
          const updated = prev.map(d => {
            if (d.id === deptId) {
              const newInit: DepartmentInitiative = {
                id: `init-${Date.now()}`,
                title,
                category,
                status: 'ACTIVE',
                savingsEstimatedLpd: savingsLpd,
                impactDescription: description,
                dateStarted: new Date().toISOString().split('T')[0]
              };
              const addedMonthLiters = savingsLpd * 30;
              const newScore = Math.min(99.5, Number((d.efficiencyScore + efficiencyBoost).toFixed(1)));
              return {
                ...d,
                waterSavedLitersMonth: d.waterSavedLitersMonth + addedMonthLiters,
                efficiencyScore: newScore,
                activeInitiatives: [newInit, ...d.activeInitiatives]
              };
            }
            return d;
          });

          // Re-sort and rank
          const sorted = [...updated].sort((a, b) => b.efficiencyScore - a.efficiencyScore);
          sorted.forEach((d, idx) => {
            d.previousRank = d.currentRank;
            d.currentRank = idx + 1;
            if (d.efficiencyScore >= 92) d.tier = 'Diamond';
            else if (d.efficiencyScore >= 88) d.tier = 'Platinum';
            else if (d.efficiencyScore >= 84) d.tier = 'Gold';
            else if (d.efficiencyScore >= 78) d.tier = 'Silver';
            else d.tier = 'Bronze';
          });
          return sorted;
        });
      }

      setIsPledgeModalOpen(false);
      const deptObj = departments.find(d => d.id === deptId);
      triggerToast(`🌿 Conservation initiative registered for ${deptObj?.name}! Efficiency score increased.`);
      // Reset form fields
      setCustomTitle('');
      setCustomDescription('');
    } catch (err) {
      console.error('Failed to submit pledge:', err);
      triggerToast('⚠️ Error submitting pledge. Please check network connection.');
    } finally {
      setIsSubmittingPledge(false);
    }
  };

  // Open pledge modal targeting specific department
  const openPledgeModalFor = (deptId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPledgeTargetDeptId(deptId);
    setIsPledgeModalOpen(true);
  };

  // Filtered & Sorted Departments
  const filteredDepartments = useMemo(() => {
    return departments
      .filter(d => {
        if (selectedCategory !== 'ALL' && d.category !== selectedCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = d.name.toLowerCase().includes(q);
          const matchBuilding = d.buildingName.toLowerCase().includes(q);
          const matchHead = d.headOfDepartment.toLowerCase().includes(q);
          const matchCode = d.shortCode.toLowerCase().includes(q);
          if (!matchName && !matchBuilding && !matchHead && !matchCode) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'efficiency') return b.efficiencyScore - a.efficiencyScore;
        if (sortBy === 'savings') return b.waterSavedLitersMonth - a.waterSavedLitersMonth;
        if (sortBy === 'perCapita') return a.perCapitaLpd - b.perCapitaLpd; // lowest is better
        if (sortBy === 'cheers') return b.cheerCount - a.cheerCount;
        return 0;
      });
  }, [departments, selectedCategory, searchQuery, sortBy]);

  // Top 3 Podium
  const podiumDepartments = useMemo(() => {
    return [...departments]
      .sort((a, b) => b.efficiencyScore - a.efficiencyScore)
      .slice(0, 3);
  }, [departments]);

  // Badge lookup helper
  const getBadgeById = (badgeId: string) => {
    return badges.find(b => b.id === badgeId);
  };

  // Badge Category Filter
  const filteredBadges = useMemo(() => {
    if (badgeCategoryFilter === 'ALL') return badges;
    return badges.filter(b => b.category === badgeCategoryFilter);
  }, [badges, badgeCategoryFilter]);

  // Categories list
  const categories = [
    { id: 'ALL', label: 'All Sectors' },
    { id: 'Academic & Research', label: 'Academic & Labs' },
    { id: 'Student Living & Dining', label: 'Residential Life' },
    { id: 'Operations & Facilities', label: 'Utilities & Plant' },
    { id: 'Administration', label: 'Administration' }
  ];

  // Benchmark factors
  const scoreFactors = [
    { title: 'Baseline Consumption Deviation', score: 18, max: 20, desc: '90% of operational hours within targeted envelope' },
    { title: 'Night Flow Minimum Compliance', score: 14, max: 20, desc: 'Deductions due to Block A lab quiescent trickle' },
    { title: 'Rapid Leak Remediation SLA', score: 19, max: 20, desc: 'Mean institutional ticket resolution under 1.2 hours' },
    { title: 'Rainwater / Greywater Ingress', score: 12, max: 15, desc: '48,500L reclaimed non-potable water cycled this week' },
    { title: 'Low-Flow Aerator Fixture Coverage', score: 14, max: 15, desc: '88% of campus bathroom fixtures retrofitted with 1.5 LPM aerators' },
    { title: 'Occupant-Normalized Intensity', score: 9, max: 10, desc: 'Significantly outperforms regional university LEED benchmark' }
  ];

  // Helper for badge icon component
  const renderBadgeIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      case 'Droplets':
        return <Droplets className={className} />;
      case 'Moon':
        return <Moon className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Users':
        return <Users className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Diamond':
        return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30 dark:text-cyan-400 dark:bg-cyan-950/40 dark:border-cyan-500/40';
      case 'Platinum':
        return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30 dark:text-indigo-400 dark:bg-indigo-950/40 dark:border-indigo-500/40';
      case 'Gold':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/30 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-500/40';
      case 'Silver':
        return 'text-slate-500 bg-slate-500/10 border-slate-500/30 dark:text-slate-300 dark:bg-slate-800/40 dark:border-slate-600/40';
      default:
        return 'text-amber-700 bg-amber-700/10 border-amber-700/30 dark:text-amber-500 dark:bg-amber-950/30 dark:border-amber-700/40';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto transition-colors">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl border border-slate-700 dark:border-slate-300 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-amber-400 dark:text-amber-600 animate-spin shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Leaf className="w-6 h-6" />
              </span>
              Campus Water Conservation & Department Leaderboard
            </h1>
            <span className="text-[10px] font-mono uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
              LEED Platinum Benchmark
            </span>
            <span className="text-[10px] font-mono uppercase bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 font-bold px-2.5 py-0.5 rounded-full border border-cyan-300 dark:border-cyan-800">
              Active Inter-Department Cup
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-3xl">
            Live institutional gamification: Department rankings based on normalized water saving efficiency, leak SLA response, and certified sustainability badge unlocks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCompareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            Head-to-Head Compare
          </button>

          <button
            onClick={() => openPledgeModalFor(departments[0]?.id || '')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Pledge Department Action
          </button>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Hero Banner: Composite Water Efficiency Score & Top Champion */}
      <div className="relative overflow-hidden bg-linear-to-br from-slate-900 via-teal-950 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-500/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider font-extrabold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                Institutional ESG Scorecard • Sprint Q4 2026
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
                <Crown className="w-3.5 h-3.5" />
                #1 Leader: {podiumDepartments[0]?.name || 'Biotechnology & Life Sciences'} ({podiumDepartments[0]?.efficiencyScore || 94.6}%)
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Campus Efficiency Index: <span className="text-emerald-400 font-mono">{data.score}</span> / 100
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Tier: <strong className="text-amber-300">Gold Star Sustainability Rating</strong>. The Smart AquaGrid campus outperforms the national higher-education consumption benchmark by <strong>28.4%</strong>, preserving high-value municipal aquifer reserves and avoiding peak pump electrical charges.
            </p>

            {/* Quick Department Shoutout */}
            <div className="inline-flex items-center gap-2 pt-1 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>7 departments actively competing for the <strong>2026 Green Chancellor Cup</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 bg-white/10 dark:bg-black/30 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 text-center shrink-0">
            <div>
              <span className="text-xl sm:text-3xl font-black text-emerald-300 font-mono tracking-tight">
                {(data.waterSavedYtdLiters ?? 0).toLocaleString()}
              </span>
              <span className="block text-[10px] sm:text-xs text-slate-300 uppercase mt-1 font-semibold">Liters Saved YTD</span>
            </div>
            <div className="border-x border-white/15 px-3">
              <span className="text-xl sm:text-3xl font-black text-cyan-300 font-mono tracking-tight">
                {(data.energySavedKwh ?? 0).toLocaleString()}
              </span>
              <span className="block text-[10px] sm:text-xs text-slate-300 uppercase mt-1 font-semibold">kWh Pump Energy</span>
            </div>
            <div>
              <span className="text-xl sm:text-3xl font-black text-amber-300 font-mono tracking-tight">
                {(data.co2AvoidedKg ?? 0).toLocaleString()}
              </span>
              <span className="block text-[10px] sm:text-xs text-slate-300 uppercase mt-1 font-semibold">kg CO2e Offset</span>
            </div>
          </div>
        </div>
      </div>

      {/* Podium: Top 3 Department Champions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
              <Trophy className="w-5 h-5 text-amber-500" />
              Department Honor Podium — Top Water Savers
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Leading campus departments with highest verified water conservation efficiency index
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Cycle:</span>
            <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setTimeRange('month')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                  timeRange === 'month'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                October 2026
              </button>
              <button
                onClick={() => setTimeRange('quarter')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                  timeRange === 'quarter'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Q4 Sprint
              </button>
              <button
                onClick={() => setTimeRange('year')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                  timeRange === 'year'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Year 2026
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {podiumDepartments.map((dept, index) => {
            const isFirst = index === 0;
            const isSecond = index === 1;
            const isThird = index === 2;

            const crownColor = isFirst
              ? 'from-amber-400 to-yellow-500 text-slate-950 border-amber-300'
              : isSecond
              ? 'from-slate-200 to-slate-400 text-slate-950 border-slate-300'
              : 'from-amber-700 to-amber-800 text-white border-amber-600';

            const cardBorder = isFirst
              ? 'border-amber-400/80 shadow-lg dark:border-amber-500/50 bg-linear-to-b from-amber-500/5 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';

            return (
              <div
                key={dept.id}
                onClick={() => setSelectedDeptForDetail(dept)}
                className={`rounded-2xl p-5 border relative flex flex-col justify-between cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-400 transition-all group ${cardBorder}`}
              >
                {/* Medal Tag */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-xl font-mono font-black text-xs flex items-center justify-center shadow-xs bg-linear-to-br ${crownColor}`}
                    >
                      #{index + 1}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {isFirst ? '🏆 Chancellor Gold' : isSecond ? '🥈 Silver Laureate' : '🥉 Bronze Merit'}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getTierColor(
                      dept.tier
                    )}`}
                  >
                    {dept.tier} Tier
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {dept.buildingName}
                  </p>

                  {/* Efficiency Metric Big Display */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Water-Saving Efficiency
                      </span>
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {dept.efficiencyScore}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-linear-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, dept.efficiencyScore)}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Monthly Saved</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                          {dept.waterSavedLitersMonth.toLocaleString()} L
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Intensity</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                          {dept.perCapitaLpd} L/capita
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges preview */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    {dept.badgeIds.slice(0, 3).map(bId => {
                      const b = getBadgeById(bId);
                      if (!b) return null;
                      return (
                        <span
                          key={bId}
                          title={`${b.title}: ${b.description}`}
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60"
                        >
                          {renderBadgeIcon(b.iconName, 'w-3 h-3')}
                          {b.title}
                        </span>
                      );
                    })}
                    {dept.badgeIds.length > 3 && (
                      <span className="text-[10px] text-slate-400 font-bold">
                        +{dept.badgeIds.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer with Cheer & Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={e => handleCheer(e, dept.id)}
                    className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 transition-transform active:scale-95"
                    title="Endorse this department"
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span>{dept.cheerCount}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={e => openPledgeModalFor(dept.id, e)}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 px-2 py-1 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                    >
                      Pledge Action
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Standings Table & Filtering */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-5 transition-colors">
        
        {/* Controls: Search, Sector Tabs, and Sort */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Inter-Department Water Efficiency Leaderboard
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time standings based on telemetry meters, leak ticket resolution SLA, and conservation initiatives.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search department, building..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span className="font-semibold text-[11px]">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="efficiency">Highest Efficiency %</option>
                <option value="savings">Most Liters Saved</option>
                <option value="perCapita">Lowest Per-Capita</option>
                <option value="cheers">Most Endorsed (Cheers)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedCategory === c.id
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Department & Wing</th>
                <th className="py-3 px-3">Efficiency Index</th>
                <th className="py-3 px-3">Water Saved (Mo)</th>
                <th className="py-3 px-3">Per-Capita</th>
                <th className="py-3 px-3">Leak SLA</th>
                <th className="py-3 px-3">Honors / Badges</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredDepartments.map((dept, index) => {
                const rankDelta = dept.previousRank - dept.currentRank;

                return (
                  <tr
                    key={dept.id}
                    onClick={() => setSelectedDeptForDetail(dept)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-lg font-mono font-black text-xs flex items-center justify-center ${
                            dept.currentRank === 1
                              ? 'bg-amber-400 text-slate-950 font-bold'
                              : dept.currentRank === 2
                              ? 'bg-slate-300 text-slate-900 font-bold'
                              : dept.currentRank === 3
                              ? 'bg-amber-700 text-white font-bold'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          #{dept.currentRank}
                        </span>

                        {rankDelta > 0 ? (
                          <span
                            className="inline-flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400"
                            title={`Rose ${rankDelta} position(s)`}
                          >
                            <ArrowUpRight className="w-3 h-3" />
                            {rankDelta}
                          </span>
                        ) : rankDelta < 0 ? (
                          <span
                            className="inline-flex items-center text-[10px] font-bold text-rose-500"
                            title={`Fell ${Math.abs(rankDelta)} position(s)`}
                          >
                            <ArrowDownRight className="w-3 h-3" />
                            {Math.abs(rankDelta)}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400 font-bold">—</span>
                        )}
                      </div>
                    </td>

                    {/* Department Name */}
                    <td className="py-3.5 px-3">
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          <span>{dept.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">({dept.shortCode})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{dept.buildingName}</span>
                          <span>•</span>
                          <span>Head: {dept.headOfDepartment}</span>
                        </div>
                      </div>
                    </td>

                    {/* Efficiency Index */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-20 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, dept.efficiencyScore)}%` }}
                          />
                        </div>
                        <span className="font-mono font-black text-xs text-slate-900 dark:text-white">
                          {dept.efficiencyScore}%
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm border ${getTierColor(
                            dept.tier
                          )}`}
                        >
                          {dept.tier}
                        </span>
                      </div>
                    </td>

                    {/* Monthly Water Saved */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                          {dept.waterSavedLitersMonth.toLocaleString()} L
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">
                          +{Math.round((dept.waterSavedLitersMonth / dept.baselineConsumptionMonth) * 100)}% vs baseline
                        </span>
                      </div>
                    </td>

                    {/* Per-Capita */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {dept.perCapitaLpd} <span className="text-[10px] text-slate-400">L/day</span>
                      </span>
                    </td>

                    {/* Leak SLA */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            dept.leakIncidentCount === 0
                              ? 'bg-emerald-500'
                              : dept.leakIncidentCount <= 2
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        <span className="text-[11px] text-slate-700 dark:text-slate-300 font-mono">
                          {dept.leakResolutionAvgHours}h avg
                        </span>
                        <span className="text-[10px] text-slate-400">({dept.leakIncidentCount} leaks)</span>
                      </div>
                    </td>

                    {/* Honors / Badges */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap items-center gap-1 max-w-[200px]">
                        {dept.badgeIds.map(bId => {
                          const b = getBadgeById(bId);
                          if (!b) return null;
                          return (
                            <span
                              key={bId}
                              title={`${b.title}: ${b.description}`}
                              className="p-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 inline-flex items-center"
                            >
                              {renderBadgeIcon(b.iconName, 'w-3.5 h-3.5')}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={e => handleCheer(e, dept.id)}
                          className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-colors"
                          title="Cheer for this department"
                        >
                          <Heart className="w-3 h-3 fill-rose-500" />
                          <span>{dept.cheerCount}</span>
                        </button>

                        <button
                          onClick={e => openPledgeModalFor(dept.id, e)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors"
                        >
                          Pledge
                        </button>

                        <button
                          onClick={() => setSelectedDeptForDetail(dept)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View Water Audit"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sustainability Badge Showcase (Trophy Case) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Sustainability Badges & Gamification Trophy Case
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Prestige badges awarded to departments achieving verified milestones in water preservation, leak mitigation, and eco-innovation.
            </p>
          </div>

          {/* Badge Category Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'EFFICIENCY', 'LEAK_PREVENTION', 'RECYCLING', 'INNOVATION', 'COMMUNITY'].map(cat => (
              <button
                key={cat}
                onClick={() => setBadgeCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-colors ${
                  badgeCategoryFilter === cat
                    ? 'bg-amber-500 text-slate-950 shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredBadges.map(b => {
            const isUnlocked = b.unlocked;

            return (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                  isUnlocked
                    ? 'border-amber-400/40 dark:border-amber-500/30 bg-linear-to-b from-amber-500/5 to-transparent dark:from-amber-950/20 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`p-2 rounded-xl flex items-center justify-center ${
                        isUnlocked
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {renderBadgeIcon(b.iconName, 'w-5 h-5')}
                    </span>

                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                        +{b.points} pts
                      </span>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                        {b.rarity}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-black text-slate-900 dark:text-white text-sm">
                    {b.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {b.description}
                  </p>

                  <div className="mt-3 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-600 dark:text-slate-400">
                    <strong className="text-slate-700 dark:text-slate-300 block mb-0.5">Earning Criteria:</strong>
                    {b.criteria}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {/* Departments holding this badge */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Awarded Departments ({b.awardedDepartments.length}):
                    </span>
                    <div className="flex flex-wrap items-center gap-1">
                      {b.awardedDepartments.map(d => (
                        <span
                          key={d.departmentId}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        >
                          {d.departmentName.split(' ')[0]}
                        </span>
                      ))}
                      {b.awardedDepartments.length === 0 && (
                        <span className="text-[10px] text-slate-400 italic">No department unlocked yet</span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                      <span>Campus Cohort Progress</span>
                      <span className="font-mono font-bold">{b.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${b.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Transparent Score Breakdown vs Conservation Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Score Factor Decomposition */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 transition-colors">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Score Factor Decomposition (Weighted 100-Point Index)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Objective mathematical scoring across six certified institutional dimensions
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {scoreFactors.map(f => (
              <div
                key={f.title}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{f.title}</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {f.score} / {f.max} pts
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${(f.score / f.max) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{f.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conservation Goals & Mandates */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 transition-colors">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Campus Conservation Mandates & Milestones
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Annual Sustainability Board goals linked to departmental conservation quotas
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                <span>Q4 20% Net Consumption Reduction</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-mono">77.5% Completed</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Target: Save 1,000,000L against historical 2025 baseline. Currently at 775,000L.
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-cyan-600 h-full rounded-full" style={{ width: '77.5%' }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                <span>Zero Rooftop Spillage (90 Day Streak)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">100% Achieved</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Automated solenoid tank cut-offs prevented 15,000L of overflow this semester.
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                <span>Greywater Recycling Ratio Target (45%)</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">86.6% on Track</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Currently 390,000L / 450,000L monthly target recycled through dual plumbing lines.
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '86.6%' }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: PLEDGE CONSERVATION ACTION MODAL */}
      {/* ========================================================================= */}
      {isPledgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <Leaf className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Pledge Department Conservation Action
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Log verified interventions to increase efficiency score and climb the leaderboard
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPledgeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPledge} className="space-y-4">
              {/* Select Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Target Department
                </label>
                <select
                  value={pledgeTargetDeptId}
                  onChange={e => setPledgeTargetDeptId(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>
                      #{d.currentRank} {d.name} — Current Score: {d.efficiencyScore}%
                    </option>
                  ))}
                </select>
              </div>

              {/* Pick Preset Proven Initiatives */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Proven Water Conservation Interventions
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {PRESET_PLEDGE_INITIATIVES.map((preset, idx) => (
                    <div
                      key={preset.title}
                      onClick={() => {
                        setSelectedPresetIndex(idx);
                        setCustomTitle(preset.title);
                        setCustomCategory(preset.category);
                        setCustomSavingsLpd(preset.estimatedDailySavingsLiters);
                        setCustomDescription(preset.description);
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedPresetIndex === idx
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center font-bold">
                        <span>{preset.title}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                          +{preset.estimatedDailySavingsLiters.toLocaleString()} L/day
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {preset.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] font-semibold text-slate-400">
                        <span>Category: {preset.category}</span>
                        <span>•</span>
                        <span className="text-amber-600 dark:text-amber-400">
                          +{preset.efficiencyBoostPercent}% score boost
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Impact Preview */}
              <div className="p-3.5 rounded-xl bg-linear-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block">
                    Estimated Conservation Impact
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    +{((customSavingsLpd || 1500) * 30).toLocaleString()} Liters saved this month
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Projected Boost</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    +{PRESET_PLEDGE_INITIATIVES[selectedPresetIndex]?.efficiencyBoostPercent || 1.8}%
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPledgeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPledge}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md transition-all flex items-center gap-2"
                >
                  {isSubmittingPledge ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Logging Action...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Confirm & Re-rank Leaderboard
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: HEAD-TO-HEAD COMPARISON TOOL */}
      {/* ========================================================================= */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-xl">
                  <ArrowUpDown className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Department Head-to-Head Efficiency Duel
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Compare water conservation performance, leak remediation speed, and badge honours
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Department Alpha
                </label>
                <select
                  value={compareDeptAId}
                  onChange={e => setCompareDeptAId(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>
                      #{d.currentRank} {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Department Beta
                </label>
                <select
                  value={compareDeptBId}
                  onChange={e => setCompareDeptBId(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>
                      #{d.currentRank} {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Metrics Grid */}
            {(() => {
              const deptA = departments.find(d => d.id === compareDeptAId) || departments[0];
              const deptB = departments.find(d => d.id === compareDeptBId) || departments[1];

              const rows = [
                {
                  label: 'Efficiency Score',
                  valA: `${deptA.efficiencyScore}%`,
                  valB: `${deptB.efficiencyScore}%`,
                  winner: deptA.efficiencyScore > deptB.efficiencyScore ? 'A' : 'B'
                },
                {
                  label: 'Leaderboard Standing',
                  valA: `#${deptA.currentRank}`,
                  valB: `#${deptB.currentRank}`,
                  winner: deptA.currentRank < deptB.currentRank ? 'A' : 'B'
                },
                {
                  label: 'Water Saved (Month)',
                  valA: `${deptA.waterSavedLitersMonth.toLocaleString()} L`,
                  valB: `${deptB.waterSavedLitersMonth.toLocaleString()} L`,
                  winner: deptA.waterSavedLitersMonth > deptB.waterSavedLitersMonth ? 'A' : 'B'
                },
                {
                  label: 'Per-Capita Daily Intensity',
                  valA: `${deptA.perCapitaLpd} L/person`,
                  valB: `${deptB.perCapitaLpd} L/person`,
                  winner: deptA.perCapitaLpd < deptB.perCapitaLpd ? 'A' : 'B'
                },
                {
                  label: 'Leak Ticket SLA Speed',
                  valA: `${deptA.leakResolutionAvgHours} hours`,
                  valB: `${deptB.leakResolutionAvgHours} hours`,
                  winner: deptA.leakResolutionAvgHours < deptB.leakResolutionAvgHours ? 'A' : 'B'
                },
                {
                  label: 'Sustainability Badges',
                  valA: `${deptA.badgeIds.length} unlocked`,
                  valB: `${deptB.badgeIds.length} unlocked`,
                  winner: deptA.badgeIds.length > deptB.badgeIds.length ? 'A' : 'B'
                },
                {
                  label: 'Active Initiatives',
                  valA: `${deptA.activeInitiatives.length} projects`,
                  valB: `${deptB.activeInitiatives.length} projects`,
                  winner: deptA.activeInitiatives.length >= deptB.activeInitiatives.length ? 'A' : 'B'
                },
                {
                  label: 'Morale Cheers',
                  valA: `${deptA.cheerCount} cheers`,
                  valB: `${deptB.cheerCount} cheers`,
                  winner: deptA.cheerCount > deptB.cheerCount ? 'A' : 'B'
                }
              ];

              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 text-center font-bold text-xs pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-800 dark:text-slate-200 text-left">{deptA.name}</span>
                    <span className="text-slate-400">Dimension</span>
                    <span className="text-slate-800 dark:text-slate-200 text-right">{deptB.name}</span>
                  </div>

                  {rows.map(r => (
                    <div
                      key={r.label}
                      className="grid grid-cols-3 items-center py-2 text-xs border-b border-slate-100 dark:border-slate-800/60"
                    >
                      <div className="text-left font-mono font-bold flex items-center gap-1.5">
                        {r.winner === 'A' && <span className="text-amber-500">👑</span>}
                        <span className={r.winner === 'A' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}>
                          {r.valA}
                        </span>
                      </div>

                      <div className="text-center font-semibold text-slate-500 dark:text-slate-400 text-[11px]">
                        {r.label}
                      </div>

                      <div className="text-right font-mono font-bold flex items-center justify-end gap-1.5">
                        <span className={r.winner === 'B' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}>
                          {r.valB}
                        </span>
                        {r.winner === 'B' && <span className="text-amber-500">👑</span>}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DEPARTMENT PROFILE & WATER AUDIT MODAL */}
      {/* ========================================================================= */}
      {selectedDeptForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-lg font-mono font-black text-xs flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300`}
                  >
                    #{selectedDeptForDetail.currentRank}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedDeptForDetail.name}
                  </h3>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getTierColor(
                      selectedDeptForDetail.tier
                    )}`}
                  >
                    {selectedDeptForDetail.tier}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                  <span>{selectedDeptForDetail.buildingName}</span>
                  <span>•</span>
                  <span>Head: {selectedDeptForDetail.headOfDepartment}</span>
                  <span>•</span>
                  <span>{selectedDeptForDetail.occupancy} Active Occupants</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedDeptForDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Snapshot */}
            <div className="grid grid-cols-3 gap-3 text-center bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Efficiency Rating</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {selectedDeptForDetail.efficiencyScore}%
                </span>
              </div>
              <div className="border-x border-slate-200 dark:border-slate-700 px-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Water Saved (Mo)</span>
                <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                  {selectedDeptForDetail.waterSavedLitersMonth.toLocaleString()} L
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Daily Intensity</span>
                <span className="text-2xl font-black text-amber-500 font-mono">
                  {selectedDeptForDetail.perCapitaLpd} <span className="text-xs font-normal">L/d</span>
                </span>
              </div>
            </div>

            {/* Badges Earned */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Earned Sustainability Badges ({selectedDeptForDetail.badgeIds.length})
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedDeptForDetail.badgeIds.map(bId => {
                  const b = getBadgeById(bId);
                  if (!b) return null;
                  return (
                    <div
                      key={bId}
                      className="p-2.5 rounded-xl border border-amber-300/50 dark:border-amber-800/50 bg-amber-50/60 dark:bg-amber-950/30 flex items-center gap-2.5"
                    >
                      <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                        {renderBadgeIcon(b.iconName, 'w-4 h-4')}
                      </span>
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                          {b.title}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                          +{b.points} pts • {b.rarity}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Conservation Initiatives */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Active Department Initiatives ({selectedDeptForDetail.activeInitiatives.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedDeptForDetail.activeInitiatives.map(init => (
                  <div
                    key={init.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-900 dark:text-white">{init.title}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                        +{init.savingsEstimatedLpd.toLocaleString()} L/day
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {init.impactDescription}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                      <span>Category: {init.category}</span>
                      <span>•</span>
                      <span>Started: {init.dateStarted}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Advisor Guidance Box */}
            <div className="p-3.5 rounded-xl bg-linear-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/30 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">
                  AI Conservation Advisory for {selectedDeptForDetail.name}:
                </span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                  To overtake the next rank and unlock the <strong>Diamond Aqua-Star</strong> badge, reduce off-hours sink faucet flow by completing the aerator retrofit and automating weekend line shutoffs.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={e => handleCheer(e, selectedDeptForDetail.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 transition-colors"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-500" />
                Cheer ({selectedDeptForDetail.cheerCount})
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    openPledgeModalFor(selectedDeptForDetail.id);
                    setSelectedDeptForDetail(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs transition-colors"
                >
                  Log Initiative for This Dept
                </button>
                <button
                  onClick={() => setSelectedDeptForDetail(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
