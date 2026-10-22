import test from 'node:test';
import assert from 'node:assert/strict';
import { backupJSON, backupJSONWithFiles, backupSummary, parseBackup, mergeBackup } from '../src/backup.ts';
const pet = {id:'p',name:'Misket',species:'Kedi',breed:'',birthday:'2024-02-29',allergies:'',photo:'file:///private/photo.jpg'};
const entry = {id:'e',petId:'p',title:'Kontrol',kind:'Kontrol',date:'2026-10-20',notes:'',done:false,file:'file:///private/record.pdf',notification:'os-id'};
const store = {pets:[pet],entries:[entry],favorites:['1'],preferences:{reminders:false,daysBefore:3,hour:18},checklist:{p:['space']},trash:[]};
test('portable backup round trips records without device paths or notification ids',()=>{
 const raw=backupJSON(store), restored=parseBackup(raw);
 assert.equal(restored.pets[0].name,'Misket');
 assert.equal(restored.entries[0].date,entry.date);
 assert.equal(raw.includes('file:///'),false); assert.equal(raw.includes('os-id'),false);
 assert.deepEqual(restored.checklist.p,['space']);
});
test('import preserves current edits, preferences, attachments and is idempotent',()=>{
 const changed={...store,pets:[{...pet,name:'Yeni isim'}]};
 const backup=parseBackup(backupJSON({...store,entries:[entry,{...entry,id:'e2'}]}));
 const merged=mergeBackup(changed,backup);
 assert.equal(merged.pets[0].name,'Yeni isim'); assert.equal(merged.pets[0].photo,pet.photo);
 assert.equal(merged.entries.length,2); assert.deepEqual(merged.preferences,store.preferences);
 assert.deepEqual(mergeBackup(merged,backup),merged);
});
test('malformed, orphan, duplicate and impossible dates are rejected before mutation',()=>{
 for(const bad of ['no json',JSON.stringify({...store,pets:[pet,pet]}),JSON.stringify({...store,entries:[{...entry,petId:'missing'}]}),JSON.stringify({...store,entries:[{...entry,date:'2026-02-30'}]}),JSON.stringify({...store,pets:[{...pet,id:'__proto__'}]})]) assert.throws(()=>parseBackup(bad));
});
test('merge does not resurrect trash and adds new profile checklists',()=>{
 const backup=parseBackup(backupJSON(store));
 const deleted={...store,pets:[],entries:[],checklist:{},trash:[{id:'pet-p',pet,entries:[entry],deletedAt:'2026-10-18'}]};
 assert.equal(mergeBackup(deleted,backup).pets.length,0);
 const empty={...deleted,trash:[]}; const merged=mergeBackup(empty,backup);
 assert.equal(merged.pets.length,1); assert.equal(merged.entries.length,1); assert.deepEqual(merged.checklist.p,['space']);
});

test('legacy v1 backup remains restorable without portable assets',()=>{
 const legacy=JSON.stringify({format:'wikipati',version:1,data:{pets:[pet],entries:[entry],favorites:[],checklist:{}}});
 const restored=parseBackup(legacy);
 assert.equal(restored.formatVersion,1);
 assert.equal(restored.pets[0].photo,undefined);
 assert.equal(restored.entries[0].file,undefined);
});

test('v2 backup embeds photos and documents and reports restore summary',async()=>{
 const data='data:application/octet-stream;base64,QUJD';
 const raw=await backupJSONWithFiles(store,async()=>data);
 const restored=parseBackup(raw);
 assert.equal(restored.formatVersion,2);
 assert.equal(restored.pets[0].photo,data);
 assert.equal(restored.entries[0].file,data);
 assert.deepEqual(backupSummary(restored),{pets:1,entries:1,photos:1,documents:1});
 const current={...store,pets:[{...pet,photo:undefined}],entries:[{...entry,file:undefined}]};
 const merged=mergeBackup(current,restored,true);
 assert.equal(merged.pets[0].photo,data);
 assert.equal(merged.entries[0].file,data);
});
