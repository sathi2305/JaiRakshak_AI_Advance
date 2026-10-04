import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { Header } from './components/common/Header';
import { CollapsibleSidebarDrawer } from './components/common/CollapsibleSidebarDrawer';
import { PageMatrixBar } from './components/common/PageMatrixBar';
import { MasterDashboard } from './components/dashboard/MasterDashboard';
import { RealTimeMonitoring } from './components/monitoring/RealTimeMonitoring';
import { DigitalWaterTwin } from './components/digitaltwin/DigitalWaterTwin';
import { AnomalyLeakageCenter } from './components/anomaly/AnomalyLeakageCenter';
import { ForecastOptimization } from './components/forecast/ForecastOptimization';
import { RecommendationsView } from './components/recommendations/RecommendationsView';
import { DigitalTwinSimulator } from './components/simulator/DigitalTwinSimulator';
import { PredictiveMaintenance } from './components/maintenance/PredictiveMaintenance';
import { WaterQualityModule } from './components/quality/WaterQualityModule';
import { GeospatialMap } from './components/geospatial/GeospatialMap';
import { MultiBuildingComparison } from './components/comparison/MultiBuildingComparison';
import { SustainabilityCenter } from './components/sustainability/SustainabilityCenter';
import { ReportCenter } from './components/reports/ReportCenter';
import { SensorHealthView } from './components/sensors/SensorHealthView';
import { AuditLogView } from './components/audit/AuditLogView';
import { JalRakshakCopilot } from './components/copilot/JalRakshakCopilot';
import { PageContextualChatbot } from './components/copilot/PageContextualChatbot';
import { SimulatorDrawer } from './components/simulator/SimulatorDrawer';
import { SignInPage } from './components/auth/SignInPage';
import { InstallPwaModal } from './components/common/InstallPwaModal';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PwaUpdateToast } from './components/common/PwaUpdateToast';
import { NotificationCenterModal } from './components/common/NotificationCenterModal';
import { KeyboardShortcutManager } from './components/common/KeyboardShortcutManager';
import { VoiceNavigationManager } from './components/common/VoiceNavigationManager';
import { Minimize2, Eye } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    isAuthenticated,
    activeTab,
    isUpdateAvailable,
    applyUpdate,
    dismissUpdate,
    isNotificationCenterOpen,
    setIsNotificationCenterOpen,
    isPwaModalOpen,
    setIsPwaModalOpen,
    deferredPwaPrompt,
    isPwaInstalled,
    isFocusMode,
    toggleFocusMode
  } = useApp();

  // If user is not signed in, show dedicated Sign In page
  if (!isAuthenticated) {
    return (
      <>
        <SignInPage />
        <InstallPwaModal
          isOpen={isPwaModalOpen}
          onClose={() => setIsPwaModalOpen(false)}
          deferredPrompt={deferredPwaPrompt}
          isInstalled={isPwaInstalled}
        />
        <OfflineIndicator />
        <PwaUpdateToast
          isOpen={isUpdateAvailable}
          onRefresh={applyUpdate}
          onDismiss={dismissUpdate}
        />
      </>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <MasterDashboard />;
      case 'monitoring':
        return <RealTimeMonitoring />;
      case 'digital-twin':
        return <DigitalWaterTwin />;
      case 'anomalies':
        return <AnomalyLeakageCenter />;
      case 'forecast':
        return <ForecastOptimization />;
      case 'recommendations':
        return <RecommendationsView />;
      case 'simulator':
        return <DigitalTwinSimulator />;
      case 'maintenance':
        return <PredictiveMaintenance />;
      case 'quality':
        return <WaterQualityModule />;
      case 'geospatial':
        return <GeospatialMap />;
      case 'comparison':
        return <MultiBuildingComparison />;
      case 'sustainability':
        return <SustainabilityCenter />;
      case 'reports':
        return <ReportCenter />;
      case 'sensors':
        return <SensorHealthView />;
      case 'audit':
        return <AuditLogView />;
      default:
        return <MasterDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-800 dark:text-slate-100 antialiased selection:bg-cyan-500 selection:text-white transition-colors duration-200">
      {/* Top Header */}
      <Header />

      {/* Open/Close Collapsible Command Sidebar Drawer (Hidden until opened by user, auto-closes after selection) */}
      <CollapsibleSidebarDrawer />

      {/* Dynamic Page-Wise Operational Matrix Bar (Hidden in Distraction-Free Focus Mode) */}
      {!isFocusMode && <PageMatrixBar />}

      {/* Full Page Command Center Active View */}
      <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col w-full">
        <div className="flex-1 w-full">
          <ErrorBoundary key={activeTab} fallbackTitle={`Navigation View: ${activeTab.toUpperCase()}`}>
            {renderActiveView()}
          </ErrorBoundary>
        </div>
      </main>

      {/* Secondary Chat & Simulator Drawers (Hidden in Distraction-Free Focus Mode) */}
      {!isFocusMode && (
        <>
          {/* Global General Copilot Drawer */}
          <JalRakshakCopilot />

          {/* Dedicated Page-Wise Contextual Query-Solving Chatbot */}
          <PageContextualChatbot />

          {/* IoT Digital Twin Simulator Controls Drawer */}
          <SimulatorDrawer />
        </>
      )}

      {/* Subtle Floating Focus Mode Exit Pill */}
      {isFocusMode && (
        <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-950/90 text-white border border-cyan-500/40 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-bold text-slate-200">
            Focus Mode Active
          </span>
          <button
            type="button"
            onClick={toggleFocusMode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-extrabold transition-colors cursor-pointer ml-1"
            title="Exit Focus Mode and restore navigation matrix & chat (Alt+F)"
          >
            <Minimize2 className="w-3 h-3" />
            <span>Exit Focus</span>
          </button>
        </div>
      )}
      
      {/* Dedicated Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />

      {/* Dedicated Desktop App Installer Modal */}
      <InstallPwaModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
        deferredPrompt={deferredPwaPrompt}
        isInstalled={isPwaInstalled}
      />

      {/* Global Keyboard Shortcut & Hotkey Manager */}
      <KeyboardShortcutManager />

      {/* Hands-Free Voice Command Navigation Manager (Web Speech API) */}
      <VoiceNavigationManager />

      {/* Offline Status & Cached Telemetry Indicator */}
      <OfflineIndicator />

      {/* PWA Update Available Toast */}
      <PwaUpdateToast
        isOpen={isUpdateAvailable}
        onRefresh={applyUpdate}
        onDismiss={dismissUpdate}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AppProvider>
  );
}
