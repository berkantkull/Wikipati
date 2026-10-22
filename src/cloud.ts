import "react-native-url-polyfill/auto";
import { createClient, processLock } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform, AppState } from "react-native";
import type { Store } from "./data";
import { backupJSON, parseBackup } from "./backup";
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
// Native sessions are split into small SecureStore values. Web uses sessionStorage only.
const storage = {
  async getItem(key: string) {
    if (Platform.OS === "web")
      return typeof sessionStorage === "undefined"
        ? null
        : sessionStorage.getItem(key);
    const count = Number(await SecureStore.getItemAsync(key + ".count"));
    if (!count || count > 100) return null;
    let value = "";
    for (let i = 0; i < count; i++) {
      const part = await SecureStore.getItemAsync(key + "." + i);
      if (part === null) return null;
      value += part;
    }
    return value;
  },
  async setItem(key: string, value: string) {
    if (Platform.OS === "web") {
      sessionStorage.setItem(key, value);
      return;
    }
    const old = Number(await SecureStore.getItemAsync(key + ".count")) || 0;
    const count = Math.ceil(value.length / 1500);
    for (let i = 0; i < count; i++)
      await SecureStore.setItemAsync(
        key + "." + i,
        value.slice(i * 1500, (i + 1) * 1500),
      );
    await SecureStore.setItemAsync(key + ".count", String(count));
    for (let i = count; i < old; i++)
      await SecureStore.deleteItemAsync(key + "." + i);
  },
  async removeItem(key: string) {
    if (Platform.OS === "web") {
      sessionStorage.removeItem(key);
      return;
    }
    const count = Number(await SecureStore.getItemAsync(key + ".count")) || 0;
    await SecureStore.deleteItemAsync(key + ".count");
    for (let i = 0; i < Math.min(count, 100); i++)
      await SecureStore.deleteItemAsync(key + "." + i);
  },
};
export const cloud =
  process.env.EXPO_PUBLIC_CLOUD_ENABLED === "true" && url && key
    ? createClient(url, key, {
        auth: {
          storage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
          lock: processLock,
        },
      })
    : null;
export function watchCloud() {
  if (!cloud) return () => {};
  if (AppState.currentState === "active") cloud.auth.startAutoRefresh();
  const sub = AppState.addEventListener("change", (state) =>
    state === "active"
      ? cloud.auth.startAutoRefresh()
      : cloud.auth.stopAutoRefresh(),
  );
  return () => {
    sub.remove();
    cloud.auth.stopAutoRefresh();
  };
}
export async function uploadCloudBackup(store: Store) {
  if (!cloud) throw Error("Bulut bağlantısı henüz etkinleştirilmedi.");
  const {
    data: { user },
    error,
  } = await cloud.auth.getUser();
  if (error || !user) throw Error("Önce hesabına giriş yap.");
  const payload = JSON.parse(backupJSON(store));
  const result = await cloud
    .from("wikipati_backups")
    .insert({ user_id: user.id, payload, device_label: Platform.OS })
    .select("id,created_at")
    .single();
  if (result.error)
    throw Error(
      "Yedek yüklenemedi. Bağlantıyı ve bulut kurulumunu kontrol et.",
    );
  return result.data;
}
export async function listCloudBackups() {
  if (!cloud) throw Error("Bulut bağlantısı yok.");
  const { data, error } = await cloud
    .from("wikipati_backups")
    .select("id,created_at,device_label")
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw Error("Yedekler alınamadı.");
  return data;
}
export async function downloadCloudBackup(id: string) {
  if (!cloud) throw Error("Bulut bağlantısı yok.");
  const { data, error } = await cloud
    .from("wikipati_backups")
    .select("payload")
    .eq("id", id)
    .single();
  if (error) throw Error("Yedek indirilemedi.");
  return parseBackup(JSON.stringify(data.payload));
}
