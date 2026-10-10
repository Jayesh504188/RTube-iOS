import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useHistory } from '../history';

const SITES = [
  { name: 'YouTube', url: 'https://m.youtube.com', bg: '#ff0000', kind: 'play' },
  { name: 'Twitch', url: 'https://m.twitch.tv', bg: '#9146ff', kind: 'chat' },
  { name: 'TikTok', url: 'https://www.tiktok.com', bg: '#111111', kind: 'note' },
  { name: 'Rumble', url: 'https://rumble.com', bg: '#85c742', kind: 'play' },
];

function SiteGlyph({ kind }) {
  if (kind === 'play') return <Text style={{ color: '#fff', fontSize: 26 }}>▶</Text>;
  if (kind === 'note') return <Text style={{ color: '#fff', fontSize: 26 }}>♪</Text>;
  return (
    <View style={{ width: 30, height: 26 }}>
      <View style={{ width: 30, height: 20, borderRadius: 7, backgroundColor: '#fff' }} />
      <View
        style={{
          marginLeft: 7,
          width: 0,
          height: 0,
          borderLeftWidth: 5,
          borderRightWidth: 5,
          borderTopWidth: 8,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: '#fff',
        }}
      />
    </View>
  );
}

function toUrl(input) {
  const t = String(input || '').trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(t)) return 'https://' + t;
  return 'https://www.google.com/search?q=' + encodeURIComponent(t);
}

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch (e) {
    return url;
  }
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { items } = useHistory();
  const [query, setQuery] = useState('');

  const open = (url) => navigation.navigate('Browser', { url });
  const submit = () => {
    const u = toUrl(query);
    if (u) {
      open(u);
      setQuery('');
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Image
        source={require('../../assets/icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={[styles.searchPill, { backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search on Google or enter website"
          placeholderTextColor={colors.sub}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={submit}
          returnKeyType="go"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={submit} hitSlop={12}>
          <Ionicons name="search" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.sitesRow}>
          {SITES.map((s) => (
            <TouchableOpacity
              key={s.name}
              style={styles.site}
              onPress={() => open(s.url)}
              activeOpacity={0.7}
            >
              <View style={[styles.siteIcon, { backgroundColor: s.bg }]}>
                <SiteGlyph kind={s.kind} />
              </View>
              <Text style={[styles.siteName, { color: colors.sub }]}>{s.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.card, styles.settingsCard, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('Settings')}
        activeOpacity={0.7}
      >
        <Ionicons name="settings-outline" size={34} color={colors.text} />
        <View style={styles.settingsText}>
          <Text style={[styles.settingsTitle, { color: colors.text }]}>Settings</Text>
          <Text style={[styles.settingsSub, { color: colors.sub }]}>
            Discover more controls
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.sub} />
      </TouchableOpacity>

      {items.length > 0 && (
        <View style={styles.recentWrap}>
          <Text style={[styles.recentTitle, { color: colors.text }]}>
            Recently watched
          </Text>
          <FlatList
            data={items.slice(0, 10)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(i) => i.url}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.recentCard, { backgroundColor: colors.card }]}
                onPress={() => open(item.url)}
              >
                <Text style={[styles.recentHost, { color: colors.primary }]}>
                  {hostOf(item.url)}
                </Text>
                <Text
                  style={[styles.recentName, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 48, paddingBottom: 32 },
  logo: { width: 88, height: 88, borderRadius: 22, alignSelf: 'center' },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 20,
    height: 56,
    marginTop: 28,
  },
  searchInput: { flex: 1, fontSize: 16, marginRight: 8 },
  card: { borderRadius: 24, padding: 20, marginTop: 20 },
  sitesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  site: { alignItems: 'center', minWidth: 64 },
  siteIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  siteName: { marginTop: 8, fontSize: 12 },
  settingsCard: { flexDirection: 'row', alignItems: 'center' },
  settingsText: { flex: 1, marginLeft: 16 },
  settingsTitle: { fontSize: 18, fontWeight: '700' },
  settingsSub: { fontSize: 14, marginTop: 2 },
  recentWrap: { marginTop: 28 },
  recentTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  recentCard: {
    width: 180,
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
  },
  recentHost: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  recentName: { fontSize: 14, lineHeight: 19 },
});
