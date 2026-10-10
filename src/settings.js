import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'rtube:settings:v1';

export const DEFAULTS = {
  appearance: 'auto', // auto | light | dark
  quality: 'wifi', // wifi | mobile
  blockAds: true,
  backgroundPlay: true,
  notifications: false,
  language: 'English',
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [prefs, setPrefs] = useState(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setPrefs({ ...DEFAULTS, ...JSON.parse(raw) });
      } catch (e) {
        // corrupted storage -> keep defaults
      }
      setReady(true);
    })();
  }, []);

  const setPref = useCallback((k, v) => {
    setPrefs((prev) => {
      const next = { ...prev, [k]: v };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const resetAll = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(KEY);
    } catch (e) {}
    setPrefs(DEFAULTS);
  }, []);

  return (
    <SettingsContext.Provider value={{ prefs, setPref, resetAll, ready }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
