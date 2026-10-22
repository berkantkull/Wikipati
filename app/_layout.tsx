import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(Ionicons.font);
  const [storageReady, setStorageReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem("wikipati.v1")
      .catch(() => null)
      .finally(() => active && setStorageReady(true));
    const fallback = setTimeout(() => active && setTimedOut(true), 4000);
    return () => {
      active = false;
      clearTimeout(fallback);
    };
  }, []);

  const ready = (fontsLoaded || !!fontError) && storageReady;
  useEffect(() => {
    if (ready || timedOut) void SplashScreen.hideAsync().catch(() => {});
  }, [ready, timedOut]);

  if (!ready && !timedOut) return null;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="rehber/[slug]" />
      <Stack.Screen name="pati/[id]" />
      <Stack.Screen name="pati/[id]/takvim" />
    </Stack>
  );
}
