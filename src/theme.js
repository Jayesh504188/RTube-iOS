import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSettings } from './settings';

export const Light = {
  bg: '#ffffff',
  card: '#f1f1f4',
  text: '#111114',
  sub: '#8e8e93',
  primary: '#ff1a1a',
  border: '#e4e4e8',
  tabBar: '#ffffff',
  overlay: 'rgba(0,0,0,0.45)',
  danger: '#ff3b30',
};

export const Dark = {
  bg: '#000000',
  card: '#1c1c1f',
  text: '#f5f5f7',
  sub: '#9a9aa0',
  primary: '#ff453a',
  border: '#2c2c30',
  tabBar: '#0a0a0c',
  overlay: 'rgba(0,0,0,0.6)',
  danger: '#ff6961',
};

export function useTheme() {
  const { prefs } = useSettings();
  const system = useColorScheme();
  const mode = prefs.appearance === 'auto' ? system || 'light' : prefs.appearance;
  return useMemo(
    () => ({ mode, colors: mode === 'dark' ? Dark : Light }),
    [mode]
  );
}
