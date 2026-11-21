'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { create, bundlePoint, chartCoordinates } = require('../e8-plumbing.js');
const { trace } = require('../e8-boundary.js');

const tab = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8')
  .split('<template id="page-src-e8insp">')[1].split('</template>')[0];
const literal = tab.match(/const SIMPLE_ROOTS = (\[[\s\S]*?\]);/)[1].replace(/\/\/[^\n]*/g, '');
const roots = JSON.parse(literal);
const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0);
const model = create(roots, dot);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-10, a + ' differs from ' + b);
const nearVector = (a, b) => a.forEach((x, i) => near(x, b[i]));

for (const joint of model.joints) {
  const open = trace(model, bundlePoint, joint, 0);
  assert.equal(open.identified, false);
  assert.equal(open.sides.length, 2);
  assert.equal(model.mate(joint.a, open.sides[0].point), null);
}
for (const joint of model.joints) model.glue(joint);
const used = new Set();
for (const joint of model.joints) {
  const seam = trace(model, bundlePoint, joint, 0);
  near(seam.baseRadius, 1);
  near(seam.fiberRadius, 1);
  assert.equal(seam.identified, true);
  assert.deepEqual(seam.sides.map(s => s.piece), [joint.a, joint.b]);
  const [first, second] = seam.sides.map(s => s.point);
  const a = chartCoordinates(joint.slotA, first), b = chartCoordinates(joint.slotB, second);
  near(dot(a.base, a.base), 1);
  near(dot(a.fiber, a.fiber), 1);
  nearVector(a.base, b.fiber);
  nearVector(a.fiber, b.base);
  const back = model.mate(joint.b, second);
  assert.equal(back.piece, joint.a);
  nearVector(back.point.x, first.x);
  nearVector(back.point.v, first.v);
  for (const [piece, slot] of [[joint.a, joint.slotA], [joint.b, joint.slotB]]) {
    used.add(piece + '/' + slot);
  }
  for (let i = -10; i <= 10; i++) {
    const current = trace(model, bundlePoint, joint, i / 10);
    assert.ok(current.baseRadius >= 1 && current.fiberRadius >= 1);
    assert.ok(current.baseRadius === 1 || current.fiberRadius === 1);
    assert.equal(current.sides.length, i === 0 ? 2 : 1);
    if (i !== 0) {
      const side = current.sides[0];
      assert.equal(side.piece, i < 0 ? joint.a : joint.b);
      assert.equal(model.mate(side.piece, side.point), null);
      for (let slot = 0; slot < model.sites[side.piece].length; slot++)
        assert.equal(chartCoordinates(slot, side.point), null);
    }
    for (const { point } of current.sides) {
      near(dot(point.x, point.x), 1);
      near(dot(point.v, point.v), 1);
      near(dot(point.x, point.v), 0);
      near(point.x[3], 0);
      near(point.x[4], 0);
    }
  }
}
assert.equal(used.size, 14);
model.reset();
for (const joint of model.joints) assert.equal(trace(model, bundlePoint, joint, 0).identified, false);
console.log('PASS: all seven seams, fourteen cap rims, exchange in both directions, and exposed unit tangent vectors along each traced collar.');
