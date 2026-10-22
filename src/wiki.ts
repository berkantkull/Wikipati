import { articles } from "./data";

// Keep identifiers stable: existing saved favorites continue to point to these entries.
const metadata: Record<
  string,
  { title: string; slug: string; headings: string[]; related: string[] }
> = {
  "1": {
    title: "Kedi bakımı",
    slug: "kedi-bakimi",
    headings: ["Genel bakım", "Bakım rutini"],
    related: ["3", "5", "2"],
  },
  "2": {
    title: "Aşı takvimi",
    slug: "asi-takvimi",
    headings: ["Kişiye özel planlama", "Aşı kayıtları"],
    related: ["6", "1", "4"],
  },
  "3": {
    title: "Kedi beslenmesi",
    slug: "kedi-beslenmesi",
    headings: ["Beslenme ihtiyaçları", "İştah takibi"],
    related: ["1", "5", "6"],
  },
  "4": {
    title: "Köpek bakımı",
    slug: "kopek-bakimi",
    headings: ["Günlük bakım", "Koruyucu bakım"],
    related: ["2", "6", "5"],
  },
  "5": {
    title: "Davranış değişiklikleri",
    slug: "davranis-degisiklikleri",
    headings: ["Gözlem ve kayıt", "Veteriner değerlendirmesi"],
    related: ["1", "4", "6"],
  },
  "6": {
    title: "Sağlık kayıtları",
    slug: "saglik-kayitlari",
    headings: ["Kayıtların kapsamı", "Veteriner ziyaretine hazırlık"],
    related: ["2", "5", "4"],
  },
};
const fallbackSlugs: Record<string, string> = {
  "7": "yavru-guvenli-ev",
  "8": "ileri-yasta-bakim",
  "9": "agiz-dis-bakimi",
  "10": "gunluk-degisiklikler",
};
export const wikiArticles = articles.map((a) => ({
  ...a,
  title: metadata[a.id]?.title || a.title,
  slug: metadata[a.id]?.slug || fallbackSlugs[a.id],
  sections: a.body.split("\n\n").map((text, index) => ({
    id: `section-${index}`,
    title: metadata[a.id]?.headings[index] || "Ek bilgiler",
    text,
  })),
  related: metadata[a.id]?.related || ["1", "4", "6"],
  updated: "18 Ekim 2026",
  lifeStages:
    a.id === "7"
      ? ["Yavru"]
      : a.id === "8"
        ? ["İleri yaş"]
        : ["Yavru", "Yetişkin", "İleri yaş"],
}));
export type WikiArticle = (typeof wikiArticles)[number];
export function findArticles(
  query: string,
  category = "Tümü",
  species = "Tümü",
  favorites?: string[],
) {
  const term = query.trim().toLocaleLowerCase("tr-TR");
  return wikiArticles
    .filter(
      (a) =>
        (category === "Tümü" || a.category === category) &&
        (species === "Tümü" || a.species === species || a.species === "Tümü") &&
        (!favorites || favorites.includes(a.id)) &&
        `${a.title} ${a.summary} ${a.body}`
          .toLocaleLowerCase("tr-TR")
          .includes(term),
    )
    .sort((a, b) => a.title.localeCompare(b.title, "tr"));
}

export const glossary = [
  {
    term: "Koruyucu bakım",
    definition:
      "Sağlığı korumaya yönelik kontrol ve bakım uygulamalarının bütünü.",
  },
  {
    term: "Rapel",
    definition:
      "Aşı korumasının sürdürülmesi için planlanan tekrar dozu; zamanlamayı veteriner belirler.",
  },
  {
    term: "Parazit",
    definition:
      "Başka bir canlı üzerinde veya içinde yaşayarak ondan yararlanan organizma.",
  },
  {
    term: "Anamnez",
    definition:
      "Muayeneye yardımcı olan önceki sağlık ve gözlem bilgilerinin öyküsü.",
  },
];
