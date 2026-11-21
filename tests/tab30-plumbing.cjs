'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { create, bundlePoint, chartCoordinates } = require('../e8-plumbing.js');
const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'index.html'), 'utf8').split('<template id="page-src-e8insp">')[1].split('</template>')[0];
const array = page.match(/const SIMPLE_ROOTS = (\[[\s\S]*?\]);/)[1].replace(/\/\/[^\n]*/g,'');
const roots = JSON.parse(array);
const dot = (a,b) => a.reduce((s,v,i) => s + v*b[i],0);
const model = create(roots,dot);
const near = (xs,ys) => xs.forEach((v,i) => assert.ok(Math.abs(v-ys[i]) < 1e-10));

// Compare the actual browser-model joint and site order with the Lean input.
const lean = fs.readFileSync(path.join(__dirname,'lean','Tab30PlumbingAssembly.lean'),'utf8');
const fittings = lean.split('def fittings : List (Site × Site) :=')[1].split('def joints')[0];
const pairs = [...fittings.matchAll(/\(\((\d+), (\d+)\), \((\d+), (\d+)\)\)/g)].map(m => m.slice(1).map(Number));
assert.equal(pairs.length,7);
assert.deepEqual(model.joints.map(j => [j.a,j.slotA,j.b,j.slotB]),pairs);
assert.equal(model.components,8);
const zero = [0,0,0,0];
const sample = [.15,-.27,.09,.31], other = [.62,.12,-.28,.13];
const boundary = [0,0,0,1];
const samples = [[zero,zero],[sample,zero],[zero,other],[sample,other],[boundary,boundary]];

for (const joint of [...model.joints].reverse()) {
  const count = model.components;
  assert.equal(model.mate(joint.a,bundlePoint(joint.slotA,sample,other)),null);
  model.glue(joint); model.glue(joint);
  assert.equal(model.components,count-1);
  for (const [base,fiber] of samples) {
    const source = bundlePoint(joint.slotA,base,fiber);
    const across = model.mate(joint.a,source);
    assert.equal(across.piece,joint.b);
    const to = chartCoordinates(joint.slotB,across.point);
    near(to.base,fiber); near(to.fiber,base);
    for (const [point,vector] of [[source,fiber],[across.point,base]]) {
      near([dot(point.x,point.x),dot(point.x,point.v),dot(point.v,point.v)],[1,0,dot(vector,vector)]);
    }
    const back = model.mate(across.piece,across.point);
    assert.equal(back.piece,joint.a);
    near(back.point.x,source.x); near(back.point.v,source.v);
    for (let slot=0; slot<model.sites[joint.a].length; slot++) {
      if (slot !== joint.slotA) assert.equal(chartCoordinates(slot,source),null);
    }
  }
}
assert.equal(model.components,1);
model.setPieces(roots.map((_,i) => i !== 4));
assert.equal(model.gluedCount,4);
assert.equal(model.components,3);
model.setPieces(roots.map(() => true));
assert.equal(model.gluedCount,4);
model.reset();
assert.equal(model.components,8);
model.setPieces(roots.map(() => false));
assert.equal(model.components,0);
assert.deepEqual(model.joints,[]);
console.log('PASS: seven site pairs match the Lean source; chart constraints, two-way gluing, distinct patches, and assembly controls checked.');
