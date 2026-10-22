import type { Entry, Pet } from "./data";

export function calendarEntries(entries: Entry[], pets: Pet[], now: string, filter: string, petId = "Tümü", query = "") {
  const end = new Date(now + "T12:00:00Z");
  end.setUTCDate(end.getUTCDate() + 6);
  const lastDay = end.toISOString().slice(0, 10);
  const search = query.trim().toLocaleLowerCase("tr-TR");
  return entries.filter(e => {
    if (petId !== "Tümü" && e.petId !== petId) return false;
    if (search && ![e.title, e.kind, e.notes, pets.find(p => p.id === e.petId)?.name || ""].join(" ").toLocaleLowerCase("tr-TR").includes(search)) return false;
    if (filter === "Geçmiş") return e.done;
    if (e.done) return false;
    if (filter === "Bugün") return e.date === now;
    if (filter === "Geciken") return e.date < now;
    if (filter === "7 gün") return e.date >= now && e.date <= lastDay;
    return true;
  }).sort((a, b) => filter === "Geçmiş" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
}
