import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  CheckCircle2,
  X,
  HelpCircle,
  Play,
  AlertCircle
} from 'lucide-react';

export interface VoiceCommandRule {
  id: string;
  phrases: string[];
  exampleCommand: string;
  label: string;
  category: 'NAVIGATION' | 'CONTROL';
  route?: string;
  actionType?: 'FOCUS_MODE' | 'TOGGLE_THEME' | 'TOGGLE_COPILOT' | 'SIMULATE_LEAK' | 'CLEAR_LEAK' | 'NEXT_TAB' | 'PREV_TAB';
}

export const VOICE_COMMAND_RULES: VoiceCommandRule[] = [
  {
    id: 'vc-dashboard',
    phrases: ['dashboard', 'command center', 'master dashboard', 'home', 'overview', 'module one', 'module 1'],
    exampleCommand: '"Go to Command Center"',
    label: 'Master Command Center',
    category: 'NAVIGATION',
    route: 'dashboard'
  },
  {
    id: 'vc-monitoring',
    phrases: ['real time', 'monitoring', 'telemetry', 'live flow', 'pressure', 'module two', 'module 2'],
    exampleCommand: '"Open Real-Time Monitoring"',
    label: 'Real-Time Telemetry',
    category: 'NAVIGATION',
    route: 'monitoring'
  },
  {
    id: 'vc-digital-twin',
    phrases: ['digital twin', 'water twin', 'hydraulic twin', 'pipe network', 'epanet', 'module three', 'module 3'],
    exampleCommand: '"Show Digital Water Twin"',
    label: 'Digital Water Twin',
    category: 'NAVIGATION',
    route: 'digital-twin'
  },
  {
    id: 'vc-anomalies',
    phrases: ['anomaly', 'anomalies', 'leak risk', 'leakage center', 'acoustic', 'alerts', 'module four', 'module 4'],
    exampleCommand: '"Open Anomaly & Leak Risk"',
    label: 'Anomaly & Leak Risk',
    category: 'NAVIGATION',
    route: 'anomalies'
  },
  {
    id: 'vc-forecast',
    phrases: ['forecast', 'forecasting', 'optimization', 'weather', 'reservoir', 'demand prediction', 'module five', 'module 5'],
    exampleCommand: '"Show Forecast & Optimization"',
    label: 'Forecast & Optimization',
    category: 'NAVIGATION',
    route: 'forecast'
  },
  {
    id: 'vc-recommendations',
    phrases: ['recommendation', 'recommendations', 'smart actions', 'conservation', 'roi', 'module six', 'module 6'],
    exampleCommand: '"Open Smart Recommendations"',
    label: 'Smart Recommendations',
    category: 'NAVIGATION',
    route: 'recommendations'
  },
  {
    id: 'vc-simulator',
    phrases: ['simulator', 'what if', 'stress test', 'simulation', 'module seven', 'module 7'],
    exampleCommand: '"Launch What-If Simulator"',
    label: 'What-If Simulator',
    category: 'NAVIGATION',
    route: 'simulator'
  },
  {
    id: 'vc-maintenance',
    phrases: ['maintenance', 'predictive maintenance', 'pump health', 'vibration', 'module eight', 'module 8'],
    exampleCommand: '"Open Predictive Maintenance"',
    label: 'Predictive Maintenance',
    category: 'NAVIGATION',
    route: 'maintenance'
  },
  {
    id: 'vc-quality',
    phrases: ['water quality', 'quality', 'potability', 'turbidity', 'chlorine', 'tds', 'module nine', 'module 9'],
    exampleCommand: '"Check Water Quality"',
    label: 'Water Quality Module',
    category: 'NAVIGATION',
    route: 'quality'
  },
  {
    id: 'vc-geospatial',
    phrases: ['geospatial', 'geo spatial', 'gis map', 'campus map', 'spatial map', 'pipeline map'],
    exampleCommand: '"Open Geo-Spatial Map"',
    label: 'Geo-Spatial GIS Map',
    category: 'NAVIGATION',
    route: 'geospatial'
  },
  {
    id: 'vc-comparison',
    phrases: ['multi building', 'building comparison', 'compare buildings', 'benchmarks'],
    exampleCommand: '"Show Multi-Building Analytics"',
    label: 'Multi-Building Analytics',
    category: 'NAVIGATION',
    route: 'comparison'
  },
  {
    id: 'vc-sustainability',
    phrases: ['sustainability', 'leaderboard', 'esg', 'carbon', 'green score', 'water saving'],
    exampleCommand: '"Open Sustainability Leaderboard"',
    label: 'Sustainability & Leaderboard',
    category: 'NAVIGATION',
    route: 'sustainability'
  },
  {
    id: 'vc-reports',
    phrases: ['reports', 'report center', 'executive summary', 'iso report'],
    exampleCommand: '"Open Reports & Summary"',
    label: 'Reports & AI Summary',
    category: 'NAVIGATION',
    route: 'reports'
  },
  {
    id: 'vc-sensors',
    phrases: ['sensors', 'sensor health', 'battery', 'iot fleet', 'thresholds'],
    exampleCommand: '"Show Sensors & Thresholds"',
    label: 'Sensors & Thresholds',
    category: 'NAVIGATION',
    route: 'sensors'
  },
  {
    id: 'vc-audit',
    phrases: ['audit', 'audit log', 'audit ledger', 'security log', 'ledger'],
    exampleCommand: '"Open Audit Ledger"',
    label: 'Security & Audit Ledger',
    category: 'NAVIGATION',
    route: 'audit'
  },
  {
    id: 'vc-focus',
    phrases: ['focus mode', 'enter focus', 'exit focus', 'distraction free', 'toggle focus'],
    exampleCommand: '"Toggle Focus Mode"',
    label: 'Toggle Focus Mode',
    category: 'CONTROL',
    actionType: 'FOCUS_MODE'
  },
  {
    id: 'vc-theme',
    phrases: ['dark mode', 'light mode', 'toggle theme', 'switch theme'],
    exampleCommand: '"Switch Theme"',
    label: 'Toggle Light / Dark Theme',
    category: 'CONTROL',
    actionType: 'TOGGLE_THEME'
  },
  {
    id: 'vc-copilot',
    phrases: ['open copilot', 'close copilot', 'ai copilot', 'water assistant'],
    exampleCommand: '"Open AI Copilot"',
    label: 'Toggle AI Copilot',
    category: 'CONTROL',
    actionType: 'TOGGLE_COPILOT'
  },
  {
    id: 'vc-sim-leak',
    phrases: ['simulate leak', 'inject leak', 'trigger leak'],
    exampleCommand: '"Simulate Leak"',
    label: 'Inject Pipe Leak Scenario',
    category: 'CONTROL',
    actionType: 'SIMULATE_LEAK'
  },
  {
    id: 'vc-clear-leak',
    phrases: ['clear leak', 'reset leak', 'normal mode', 'stop leak'],
    exampleCommand: '"Clear Leak"',
    label: 'Restore Normal Grid Mode',
    category: 'CONTROL',
    actionType: 'CLEAR_LEAK'
  },
  {
    id: 'vc-next-tab',
    phrases: ['next module', 'next page', 'next tab'],
    exampleCommand: '"Next Module"',
    label: 'Switch to Next Module',
    category: 'CONTROL',
    actionType: 'NEXT_TAB'
  },
  {
    id: 'vc-prev-tab',
    phrases: ['previous module', 'previous page', 'go back'],
    exampleCommand: '"Previous Module"',
    label: 'Switch to Previous Module',
    category: 'CONTROL',
    actionType: 'PREV_TAB'
  }
];

