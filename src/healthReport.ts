import type { Pet, Entry } from "./data";
export function escapeHtml(v: unknown) {
  return String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
export function healthReport(pet: Pet, entries: Entry[], date: string) {
  const records = entries
    .filter((e) => e.petId === pet.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const h = escapeHtml;
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${h(pet.name)} · Sağlık karnesi</title><style>@page{size:A4;margin:18mm}body{font-family:Arial,sans-serif;color:#223c32;font-size:12px;line-height:1.5}h1{font-size:28px;margin-bottom:0}h2{font-size:18px}header{border-bottom:2px solid #214e42;padding-bottom:14px}small{color:#61756c}.entry{break-inside:avoid;border-bottom:1px solid #dce4dd;padding:12px 0}p{white-space:pre-wrap;overflow-wrap:anywhere}.badge{font-weight:bold}.note{background:#f2f5ef;padding:12px}</style></head><body><header><small>WİKİPATİ · KİŞİSEL SAĞLIK KARNESİ</small><h1>${h(pet.name)}</h1><p>${h(pet.species)} · ${h(pet.breed || "Irk belirtilmedi")}<br>Doğum tarihi: ${h(pet.birthday || "Bilinmiyor")} · Oluşturulma: ${h(date)}</p></header><h2>Alerjiler ve özel notlar</h2><p class="note">${h(pet.allergies || "Not eklenmemiş")}</p><h2>Sağlık ve bakım geçmişi · ${records.length} kayıt</h2>${records.length ? records.map((e) => `<section class="entry"><small>${h(e.date)} · ${h(e.kind)}</small><p class="badge">${h(e.title)} — ${e.done ? "Tamamlandı" : "Planlı"}${e.weight ? ` · ${h(e.weight)} kg` : ""}</p>${e.completedAt ? `<small>Tamamlanma: ${h(e.completedAt)}</small>` : ""}${e.postponedFrom ? `<small> · Ertelendi: ${h(e.postponedFrom)}</small>` : ""}<p>${h(e.notes || "")}</p>${e.fileName ? `<small>Ek belge: ${h(e.fileName)} (dosya bu özete dahil değil)</small>` : ""}</section>`).join("") : "<p>Henüz kayıt yok.</p>"}<p><small>Bu belge kullanıcının tuttuğu kayıtların özetidir; resmi aşı karnesi veya veteriner raporu değildir. Ek belgeler ayrıca paylaşılmalıdır.</small></p></body></html>`;
}
