import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, Building, SmartAlert, SimulationMode, BatteryThresholdConfig, AppNotification } from '../types';
import { INITIAL_USERS, INITIAL_BUILDINGS } from '../data/mockDatabase';
import { api } from '../services/api';
import { notificationService, PushNotificationPayload } from '../services/notificationService';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
  loginWithGoogle: (email?: string, name?: string, photoUrl?: string, role?: UserRole) => void;
  loginWithCredentials: (email: string, password?: string, role?: UserRole, name?: string) => void;
  logout: () => void;
  setUserRole: (role: UserRole) => void;
  isAdmin: boolean;
  campusName: string;
  setCampusName: (name: string) => void;
  activeBuildingId: string;
  setActiveBuildingId: (id: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  buildings: Building[];
  alerts: SmartAlert[];
  refreshAlerts: () => Promise<void>;
  simulationMode: SimulationMode;
  setSimulationMode: (mode: SimulationMode) => Promise<void>;
  injectSimulationEvent: (event: 'LEAK' | 'PRESSURE_DROP' | 'HIGH_CONSUMPTION' | 'SENSOR_FAILURE' | 'RESET') => Promise<void>;
  telemetry: any;
  kpis: any;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setIsDarkMode: (dark: boolean) => void;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  isPageChatbotOpen: boolean;
  setIsPageChatbotOpen: (open: boolean) => void;
  openPageChatbot: () => void;
  isSimulatorDrawerOpen: boolean;
  setIsSimulatorDrawerOpen: (open: boolean) => void;
  isFocusMode: boolean;
  setIsFocusMode: (active: boolean) => void;
  toggleFocusMode: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  notifications: AppNotification[];
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  removeNotification: (id: string) => void;
  unreadNotificationsCount: number;
  isNotificationCenterOpen: boolean;
  setIsNotificationCenterOpen: (open: boolean) => void;
  openNotificationCenter: () => void;
  pushNotificationPermission: NotificationPermission;
  requestPushPermission: () => Promise<NotificationPermission>;
  isSoundEnabled: boolean;
  toggleSoundEnabled: () => void;
  isPushEnabled: boolean;
  togglePushEnabled: () => void;
  triggerLeakNotification: (options: {
    title: string;
    body: string;
    location?: string;
    lossLph?: number;
    riskPercent?: number;
    anomalyId?: string;
    urgency?: 'low' | 'normal' | 'high' | 'critical';
  }) => Promise<void>;
  batteryThresholdConfig: BatteryThresholdConfig;
  updateBatteryThresholds: (updates: Partial<BatteryThresholdConfig>) => Promise<void>;
  lowBatteryThresholdPercent: number;
  criticalBatteryThresholdPercent: number;
  deferredPwaPrompt: any;
  isPwaInstalled: boolean;
  isPwaModalOpen: boolean;
  setIsPwaModalOpen: (open: boolean) => void;
  appInstallTab: 'pc' | 'mobile';
  setAppInstallTab: (tab: 'pc' | 'mobile') => void;
  openAppInstallModal: (tab?: 'pc' | 'mobile') => void;
  isUpdateAvailable: boolean;
  applyUpdate: () => void;
  dismissUpdate: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check stored auth session or start unauthenticated so the user can use Google / Sign In
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('jalrakshak_auth') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('jalrakshak_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    // Default user when authenticated
    return {
      id: 'usr-default',
      name: 'Sathiyamoorthi Saravanan',
      email: 'sathiyamoorthisaravanan2006@gmail.com',
      role: 'admin',
      avatar: 'SS',
      provider: 'google'
    };
  });

  const [activeBuildingId, setActiveBuildingId] = useState<string>('bld-1');
  const [campusName, setCampusNameState] = useState<string>(() => {
    const saved = localStorage.getItem('jalrakshak_campus_name');
    if (saved && !saved.toLowerCase().includes('indira')) {
      return saved;
    }
    return 'JalRakshak Smart AquaGrid Campus';
  });

  const setCampusName = useCallback((newName: string) => {
    const trimmed = newName.trim() || 'JalRakshak Smart AquaGrid Campus';
    setCampusNameState(trimmed);
    localStorage.setItem('jalrakshak_campus_name', trimmed);
    fetch('/api/campus/name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed })
    }).catch(() => {});
  }, []);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS);
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [simulationMode, setSimulationModeState] = useState<SimulationMode>('LEAKAGE_RISK');
  const [telemetry, setTelemetry] = useState<any>({
    flowRateLpm: 48.5,
    pressureBar: 2.7,
    tankLevelPercent: 78,
    leakageRiskPercent: 87,
    leakRiskLevel: 'HIGH',
    consumptionRateLph: 1420,
    waterQualityScore: 92
  });
  const [kpis, setKpis] = useState<any>(null);
  
  // Dark Mode Theme State with localStorage persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('jalrakshak_theme');
    if (saved) return saved === 'dark';
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('jalrakshak_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('jalrakshak_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Chatbot states
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isPageChatbotOpen, setIsPageChatbotOpen] = useState(false);
  const [isSimulatorDrawerOpen, setIsSimulatorDrawerOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // Browser Notification States
  const [pushNotificationPermission, setPushNotificationPermission] = useState<NotificationPermission>(() => {
    return notificationService.getPermission();
  });
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    return notificationService.isSoundEnabled();
  });
  const [isPushEnabled, setIsPushEnabled] = useState<boolean>(() => {
    return notificationService.isPushEnabled();
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'High Leakage Risk (87%) detected in Block A Floor 2',
      body: 'Acoustic waveform peak at 184 Hz and continuous night flow exceedance on riser P-104.',
      time: '38m ago',
      read: false,
      type: 'critical',
      location: 'Block A Floor 2 Riser P-104',
      lossLph: 1240,
      riskPercent: 87,
      route: 'anomalies'
    },
    {
      id: 'notif-2',
      title: 'Abnormal dishwashing water consumption in Block D',
      body: 'Flow rate surged to 68 LPM outside normal dining service window.',
      time: '1h ago',
      read: false,
      type: 'warning',
      location: 'Block D Dining Hall',
      lossLph: 640,
      riskPercent: 62,
      route: 'anomalies'
    },
    {
      id: 'notif-3',
      title: 'Weekly Sustainability Milestone: 42,000L saved',
      body: 'AI pump schedule optimization reduced non-revenue water loss by 14.8%.',
      time: '4h ago',
      read: true,
      type: 'success',
      route: 'sustainability'
    },
    {
      id: 'notif-4',
      title: 'Sensor FLW-401 battery low (34%)',
      body: 'Scheduled preventive lithium cell replacement within 5 days.',
      time: '5h ago',
      read: true,
      type: 'info',
      route: 'sensors'
    }
  ]);

  // Battery Threshold Configuration for Remote IoT Sensors
  const [batteryThresholdConfig, setBatteryThresholdConfig] = useState<BatteryThresholdConfig>(() => {
    const saved = localStorage.getItem('jalrakshak_battery_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      lowBatteryThresholdPercent: 40,
      criticalBatteryThresholdPercent: 20,
      headerMaintenanceAlertActive: true,
      autoDispatchBatteryWorkOrder: true,
      soundAlarmOnCritical: false,
      leadTimeDaysTarget: 5,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Chief Plant Engineer'
    };
  });

  useEffect(() => {
    api.getBatteryThresholdConfig()
      .then(cfg => {
        if (cfg && typeof cfg.lowBatteryThresholdPercent === 'number') {
          setBatteryThresholdConfig(cfg);
          localStorage.setItem('jalrakshak_battery_config', JSON.stringify(cfg));
        }
      })
      .catch(err => console.warn('Could not load battery config from server:', err));
  }, []);

  const updateBatteryThresholds = async (updates: Partial<BatteryThresholdConfig>) => {
    const newConfig: BatteryThresholdConfig = {
      ...batteryThresholdConfig,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.name || 'Chief Plant Engineer'
    };
    setBatteryThresholdConfig(newConfig);
    localStorage.setItem('jalrakshak_battery_config', JSON.stringify(newConfig));

    try {
      await api.updateBatteryThresholdConfig(newConfig);
    } catch (err) {
      console.warn('Failed to persist battery threshold update to server:', err);
    }
  };

  // PWA State for PC & Mobile
  const [deferredPwaPrompt, setDeferredPwaPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState<boolean>(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState<boolean>(false);
  const [appInstallTab, setAppInstallTab] = useState<'pc' | 'mobile'>('pc');
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  // Distraction-Free Focus Mode State
  const [isFocusMode, setIsFocusModeState] = useState<boolean>(() => {
    return localStorage.getItem('jalrakshak_focus_mode') === 'true';
  });

  const setIsFocusMode = (active: boolean) => {
    setIsFocusModeState(active);
    localStorage.setItem('jalrakshak_focus_mode', String(active));
    if (active) {
      setIsCopilotOpen(false);
      setIsPageChatbotOpen(false);
      setIsSimulatorDrawerOpen(false);
    }
  };

  const toggleFocusMode = () => {
    setIsFocusMode(!isFocusMode);
  };

  // Off-Canvas Collapsible Command Sidebar Drawer State (Closed by default so frontend stays clean)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const openAppInstallModal = (tab: 'pc' | 'mobile' = 'pc') => {
    setAppInstallTab(tab);
    setIsPwaModalOpen(true);
  };

  const applyUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } else if (navigator.serviceWorker) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg?.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        } else {
          window.location.reload();
        }
      }).catch(() => {
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  };

  const dismissUpdate = () => {
    setIsUpdateAvailable(false);
  };

  const openPageChatbot = () => {
    setIsPageChatbotOpen(true);
  };

  useEffect(() => {
    // Listen for beforeinstallprompt event on PC / Android browsers
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPwaPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setDeferredPwaPrompt(null);
    };

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPwaInstalled(true);
    }

    // Custom event dispatched from main.tsx when a new service worker completes installation
    const handleSwUpdateAvailable = (e: any) => {
      console.log('[JalRakshak App] Service Worker update available event received.');
      if (e.detail?.waitingWorker) {
        setWaitingWorker(e.detail.waitingWorker);
      }
      setIsUpdateAvailable(true);
    };

    // When the controller changes (new service worker activates after skipWaiting), reload page to load new version
    let refreshing = false;
    const handleControllerChange = () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('swUpdateAvailable', handleSwUpdateAvailable);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('swUpdateAvailable', handleSwUpdateAvailable);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      }
    };
  }, []);

  const loginWithGoogle = (email?: string, name?: string, photoUrl?: string, role: UserRole = 'admin') => {
    const user: User = {
      id: 'usr-google-' + Date.now(),
      name: name || 'Sathiyamoorthi Saravanan',
      email: email || 'sathiyamoorthisaravanan2006@gmail.com',
      role,
      avatar: (name || 'SS').slice(0, 2).toUpperCase(),
      provider: 'google',
      photoUrl: photoUrl || undefined
    };
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('jalrakshak_auth', 'true');
    localStorage.setItem('jalrakshak_user', JSON.stringify(user));
  };

  const loginWithCredentials = (email: string, _password?: string, role: UserRole = 'admin', name?: string) => {
    const displayName = name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const user: User = {
      id: 'usr-cred-' + Date.now(),
      name: displayName,
      email,
      role,
      avatar: displayName.slice(0, 2).toUpperCase(),
      provider: 'email'
    };
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('jalrakshak_auth', 'true');
    localStorage.setItem('jalrakshak_user', JSON.stringify(user));
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('jalrakshak_auth');
    localStorage.removeItem('jalrakshak_user');
  };

  const setUserRole = (role: UserRole) => {
    if (!currentUser) return;
    const updated: User = {
      ...currentUser,
      role
    };
    setCurrentUser(updated);
    localStorage.setItem('jalrakshak_user', JSON.stringify(updated));
  };

  const isAdmin = true;

  const refreshAlerts = async () => {
    try {
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (e) {
      console.warn('Failed to load alerts:', e);
    }
  };

  const setSimulationMode = async (mode: SimulationMode) => {
    try {
      setSimulationModeState(mode);
      await api.setSimulationMode(mode);
    } catch (e) {
      console.warn('Failed to set simulation mode:', e);
    }
  };

  const injectSimulationEvent = async (event: 'LEAK' | 'PRESSURE_DROP' | 'HIGH_CONSUMPTION' | 'SENSOR_FAILURE' | 'RESET') => {
    try {
      const res = await api.injectSimulationEvent(event);
      if (res.mode) setSimulationModeState(res.mode);
      if (res.telemetry) setTelemetry(res.telemetry);
    } catch (e) {
      console.warn('Failed to inject simulation event:', e);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const openNotificationCenter = () => {
    setIsNotificationCenterOpen(true);
  };

  const requestPushPermission = async () => {
    const perm = await notificationService.requestPermission();
    setPushNotificationPermission(perm);
    return perm;
  };

  const toggleSoundEnabled = () => {
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    notificationService.setSoundEnabled(next);
  };

  const togglePushEnabled = () => {
    const next = !isPushEnabled;
    setIsPushEnabled(next);
    notificationService.setPushEnabled(next);
  };

  const triggerLeakNotification = useCallback(async (options: {
    title: string;
    body: string;
    location?: string;
    lossLph?: number;
    riskPercent?: number;
    anomalyId?: string;
    urgency?: 'low' | 'normal' | 'high' | 'critical';
  }) => {
    const newNotif: AppNotification = {
      id: `leak-alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: options.title,
      body: options.body,
      time: 'Just now',
      read: false,
      type: options.urgency === 'critical' ? 'critical' : options.urgency === 'high' ? 'warning' : 'info',
      location: options.location,
      lossLph: options.lossLph,
      riskPercent: options.riskPercent,
      anomalyId: options.anomalyId,
      route: 'anomalies'
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Dispatch system push notification using browser Notification API
    await notificationService.sendLeakAlert({
      title: options.title,
      body: options.body,
      tag: `leak-alert-${options.location || 'campus'}`,
      urgency: options.urgency || 'critical',
      data: {
        anomalyId: options.anomalyId,
        location: options.location,
        riskPercent: options.riskPercent,
        lossLph: options.lossLph,
        route: 'anomalies'
      }
    });
  }, []);

  // Listen to navigation events from notification clicks (Service worker or Notification onclick)
  useEffect(() => {
    const handleNavEvent = (e: any) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
      }
    };
    window.addEventListener('jalrakshak_navigate', handleNavEvent);
    return () => window.removeEventListener('jalrakshak_navigate', handleNavEvent);
  }, []);

  // Initial fetch
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [sumData, bldData, altData] = await Promise.all([
          api.getDashboardSummary(),
          api.getBuildings(),
          api.getAlerts()
        ]);
        if (sumData?.kpis) setKpis(sumData.kpis);
        if (sumData?.currentSimulationMode) setSimulationModeState(sumData.currentSimulationMode);
        if (bldData) setBuildings(bldData);
        if (altData) setAlerts(altData);
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    };
    loadInitialData();

    // Subscribe to real-time Server-Sent Events
    let lastLeakNotificationTime = 0;
    const unsubscribe = api.subscribeToTelemetry((streamData) => {
      if (streamData.telemetry) {
        setTelemetry(streamData.telemetry);

        // Check if significant water leak is detected in real time
        const risk = streamData.telemetry.leakageRiskPercent;
        const mode = streamData.mode || streamData.telemetry.leakRiskLevel;
        const now = Date.now();

        if (
          (risk >= 75 || mode === 'LEAKAGE_RISK' || mode === 'HIGH') &&
          now - lastLeakNotificationTime > 60000 // Debounce 1 minute
        ) {
          lastLeakNotificationTime = now;
          triggerLeakNotification({
            title: `🚨 CRITICAL WATER LEAK DETECTED: Risk at ${risk}%`,
            body: `Telemetry detected continuous head pressure drop (-0.54 bar) and acoustic peak. Flow rate: ${streamData.telemetry.flowRateLpm || 48.5} LPM.`,
            location: 'Engineering Block A (Riser P-104 Zone)',
            lossLph: Math.round((streamData.telemetry.flowRateLpm || 45) * 30),
            riskPercent: risk,
            urgency: 'critical'
          });
        }
      }
      if (streamData.buildings) setBuildings(streamData.buildings);
      if (streamData.mode) setSimulationModeState(streamData.mode);
    });

    return () => {
      unsubscribe();
    };
  }, [triggerLeakNotification]);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated,
        loginWithGoogle,
        loginWithCredentials,
        logout,
        setUserRole,
        isAdmin,
        campusName,
        setCampusName,
        activeBuildingId,
        setActiveBuildingId,
        activeTab,
        setActiveTab,
        buildings,
        alerts,
        refreshAlerts,
        simulationMode,
        setSimulationMode,
        injectSimulationEvent,
        telemetry,
        kpis,
        isDarkMode,
        toggleDarkMode,
        setIsDarkMode,
        isCopilotOpen,
        setIsCopilotOpen,
        isPageChatbotOpen,
        setIsPageChatbotOpen,
        openPageChatbot,
        isSimulatorDrawerOpen,
        setIsSimulatorDrawerOpen,
        isFocusMode,
        setIsFocusMode,
        toggleFocusMode,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        notifications,
        markAllNotificationsRead,
        markNotificationRead,
        clearAllNotifications,
        removeNotification,
        unreadNotificationsCount,
        isNotificationCenterOpen,
        setIsNotificationCenterOpen,
        openNotificationCenter,
        pushNotificationPermission,
        requestPushPermission,
        isSoundEnabled,
        toggleSoundEnabled,
        isPushEnabled,
        togglePushEnabled,
        triggerLeakNotification,
        batteryThresholdConfig,
        updateBatteryThresholds,
        lowBatteryThresholdPercent: batteryThresholdConfig.lowBatteryThresholdPercent,
        criticalBatteryThresholdPercent: batteryThresholdConfig.criticalBatteryThresholdPercent,
        deferredPwaPrompt,
        isPwaInstalled,
        isPwaModalOpen,
        setIsPwaModalOpen,
        appInstallTab,
        setAppInstallTab,
        openAppInstallModal,
        isUpdateAvailable,
        applyUpdate,
        dismissUpdate
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
