// JalRakshak AI — Browser Web Notification & Push Dispatcher
// Manages Notification API permissions, system notification delivery,
// custom sound chimes, debouncing, and direct deep-linking to Anomaly & Leakage Center.

export interface PushNotificationPayload {
  title: string;
  body: string;
  tag?: string;
  icon?: string;
  badge?: string;
  urgency?: 'low' | 'normal' | 'high' | 'critical';
  data?: {
    anomalyId?: string;
    location?: string;
    riskPercent?: number;
    lossLph?: number;
    route?: string;
    timestamp?: string;
  };
}

class NotificationService {
  private permissionState: NotificationPermission = 'default';
  private audioContext: AudioContext | null = null;
  private soundEnabled = true;
  private pushEnabled = true;
  private sentNotificationTags = new Set<string>();

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permissionState = Notification.permission;
      const storedSound = localStorage.getItem('jalrakshak_sound_notifs');
      if (storedSound !== null) {
        this.soundEnabled = storedSound === 'true';
      }
      const storedPush = localStorage.getItem('jalrakshak_browser_notifs');
      if (storedPush !== null) {
        this.pushEnabled = storedPush === 'true';
      }
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    this.permissionState = Notification.permission;
    return this.permissionState;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    localStorage.setItem('jalrakshak_sound_notifs', String(enabled));
  }

  public isPushEnabled(): boolean {
    return this.pushEnabled;
  }

  public setPushEnabled(enabled: boolean): void {
    this.pushEnabled = enabled;
    localStorage.setItem('jalrakshak_browser_notifs', String(enabled));
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const perm = await Notification.requestPermission();
      this.permissionState = perm;
      if (perm === 'granted') {
        this.setPushEnabled(true);
      }
      return perm;
    } catch (err) {
      console.warn('Failed to request notification permission:', err);
      return 'denied';
    }
  }

  public playAlertChime(urgency: 'low' | 'normal' | 'high' | 'critical' = 'critical'): void {
    if (!this.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      if (urgency === 'critical') {
        // High-pitched warning two-tone beep (880Hz -> 659Hz)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(659, now + 0.15);
        osc.frequency.setValueAtTime(880, now + 0.25);
        osc.frequency.exponentialRampToValueAtTime(587, now + 0.45);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        osc.start(now);
        osc.stop(now + 0.5);
      } else {
        // Subtle alert tone (523Hz -> 659Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.2);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {
      // Audio playback might be prevented by browser auto-play policy before user gesture
    }
  }

  public async sendLeakAlert(payload: PushNotificationPayload): Promise<boolean> {
    if (!this.isSupported()) return false;
    if (!this.pushEnabled) return false;

    // Deduplicate by tag to avoid spamming the user within 30 seconds
    const dedupeKey = payload.tag || `${payload.title}-${payload.data?.location || ''}`;
    if (this.sentNotificationTags.has(dedupeKey)) {
      return false;
    }
    this.sentNotificationTags.add(dedupeKey);
    setTimeout(() => {
      this.sentNotificationTags.delete(dedupeKey);
    }, 30000);

    // Audio chime
    this.playAlertChime(payload.urgency || 'critical');

    // Check permission
    if (Notification.permission !== 'granted') {
      return false;
    }

    const title = payload.title || '🚨 Significant Water Leak Detected';
    const options: NotificationOptions & { renotify?: boolean } = {
      body: payload.body,
      icon: payload.icon || '/pwa-icon.svg',
      badge: payload.badge || '/pwa-icon.svg',
      tag: dedupeKey,
      renotify: true,
      data: payload.data || { route: 'anomalies' },
      requireInteraction: payload.urgency === 'critical'
    };

    // Prefer Service Worker registration showNotification for background & lockscreen compatibility
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && typeof registration.showNotification === 'function') {
          await registration.showNotification(title, options);
          return true;
        }
      } catch (swErr) {
        console.warn('SW notification fallback to window.Notification:', swErr);
      }
    }

    // Fallback to standard window Notification API
    try {
      const notification = new Notification(title, options);
      notification.onclick = () => {
        window.focus();
        if (payload.data?.route) {
          window.dispatchEvent(
            new CustomEvent('jalrakshak_navigate', { detail: { tab: payload.data.route, anomalyId: payload.data?.anomalyId } })
          );
        }
        notification.close();
      };
      return true;
    } catch (err) {
      console.error('Error creating Notification:', err);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
