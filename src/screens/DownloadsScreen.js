import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import {
  listDownloads,
  deleteDownload,
  formatBytes,
  formatDate,
} from '../downloads';

export default function DownloadsScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [files, setFiles] = useState([]);

  const refresh = useCallback(async () => {
    try {
      setFiles(await listDownloads());
    } catch (e) {
      setFiles([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const confirmDelete = (name) => {
    Alert.alert('Delete', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDownload(name);
          } catch (e) {}
          refresh();
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Downloads</Text>
      </View>
      {files.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="arrow-down-circle-outline" size={48} color={colors.sub} />
          <Text style={[styles.emptyText, { color: colors.sub }]}>
            Nothing downloaded yet.{'\n'}Open a video page in the browser,{'\n'}tap ⋯ then "Download Video".
          </Text>
        </View>
      ) : (
        <FlatList
          data={files}
          keyExtractor={(i) => i.name}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: colors.border }]}
              onPress={() =>
                navigation.navigate('Player', { uri: item.uri, name: item.name })
              }
            >
              <View style={[styles.thumb, { backgroundColor: colors.card }]}>
                <Ionicons name="play" size={20} color={colors.primary} />
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.rowSub, { color: colors.sub }]}>
                  {formatBytes(item.size)} · {formatDate(item.mtime)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => confirmDelete(item.name)}
                hitSlop={12}
              >
                <Ionicons name="trash-outline" size={18} color={colors.sub} />
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
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '800' },
  list: { paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowText: { flex: 1, marginRight: 8 },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowSub: { fontSize: 13, marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { marginTop: 16, fontSize: 15, textAlign: 'center', lineHeight: 24 },
});
