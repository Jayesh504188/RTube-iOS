import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import { PAUSE_ALL_JS } from './adblock';

// The BrowserScreen registers its WebView here so the timer can pause
// whatever media is playing in the page when the countdown ends.
let browserWebView = null;
export function registerBrowserWebView(ref) {
  browserWebView = ref;
}

const SleepTimerContext = createContext(null);

export function SleepTimerProvider({ children }) {
  const [remaining, setRemaining] = useState(null); // seconds, or null when off
  const intervalRef = useRef(null);

  const fire = useCallback(() => {
    try {
      if (browserWebView) browserWebView.injectJavaScript(PAUSE_ALL_JS);
    } catch (e) {}
    setRemaining(null);
  }, []);

  const start = useCallback(
    (minutes) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const total = Math.max(1, Math.round(minutes * 60));
      setRemaining(total);
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev == null) return prev;
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
            fire();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [fire]
  );

  const cancel = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRemaining(null);
  }, []);

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    },
    []
  );

  return (
    <SleepTimerContext.Provider value={{ remaining, start, cancel }}>
      {children}
    </SleepTimerContext.Provider>
  );
}

export function useSleepTimer() {
  const ctx = useContext(SleepTimerContext);
  if (!ctx) throw new Error('useSleepTimer must be used inside SleepTimerProvider');
  return ctx;
}

export function formatCountdown(totalSeconds) {
  if (totalSeconds == null) return '';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
