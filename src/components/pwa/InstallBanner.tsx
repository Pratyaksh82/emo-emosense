import React, { useState } from 'react';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { Share, PlusSquare, X, ArrowDown, Copy, Check, Download } from 'lucide-react';
import './InstallBanner.css';

interface InstallBannerProps {
  onManualTriggerRef?: (fn: () => void) => void;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({ onManualTriggerRef }) => {
  const {
    canInstallAndroid,
    isStandalone,
    isIOS,
    isInAppBrowser,
    isDismissed,
    isInstalled,
    promptInstall,
    dismissPrompt,
    openBannerManually
  } = useInstallPrompt();

  const [copied, setCopied] = useState<boolean>(false);

  // Expose manual trigger to parent if needed
  React.useEffect(() => {
    if (onManualTriggerRef) {
      onManualTriggerRef(openBannerManually);
    }
  }, [onManualTriggerRef, openBannerManually]);

  // If already installed or running in standalone mode, hide
  if (isStandalone || isInstalled) {
    return null;
  }

  // If dismissed, hide banner
  if (isDismissed) {
    return null;
  }

  // 1. In-App Browser (Instagram, WhatsApp, etc.) Notice
  if (isInAppBrowser) {
    const handleCopy = () => {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    };

    return (
      <div className="pwa-banner-container" role="dialog" aria-label="Open in Browser Notice">
        <div className="pwa-card pwa-card-inapp">
          <button
            className="pwa-close-btn"
            onClick={() => dismissPrompt(7)}
            aria-label="Close Notice"
          >
            <X size={18} />
          </button>
          <div className="pwa-card-header">
            <div className="pwa-app-icon">
              <img src="/icons/icon-192x192.png" alt="EmoSense App Icon" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
            </div>
            <div className="pwa-card-text">
              <h3 className="pwa-title">Open in Safari or Chrome</h3>
              <p className="pwa-sub">
                To install EmoSense and use it offline, open this link in your standard browser.
              </p>
            </div>
          </div>
          <div className="pwa-actions-row">
            <button className="pwa-btn pwa-btn-primary" onClick={handleCopy}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
            </button>
            <button className="pwa-btn pwa-btn-ghost" onClick={() => dismissPrompt(7)}>
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. iOS Safari Step-by-Step Guide
  if (isIOS) {
    return (
      <div className="pwa-banner-container" role="dialog" aria-label="Add to Home Screen Guide">
        <div className="pwa-card pwa-card-ios">
          <button
            className="pwa-close-btn"
            onClick={() => dismissPrompt(14)}
            aria-label="Close Guide"
          >
            <X size={18} />
          </button>

          <h3 className="pwa-title" style={{ fontSize: 15, marginBottom: 8 }}>
            Add EmoSense to your home screen
          </h3>

          <div className="ios-steps-list">
            <div className="ios-step-item">
              <span className="step-num">1</span>
              <span>Tap the Share button</span>
              <Share size={16} className="step-icon text-cyan-400" />
            </div>
            <div className="ios-step-item">
              <span className="step-num">2</span>
              <span>Choose Add to Home Screen</span>
              <PlusSquare size={16} className="step-icon text-indigo-400" />
            </div>
          </div>

          <div className="pwa-actions-row" style={{ marginTop: 12 }}>
            <button className="pwa-btn pwa-btn-primary" onClick={() => dismissPrompt(14)}>
              Got it
            </button>
          </div>

          {/* Soft bouncing arrow pointing down towards Safari toolbar */}
          <div className="ios-bottom-indicator" aria-hidden="true">
            <div className="ios-bouncing-arrow">
              <ArrowDown size={18} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Android / Chrome / Desktop Calm Bottom Card (Main Banner)
  return (
    <div className="pwa-banner-container" role="dialog" aria-label="Install EmoSense App">
      <div className="pwa-card pwa-card-main">
        <button
          className="pwa-close-btn"
          onClick={() => dismissPrompt(7)}
          aria-label="Dismiss banner"
        >
          <X size={18} />
        </button>

        <div className="pwa-card-header">
          <div className="pwa-app-icon">
            <img src="/icons/icon-192x192.png" alt="EmoSense App Icon" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
          </div>
          <div className="pwa-card-text">
            <h3 className="pwa-title">Keep EmoSense with you</h3>
            <p className="pwa-sub">Works offline. Your calming tools are always ready.</p>
          </div>
        </div>

        <div className="pwa-actions-row">
          <button
            className="pwa-btn pwa-btn-primary"
            onClick={promptInstall}
            aria-label="Install EmoSense application"
          >
            <Download size={16} />
            <span>Install</span>
          </button>
          <button
            className="pwa-btn pwa-btn-ghost"
            onClick={() => dismissPrompt(7)}
            aria-label="Dismiss install banner for 7 days"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallBanner;
