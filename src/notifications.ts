import { Platform, Linking } from "react-native";
import * as Notifications from "expo-notifications";
import type { Store } from "./data";
import { reminderDates, selectedDays } from "./care";

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
function possessive(name: string) {
  const lower = name.toLocaleLowerCase("tr-TR");
  const lastVowel = [...lower].reverse().find((letter) => "aeıioöuü".includes(letter)) || "i";
  const suffix = "aı".includes(lastVowel)
    ? "ın"
    : "ei".includes(lastVowel)
      ? "in"
      : "ou".includes(lastVowel)
        ? "un"
        : "ün";
  return `${name}'${"aeıioöuü".includes(lower.at(-1) || "") ? "n" : ""}${suffix}`;
}
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
  const plans =
    store.preferences.reminders && p.allowed
      ? pending
          .flatMap((e) =>
            reminderDates(e.date, store.preferences).map((r) => ({
              ...r,
              entry: e,
              id: `wikipati-care-${e.id}-d${r.daysBefore}`,
            })),
          )
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .slice(0, 60)
      : [];
  const active = new Set(plans.map((p) => p.id));
  for (const n of scheduled) {
    if (
      ((n.identifier.startsWith("wikipati-care-") ||
        legacy.has(n.identifier)) &&
        !active.has(n.identifier)) ||
      (n.identifier === "wikipati-test" && !store.preferences.reminders)
    )
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
  }
  const outcomes = new Map<string, { id: string; date: Date; ok: boolean }[]>();
  for (const plan of plans) {
    let ok = false;
    try {
      await Notifications.cancelScheduledNotificationAsync(plan.id);
      const pet = store.pets.find((p) => p.id === plan.entry.petId);
      await Notifications.scheduleNotificationAsync({
        identifier: plan.id,
        content: {
          title: `${pet?.name || "Patin"} • Wikipati`,
          body: `${possessive(pet?.name || "Patin")} ${plan.entry.title} ${plan.daysBefore === 1 ? "yarın" : plan.daysBefore ? plan.daysBefore + " gün sonra" : "bugün"}`,
          sound: "default",
          data: {
            screen: "calendar",
            petId: plan.entry.petId,
            entryId: plan.entry.id,
            targetRoute: `/pati/${plan.entry.petId}/takvim`,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: plan.date,
          channelId: "care",
        },
      });
      ok = true;
    } catch {}
    outcomes.set(plan.entry.id, [
      ...(outcomes.get(plan.entry.id) || []),
      { id: plan.id, date: plan.date, ok },
    ]);
  }
  const entries = store.entries.map((e) => {
    const eligible = reminderDates(e.date, store.preferences),
      results = outcomes.get(e.id) || [],
      success = results.filter((r) => r.ok);
    const state = e.done
      ? undefined
      : !store.preferences.reminders
        ? "Hatırlatmalar ayarlardan kapalı"
        : !selectedDays(store.preferences).length
          ? "Hatırlatma günü seçilmedi"
          : !p.allowed
            ? "Bildirim izni gerekli"
            : !eligible.length
              ? "Seçili hatırlatma zamanları geçmiş"
              : results.some((r) => !r.ok)
                ? `${success.length}/${eligible.length} planlandı · Ayarlardan yeniden dene`
                : !results.length
                  ? "İlk 60 bildirimden sonra planlanacak"
                  : `${success.length} hatırlatma planlandı · ${success.map((r) => r.date.toLocaleString("tr-TR")).join(" / ")}${results.length < eligible.length ? " · Kalanlar ilk 60 bildirimden sonra planlanacak" : ""}`;
    return { ...e, notification: success[0]?.id, notificationState: state };
  });
  return { ...store, entries };
}
