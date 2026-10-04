import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Mic,
  MicOff,
  Layers,
  Activity,
  AlertTriangle,
  TrendingUp,
  Cpu,
  Droplets,
  Building2,
  FileText,
  MapPin,
  Sliders,
  Wrench,
  Shield,
  ArrowRight,
  Maximize2,
  Minimize2,
  Edit3
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  modelUsed?: string;
  suggestedActions?: { label: string; route: string; description?: string }[];
}

export const JalRakshakCopilot: React.FC = () => {
  const {
    isCopilotOpen,
    setIsCopilotOpen,
    isPageChatbotOpen,
    setIsPageChatbotOpen,
    activeTab,
    setActiveTab,
    telemetry,
    buildings,
    alerts,
    isAdmin,
    simulationMode,
    campusName,
    setCampusName
  } = useApp();

  const [isEditingCampusInCopilot, setIsEditingCampusInCopilot] = useState(false);
  const [copilotCampusDraft, setCopilotCampusDraft] = useState(campusName);

  const isOpen = isCopilotOpen || isPageChatbotOpen;
  const handleClose = () => {
    setIsCopilotOpen(false);
    setIsPageChatbotOpen(false);
  };

  const [activeScope, setActiveScope] = useState<'page' | 'campus'>('page');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Store messages by page/scope
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({});

  // Dynamic Page Configurations & Expert Presets
  const getPageContextConfig = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Campus Master Water Copilot',
          domain: 'Whole-Campus Balance & Macro Health',
          icon: Activity,
          welcome: 'Welcome! I am your Campus Master Water Copilot. I analyze campus macro-water balance, aggregate telemetry, and cross-facility conservation targets in real time.',
          suggestions: [
            'Why is campus consumption elevated today?',
            'Which building has the highest water loss risk?',
            'How much water have we conserved this month?',
            'Summarize all active critical alerts'
          ]
        };
      case 'monitoring':
        return {
          title: 'Hydraulic Telemetry Copilot',
          domain: 'High-Density Ultrasonic Sensor Curves',
          icon: Activity,
          welcome: 'Real-Time Hydraulic Telemetry Copilot ready. Inspecting sub-minute pressure curves, flow velocities, and IoT node packet transmission.',
          suggestions: [
            'Is there any localized pressure drop in Block A?',
            'Which distribution junction has the highest velocity?',
            'Explain the current 142ms sensor latency reading',
            'Are any ultrasonic transducers showing abnormal drift?'
          ]
        };
      case 'digital-twin':
        return {
          title: 'EPANET Physics Twin Copilot',
          domain: 'Darcy-Weisbach Solver & Meshed Nodes',
          icon: Layers,
          welcome: 'EPANET 2.2 Digital Water Twin Copilot online. Calibrated against 64 meshed junction nodes across campus distribution rings.',
          suggestions: [
            'Why does Loop 2 show a -0.42 bar pressure variance?',
            'What is the simulated head loss along pipe segment P-104?',
            'What happens to pressure if isolation valve V-102 closes?',
            'Verify mass balance conservation across all nodes'
          ]
        };
      case 'anomalies':
        return {
          title: 'Acoustic Waveform & Leakage Copilot',
          domain: 'Acoustic FFT & Pipe Burst Triaging',
          icon: AlertTriangle,
          welcome: 'Leakage Triaging Copilot active. Analyzing acoustic hydrophones, pipe vibration resonance, and Bayesian leak probabilities.',
          suggestions: [
            'Why is Block A Floor 2 evaluated at high leakage risk?',
            'What is the estimated water loss rate and hourly cost?',
            'Which isolation valve must be actuated to stop the leak?',
            'Explain the 184 Hz acoustic resonance detected'
          ]
        };
      case 'forecast':
        return {
          title: 'Neural Demand Forecasting Copilot',
          domain: 'LSTM Load Prediction & Peak Hours',
          icon: TrendingUp,
          welcome: 'Forecasting Copilot ready. Powered by a hybrid Prophet-LSTM model calibrated against 18 months of consumption patterns and weather regressors.',
          suggestions: [
            'What causes the projected consumption spike between 13:00 - 15:00?',
            'How much water should we pre-pump into overhead tanks tonight?',
            'How do outdoor temperature and humidity affect tomorrow’s demand?',
            'Recommend optimal pump operating hours to reduce electricity tariffs'
          ]
        };
      case 'recommendations':
        return {
          title: 'Prescriptive Conservation & ROI Copilot',
          domain: 'Conservation Engineering & Payback',
          icon: Sparkles,
          welcome: 'Conservation ROI Copilot online. Calculating capital expenditure payback, life-cycle carbon offsets, and water conservation interventions.',
          suggestions: [
            'Which recommendation yields the quickest financial payback?',
            'How can we recover the estimated 42,000 Liters per week?',
            'What is the carbon emission reduction from optimizing pump runs?',
            'Draft an executive justification for aerator retrofits'
          ]
        };
      case 'simulator':
        return {
          title: 'Hydraulic Stress & Scenario Copilot',
          domain: 'Transient Water Hammer & Scenarios',
          icon: Sliders,
          welcome: 'What-If Simulation Copilot ready. Configure stress tests, sudden valve closure water hammer analysis, and tank depletion scenarios.',
          suggestions: [
            'What hydraulic shockwave occurs if the main booster trips?',
            'Simulate a 50 LPM pipe breach on Block A Floor 2',
            'How does the digital twin respond to high demand stress testing?',
            'What safety interlocks protect the physical plant from test errors?'
          ]
        };
      case 'maintenance':
        return {
          title: 'Pump Vibration & Asset Health Copilot',
          domain: 'ISO 10816 Diagnostics & Asset Life',
          icon: Wrench,
          welcome: 'Predictive Maintenance Copilot active. Monitoring motor winding thermography, ISO 10816 vibration velocity, and Mean Time to Failure (MTTF).',
          suggestions: [
            'Which pump has the shortest remaining operational life?',
            'Explain the 2.1 mm/s vibration reading on Booster Pump 2',
            'What are the signs of impending cavitation in the chiller line?',
            'Draft an inspection task checklist for technician dispatch'
          ]
        };
      case 'quality':
        return {
          title: 'Water Potability & Chemistry Copilot',
          domain: 'Spectrography, pH, Chlorine & TDS',
          icon: Droplets,
          welcome: 'Continuous Water Quality Copilot active. Monitoring real-time spectrophotometric turbidity, galvanic pH, oxidation-reduction potential, and TDS.',
          suggestions: [
            'Is the campus tap water currently 100% potable and safe to drink?',
            'What causes the 240 ppm Total Dissolved Solids reading?',
            'What actions should be taken if pH drops below 6.5?',
            'How often is the UV disinfection subsystem calibrated?'
          ]
        };
      case 'geospatial':
        return {
          title: 'GIS Pipeline Topography Copilot',
          domain: 'Spatial Network & Valve Geofencing',
          icon: MapPin,
          welcome: 'Geospatial Copilot online. Providing spatial queries for underground HDPE piping, valve GPS coordinates, and campus elevation contours.',
          suggestions: [
            'Which pipeline segment connects the Central Sump to Block A?',
            'What is the total length of pressurized pipes in Zone B?',
            'Show the GPS coordinates for Emergency Isolation Valve V-102',
            'Are there any pipe junctions in high-traffic subterranean corridors?'
          ]
        };
      case 'comparison':
        return {
          title: 'Inter-Facility Benchmark Copilot',
          domain: 'Per-Capita Efficiency & Variance',
          icon: Building2,
          welcome: 'Benchmark Copilot active. Calculating normalized consumption per occupant and square meter across all facilities.',
          suggestions: [
            'Why does Block A consume more water per capita than Block B?',
            'Which facility has demonstrated the greatest conservation gains?',
            'How does occupant density correlate with hourly washroom flow?',
            'Generate a comparative efficiency ranking for all 4 facilities'
          ]
        };
      case 'sustainability':
        return {
          title: 'Net-Zero Water & ESG Copilot',
          domain: 'Rainwater, Circular Reuse & Scope 2',
          icon: Droplets,
          welcome: 'Sustainability & ESG Copilot ready. Tracking progress towards campus 100% Water Neutrality, rainwater retention efficiency, and greywater recycling.',
          suggestions: [
            'What is our current Water Neutrality Index score?',
            'How much rainwater was harvested during the latest monsoon period?',
            'How does our greywater recycling reduce external utility dependency?',
            'Prepare data points for the annual LEED & GRI water disclosure'
          ]
        };
      case 'reports':
        return {
          title: 'Compliance & Audit Report Copilot',
          domain: 'ISO 14046 & Automated Governance',
          icon: FileText,
          welcome: 'Regulatory Audit Copilot active. Assembling tamper-evident water balance audits compliant with ISO 14046 water footprinting and municipal guidelines.',
          suggestions: [
            'Draft an executive summary for this month’s water conservation audit',
            'Verify that all measured values are distinguished from AI estimates',
            'What is the audit trail hash for the latest generated report?',
            'What regulatory criteria are evaluated in the LEED v4.1 water section?'
          ]
        };
      case 'sensors':
        return {
          title: 'IoT Telemetry & Mesh Copilot',
          domain: 'LoRaWAN Signals, Battery & Gateways',
          icon: Cpu,
          welcome: 'IoT Mesh Copilot ready. Diagnosing RF propagation, RSSI link budget, sensor battery depletion curves, and firmware synchronization.',
          suggestions: [
            'Which sensor node has a critical battery level under 40%?',
            'Explain the -78 dBm LoRaWAN RSSI signal reading',
            'Are any gateways experiencing packet collisions or frame drops?',
            'What is the scheduled battery replacement date for sensor FLW-401?'
          ]
        };
      case 'audit':
        return {
          title: 'Security & Audit Ledger Copilot',
          domain: 'SHA-256 Ledger & RBAC Enforcement',
          icon: Shield,
          welcome: 'Security Ledger Copilot active. Inspecting cryptographically hashed audit chains, user role authorizations, and root actuator logs.',
          suggestions: [
            'Verify that the SHA-256 hash chain is untampered and valid',
            'What administrative actions were executed in the past 24 hours?',
            'Who acknowledged the latest High Leakage Risk alert ALT-1?',
            'Explain the difference in privileges between Admin and User Level'
          ]
        };
      default:
        return {
          title: 'JalRakshak AI Copilot',
          domain: 'Operational Water Intelligence',
          icon: Bot,
          welcome: 'Hello! I am your JalRakshak AI Water Copilot. Grounded in real-time telemetry, EPANET hydraulic modeling, and automated anomaly detection.',
          suggestions: [
            'Where is water being wasted right now?',
            'Why is Block A showing high leak risk?',
            'Summarize today\'s water audit in 3 bullets',
            'How can we raise our Water Efficiency Score to 85?'
          ]
        };
    }
  };

  const pageConfig = getPageContextConfig();
  const ScopeIcon = activeScope === 'page' ? pageConfig.icon : Bot;
  const currentKey = activeScope === 'page' ? activeTab : 'campus-global';

  // Get messages for current scope
  const messages = chatHistory[currentKey] || [
    {
      id: `init-${currentKey}`,
      sender: 'ai',
      text: activeScope === 'page' ? pageConfig.welcome : "Hello! I am your Campus-Wide Water Copilot. I have macro access to all 4 facilities, central sump pumps, and long-term ESG neutrality metrics. What would you like to explore across the entire campus?",
      timestamp: 'Just now',
      modelUsed: 'gemini-3.8-flash'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Speech Recognition Setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition not available:', err);
      }
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Speech recognition error:', e);
      }
    }
  };

  // Text-To-Speech Play / Stop
  const handleSpeak = (id: string, text: string) => {
    if (!window.speechSynthesis) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting symbols for natural voice narration
    const cleanText = text
      .replace(/[#*_`]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/•/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingId(null);
    };
    utterance.onerror = () => {
      setSpeakingId(null);
    };

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Copy message text to clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleSend = async (userText?: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || isTyping) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: timeStr
    };

    const updated = [...messages, userMsg];
    setChatHistory(prev => ({
      ...prev,
      [currentKey]: updated
    }));

    setInput('');
    setIsTyping(true);

    // Check if the user asked Copilot to change/rename the campus name
    const renameMatch = textToSend.trim().match(/(?:change|rename|set|update)\s+(?:the\s+)?(?:campus\s+)?name\s+(?:of\s+.*?\s+)?to\s+["']?([^"'.!?]+)["']?/i);
    if (renameMatch && renameMatch[1]) {
      const newName = renameMatch[1].trim();
      setCampusName(newName);
      setCopilotCampusDraft(newName);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `**Campus Name Updated Successfully:**\n\n• **New Active Campus Name:** **${newName}**\n• All live telemetry headers, Copilot context, GIS maps, and ISO 14046 audit reports are now synchronized to **${newName}**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'jalrakshak-command-engine'
      };
      setChatHistory(prev => ({
        ...prev,
        [currentKey]: [...(prev[currentKey] || updated), aiMsg]
      }));
      setIsTyping(false);
      return;
    }

    try {
      const historyPayload = updated.slice(-8).map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          conversationHistory: historyPayload,
          pageContext: activeScope === 'page' ? activeTab : 'dashboard',
          userRole: isAdmin ? 'admin' : 'user',
          campusName
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply || "I analyzed the water telemetry and model parameters.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.model || 'gemini-3.8-flash',
          suggestedActions: data.suggestedActions || []
        };

        setChatHistory(prev => ({
          ...prev,
          [currentKey]: [...(prev[currentKey] || updated), aiMsg]
        }));
      } else {
        throw new Error(`Server returned ${res.status}`);
      }
    } catch (err) {
      console.warn('Copilot call error, generating offline response:', err);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `**Operational Telemetry Analysis (${activeTab.toUpperCase()}):**\n\n` +
          `• **Current Campus Flow:** ${telemetry.flowRateLpm.toFixed(1)} L/min at ${telemetry.pressureBar.toFixed(2)} bar.\n` +
          `• **Leakage Probability:** ${telemetry.leakageRiskPercent}% in Block A Floor 2 (Zone B).\n` +
          `• **Status:** Active alerts logged and available for physical on-site inspection.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'jalrakshak-resilient-engine'
      };

      setChatHistory(prev => ({
        ...prev,
        [currentKey]: [...(prev[currentKey] || updated), aiMsg]
      }));
    } finally {
      setIsTyping(false);
    }
  };

  // Floating trigger button when closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-40 print:hidden animate-in fade-in">
        <button
          id="global-floating-copilot-btn"
          onClick={() => {
            setActiveScope('page');
            setIsCopilotOpen(true);
            setIsPageChatbotOpen(true);
          }}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-linear-to-r from-slate-900 via-cyan-900 to-blue-900 hover:from-cyan-700 hover:to-blue-700 text-white shadow-xl shadow-cyan-950/40 hover:shadow-cyan-600/30 border border-cyan-500/40 hover:border-cyan-400 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          title={`Ask JalRakshak AI Copilot about ${pageConfig.title}`}
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full"></span>
          </div>
          <span className="text-xs font-bold tracking-tight">
            AI Water Copilot
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hidden sm:inline">
            Live
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex justify-end animate-in fade-in print:hidden">
      <div
        className={`bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 transition-all duration-300 animate-in slide-in-from-right ${
          isExpanded ? 'w-full max-w-2xl' : 'w-full max-w-lg'
        }`}
      >
        {/* Top Header */}
        <div className="p-4 bg-linear-to-r from-slate-950 via-slate-900 to-cyan-950 text-white flex items-center justify-between border-b border-cyan-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white tracking-tight">
                  JalRakshak AI Copilot
                </h3>
                <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-1.5 py-0.2 rounded-full">
                  Gemini Grounded
                </span>
              </div>
              <div className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                {isEditingCampusInCopilot ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (copilotCampusDraft.trim()) {
                        setCampusName(copilotCampusDraft.trim());
                      }
                      setIsEditingCampusInCopilot(false);
                    }}
                    className="flex items-center gap-1"
                  >
                    <input
                      type="text"
                      value={copilotCampusDraft}
                      onChange={(e) => setCopilotCampusDraft(e.target.value)}
                      className="px-1.5 py-0.5 text-[11px] rounded bg-slate-800 border border-cyan-500 text-white w-44 focus:outline-hidden"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-1.5 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold cursor-pointer"
                    >
                      Save
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="truncate max-w-[200px] font-semibold text-cyan-200">{campusName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCopilotCampusDraft(campusName);
                        setIsEditingCampusInCopilot(true);
                      }}
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-800/90 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/30 text-[10px] font-semibold cursor-pointer transition-colors"
                      title="Change Campus Name"
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                      <span>Rename</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              title={isExpanded ? "Collapse panel" : "Expand panel"}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Close Copilot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scope Selector: View-Specific Copilot vs Whole-Campus Assistant */}
        <div className="p-2 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 shrink-0">
          <button
            onClick={() => setActiveScope('page')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeScope === 'page'
                ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ScopeIcon className="w-3.5 h-3.5" />
            <span className="truncate">{pageConfig.title.replace('Copilot', 'View')}</span>
          </button>

          <button
            onClick={() => setActiveScope('campus')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeScope === 'campus'
                ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Campus Macro</span>
          </button>
        </div>

        {/* Real-Time Live Telemetry Ribbon */}
        <div className="bg-cyan-50/80 dark:bg-cyan-950/40 border-b border-cyan-100 dark:border-cyan-900/60 px-4 py-2 flex items-center justify-between text-[11px] text-cyan-950 dark:text-cyan-200 shrink-0">
          <div className="flex items-center gap-2">
            <span>Flow: <strong className="font-mono">{telemetry?.flowRateLpm?.toFixed(1) || '48.5'} L/min</strong></span>
            <span>·</span>
            <span>Pressure: <strong className="font-mono">{telemetry?.pressureBar?.toFixed(2) || '2.70'} bar</strong></span>
            <span>·</span>
            <span>Leak Risk: <strong className="font-mono text-rose-600 dark:text-rose-400">{telemetry?.leakageRiskPercent || 87}%</strong></span>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-cyan-700 dark:text-cyan-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            Grounded
          </span>
        </div>

        {/* Messages Stream Container */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed transition-all ${
                  m.sender === 'user'
                    ? 'bg-slate-900 dark:bg-cyan-600 text-white rounded-tr-none shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/80 dark:border-slate-700 shadow-xs'
                }`}
              >
                {/* Message Content */}
                <div className="whitespace-pre-wrap font-sans text-xs">
                  {m.text}
                </div>

                {/* Suggested Action Buttons if provided by AI */}
                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/80 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                      Recommended Direct Actions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {m.suggestedActions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => {
                            setActiveTab(act.route);
                            handleClose();
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/70 hover:bg-cyan-100 dark:hover:bg-cyan-900/70 text-cyan-800 dark:text-cyan-200 border border-cyan-200 dark:border-cyan-800 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Controls: Time, Audio Listen, Copy */}
                <div className="mt-2 pt-1.5 border-t border-slate-100/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-2">
                    {m.modelUsed && (
                      <span className="font-mono text-[9px] opacity-75">
                        {m.modelUsed}
                      </span>
                    )}
                    <span>{m.timestamp}</span>
                  </div>

                  {m.sender === 'ai' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSpeak(m.id, m.text)}
                        className={`p-1 rounded-md transition-colors cursor-pointer ${
                          speakingId === m.id
                            ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 font-bold'
                            : 'hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                        title={speakingId === m.id ? "Stop reading aloud" : "Read response aloud (Voice synthesis)"}
                      >
                        {speakingId === m.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleCopy(m.id, m.text)}
                        className="p-1 rounded-md hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px] shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 pl-2 py-1">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-600 dark:text-cyan-400" />
              <span>Analyzing EPANET physics, sensor telemetry & predictive models...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Inquiry Chips */}
        <div className="p-3 bg-slate-100/80 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {activeScope === 'page' ? `${pageConfig.title.replace('Copilot', '')} Prompts` : 'Campus Inquiries'}
            </span>
            <span className="text-[10px] text-cyan-600 dark:text-cyan-400">Click to ask</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {pageConfig.suggestions.map((pill, i) => (
              <button
                key={i}
                onClick={() => handleSend(pill)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 hover:border-cyan-300 dark:hover:border-cyan-700 hover:text-cyan-900 dark:hover:text-cyan-200 text-[11px] whitespace-nowrap transition-colors shadow-2xs font-medium cursor-pointer"
              >
                {pill}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input Form */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            {/* Voice Dictation Button */}
            {recognitionRef.current && (
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-300 animate-pulse'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title={isListening ? "Listening... click to stop" : "Voice dictation (speech-to-text)"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            <input
              type="text"
              placeholder={`Ask ${activeScope === 'page' ? pageConfig.title : 'JalRakshak AI'}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
            />

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2.5 rounded-xl bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white transition-all shadow-xs cursor-pointer"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
