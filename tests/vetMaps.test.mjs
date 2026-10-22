import test from 'node:test';
import assert from 'node:assert/strict';
import {vetMapsUrl} from '../src/vetMaps.ts';
test('maps searches encode user area and rounded coordinates without query injection',()=>{
 const u=new URL(vetMapsUrl(null,'Kadıköy & İstanbul'));assert.equal(u.searchParams.get('query'),'veteriner Kadıköy & İstanbul');assert.equal(u.searchParams.size,2);
 assert.equal(new URL(vetMapsUrl({latitude:40.99123456,longitude:29.0256789})).searchParams.get('query'),'veteriner near 40.9912,29.0257');
 assert.throws(()=>vetMapsUrl({latitude:NaN,longitude:29}));
});
