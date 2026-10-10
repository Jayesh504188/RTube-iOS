import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'rtube:history:v1';
const MAX = 200;

const HistoryContext = createContext(null);

export function HistoryProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setItems(JSON.parse(raw));
      } catch (e) {}
    })();
  }, []);

  const addEntry = useCallback((url, title) => {
    if (!url || url === 'about:blank') return;
    setItems((prev) => {
      const next = [
        { url, title: title || url, ts: Date.now() },
        ...prev.filter((i) => i.url !== url),
      ].slice(0, MAX);
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const removeEntry = useCallback((url) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.url !== url);
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const clear = useCallback(async () => {
    setItems([]);
    try {
      await AsyncStorage.removeItem(KEY);
    } catch (e) {}
  }, []);

  return (
    <HistoryContext.Provider value={{ items, addEntry, removeEntry, clear }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used inside HistoryProvider');
  return ctx;
}