const MODULE_ORDER = [
  'dashboard',
  'monitoring',
  'digital-twin',
  'anomalies',
  'forecast',
  'recommendations',
  'simulator',
  'maintenance',
  'quality',
  'geospatial',
  'comparison',
  'sustainability',
  'reports',
  'sensors',
  'audit'
];

export const VoiceNavigationManager: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isFocusMode,
    toggleFocusMode,
    toggleDarkMode,
    isCopilotOpen,
    setIsCopilotOpen,
    injectSimulationEvent
  } = useApp();

  const { language } = useLanguage();

  const [isListening, setIsListening] = useState(false);
  const [continuousMode, setContinuousMode] = useState<boolean>(() => {
    return localStorage.getItem('jalrakshak_voice_continuous') !== 'false';
  });
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState<boolean>(() => {
    return localStorage.getItem('jalrakshak_voice_tts') !== 'false';
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [matchedFeedback, setMatchedFeedback] = useState<{ command: string; target: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const shouldKeepListeningRef = useRef<boolean>(false);

  const isSpeechSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const speakConfirmation = useCallback(
    (text: string) => {
      if (!voiceFeedbackEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const utterance = new window.SpeechSynthesisUtterance(text);
        utterance.rate = 1.08;
        utterance.pitch = 1.0;
        utterance.volume = 0.85;
        window.speechSynthesis.speak(utterance);
      } catch {
        // ignore speech synthesis errors
      }
    },
    [voiceFeedbackEnabled]
  );

  const executeVoiceRule = useCallback(
    (rule: VoiceCommandRule, rawSpoken: string) => {
      if (rule.route) {
        setActiveTab(rule.route);
        setMatchedFeedback({ command: rawSpoken, target: `Switched to ${rule.label}` });
        speakConfirmation(`Opening ${rule.label}`);
      } else if (rule.actionType === 'FOCUS_MODE') {
        toggleFocusMode();
        const nextLabel = isFocusMode ? 'Exited Focus Mode' : 'Entered Focus Mode';
        setMatchedFeedback({ command: rawSpoken, target: nextLabel });
        speakConfirmation(nextLabel);
      } else if (rule.actionType === 'TOGGLE_THEME') {
        toggleDarkMode();
        setMatchedFeedback({ command: rawSpoken, target: 'Switched Display Theme' });
        speakConfirmation('Theme updated');
      } else if (rule.actionType === 'TOGGLE_COPILOT') {
        setIsCopilotOpen(!isCopilotOpen);
        setMatchedFeedback({
          command: rawSpoken,
          target: isCopilotOpen ? 'Closed AI Copilot' : 'Opened AI Copilot'
        });
        speakConfirmation(isCopilotOpen ? 'Closing Copilot' : 'Opening AI Copilot');
      } else if (rule.actionType === 'SIMULATE_LEAK') {
        injectSimulationEvent('LEAK');
        setMatchedFeedback({ command: rawSpoken, target: 'Injected Pipe Leak Simulation' });
        speakConfirmation('Simulating pipe leak scenario');
      } else if (rule.actionType === 'CLEAR_LEAK') {
        injectSimulationEvent('RESET');
        setMatchedFeedback({ command: rawSpoken, target: 'Restored Normal Grid Telemetry' });
        speakConfirmation('Restoring normal telemetry');
      } else if (rule.actionType === 'NEXT_TAB' || rule.actionType === 'PREV_TAB') {
        const idx = MODULE_ORDER.indexOf(activeTab);
        const nextIdx =
          rule.actionType === 'NEXT_TAB'
            ? (idx + 1) % MODULE_ORDER.length
            : (idx - 1 + MODULE_ORDER.length) % MODULE_ORDER.length;
        const nextRoute = MODULE_ORDER[nextIdx];
        setActiveTab(nextRoute);
        setMatchedFeedback({ command: rawSpoken, target: `Switched to ${nextRoute}` });
        speakConfirmation(`Switching module`);
      }
    },
    [
      activeTab,
      isCopilotOpen,
      isFocusMode,
      injectSimulationEvent,
      setActiveTab,
      setIsCopilotOpen,
      speakConfirmation,
      toggleDarkMode,
      toggleFocusMode
    ]
  );

  const processSpokenTranscript = useCallback(
    (transcriptText: string) => {
      const cleaned = transcriptText.toLowerCase().trim();
      if (!cleaned) return false;

      for (const rule of VOICE_COMMAND_RULES) {
        for (const phrase of rule.phrases) {
          if (cleaned.includes(phrase.toLowerCase())) {
            executeVoiceRule(rule, transcriptText);
            return true;
          }
        }
      }
      return false;
    },
    [executeVoiceRule]
  );

  const stopListening = useCallback(() => {
    shouldKeepListeningRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (!isSpeechSupported) {
      setErrorMessage('SpeechRecognition API is not supported in this browser. Use the interactive command buttons below to test voice navigation.');
      setIsModalOpen(true);
      return;
    }

    setErrorMessage(null);
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = continuousMode;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setErrorMessage(null);
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          finalTranscript += res[0].transcript;
        } else {
          interim += res[0].transcript;
        }
      }

      if (interim) {
        setLiveTranscript(interim);
      }

      if (finalTranscript) {
        const trimmedFinal = finalTranscript.trim();
        setLiveTranscript(trimmedFinal);
        processSpokenTranscript(trimmedFinal);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        shouldKeepListeningRef.current = false;
        setIsListening(false);
        setErrorMessage('Microphone access was blocked or requires permission. Allow microphone access or trigger commands from the Voice Command Panel.');
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setErrorMessage(`Voice recognition warning: ${event.error}`);
      }
    };

    recognition.onend = () => {
      if (shouldKeepListeningRef.current && continuousMode) {
        try {
          recognition.start();
        } catch {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    shouldKeepListeningRef.current = true;

    try {
      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  }, [continuousMode, isSpeechSupported, processSpokenTranscript]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Listen for custom header events & Alt+V keyboard shortcut
  useEffect(() => {
    const handleToggleVoice = () => toggleListening();
    const handleOpenVoiceModal = () => setIsModalOpen(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        toggleListening();
      }
    };

    window.addEventListener('jalrakshak:toggle-voice', handleToggleVoice);
    window.addEventListener('jalrakshak:open-voice-modal', handleOpenVoiceModal);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('jalrakshak:toggle-voice', handleToggleVoice);
      window.removeEventListener('jalrakshak:open-voice-modal', handleOpenVoiceModal);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleListening]);

  // Broadcast listening state to Header button
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('jalrakshak:voice-state-changed', {
        detail: { isListening }
      })
    );
  }, [isListening]);

  // Clear matched HUD banner after 2.8 seconds
  useEffect(() => {
    if (!matchedFeedback) return;
    const timer = setTimeout(() => {
      setMatchedFeedback(null);
      setLiveTranscript('');
    }, 2800);
    return () => clearTimeout(timer);
  }, [matchedFeedback]);

  return (
    <>
      {/* Floating Live Hands-Free Voice Recognition HUD */}
      {(isListening || matchedFeedback) && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-950/95 text-white border border-cyan-500/50 shadow-2xl shadow-cyan-950/70 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          {isListening && (
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
          )}

          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-bold">
              {isListening ? 'Hands-Free Mic Live' : 'Voice Action'}
            </span>
            {matchedFeedback ? (
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{matchedFeedback.target}</span>
                <span className="text-slate-400 font-normal text-[11px]">
                  (&ldquo;{matchedFeedback.command}&rdquo;)
                </span>
              </span>
            ) : (
              <span className="text-slate-200 font-medium">
                {liveTranscript ? (
                  <span>Hearing: &ldquo;{liveTranscript}&rdquo;...</span>
                ) : (
                  <span>Say a command e.g. &ldquo;Forecast&rdquo;, &ldquo;Digital Twin&rdquo;, &ldquo;Anomalies&rdquo;...</span>
                )}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Open Voice Commands Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {isListening && (
            <button
              type="button"
              onClick={stopListening}
              className="px-2 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-[10px] font-bold transition-colors cursor-pointer"
              title="Stop Voice Recognition (Alt+V)"
            >
              Stop
            </button>
          )}
        </div>
      )}

      {/* Voice Command Center & Hands-Free Navigation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-linear-to-r from-slate-950 via-cyan-950 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 ${
                    isListening
                      ? 'bg-linear-to-br from-rose-500 to-amber-500 animate-pulse'
                      : 'bg-linear-to-br from-cyan-500 to-blue-600'
                  }`}
                >
                  {isListening ? <Radio className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                      Hands-Free Voice Command Navigation
                    </h2>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-bold">
                      Web Speech API • Alt+V
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Navigate between all 15 hydrological modules and control SCADA actions completely hands-free
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Microphone Control Bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25'
                      : 'bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/25'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span>Stop Hands-Free Mic</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>Start Hands-Free Listening</span>
                    </>
                  )}
                </button>

                <div className="text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-100 block">
                    {isListening ? 'Microphone Actively Listening...' : 'Microphone Standby'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    {liveTranscript
                      ? `Last heard: "${liveTranscript}"`
                      : 'Say any module name (e.g., "Forecast", "Digital Twin", "Water Quality")'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const next = !continuousMode;
                    setContinuousMode(next);
                    localStorage.setItem('jalrakshak_voice_continuous', String(next));
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    continuousMode
                      ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {continuousMode ? 'Continuous Listen: ON' : 'Single Command'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const next = !voiceFeedbackEnabled;
                    setVoiceFeedbackEnabled(next);
                    localStorage.setItem('jalrakshak_voice_tts', String(next));
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    voiceFeedbackEnabled
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                  title="Toggle spoken audio confirmation (SpeechSynthesis)"
                >
                  {voiceFeedbackEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>{voiceFeedbackEnabled ? 'Voice Reply: ON' : 'Muted'}</span>
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="mx-5 mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Voice Commands Directory */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Spoken Module Navigation Commands
                  </span>
                  <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">
                    Speak into mic or click &ldquo;Simulate Voice&rdquo; to test
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {VOICE_COMMAND_RULES.filter((r) => r.category === 'NAVIGATION').map((rule) => {
                    const isCurrent = rule.route === activeTab;
                    return (
                      <div
                        key={rule.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                          isCurrent
                            ? 'bg-cyan-50/70 dark:bg-cyan-950/40 border-cyan-400/60 dark:border-cyan-700'
                            : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                              {rule.label}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-mono text-cyan-700 dark:text-cyan-300 mt-0.5 truncate">
                            Say {rule.exampleCommand}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            executeVoiceRule(rule, rule.exampleCommand.replace(/"/g, ''));
                            setIsModalOpen(false);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-cyan-600 hover:text-white text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-bold transition-colors cursor-pointer shrink-0"
                          title={`Simulate voice command: ${rule.exampleCommand}`}
                        >
                          <Play className="w-3 h-3" />
                          <span>Run</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                  Hands-Free System Control Commands
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {VOICE_COMMAND_RULES.filter((r) => r.category === 'CONTROL').map((rule) => (
                    <div
                      key={rule.id}
                      className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white block truncate">
                          {rule.label}
                        </span>
                        <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-300 block truncate mt-0.5">
                          Say {rule.exampleCommand}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          executeVoiceRule(rule, rule.exampleCommand.replace(/"/g, ''));
                          setIsModalOpen(false);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-bold transition-colors cursor-pointer shrink-0"
                      >
                        <Play className="w-3 h-3" />
                        <span>Run</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[10px] font-bold">Alt + V</kbd> anytime to toggle the hands-free microphone.</span>
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-cyan-600 text-white font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
