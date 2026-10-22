import type { Entry, Store } from "./data";
export function nextRoutineDate(date: string, days: number, now: string) {
  const d = new Date(date + "T12:00:00");
  if (
    !Number.isInteger(days) ||
    days < 1 ||
    days > 365 ||
    !Number.isFinite(d.getTime())
  )
    throw Error("Geçersiz tekrar aralığı");
  const fmt = () =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  do {
    d.setDate(d.getDate() + days);
  } while (fmt() <= now);
  return fmt();
}
export function finishCare(
  store: Store,
  id: string,
  now: string,
  newId: string,
): Store {
  const entry = store.entries.find((e) => e.id === id);
  if (!entry || entry.done) return store;
  const entries = store.entries.map((e) =>
    e.id === id ? { ...e, done: true, completedAt: now } : e,
  );
  if (entry.repeatDays) {
    const {
      notification,
      notificationState,
      file,
      fileName,
      completedAt,
      postponedFrom,
      ...base
    } = entry;
    entries.push({
      ...base,
      id: newId,
      date: nextRoutineDate(entry.date, entry.repeatDays, now),
      done: false,
    });
  }
  return { ...store, entries };
}
export function dailyCare(entries: Entry[], now: string) {
  return entries
    .filter((e) => e.repeatDays && !e.done && e.date <= now)
    .sort((a, b) => a.date.localeCompare(b.date));
}
