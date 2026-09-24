import {articles} from './data';

// Keep identifiers stable: existing saved favorites continue to point to these entries.
const metadata: Record<string,{title:string; headings:string[]; related:string[]}> = {
 '1':{title:'Kedi bakımı',headings:['Genel bakım','Bakım rutini'],related:['3','5','2']},
 '2':{title:'Aşı takvimi',headings:['Kişiye özel planlama','Aşı kayıtları'],related:['6','1','4']},
 '3':{title:'Kedi beslenmesi',headings:['Beslenme ihtiyaçları','İştah takibi'],related:['1','5','6']},
 '4':{title:'Köpek bakımı',headings:['Günlük bakım','Koruyucu bakım'],related:['2','6','5']},
 '5':{title:'Davranış değişiklikleri',headings:['Gözlem ve kayıt','Veteriner değerlendirmesi'],related:['1','4','6']},
 '6':{title:'Sağlık kayıtları',headings:['Kayıtların kapsamı','Veteriner ziyaretine hazırlık'],related:['2','5','4']},
};
export const wikiArticles=articles.map(a=>({
 ...a, title:metadata[a.id].title,
 sections:a.body.split('\n\n').map((text,index)=>({id:`section-${index}`,title:metadata[a.id].headings[index]||'Ek bilgiler',text})),
 related:metadata[a.id].related,
 updated:'14 Eylül 2026',
}));
export type WikiArticle=typeof wikiArticles[number];
export function findArticles(query:string, category='Tümü', species='Tümü', favorites?:string[]) {
 const term=query.trim().toLocaleLowerCase('tr-TR');
 return wikiArticles.filter(a=>(category==='Tümü'||a.category===category)&&(species==='Tümü'||a.species===species||a.species==='Tümü')&&(!favorites||favorites.includes(a.id))&&`${a.title} ${a.summary} ${a.body}`.toLocaleLowerCase('tr-TR').includes(term)).sort((a,b)=>a.title.localeCompare(b.title,'tr'));
}
