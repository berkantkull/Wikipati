import type { Entry, Preferences, Store, TrashItem } from "./data";

export function selectedDays(prefs: Preferences): number[] {
  const values = Array.isArray(prefs.daysBefore)
    ? prefs.daysBefore
    : [prefs.daysBefore];
  return [...new Set(values.filter((d) => [0, 1, 3].includes(d)))].sort(
    (a, b) => b - a,
  );
}
export function reminderDates(
  value: string,
  prefs: Preferences,
  now = new Date(),
): { daysBefore: number; date: Date }[] {
  const day = new Date(value + "T00:00:00");
  if (!Number.isFinite(day.getTime())) return [];
  day.setHours(prefs.hour, prefs.minute || 0, 0, 0);
  return selectedDays(prefs)
    .map((daysBefore) => {
      const date = new Date(day);
      date.setDate(date.getDate() - daysBefore);
      return { daysBefore, date };
    })
    .filter((r) => r.date > now);
}
// Compatibility helper for callers needing the first upcoming reminder.
export function reminderDate(
  value: string,
  prefs: Preferences,
  now = new Date(),
): Date | null {
  return reminderDates(value, prefs, now)[0]?.date || null;
}
export function weightPoints(entries: Entry[], petId: string) {
  return entries
    .filter(
      (e) =>
        e.petId === petId &&
        e.kind === "Kilo" &&
        Number.isFinite(e.weight) &&
        e.weight! > 0,
    )
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}
export function removePet(store: Store, petId: string): Store {
  const pet = store.pets.find((p) => p.id === petId);
  if (!pet) return store;
  const item: TrashItem = {
    id: "pet-" + petId,
    pet,
    entries: store.entries.filter((e) => e.petId === petId),
    deletedAt: new Date().toISOString(),
  };
  return {
    ...store,
    pets: store.pets.filter((p) => p.id !== petId),
    entries: store.entries.filter((e) => e.petId !== petId),
    trash: [...store.trash, item],
  };
}
export function removeEntry(store: Store, id: string): Store {
  const entry = store.entries.find((e) => e.id === id);
  if (!entry) return store;
  return {
    ...store,
    entries: store.entries.filter((e) => e.id !== id),
    trash: [
      ...store.trash,
      {
        id: "entry-" + id,
        entries: [entry],
        deletedAt: new Date().toISOString(),
      },
    ],
  };
}
export function restoreItem(store: Store, id: string): Store {
  const item = store.trash.find((t) => t.id === id);
  if (!item) return store;
  const pets =
    item.pet && !store.pets.some((p) => p.id === item.pet!.id)
      ? [...store.pets, item.pet]
      : store.pets;
  if (item.entries.some((e) => !pets.some((p) => p.id === e.petId)))
    throw Error("Önce bu kaydın ait olduğu pati profilini geri yükle.");
  return {
    ...store,
    pets,
    entries: [
      ...store.entries,
      ...item.entries.filter((e) => !store.entries.some((x) => x.id === e.id)),
    ],
    trash: store.trash.filter((t) => t.id !== id),
  };
}
export function normalizeStore(data: Partial<Store>): Store {
  if (
    !Array.isArray(data.pets) ||
    !Array.isArray(data.entries) ||
    !Array.isArray(data.favorites)
  )
    throw Error("Geçersiz kayıt");
  return {
    ...data,
    pets: data.pets,
    entries: data.entries,
    favorites: data.favorites,
    preferences: {
      reminders:
        typeof data.preferences?.reminders === "boolean"
          ? data.preferences.reminders
          : true,
      daysBefore:
        data.preferences?.daysBefore != null
          ? selectedDays(data.preferences)
          : [1],
      hour:
        Number.isInteger(data.preferences?.hour) &&
        data.preferences!.hour >= 0 &&
        data.preferences!.hour <= 23
          ? data.preferences!.hour
          : 9,
      minute:
        Number.isInteger(data.preferences?.minute) &&
        data.preferences!.minute! >= 0 &&
        data.preferences!.minute! <= 59
          ? data.preferences!.minute!
          : 0,
    },
    checklist: data.checklist || {},
    trash: data.trash || [],
  };
}
