import type {Pet, Entry} from "./data";
import {escapeHtml} from "./healthReport.ts";
export type DocumentDraft = {mode: "visit" | "handover"; date: string; end: string; reason: string; questions: string; feeding: string; medicine: string; habits: string; contact: string; includeAllergies: boolean; selected: string[]};
export function documentText(pet: Pet, entries: Entry[], d: DocumentDraft) {
  const rows = entries.filter(e => e.petId === pet.id && d.selected.includes(e.id)).sort((a,b)=>b.date.localeCompare(a.date));
  const fields = d.mode === "visit"
    ? [["Görüşme tarihi",d.date],["Gözlemler ve görüşme nedeni",d.reason],["Veterinere sorularım",d.questions],["Kullanıldığını belirttiğim ilaçlar",d.medicine]]
    : [["Bakım dönemi",d.date + " — " + d.end],["Beslenme düzeni",d.feeding],["İlaç talimatları (sahibinin notu)",d.medicine],["Alışkanlıklar ve dikkat edilecekler",d.habits],["Acil iletişim ve veteriner",d.contact]];
  return [d.mode === "visit" ? "Veteriner görüşme notu" : "Bakım devretme kartı",pet.name + " · " + pet.species,...fields.filter(([,v])=>v.trim()).map(([k,v])=>k+"\n"+v),...(d.includeAllergies ? ["Alerjiler / özel notlar\n" + (pet.allergies || "Profilde bilgi belirtilmemiş; alerji olmadığı anlamına gelmez.")] : []),...(rows.length ? ["Seçilen kayıtlar\n"+rows.map(e=>e.date+" · "+e.kind+" · "+e.title+" · "+(e.done?"Tamamlandı":"Planlı")+(e.notes?"\n"+e.notes:"")).join("\n\n")] : []),"Kullanıcının hazırladığı bilgi notudur; veteriner raporu veya yeni tedavi talimatı değildir. Ek dosyalar dahil değildir."].join("\n\n");
}
export function documentHtml(text: string) {
  return '<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Wikipati bakım notu</title><style>@page{size:A4;margin:20mm}body{font-family:Arial,sans-serif;color:#214e42;line-height:1.6}pre{font-family:inherit;white-space:pre-wrap;overflow-wrap:anywhere}header{border-bottom:2px solid #214e42;padding-bottom:12px}</style></head><body><header>WİKİPATİ · KİŞİSEL BAKIM NOTU</header><pre>'+escapeHtml(text)+'</pre></body></html>';
}

