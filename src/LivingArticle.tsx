import React from "react";
import {View, Text, Pressable} from "react-native";
import type {Pet, Entry} from "./data";
import type {WikiArticle} from "./wiki";
import {Action} from "./Features";
import {s} from "./styles";
export function LivingArticle({article,pet,pets,entries,onSelect,onRecords}: {article:WikiArticle;pet?:Pet;pets:Pet[];entries:Entry[];onSelect:(id:string)=>void;onRecords:()=>void}) {
 const compatible=pets.filter(p=>article.species==="Tümü"||p.species===article.species);
 const active=pet&&compatible.some(p=>p.id===pet.id)?pet:undefined;
 const records=active?entries.filter(e=>e.petId===active.id&&(article.id==="2"?e.kind==="Aşı":article.id==="6"?true:article.category==="Beslenme"?e.kind==="Kilo"||e.kind==="Bakım":article.category==="Sağlık"?["Kontrol","İlaç","Aşı","Kilo"].includes(e.kind):e.kind==="Bakım"||e.kind==="Not")).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3):[];
 return <View style={{backgroundColor:"#EDF3E9",padding:18,borderRadius:18,gap:12}}>
  <Text style={s.eyebrow}>DOSTUNUN KAYITLARI</Text>
  <Text style={s.cardTitle}>{active?active.name+" için kişisel kayıtlar":"Kayıtlarını görmek için bir pati seç"}</Text>
  <Text style={s.small}>Bu rehberin konusuyla ilgili son kayıtlarını burada görebilirsin. Bu kayıtlar tıbbi bir değerlendirme içermez.</Text>
  <View style={{flexDirection:"row",flexWrap:"wrap",gap:8}}>{compatible.map(p=><Pressable key={p.id} accessibilityRole="button" accessibilityLabel={`${p.name} profilini seç`} accessibilityState={{selected:active?.id===p.id}} onPress={()=>onSelect(p.id)} style={[s.chip,active?.id===p.id&&s.chipActive]}><Text style={[s.chipText,active?.id===p.id&&{color:"white"}]}>{p.name}</Text></Pressable>)}</View>
  {!compatible.length&&<Text style={s.muted}>Bu türde henüz bir pati profilin yok. Rehberi okumaya devam edebilirsin.</Text>}
  {active&&<>{records.length?records.map(e=><View key={e.id} style={{gap:4}}><Text style={s.label}>{e.title}</Text><Text style={s.small}>{e.date} · {e.kind} · {e.done?"Tamamlandı":"Planlı"}</Text></View>):<Text style={s.muted}>Bu konuyla eşleşen kayıt bulunamadı. Kendi bakım planını oluşturabilirsin.</Text>}<Action label={article.category==="Beslenme"?"Kilo takibini aç":"Sağlık karnesini aç"} onPress={onRecords}/></>}
 </View>;
}
