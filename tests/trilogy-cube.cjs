// Run with: node tests/trilogy-cube.cjs [path/to/index.html]
// Exhaustive JavaScript regression checks, not Lean proofs or a browser test.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const file = process.argv[2] || path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(file, 'utf8');
const template = html.match(/<template id="page-src-trilogy">([\s\S]*?)<\/template>/)?.[1];
assert(template, 'Trilogy template exists');
const script = template.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(script, 'Trilogy script exists');
new vm.Script(script, {filename: 'Trilogy script'}); // Parse the entire embedded script.

// Use the actual markup IDs and HUD implementation, with text-only DOM stand-ins.
const elements = new Map();
for (const [, id, initial] of template.matchAll(/id="(hud[^"]+)"[^>]*>([^<]*)</g)) {
  let text = initial;
  elements.set(id, {
    style: {},
    get textContent() { return text; },
    set textContent(value) { text = String(value); }
  });
}
assert.match(template, /Exact Maximum h\(m\):/);
assert.match(template, /Upper Bound \(m\/2\)log₂m:/);
assert.match(template, /Optimality:/);
const start = script.indexOf('function exactCubeMaximum(');
const end = script.indexOf('function projectVertex(', start);
assert(start >= 0 && end > start, 'Locate the exact maximum and HUD functions');
const context = vm.createContext({
  cubeDim: 3,
  selectedSet: new Set(),
  document: {getElementById(id) {
    assert(elements.has(id), `HUD element exists: ${id}`);
    return elements.get(id);
  }}
});
const {exactCubeMaximum, updateCubeHUD} = new vm.Script(
  `${script.slice(start, end)}\n({exactCubeMaximum, updateCubeHUD});`
).runInContext(context, {timeout: 5000});
const read = id => elements.get(id).textContent;

const results = [];
for (const dimension of [2, 3, 4]) {
  context.cubeDim = dimension;
  const vertices = Array.from({length: 2 ** dimension}, (_, i) => i);
  // Independently enumerate adjacent unordered vertex pairs and all subsets.
  const edgeMasks = [];
  for (const u of vertices) for (const v of vertices) {
    if (u < v && (u ^ v).toString(2).replace(/0/g, '').length === 1) {
      edgeMasks.push((1 << u) | (1 << v));
    }
  }
  const sets = [];
  const maxima = Array(vertices.length + 1).fill(0);
  for (let mask = 0; mask < 2 ** vertices.length; mask++) {
    const selected = vertices.filter(v => mask & (1 << v));
    let internal = 0, boundary = 0;
    for (const edge of edgeMasks) {
      const occupied = mask & edge;
      if (occupied === edge) internal++;
      else if (occupied !== 0) boundary++;
    }
    maxima[selected.length] = Math.max(maxima[selected.length], internal);
    sets.push({selected, internal, boundary});
  }
  for (let m = 0; m <= vertices.length; m++) {
    assert.equal(exactCubeMaximum(m), maxima[m], `Exact maximum: dimension=${dimension}, m=${m}`);
  }
  let optimalSets = 0;
  for (const {selected, internal, boundary} of sets) {
    context.selectedSet = new Set(selected);
    updateCubeHUD();
    const m = selected.length, maximum = maxima[m], shortfall = maximum - internal;
    assert.equal(read('hudM'), String(m));
    assert.equal(read('hudInternal'), String(internal));
    assert.equal(read('hudBoundary'), String(boundary));
    assert.equal(read('hudMax'), String(maximum));
    assert.equal(read('hudLogBound'), (m ? (m / 2) * Math.log2(m) : 0).toFixed(2));
    if (shortfall === 0) {
      optimalSets++;
      assert.equal(read('hudStatus'), m ? 'Optimal (exact maximum)' : 'Empty set (optimal)');
      assert.equal(elements.get('hudStatus').style.color, m ? 'var(--good)' : 'var(--muted)');
    } else {
      assert.equal(read('hudStatus'), `Sub-optimal (${shortfall} ${shortfall === 1 ? 'edge' : 'edges'} short)`);
      assert.equal(elements.get('hudStatus').style.color, 'var(--warm)');
    }
  }
  results.push({dimension, subsets_checked: sets.length, optimal_sets: optimalSets, maxima});
}

// The original regression: three vertices forming a path are already optimal.
context.cubeDim = 3;
context.selectedSet = new Set([0, 1, 2]);
updateCubeHUD();
assert.equal(read('hudInternal'), '2');
assert.equal(read('hudMax'), '2');
assert.equal(read('hudLogBound'), '2.38');
assert.equal(read('hudStatus'), 'Optimal (exact maximum)');
console.log(JSON.stringify({
  status: 'PASS',
  subsets_checked: results.reduce((sum, row) => sum + row.subsets_checked, 0),
  dimensions: results,
  regression: {selected: [0, 1, 2], internal_edges: 2, exact_maximum: 2,
    displayed_logarithmic_upper_bound: read('hudLogBound'), label: read('hudStatus')}
}, null, 2));
