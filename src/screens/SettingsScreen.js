import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../theme';
import { useSettings } from '../settings';
import { useHistory } from '../history';
import { useSleepTimer, formatCountdown } from '../sleeptimer';
import { clearDownloads } from '../downloads';

const SUPPORT_EMAIL = 'support@rtube.app';
// Filled in after the App Store listing exists.
const APP_STORE_ID = '';

function Row({ icon, label, value, onPress, right, danger }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress && !right}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <Ionicons
        name={icon}
        size={20}
        color={danger ? colors.danger : colors.sub}
        style={styles.rowIcon}
      />
      <Text
        style={[styles.rowLabel, { color: danger ? colors.danger : colors.text }]}
      >
        {label}
      </Text>
      {value != null && (
        <Text style={[styles.rowValue, { color: colors.sub }]}>{value}</Text>
      )}
      {right || null}
      {onPress && !right && (
        <Ionicons name="chevron-forward" size={18} color={colors.sub} />
      )}
    </TouchableOpacity>
  );
}

function Section({ title, children }) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.sub }]}>{title}</Text>
      <View style={[styles.sectionBody, { backgroundColor: colors.card }]}>
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { colors, mode } = useTheme();
  const { prefs, setPref, resetAll } = useSettings();
  const { clear } = useHistory();
  const { remaining } = useSleepTimer();

  const cycleAppearance = () => {
    const order = ['auto', 'light', 'dark'];
    const next = order[(order.indexOf(prefs.appearance) + 1) % order.length];
    setPref('appearance', next);
  };

  const appearanceLabel =
    prefs.appearance === 'auto'
      ? `Auto (${mode === 'dark' ? 'Dark' : 'Light'})`
      : prefs.appearance === 'dark'
        ? 'Dark'
        : 'Light';

  const pickQuality = () => {
    Alert.alert('Quality', 'Preferred video quality on mobile data.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Mobile Data (saver)', onPress: () => setPref('quality', 'mobile') },
      { text: 'Wi-Fi (best)', onPress: () => setPref('quality', 'wifi') },
    ]);
  };

  const confirmClearHistory = () => {
    Alert.alert('Clear History', 'Delete all browsing history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clear },
    ]);
  };

  const confirmClearData = () => {
    Alert.alert(
      'Clear Data',
      'Delete browsing history, downloads and reset all settings?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clear();
              await clearDownloads();
              await resetAll();
            } catch (e) {}
            Alert.alert('Done', 'All data cleared.');
          },
        },
      ]
    );
  };

  const toggleNotifications = async (value) => {
    if (value) {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Notifications',
            'Permission denied. Enable notifications in iOS Settings to get download alerts.'
          );
          return;
        }
      } catch (e) {}
    }
    setPref('notifications', value);
  };

  const contactUs = () => {
    Linking.openURL(
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('RTube Inquiry')}`
    ).catch(() =>
      Alert.alert('Contact Us', `Email us at ${SUPPORT_EMAIL}`)
    );
  };

  const shareApp = () => {
    Share.share({
      message: 'RTube - Browse, Play & Cast. All your favorite videos in one app.',
    }).catch(() => {});
  };

  const rateApp = () => {
    if (APP_STORE_ID) {
      Linking.openURL(
        `https://apps.apple.com/app/id${APP_STORE_ID}?action=write-review`
      ).catch(() => {});
    } else {
      Alert.alert(
        'Rate App',
        'Thanks for the love! Rating will be available once RTube is on the App Store.'
      );
    }
  };

  const sw = (value, onValueChange) => (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ true: colors.primary }}
    />
  );

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

      <Section title="PLAYBACK">
        <Row
          icon="contrast-outline"
          label="Appearance"
          value={appearanceLabel}
          onPress={cycleAppearance}
        />
        <Row
          icon="film-outline"
          label="Quality"
          value={prefs.quality === 'wifi' ? 'Wi-Fi (best)' : 'Mobile Data (saver)'}
          onPress={pickQuality}
        />
        <Row
          icon="timer-outline"
          label="Sleep Timer"
          value={remaining != null ? formatCountdown(remaining) : 'Off'}
          onPress={() => navigation.navigate('SleepTimer')}
        />
        <Row
          icon="musical-notes-outline"
          label="Background Play"
          right={sw(prefs.backgroundPlay, (v) => setPref('backgroundPlay', v))}
        />
      </Section>

      <Section title="PRIVACY">
        <Row
          icon="shield-checkmark-outline"
          label="Block Ads"
          right={sw(prefs.blockAds, (v) => setPref('blockAds', v))}
        />
        <Row
          icon="time-outline"
          label="Clear History"
          onPress={confirmClearHistory}
        />
        <Row
          icon="trash-outline"
          label="Clear Data"
          danger
          onPress={confirmClearData}
        />
      </Section>

      <Section title="GENERAL">
        <Row icon="language-outline" label="Language" value="English" />
        <Row
          icon="notifications-outline"
          label="Notifications"
          right={sw(prefs.notifications, toggleNotifications)}
        />
      </Section>

      <Section title="ABOUT">
        <Row
          icon="document-text-outline"
          label="Privacy Policy"
          onPress={() => navigation.navigate('Info', { kind: 'privacy' })}
        />
        <Row
          icon="reader-outline"
          label="Terms of Use"
          onPress={() => navigation.navigate('Info', { kind: 'terms' })}
        />
        <Row icon="mail-outline" label="Contact Us" onPress={contactUs} />
        <Row icon="share-social-outline" label="Share App" onPress={shareApp} />
        <Row icon="star-outline" label="Rate App" onPress={rateApp} />
        <Row icon="information-circle-outline" label="Version" value="1.0.0" />
      </Section>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  title: { fontSize: 28, fontWeight: '800', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 },
  section: { marginTop: 18 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionBody: { borderRadius: 16, marginHorizontal: 16, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: { marginRight: 12 },
  rowLabel: { flex: 1, fontSize: 16 },
  rowValue: { fontSize: 15, marginRight: 6 },
});
