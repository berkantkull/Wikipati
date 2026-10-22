export type ToxicityStatus = "guvenli" | "dikkat" | "tehlikeli" | "bilinmiyor";
export type ToxicityItem = {
  id: string;
  names: string[];
  category: "yiyecek" | "bitki" | "ev-kimyasali" | "ilac";
  species: { cat: ToxicityStatus; dog: ToxicityStatus };
  summary: string;
  sources: { title: string; url: string; publisher: string }[];
  visible: boolean;
};

// TODO: kaynak ve veteriner onayı gerekli. Onaylanana kadar kullanıcıya gösterilmez.
export const toxicityItems: ToxicityItem[] = [
  { id: "todo-1", names: ["TODO"], category: "yiyecek", species: { cat: "bilinmiyor", dog: "bilinmiyor" }, summary: "TODO: kaynak ve veteriner onayı gerekli", sources: [], visible: false },
  { id: "todo-2", names: ["TODO"], category: "bitki", species: { cat: "bilinmiyor", dog: "bilinmiyor" }, summary: "TODO: kaynak ve veteriner onayı gerekli", sources: [], visible: false },
  { id: "todo-3", names: ["TODO"], category: "ev-kimyasali", species: { cat: "bilinmiyor", dog: "bilinmiyor" }, summary: "TODO: kaynak ve veteriner onayı gerekli", sources: [], visible: false },
];

export function normalizeSearch(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]/g, "");
}

export function editDistance(left: string, right: string) {
  const a = normalizeSearch(left), b = normalizeSearch(right);
  const rows = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  rows[0] = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return rows[a.length][b.length];
}

export function searchToxicity(query: string) {
  const term = normalizeSearch(query);
  if (!term) return [];
  return toxicityItems.filter((item) => item.visible && item.names.some((name) => {
    const normalized = normalizeSearch(name);
    return normalized.includes(term) || editDistance(normalized, term) <= 2;
  }));
}
