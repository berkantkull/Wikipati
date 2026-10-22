import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Platform, Text, useWindowDimensions, View } from "react-native";

void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { width, height } = useWindowDimensions();
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
  const navigation = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="rehber/[slug]" />
      <Stack.Screen name="pati/[id]" />
      <Stack.Screen name="pati/[id]/takvim" />
    </Stack>
  );
  if (Platform.OS !== "web" || width < 900) return navigation;
  return (
    <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 56, padding: 32, backgroundColor: "#E8EFE7" }}>
      <View style={{ width: 300, gap: 18 }}>
        <View style={{ width: 58, height: 58, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "#214E42" }}><Ionicons name="paw" size={30} color="white" /></View>
        <Text style={{ color: "#214E42", fontSize: 38, fontWeight: "800" }}>wikipati.</Text>
        <Text style={{ color: "#596758", fontSize: 18, lineHeight: 28 }}>Patili dostunun bakım rehberi, sağlık günlüğü ve küçük hatırlatıcısı.</Text>
        <Text style={{ color: "#596758", fontSize: 13, lineHeight: 20 }}>Bu bir mobil uygulama demosudur — bildirimler yalnızca telefonda çalışır.</Text>
      </View>
      <View style={{ width: 430, height: Math.max(320, Math.min(900, height - 64)), flexShrink: 0, overflow: "hidden", borderRadius: 34, backgroundColor: "#F7F9F5", shadowColor: "#102C27", shadowOpacity: 0.22, shadowRadius: 28, shadowOffset: { width: 0, height: 14 }, elevation: 12 }}>
        {navigation}
      </View>
    </View>
  );
}
