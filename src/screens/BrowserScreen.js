import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Alert,
  Share,
  StyleSheet,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { registerBrowserWebView } from '../sleeptimer';
import { useSettings } from '../settings';
import { useTheme } from '../theme';
import { useHistory } from '../history';
import {
  ADBLOCK_JS,
  SET_BLOCK_ENABLED,
  SET_BACKGROUND_PLAY,
  FIND_VIDEO_JS,
} from '../adblock';
import { AirPlayButton } from '../../modules/rtube-airplay/src/index';
import {
  ensureDownloadsDir,
  DOWNLOADS_DIR,
  safeFileName,
} from '../downloads';

// Best-effort data saver: YouTube honors the vq parameter on watch pages.
function applyQuality(url, quality) {
  if (
    quality === 'mobile' &&
    /youtube\.com\/watch/.test(url) &&
    !/[?&]vq=/.test(url)
  ) {
    return url + (url.includes('?') ? '&' : '?') + 'vq=tiny';
  }
  return url;
}

function ToolBtn({ icon, onPress, disabled }) {
  return (
    <TouchableOpacity
      style={styles.toolBtn}
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
    >
      <Ionicons
        name={icon}
        size={22}
        color={disabled ? 'rgba(255,255,255,0.3)' : '#fff'}
      />
    </TouchableOpacity>
  );
}

export default function BrowserScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { prefs, setPref } = useSettings();
  const { colors } = useTheme();
  const { addEntry } = useHistory();

  const webRef = useRef(null);
  const hideTimer = useRef(null);
  const lastUrl = useRef('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  const initialUrl = applyQuality(
    route.params?.url || 'https://m.youtube.com',
    prefs.quality
  );

  useEffect(() => {
    registerBrowserWebView(webRef.current);
    return () => registerBrowserWebView(null);
  }, []);

  // Keep the page's live toggles in sync with Settings.
  useEffect(() => {
    try {
      webRef.current?.injectJavaScript(SET_BLOCK_ENABLED(prefs.blockAds));
    } catch (e) {}
  }, [prefs.blockAds]);

  useEffect(() => {
    try {
      webRef.current?.injectJavaScript(
        SET_BACKGROUND_PLAY(prefs.backgroundPlay)
      );
    } catch (e) {}
  }, [prefs.backgroundPlay]);

  const pokeControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 4000);
  }, []);

  useEffect(() => {
    pokeControls();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [pokeControls]);

  const onNav = (state) => {
    setCanGoBack(state.canGoBack);
    setCanGoForward(state.canGoForward);
    const url = state.url;
    if (url && url !== lastUrl.current && !url.startsWith('about:')) {
      lastUrl.current = url;
      addEntry(url, state.title);
    }
  };

  const downloadVideo = useCallback(() => {
    pokeControls();
    try {
      webRef.current?.injectJavaScript(FIND_VIDEO_JS);
    } catch (e) {}
  }, [pokeControls]);

  const onMessage = async (event) => {
    let msg = null;
    try {
      msg = JSON.parse(event.nativeEvent.data);
    } catch (e) {
      return;
    }
    if (!msg || msg.type !== 'RTUBE_VIDEO_SRC') return;
    if (!msg.src) {
      Alert.alert(
        'Download',
        'No downloadable video found on this page. Open a page with a direct video file and try again.'
      );
      return;
    }
    try {
      await ensureDownloadsDir();
      const name = safeFileName(msg.title || 'video') + '.mp4';
      await FileSystem.downloadAsync(msg.src, DOWNLOADS_DIR + name);
      Alert.alert('Download complete', `${name} saved to Downloads.`);
    } catch (e) {
      Alert.alert(
        'Download failed',
        'This video cannot be downloaded (streaming-protected pages are not supported).'
      );
    }
  };

  const sharePage = () => {
    const url = lastUrl.current || initialUrl;
    Share.share({ url, message: url }).catch(() => {});
  };

  const openMenu = () => {
    pokeControls();
    Alert.alert('Options', lastUrl.current || '', [
      { text: 'Sleep Timer', onPress: () => navigation.navigate('SleepTimer') },
      { text: 'Download Video', onPress: downloadVideo },
      {
        text: prefs.blockAds ? 'Turn Block Ads Off' : 'Turn Block Ads On',
        onPress: () => setPref('blockAds', !prefs.blockAds),
      },
      { text: 'Share Page', onPress: sharePage },
      {
        text: 'Reload',
        onPress: () => {
          try {
            webRef.current?.reload();
          } catch (e) {}
        },
      },
      { text: 'Close', style: 'cancel' },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <WebView
        ref={webRef}
        source={{ uri: initialUrl }}
        style={styles.webview}
        injectedJavaScriptBeforeContentLoaded={ADBLOCK_JS}
        injectedJavaScript={ADBLOCK_JS}
        onNavigationStateChange={onNav}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        allowsBackForwardNavigationGestures
        allowsInlineMediaPlayback
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        allowsLinkPreview={false}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
      />

      {controlsVisible ? (
        <>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}
            hitSlop={10}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.toolbar}>
            <ToolBtn
              icon="chevron-back"
              disabled={!canGoBack}
              onPress={() => webRef.current?.goBack()}
            />
            <ToolBtn
              icon="chevron-forward"
              disabled={!canGoForward}
              onPress={() => webRef.current?.goForward()}
            />
            <ToolBtn icon="reload" onPress={() => webRef.current?.reload()} />
            <View style={styles.airplayWrap}>
              <AirPlayButton size={30} />
            </View>
            <ToolBtn icon="arrow-down" onPress={downloadVideo} />
            <ToolBtn icon="ellipsis-horizontal" onPress={openMenu} />
          </View>
        </>
      ) : (
        <TouchableOpacity
          style={styles.grip}
          onPress={pokeControls}
          hitSlop={10}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  webview: { flex: 1 },
  closeBtn: {
    position: 'absolute',
    top: 54,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbar: {
    position: 'absolute',
    bottom: 34,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  toolBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  airplayWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grip: {
    position: 'absolute',
    bottom: 34,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
