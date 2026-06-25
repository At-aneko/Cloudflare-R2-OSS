import { useCallback } from 'react';
import { useAppStore } from '../store/appStore';

declare global {
  interface Window {
    turnstile: {
      render: (element: string | HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'expired-callback'?: () => void;
        'error-callback'?: () => void;
        theme?: 'light' | 'dark' | 'auto';
        size?: 'normal' | 'compact';
      }) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

const TURNSTILE_SITE_KEY = '0x4AAAAAADVWOePrkWv_vDrrSeo_MG7PiA4';

export function useTurnstile() {
  const setShowTurnstile = useAppStore((s) => s.setShowTurnstile);
  const setTurnstileToken = useAppStore((s) => s.setTurnstileToken);

  const loadTurnstileScript = useCallback(() => {
    if (document.querySelector('script[src*="turnstile"]')) return;
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  const renderTurnstile = useCallback((containerId: string, onSuccess: (token: string) => void) => {
    if (!window.turnstile) {
      setTimeout(() => renderTurnstile(containerId, onSuccess), 200);
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) return;

    window.turnstile.render(`#${containerId}`, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token: string) => {
        setTurnstileToken(token);
        setShowTurnstile(false);
        onSuccess(token);
      },
      'expired-callback': () => {
        setTurnstileToken('');
      },
      theme: 'dark',
    });
  }, [setTurnstileToken, setShowTurnstile]);

  return { loadTurnstileScript, renderTurnstile };
}