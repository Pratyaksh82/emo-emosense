import { useState, useEffect, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(true); // default true until checked
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check standalone mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    const standalone = checkStandalone();

    // 2. Detect iOS & Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    // 3. Detect In-App Browsers (Instagram, WhatsApp, Facebook)
    const inApp = /instagram|fbav|fban|whatsapp|line|micromessenger/.test(ua);
    setIsInAppBrowser(inApp);

    // 4. Check dismissal in localStorage
    const dismissedUntil = localStorage.getItem('emosense_install_dismissed_until');
    const now = Date.now();
    const dismissed = dismissedUntil ? now < parseInt(dismissedUntil, 10) : false;

    if (!standalone && !dismissed) {
      // Show after a brief gentle delay (2 seconds)
      const timer = setTimeout(() => {
        setIsDismissed(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setIsDismissed(true);
    }

    // 5. Capture beforeinstallprompt event (Android / Chromium / Desktop)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!standalone && !dismissed) {
        setIsDismissed(false);
      }
    };

    // 6. Track appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsDismissed(true);
      localStorage.removeItem('emosense_install_dismissed_until');
      console.log('[PWA] EmoSense app successfully installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Action: Trigger Install Prompt
  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setIsDismissed(true);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[PWA] Install prompt failed:', err);
      return false;
    }
  }, [deferredPrompt]);

  // Action: Dismiss for N days (7 days default, 14 days for iOS)
  const dismissPrompt = useCallback((days: number = 7) => {
    setIsDismissed(true);
    const expireTime = Date.now() + days * 24 * 60 * 60 * 1000;
    localStorage.setItem('emosense_install_dismissed_until', String(expireTime));
  }, []);

  // Action: Force open banner manually (e.g. from Header / Settings "Install App" button)
  const openBannerManually = useCallback(() => {
    setIsDismissed(false);
  }, []);

  return {
    deferredPrompt,
    canInstallAndroid: !!deferredPrompt,
    isStandalone,
    isIOS,
    isInAppBrowser,
    isDismissed,
    isInstalled,
    promptInstall,
    dismissPrompt,
    openBannerManually
  };
}
