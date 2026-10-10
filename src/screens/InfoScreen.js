import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

const PRIVACY = `Privacy Policy for RTube

Last updated: October 2026

RTube is a video browser app. We respect your privacy.

Data We Collect
We do not collect, store, or share any personal data. The app does not require an account, and we run no analytics, tracking, or advertising SDKs.

On-Device Data
Your settings, browsing history, downloads, and sleep-timer preferences are stored only on your device. You can delete them at any time from Settings > Clear Data. Nothing is uploaded to any server.

Network Access
The app loads the websites you choose to visit (such as video platforms). Those websites operate under their own privacy policies once loaded.

Contact
If you have questions about this policy, contact us at support@rtube.app.`;

const TERMS = `Terms of Use for RTube

Last updated: October 2026

By using RTube, you agree to these terms.

1. The App
RTube provides a browser for video websites with features like ad blocking, background playback, downloads, and AirPlay casting.

2. Third-Party Content
Video websites you visit are operated by third parties. Their content, availability, and terms are their responsibility, not ours.

3. Acceptable Use
Use the app only for lawful purposes and respect the rights of content owners. Downloading content may be restricted by the website's terms or by law in your region.

4. No Warranty
The app is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free operation.

5. Changes
We may update these terms from time to time. Continued use of the app after changes means you accept the updated terms.

Contact: support@rtube.app`;

export default function InfoScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const kind = route.params?.kind === 'terms' ? 'terms' : 'privacy';

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {kind === 'terms' ? 'Terms of Use' : 'Privacy Policy'}
        </Text>
        <View style={{ width: 26 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[styles.text, { color: colors.text }]}>
          {kind === 'terms' ? TERMS : PRIVACY}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: { fontSize: 20, fontWeight: '800' },
  body: { paddingHorizontal: 20, paddingBottom: 40 },
  text: { fontSize: 15, lineHeight: 24 },
});
