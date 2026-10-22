import test from 'node:test';
import assert from 'node:assert/strict';
import {documentText,documentHtml} from '../src/petDocumentModel.ts';
const pet={id:'p',name:'Pati <script>',species:'Kedi',allergies:'Özel bilgi'};
const entries=[{id:'a',petId:'p',title:'Kontrol',kind:'Kontrol',date:'2026-10-01',notes:'İzlem',done:true},{id:'b',petId:'other',title:'Başka pati',notes:'Gizli',date:'2026-10-02'}];
const draft={mode:'visit',date:'2026-10-21',end:'2026-10-23',reason:'İştah gözlemi',questions:'Sorular',feeding:'Mama',medicine:'',habits:'Oyun',contact:'Telefon',includeAllergies:false,selected:[]};
test('documents share only selected records for the correct pet and opt-in allergies',()=>{
 const text=documentText(pet,entries,{...draft,selected:['a','b']});
 assert.ok(text.includes('Kontrol'));assert.ok(!text.includes('Gizli'));assert.ok(!text.includes('Özel bilgi'));
 assert.ok(documentText(pet,entries,{...draft,includeAllergies:true}).includes('Özel bilgi'));
 assert.ok(!documentText(pet,entries,draft).includes('İzlem'));
});
test('handover and visit keep their fields separate, and HTML escapes user text',()=>{
 const visit=documentText(pet,entries,draft);assert.ok(!visit.includes('Telefon'));assert.ok(visit.includes('Sorular'));
 const handover=documentText(pet,entries,{...draft,mode:'handover'});assert.ok(handover.includes('Telefon'));assert.ok(!handover.includes('Sorular'));
 const html=documentHtml(visit);assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));
});
