import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

export default function VideoPlayerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const videoRef = useRef(null);
  const { uri, name } = route.params || {};

  return (
    <View style={[styles.root, { backgroundColor: '#000' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {name || 'Video'}
        </Text>
        <View style={{ width: 26 }} />
      </View>
      {uri ? (
        <Video
          ref={videoRef}
          source={{ uri }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
        />
      ) : (
        <View style={styles.empty}>
          <Text style={{ color: colors.sub }}>Video not found.</Text>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1, marginHorizontal: 12 },
  video: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
