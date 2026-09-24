import { Platform, Linking } from "react-native";
import * as Notifications from "expo-notifications";
import type { Store } from "./data";
import { reminderDate } from "./care";

if (Platform.OS !== "web")
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
export type PermissionState = {
  allowed: boolean;
  canAskAgain: boolean;
  label: string;
};
export async function permissionState(): Promise<PermissionState> {
  if (Platform.OS === "web")
    return {
      allowed: false,
      canAskAgain: false,
      label: "Telefon uygulamasında kullanılabilir",
    };
  const p = await Notifications.getPermissionsAsync();
  const allowed =
    p.granted ||
    p.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  return {
    allowed,
    canAskAgain: p.canAskAgain,
    label: allowed
      ? "İzin verildi"
      : p.canAskAgain
        ? "İzin bekleniyor"
        : "Telefon ayarlarından izin verilmeli",
  };
}
async function channel() {
  if (Platform.OS === "android")
    await Notifications.setNotificationChannelAsync("care", {
      name: "Bakım hatırlatmaları",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
}
export async function requestPermission() {
  if (Platform.OS === "web") return permissionState();
  await channel();
  const p = await permissionState();
  if (!p.allowed && p.canAskAgain)
    await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true, allowBadge: false },
    });
  else if (!p.allowed) await Linking.openSettings();
  return permissionState();
}
export async function testNotification() {
  const p = await permissionState();
  if (!p.allowed) throw Error("Önce bildirim izni ver.");
  await channel();
  await Notifications.scheduleNotificationAsync({
    identifier: "wikipati-test",
    content: {
      title: "Wikipati • Bildirim testi",
      body: "Bildirimler çalışıyor. Patinin bakım zamanı geldiğinde burada hatırlatacağız.",
      sound: "default",
      data: { screen: "calendar" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      repeats: false,
      channelId: "care",
    },
  });
}
// The persisted store is authoritative. Reconcile only this app's reminder IDs.
export async function syncNotifications(store: Store): Promise<Store> {
  const pending = store.entries
    .filter((e) => !e.done)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (Platform.OS === "web")
    return {
      ...store,
      entries: store.entries.map((e) => ({
        ...e,
        notification: undefined,
        notificationState: e.done
          ? undefined
          : "Bildirim için mobil cihaz gerekir",
      })),
    };
  const p = await permissionState();
  await channel();
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const legacy = new Set(
    [...store.entries, ...store.trash.flatMap((t) => t.entries)]
      .map((e) => e.notification)
      .filter(Boolean),
  );
  const active = new Set(
    pending
      .filter(
        (e) =>
          store.preferences.reminders &&
          p.allowed &&
          reminderDate(e.date, store.preferences),
      )
      .slice(0, 60)
      .map((e) => "wikipati-care-" + e.id),
  );
  for (const n of scheduled)
    if (
      ((n.identifier.startsWith("wikipati-care-") ||
        legacy.has(n.identifier)) &&
        !active.has(n.identifier)) ||
      (n.identifier === "wikipati-test" && !store.preferences.reminders)
    )
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
  const entries = [];
  for (const e of store.entries) {
    const date = reminderDate(e.date, store.preferences);
    let notificationState = e.done
      ? undefined
      : !store.preferences.reminders
        ? "Hatırlatmalar ayarlardan kapalı"
        : !p.allowed
          ? "Bildirim izni gerekli"
          : !date
            ? "Hatırlatma zamanı geçmiş"
            : !active.has("wikipati-care-" + e.id)
              ? "İlk 60 hatırlatmadan sonra planlanacak"
              : undefined;
    let notification: string | undefined;
    if (!e.done && !notificationState && date) {
      try {
        const pet = store.pets.find((pet) => pet.id === e.petId);
        await Notifications.cancelScheduledNotificationAsync(
          "wikipati-care-" + e.id,
        );
        notification = await Notifications.scheduleNotificationAsync({
          identifier: "wikipati-care-" + e.id,
          content: {
            title: "Wikipati • Bakım zamanı",
            body: `${pet?.name || "Patin"}: ${e.title}`,
            sound: "default",
            data: { screen: "calendar", petId: e.petId, entryId: e.id },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date,
            channelId: "care",
          },
        });
        notificationState = "Planlandı · " + date.toLocaleString("tr-TR");
      } catch {
        notificationState = "Planlanamadı · Ayarlardan yeniden dene";
      }
    }
    entries.push({ ...e, notification, notificationState });
  }
  return { ...store, entries };
}
