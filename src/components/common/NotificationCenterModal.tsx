import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { notificationService } from '../../services/notificationService';
import {
  Bell,
  BellRing,
  BellOff,
  Volume2,
  VolumeX,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Info,
  ExternalLink,
  Trash2,
  CheckCheck,
  Send,
  Sparkles,
  Radio,
  Sliders,
  X
} from 'lucide-react';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    notifications,
    markAllNotificationsRead,
    markNotificationRead,
    clearAllNotifications,
    removeNotification,
    unreadNotificationsCount,
    setActiveTab,
    pushNotificationPermission,
    requestPushPermission,
    isSoundEnabled,
    toggleSoundEnabled,
    isPushEnabled,
    togglePushEnabled,
    triggerLeakNotification
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [testSent, setTestSent] = useState(false);

  // Esc key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'CRITICAL') return n.type === 'critical';
    if (activeFilter === 'WARNING') return n.type === 'warning';
    if (activeFilter === 'INFO') return n.type === 'info' || n.type === 'success';
    return true;
  });

  const handleTestAlert = async () => {
    setTestSent(true);
    await triggerLeakNotification({
      title: '🚨 CRITICAL: Pipe Fracture Simulation in Block A Floor 2',
      body: 'Acoustic waveform peak (184 Hz) and pressure loss (-0.62 bar) detected on riser P-104. Potential loss: ~1,240 L/hr.',
      location: 'Block A, Floor 2 Riser P-104',
      lossLph: 1240,
      riskPercent: 89,
      urgency: 'critical'
    });
    setTimeout(() => setTestSent(false), 3000);
  };

  const handleNavigateToAnomaly = (notif: any) => {
    if (!notif.read) {
      markNotificationRead(notif.id);
    }
    setActiveTab('anomalies');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-center-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-rose-500 to-amber-600 flex items-center justify-center shadow-lg shadow-rose-900/40">
              <BellRing className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="notification-center-title" className="text-base sm:text-lg font-black tracking-tight text-white">
                  Telemetry & Leak Alert Notification Center
                </h2>
                {unreadNotificationsCount > 0 && (
                  <span className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">
                    {unreadNotificationsCount} New
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time browser Push Notifications for significant water leaks & pressure anomalies
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close notification center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Push Permission Banner & Audio Controls */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl border ${
                pushNotificationPermission === 'granted'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : pushNotificationPermission === 'denied'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {pushNotificationPermission === 'granted' ? (
                  <Bell className="w-4 h-4" />
                ) : (
                  <BellOff className="w-4 h-4" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Browser Push Notification Status
                </span>
                <span className="text-[11px] text-slate-500">
                  {pushNotificationPermission === 'granted'
                    ? 'Active — Ready to alert on background or lock screen'
                    : pushNotificationPermission === 'denied'
                    ? 'Blocked by browser permissions. Unblock in browser URL bar.'
                    : 'Prompt needed to receive desktop/mobile push alerts.'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {pushNotificationPermission !== 'granted' && (
                <button
                  onClick={requestPushPermission}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  Enable Push
                </button>
              )}

              {pushNotificationPermission === 'granted' && (
                <button
                  onClick={togglePushEnabled}
                  className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    isPushEnabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {isPushEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                  <span>{isPushEnabled ? 'Push Enabled' : 'Push Muted'}</span>
                </button>
              )}

              {/* Sound Chime Toggle */}
              <button
                onClick={toggleSoundEnabled}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isSoundEnabled
                    ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                    : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                }`}
                title={isSoundEnabled ? 'Alert chimes enabled' : 'Alert chimes muted'}
              >
                {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Test Leak Notification */}
              <button
                onClick={handleTestAlert}
                disabled={testSent}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                title="Send a sample critical pipe leak push notification right now"
              >
                <Radio className={`w-3.5 h-3.5 text-rose-600 ${testSent ? 'animate-ping' : ''}`} />
                <span>{testSent ? 'Alert Dispatched!' : 'Send Test Leak'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar: Category Filters & Bulk Actions */}
        <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 text-xs">
            {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  activeFilter === tab
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab === 'ALL' ? 'All Alerts' : tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {unreadNotificationsCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-xs font-semibold text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
                title="Clear all alerts from log"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Log</span>
              </button>
            )}
          </div>
        </div>

        {/* Notification Stream Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-70" />
              <p className="text-sm font-bold text-slate-700">No Notifications in this Category</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Campus hydraulic telemetry is operating within nominal thresholds. When a flow surge or pressure drop occurs, alerts will appear here.
              </p>
            </div>
          ) : (
            filteredNotifications.map(n => {
              const isCritical = n.type === 'critical';
              const isWarning = n.type === 'warning';
              const isSuccess = n.type === 'success';

              return (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 relative group ${
                    !n.read
                      ? isCritical
                        ? 'bg-rose-50/70 border-rose-200 shadow-xs'
                        : isWarning
                        ? 'bg-amber-50/70 border-amber-200 shadow-xs'
                        : 'bg-cyan-50/70 border-cyan-200 shadow-xs'
                      : 'bg-white border-slate-200/80 opacity-80 hover:opacity-100'
                  }`}
                >
                  {/* Status Indicator Icon */}
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    isCritical
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : isWarning
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                      : isSuccess
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                  }`}>
                    {isCritical ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : isSuccess ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 pr-8">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800'
                          : isSuccess
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-cyan-100 text-cyan-800'
                      }`}>
                        {n.type.toUpperCase()}
                      </span>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                      )}
                      <span className="text-[11px] text-slate-400 font-medium">
                        {n.time}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-1 leading-snug">
                      {n.title}
                    </h4>

                    {n.body && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {n.body}
                      </p>
                    )}

                    {/* Action Link for Leak Anomalies */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        onClick={() => handleNavigateToAnomaly(n)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all cursor-pointer"
                      >
                        <span>Investigate in Anomaly Center</span>
                        <ExternalLink className="w-3 h-3 text-cyan-400" />
                      </button>

                      {!n.read && (
                        <button
                          onClick={() => markNotificationRead(n.id)}
                          className="text-xs font-medium text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Delete individual button */}
                  <button
                    onClick={() => removeNotification(n.id)}
                    className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Dismiss notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Connected to JalRakshak Real-Time Telemetry Event Bus</span>
          </div>

          <button
            onClick={() => {
              setActiveTab('anomalies');
              onClose();
            }}
            className="text-xs font-bold text-slate-800 hover:text-cyan-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Open Anomaly & Leakage Center</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-600" />
          </button>
        </div>

      </div>
    </div>
  );
};
