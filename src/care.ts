import type { Entry, Preferences, Store, TrashItem } from "./data";

export function reminderDate(
  value: string,
  prefs: Preferences,
  now = new Date(),
): Date | null {
  const day = new Date(value + "T00:00:00");
  if (!Number.isFinite(day.getTime())) return null;
  day.setHours(prefs.hour, 0, 0, 0);
  const before = new Date(day);
  before.setDate(before.getDate() - prefs.daysBefore);
  if (before > now) return before;
  return day > now ? day : null;
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
      reminders: true,
      daysBefore: 1,
      hour: 9,
      ...data.preferences,
    },
    checklist: data.checklist || {},
    trash: data.trash || [],
  };
}
