import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateLifeStage} from '../src/tools/ageCalculator.ts';
import {normalizeSearch,editDistance,searchToxicity} from '../src/content/toxicity.ts';

test('cat life stages follow sourced AAHA/AAFP age boundaries',()=>{
 assert.equal(calculateLifeStage('Kedi',0,11).stage,'Yavru');
 assert.equal(calculateLifeStage('Kedi',1,0).stage,'Genç yetişkin');
 assert.equal(calculateLifeStage('Kedi',7,0).stage,'Olgun yetişkin');
 assert.equal(calculateLifeStage('Kedi',10,0).stage,'İleri yaş');
});
test('dog result stays hidden when exact stage requires individual lifespan assessment',()=>{
 assert.equal(calculateLifeStage('Köpek',0,9,'Büyük').stage,'Yavru');
 assert.equal(calculateLifeStage('Köpek',5,0,'Küçük').needsIndividualAssessment,true);
});
test('Turkish normalization and typo distance are deterministic while unreviewed items stay hidden',()=>{
 assert.equal(normalizeSearch('İlaç ÇÖZÜMÜ'),'ilaccozumu');
 assert.equal(editDistance('çikolata','cikoltaa'),2);
 assert.deepEqual(searchToxicity('TODO'),[]);
});
