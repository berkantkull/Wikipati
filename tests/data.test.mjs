import test from 'node:test';
import assert from 'node:assert/strict';
import {parseDate,today,articles} from '../src/data.ts';
import {wikiArticles} from '../src/wiki.ts';
test('date validation rejects impossible dates and ambiguous formats',()=>{
 for(const date of ['2026-02-29','2026-04-31','2026-13-01','14/09/2026','2026-9-14',''])assert.equal(parseDate(date),null);
 assert.ok(parseDate('2028-02-29'));
 assert.ok(parseDate(today()));
});
test('all guides have stable slugs and at least one valid source',()=>{
 assert.equal(new Set(wikiArticles.map(a=>a.slug)).size,wikiArticles.length);
 for(const article of wikiArticles){
  assert.match(article.slug,/^[a-z0-9-]+$/);
  assert.match(article.updatedAt,/^\d{4}-\d{2}-\d{2}$/);
  assert.ok(article.sources.length>=1);
  for(const source of article.sources) assert.equal(new URL(source.url).protocol,'https:');
 }
});
test('library sources use HTTPS and article identifiers are unique',()=>{
 assert.equal(new Set(articles.map(a=>a.id)).size,articles.length);
 for(const article of articles)assert.equal(new URL(article.source).protocol,'https:');
});
