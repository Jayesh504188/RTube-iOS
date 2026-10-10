import React from 'react';
import { requireNativeViewManager } from 'expo-modules-core';

// Native iOS view wrapping AVRoutePickerView (the system AirPlay route picker).
// Tapping it opens the standard AirPlay destination sheet.
const NativeAirPlayView = requireNativeViewManager('RTubeAirplay');

export function AirPlayButton({ size = 44, style }) {
  return <NativeAirPlayView style={[{ width: size, height: size }, style]} />;
}
