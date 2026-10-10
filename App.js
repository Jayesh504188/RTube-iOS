import React, { useEffect } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';
import { SettingsProvider } from './src/settings';
import { HistoryProvider } from './src/history';
import { SleepTimerProvider } from './src/sleeptimer';
import { useTheme } from './src/theme';
import HomeScreen from './src/screens/HomeScreen';
import BrowserScreen from './src/screens/BrowserScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import DownloadsScreen from './src/screens/DownloadsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SleepTimerScreen from './src/screens/SleepTimerScreen';
import InfoScreen from './src/screens/InfoScreen';
import VideoPlayerScreen from './src/screens/VideoPlayerScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Home: 'home',
  History: 'time',
  Downloads: 'arrow-down-circle',
  Settings: 'settings',
};

function Tabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.sub,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Downloads" component={DownloadsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function Root() {
  const { mode } = useTheme();
  return (
    <NavigationContainer theme={mode === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen
          name="Browser"
          component={BrowserScreen}
          options={{ gestureEnabled: true }}
        />
        <Stack.Screen
          name="SleepTimer"
          component={SleepTimerScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="Info" component={InfoScreen} />
        <Stack.Screen name="Player" component={VideoPlayerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    // Keep audio playing when the app goes to the background.
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    }).catch(() => {});
  }, []);

  return (
    <SettingsProvider>
      <HistoryProvider>
        <SleepTimerProvider>
          <Root />
        </SleepTimerProvider>
      </HistoryProvider>
    </SettingsProvider>
  );
}
