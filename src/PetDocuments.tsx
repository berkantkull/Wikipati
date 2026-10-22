import React, {useState} from "react";
import {View, Text, TextInput, Pressable, Platform, Share} from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import {Pet, Entry, today, parseDate} from "./data";
import {DateField} from "./DateField";
import {Action} from "./Features";
import {s} from "./styles";
import {documentText, documentHtml, DocumentDraft} from "./petDocumentModel";
export function PetDocuments({pet, entries, onSave, onPlan}: {pet:Pet; entries:Entry[]; onSave:(title:string,notes:string)=>Promise<boolean>; onPlan:(notes:string)=>void}) {
 const [draft,setDraft]=useState<DocumentDraft>({mode:"visit",date:today(),end:today(),reason:"",questions:"",feeding:"",medicine:"",habits:"",contact:"",includeAllergies:false,selected:[]});
 const [preview,setPreview]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const update=(patch:Partial<DocumentDraft>)=>{setDraft(d=>({...d,...patch}));setPreview(false);setMessage("");};
 const text=documentText(pet,entries,draft);
 const own=entries.filter(e=>e.petId===pet.id).sort((a,b)=>b.date.localeCompare(a.date));
 async function run(fn:()=>Promise<void>){if(busy)return;setBusy(true);setMessage("");try{await fn();}catch(e){setMessage(e instanceof Error?e.message:"İşlem tamamlanamadı.");}finally{setBusy(false);}}
 function review(){if(!parseDate(draft.date)||(draft.mode==="handover"&&(!parseDate(draft.end)||draft.end<draft.date))){setMessage("Geçerli tarih seç. Bitiş tarihi başlangıçtan önce olamaz.");return;}setPreview(true);setMessage("");}
 function field(key:"reason"|"questions"|"feeding"|"medicine"|"habits"|"contact",label:string,hint:string){return <View style={{gap:8}}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} value={draft[key]} onChangeText={v=>update({[key]:v})} placeholder={hint} multiline maxLength={4000} style={[s.input,{minHeight:96,textAlignVertical:"top"}]} /></View>;}
 return <View style={{gap:16}}>
  <Text style={s.sectionTitle}>Birlikte bakım</Text><Text style={s.muted}>Görüşmeye hazırlan veya dostunun bakımını güvendiğin birine anlat. İçeriği paylaşmadan önce incele.</Text>
  <View style={{flexDirection:"row",flexWrap:"wrap",gap:8}}>{([['visit','Veterinere gidiyoruz'],['handover','Bakımı devret']] as const).map(([mode,label])=><Pressable key={mode} accessibilityRole="button" accessibilityState={{selected:draft.mode===mode}} onPress={()=>update({mode})} style={[s.chip,draft.mode===mode&&s.chipActive]}><Text style={[s.chipText,draft.mode===mode&&{color:"white"}]}>{label}</Text></Pressable>)}</View>
  <DateField label={draft.mode==="visit"?"Görüşme tarihi":"Başlangıç tarihi"} value={draft.date} onChange={date=>update({date})}/>
  {draft.mode==="handover"&&<DateField label="Bitiş tarihi" value={draft.end} onChange={end=>update({end})}/>}
  {draft.mode==="visit"?<>{field("reason","Gözlemler ve görüşme nedeni","Ne değişti, ne zaman başladı?")}{field("questions","Veterinere sorularım","Görüşmede sormak istediklerin")}</>:<>{field("feeding","Beslenme düzeni","Kullandığın mama, miktar ve saatler")}{field("habits","Alışkanlıklar ve dikkat edilecekler","Gezinti, dinlenme ve günlük düzen")}{field("contact","Acil iletişim ve veteriner","Paylaşmak istediğin kişi ve klinik bilgileri")}</>}
  {field("medicine",draft.mode==="visit"?"Kullanılan ilaçlar":"Mevcut ilaç talimatları","Yalnızca veterinerinin verdiği mevcut talimatları yaz; kullanmıyorsa belirt.")}
  <Pressable accessibilityRole="checkbox" accessibilityState={{checked:draft.includeAllergies}} onPress={()=>update({includeAllergies:!draft.includeAllergies})} style={s.inline}><Text style={s.link}>{draft.includeAllergies?"☑":"□"} Profildeki alerjileri ve özel notları ekle</Text></Pressable>
  <Text style={s.label}>Paylaşılacak kayıtları seç · {draft.selected.length}</Text><Text style={s.small}>Hiçbir kayıt kendiliğinden eklenmez. İlaç kaydı, ilacın hâlâ kullanıldığı anlamına gelmez.</Text>
  {!own.length&&<Text style={s.muted}>Bu pati için kayıt yok. Notlarını yine de hazırlayabilirsin.</Text>}
  {own.map(e=><Pressable key={e.id} accessibilityRole="checkbox" accessibilityState={{checked:draft.selected.includes(e.id)}} onPress={()=>update({selected:draft.selected.includes(e.id)?draft.selected.filter(id=>id!==e.id):[...draft.selected,e.id]})} style={s.record}><Text style={s.link}>{draft.selected.includes(e.id)?"☑":"□"}</Text><View style={{flex:1}}><Text style={s.cardTitle}>{e.title}</Text><Text style={s.small}>{e.date} · {e.kind} · {e.done?"Tamamlandı":"Planlı"}</Text></View></Pressable>)}
  <Text style={s.small}>Bu formdaki değişiklikler, “Notu kayıtlarıma kaydet” demeden kalıcı olarak saklanmaz.</Text>
  <Action label="Paylaşılacak içeriği önizle" disabled={busy} onPress={review}/>
  {preview&&<View style={{gap:14,padding:18,backgroundColor:"#fff",borderRadius:18}}><Text style={s.sectionTitle}>Önizleme</Text><Text selectable style={s.muted}>{text}</Text>
    <Action label={busy?"İşleniyor…":"PDF oluştur ve paylaş"} disabled={busy} onPress={()=>run(async()=>{const html=documentHtml(text);if(Platform.OS==="web"){const win=window.open("","_blank");if(!win)throw Error("PDF önizlemesi için açılır pencereye izin ver.");win.document.write(html);win.document.close();win.focus();win.print();}else{const {uri}=await Print.printToFileAsync({html});if(await Sharing.isAvailableAsync())await Sharing.shareAsync(uri,{mimeType:"application/pdf",UTI:".pdf"});else await Print.printAsync({uri});}})}/>
    <Action label="Metin olarak paylaş" disabled={busy} onPress={()=>run(async()=>{await Share.share({message:text});})}/>
    <Action label="Notu kayıtlarıma kaydet" disabled={busy} onPress={()=>run(async()=>{if(await onSave(draft.mode==="visit"?"Veteriner görüşme hazırlığı":"Bakım devretme kartı",text))setMessage("Not, bu patinin geçmişine kaydedildi.");else throw Error("Not kaydedilemedi. Yeniden dene.");})}/>
  </View>}
  {draft.mode==="visit"&&<View style={s.note}><View style={{flex:1,gap:10}}><Text style={s.cardTitle}>Görüşme sonrasında</Text><Text style={s.muted}>Veterinerinin önerilerini yeni kayda yaz, tarih ve hatırlatmasını belirle.</Text><Action label="Görüşme sonrası takip kaydı ekle" onPress={()=>onPlan(draft.reason)}/></View></View>}
  {!!message&&<Text accessibilityRole="alert" style={s.muted}>{message}</Text>}
 </View>;
}

