import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useSleepTimer, formatCountdown } from '../sleeptimer';

const PRESETS = [5, 10, 15, 30, 45, 60, 90];

export default function SleepTimerScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { remaining, start, cancel } = useSleepTimer();

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="close" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Sleep Timer</Text>
        <View style={{ width: 26 }} />
      </View>

      <Text style={[styles.sub, { color: colors.sub }]}>
        Playback stops automatically when the timer ends.
      </Text>

      {remaining != null ? (
        <View style={styles.activeWrap}>
          <Ionicons name="timer-outline" size={64} color={colors.primary} />
          <Text style={[styles.countdown, { color: colors.text }]}>
            {formatCountdown(remaining)}
          </Text>
          <Text style={[styles.activeLabel, { color: colors.sub }]}>
            remaining
          </Text>
          <TouchableOpacity
            style={[styles.cancelBtn, { backgroundColor: colors.card }]}
            onPress={cancel}
          >
            <Text style={[styles.cancelText, { color: colors.danger }]}>
              Cancel Timer
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.grid}>
          {PRESETS.map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.chip, { backgroundColor: colors.card }]}
              onPress={() => {
                start(m);
                navigation.goBack();
              }}
            >
              <Text style={[styles.chipText, { color: colors.text }]}>
                {m}
              </Text>
              <Text style={[styles.chipSub, { color: colors.sub }]}>min</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  title: { fontSize: 22, fontWeight: '800' },
  sub: { textAlign: 'center', marginTop: 12, fontSize: 15, paddingHorizontal: 40 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
  },
  chip: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
  },
  chipText: { fontSize: 26, fontWeight: '700' },
  chipSub: { fontSize: 13, marginTop: 2 },
  activeWrap: { alignItems: 'center', marginTop: 48 },
  countdown: { fontSize: 56, fontWeight: '800', marginTop: 16, fontVariant: ['tabular-nums'] },
  activeLabel: { fontSize: 15, marginTop: 4 },
  cancelBtn: { borderRadius: 999, paddingHorizontal: 32, paddingVertical: 14, marginTop: 32 },
  cancelText: { fontSize: 16, fontWeight: '700' },
});
