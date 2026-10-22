import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

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

  useEffect(() => {
    if (Platform.OS === "web") return;
    let active = true;
    async function openResponse(response: Notifications.NotificationResponse | null) {
      if (!response || !active) return;
      const data = response.notification.request.content.data;
      const target = typeof data?.targetRoute === "string" ? data.targetRoute : "/patilerim";
      const match = target.match(/^\/pati\/([^/]+)\/takvim$/);
      if (!match) {
        router.push("/patilerim");
        return;
      }
      try {
        const raw = await AsyncStorage.getItem("wikipati.v1");
        const pets = raw ? JSON.parse(raw)?.pets : [];
        router.push((Array.isArray(pets) && pets.some((pet) => pet?.id === match[1]) ? target : "/patilerim") as never);
      } catch {
        router.push("/patilerim");
      } finally {
        void Notifications.clearLastNotificationResponseAsync().catch(() => {});
      }
    }
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      void openResponse(response);
    });
    void Notifications.getLastNotificationResponseAsync().then(openResponse).catch(() => {});
    return () => {
      active = false;
      subscription.remove();
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
