import test from 'node:test';
import assert from 'node:assert/strict';
import { calendarEntries } from '../src/calendar.ts';
const records = [
  {id:'old',petId:'p',title:'Aşı',kind:'Aşı',notes:'',date:'2026-10-20',done:false},
  {id:'today',petId:'p',title:'Kontrol',kind:'Kontrol',notes:'',date:'2026-10-21',done:false},
  {id:'last',petId:'q',title:'Tarama',kind:'Bakım',notes:'',date:'2026-10-27',done:false},
  {id:'later',petId:'p',title:'Kontrol',kind:'Kontrol',notes:'',date:'2026-10-28',done:false},
  {id:'done',petId:'p',title:'Aşı',kind:'Aşı',notes:'',date:'2026-10-21',done:true},
];
const list = (filter, pet='Tümü', query='') => calendarEntries(records,[{id:'p',name:'Işık'},{id:'q',name:'Mavi'}],'2026-10-21',filter,pet,query).map(e=>e.id);
test('calendar separates overdue, today, seven calendar days and completed records',()=>{
  assert.deepEqual(list('Geciken'),['old']);
  assert.deepEqual(list('Bugün'),['today']);
  assert.deepEqual(list('7 gün'),['today','last']);
  assert.deepEqual(list('Geçmiş'),['done']);
});
test('calendar composes pet and Turkish search filters without mutating input',()=>{
  assert.deepEqual(list('Planlı','p','ışık'),['old','today','later']);
  assert.deepEqual(list('Planlı','p','aşı'),['old']);
  assert.deepEqual(list('7 gün','p'),['today']);
  assert.equal(records[0].id,'old');
});

import { dailyCare } from '../src/routines.ts';
test('daily care shows only due recurring records',()=>{
  const data=records.map(e=>({...e,repeatDays:1}));
  assert.deepEqual(dailyCare(data,'2026-10-21').map(e=>e.id),['old','today']);
});
