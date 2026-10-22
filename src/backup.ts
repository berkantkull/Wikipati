import type { Store, Pet, Entry } from "./data";

const fail = () => {
  throw Error(
    "Geçerli bir Wikipati yedek dosyası seç. Hiçbir kayıt değiştirilmedi.",
  );
};
function text(v: unknown, optional = false): string {
  if (optional && v == null) return "";
  if (typeof v !== "string" || v.length > 20000) return fail();
  return v;
}
function date(v: unknown, optional = false): string {
  const d = text(v, optional);
  if (!d && optional) return "";
  const parsed = new Date(d + "T12:00:00");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(d) ||
    !Number.isFinite(parsed.getTime()) ||
    parsed.getFullYear() !== Number(d.slice(0, 4)) ||
    parsed.getMonth() + 1 !== Number(d.slice(5, 7)) ||
    parsed.getDate() !== Number(d.slice(8))
  )
    return fail();
  return d;
}
export type Backup = {
  formatVersion: 1 | 2;
  pets: Pet[];
  entries: Entry[];
  favorites: string[];
  checklist: Record<string, string[]>;
};
const MAX_BACKUP_SIZE = 50_000_000;
function portableAsset(value: unknown) {
  if (value == null || value === "") return undefined;
  if (typeof value !== "string") return fail();
  const asset = value;
  if (!asset.startsWith("data:") || asset.length > 20_000_000) return fail();
  return asset;
}
export function parseBackup(raw: string): Backup {
  if (raw.length > MAX_BACKUP_SIZE)
    throw Error("Yedek dosyası 50 MB sınırını aşıyor.");
  let root: any;
  try {
    root = JSON.parse(raw);
  } catch {
    return fail();
  }
  if (root?.format && (root.format !== "wikipati" || ![1, 2].includes(root.version)))
    return fail();
  const formatVersion: 1 | 2 = root?.format ? root.version : 1;
  const data = root?.format ? root.data : root;
  if (
    !data ||
    !Array.isArray(data.pets) ||
    !Array.isArray(data.entries) ||
    !Array.isArray(data.favorites) ||
    data.pets.length > 1000 ||
    data.entries.length > 20000
  )
    return fail();
  const ids = new Set<string>();
  const pets = data.pets.map((p: any): Pet => {
    if (!p) return fail();
    const id = text(p.id),
      name = text(p.name);
    if (
      !id ||
      !name.trim() ||
      ["__proto__", "constructor", "prototype"].includes(id) ||
      ids.has(id)
    )
      return fail();
    ids.add(id);
    return {
      id,
      name,
      species: text(p.species),
      breed: text(p.breed, true),
      birthday: date(p.birthday, true),
      allergies: text(p.allergies, true),
      ...(p.lifeStage ? { lifeStage: text(p.lifeStage) } : {}),
      ...(p.needs
        ? {
            needs:
              Array.isArray(p.needs) && p.needs.length <= 10
                ? p.needs.map((v: unknown) => text(v))
                : fail(),
          }
        : {}),
      ...(formatVersion === 2 && p.photo ? { photo: portableAsset(p.photo) } : {}),
    };
  });
  const entryIds = new Set<string>();
  const entries = data.entries.map((e: any): Entry => {
    if (!e) return fail();
    const id = text(e.id),
      petId = text(e.petId),
      title = text(e.title);
    if (
      !id ||
      entryIds.has(id) ||
      !ids.has(petId) ||
      !title.trim() ||
      typeof e.done !== "boolean"
    )
      return fail();
    entryIds.add(id);
    if (
      e.repeatDays != null &&
      (!Number.isInteger(e.repeatDays) ||
        e.repeatDays < 1 ||
        e.repeatDays > 365)
    )
      return fail();
    if (
      e.weight != null &&
      (typeof e.weight !== "number" ||
        !Number.isFinite(e.weight) ||
        e.weight <= 0)
    )
      return fail();
    return {
      id,
      petId,
      title,
      kind: text(e.kind),
      date: date(e.date),
      notes: text(e.notes, true),
      done: e.done,
      ...(e.repeatDays ? { repeatDays: e.repeatDays } : {}),
      ...(e.completedAt ? { completedAt: date(e.completedAt) } : {}),
      ...(e.postponedFrom ? { postponedFrom: date(e.postponedFrom) } : {}),
      ...(e.weight != null ? { weight: e.weight } : {}),
      ...(formatVersion === 2 && e.file ? { file: portableAsset(e.file) } : {}),
      ...(formatVersion === 2 && e.fileName ? { fileName: text(e.fileName) } : {}),
    };
  });
  const checklist: Record<string, string[]> = {};
  for (const key of [...ids, "__adoption_guest__"]) {
    const values = data.checklist?.[key];
    if (values != null) {
      if (
        !Array.isArray(values) ||
        values.length > 100 ||
        values.some((v) => typeof v !== "string")
      )
        return fail();
      checklist[key] = [...new Set<string>(values)];
    }
  }
  return {
    formatVersion,
    pets,
    entries,
    favorites: data.favorites.map((f: unknown) => text(f)),
    checklist,
  };
}
export function backupJSON(store: Store) {
  // Only already-portable data URLs are retained by this synchronous helper.
  const data = parseBackup(
    JSON.stringify({
      format: "wikipati",
      version: 2,
      data: {
      pets: store.pets.map((pet) => ({
        ...pet,
        photo: pet.photo?.startsWith("data:") ? pet.photo : undefined,
      })),
      entries: store.entries.map((entry) => ({
        ...entry,
        file: entry.file?.startsWith("data:") ? entry.file : undefined,
        notification: undefined,
        notificationState: undefined,
      })),
      favorites: store.favorites,
      checklist: store.checklist,
      },
    }),
  );
  return JSON.stringify(
    {
      format: "wikipati",
      version: 2,
      exportedAt: new Date().toISOString(),
      data,
    },
    null,
    2,
  );
}
export async function backupJSONWithFiles(
  store: Store,
  readAsset: (uri: string, name: string) => Promise<string>,
) {
  const pets = await Promise.all(
    store.pets.map(async (pet) => ({
      ...pet,
      photo: pet.photo ? await readAsset(pet.photo, `${pet.id}-profil.jpg`) : undefined,
    })),
  );
  const entries = await Promise.all(
    store.entries.map(async (entry) => ({
      ...entry,
      file: entry.file ? await readAsset(entry.file, entry.fileName || `${entry.id}-belge`) : undefined,
      notification: undefined,
      notificationState: undefined,
    })),
  );
  return backupJSON({ ...store, pets, entries });
}
export function backupSummary(backup: Backup) {
  return {
    pets: backup.pets.length,
    entries: backup.entries.length,
    photos: backup.pets.filter((pet) => !!pet.photo).length,
    documents: backup.entries.filter((entry) => !!entry.file).length,
  };
}
export function mergeBackup(
  current: Store,
  backup: Backup,
  useBackupVersions = false,
): Store {
  const deletedPets = new Set(
    current.trash.flatMap((t) => (t.pet ? [t.pet.id] : [])),
  );
  const deletedEntries = new Set(
    current.trash.flatMap((t) => t.entries.map((e) => e.id)),
  );
  const addedPets = backup.pets.filter(
    (p) => !current.pets.some((x) => x.id === p.id) && !deletedPets.has(p.id),
  );
  const pets = [...current.pets, ...addedPets];
  const entries = backup.entries.filter(
    (e) =>
      !current.entries.some((x) => x.id === e.id) &&
      !deletedEntries.has(e.id) &&
      pets.some((p) => p.id === e.petId),
  );
  const checklist = { ...current.checklist };
  for (const p of addedPets)
    if (backup.checklist[p.id]) checklist[p.id] = backup.checklist[p.id];
  if (!checklist.__adoption_guest__ && backup.checklist.__adoption_guest__)
    checklist.__adoption_guest__ = backup.checklist.__adoption_guest__;
  if (useBackupVersions)
    for (const p of pets)
      if (backup.checklist[p.id]) checklist[p.id] = backup.checklist[p.id];
  return {
    ...current,
    pets: useBackupVersions
      ? pets.map((p) => {
          const incoming = backup.pets.find((x) => x.id === p.id);
          return incoming ? { ...incoming, photo: incoming.photo || p.photo } : p;
        })
      : pets,
    entries: [
      ...current.entries.map((e) => {
        const incoming =
          useBackupVersions && backup.entries.find((x) => x.id === e.id);
        return incoming
          ? {
              ...incoming,
              file: incoming.file || e.file,
              fileName: incoming.fileName || e.fileName,
              notification: e.notification,
            }
          : e;
      }),
      ...entries,
    ],
    favorites: [...new Set([...current.favorites, ...backup.favorites])],
    checklist,
  };
}
