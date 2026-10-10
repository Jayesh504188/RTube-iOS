import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { useHistory } from '../history';

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').replace(/^m\./, '');
  } catch (e) {
    return '';
  }
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? 'Yesterday' : `${days} days ago`;
}

export default function HistoryScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { items, removeEntry, clear } = useHistory();

  const confirmClear = () => {
    Alert.alert('Clear History', 'Delete all browsing history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clear },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>History</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={confirmClear}>
            <Text style={[styles.clear, { color: colors.primary }]}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={48} color={colors.sub} />
          <Text style={[styles.emptyText, { color: colors.sub }]}>
            No history yet.{'\n'}Pages you visit will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.url}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: colors.border }]}
              onPress={() => navigation.navigate('Browser', { url: item.url })}
            >
              <View style={[styles.favicon, { backgroundColor: colors.card }]}>
                <Ionicons name="globe-outline" size={20} color={colors.sub} />
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.rowSub, { color: colors.sub }]} numberOfLines={1}>
                  {hostOf(item.url)} · {timeAgo(item.ts)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => removeEntry(item.url)}
                hitSlop={12}
              >
                <Ionicons name="close" size={18} color={colors.sub} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  title: { fontSize: 28, fontWeight: '800' },
  clear: { fontSize: 15, fontWeight: '600' },
  list: { paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  favicon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowText: { flex: 1, marginRight: 8 },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowSub: { fontSize: 13, marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { marginTop: 16, fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
