// Compare the actual tab source with the cited Lean definitions.
// External finite/numerical checks; this does not run Lean or certify a browser.
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict'), crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
if (process.argv.length < 3) throw Error('Usage: node scripts/check-proof-coverage.cjs LEAN_CHECKOUT [INDEX_HTML]');
const leanRoot = path.resolve(process.argv[2]);
const html = fs.readFileSync(process.argv[3] || path.join(root, 'index.html'), 'utf8').replace(/\r\n/g, '\n');
const coverage = require('../proof-coverage.js');
const sha = text => crypto.createHash('sha256').update(text).digest('hex');
const leanHashes = {};
const leanCache = {};
function lean(file, rev) {
  const r = rev || coverage.revision;
  const key = r + ':' + file;
  if (leanCache[key]) return leanCache[key];
  const pinned = execFileSync('git', ['-C', leanRoot, 'show', r + ':' + file], { encoding: 'utf8' }).replace(/\r\n/g, '\n');
  if (r === coverage.revision) {
    const text = fs.readFileSync(path.join(leanRoot, file), 'utf8').replace(/\r\n/g, '\n');
    assert.equal(text, pinned, 'Lean source differs from pinned revision: ' + file);
    leanHashes[file] = sha(text);
  } else {
    leanHashes[r + ':' + file] = sha(pinned);
  }
  leanCache[key] = pinned; return pinned;
}
const pieces = {};
function template(key) {
  const re = new RegExp('<template id="page-src-' + key + '">([\\s\\S]*?)</template>');
  const found = html.match(re); assert(found, key); return found[1];
}
function between(text, start, end, id) {
  const a = text.indexOf(start), b = text.indexOf(end, a + start.length);
  assert(a >= 0 && b > a, id);
  assert.equal(text.indexOf(start, a + 1), -1, 'Ambiguous source selector: ' + id);
  const part = text.slice(a, b); pieces[id] = { start, end, sha256: sha(part) }; return part;
}
const run = code => new vm.Script(code).runInNewContext({}, { timeout: 15000 });
const same = (a, b) => assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)));
const tabs = [...html.slice(0, html.indexOf('<div class="controls"')).matchAll(/<button class="tab(?: active)?" data-mode="([^"]+)"[^>]*>(.*?)<\/button>/g)];
same(tabs.map(m => m[1]), Object.keys(coverage.pages)); assert.equal(tabs.length, 33);
const allowedRevisions = new Set([coverage.revision, coverage.addedRevision, coverage.symmetryRevision].filter(Boolean));
const auditedByRevision = new Map();
const auditNames = new Set();
for (const revision of allowedRevisions) {
  const audit = lean('CheckAxioms.lean', revision);
  const names = new Set([...audit.matchAll(/^#print axioms (\S+)/gm)].map(match => match[1]));
  auditedByRevision.set(revision, names);
  for (const name of names) auditNames.add(name);
}
const targets = [];
for (const href of new Set(Object.values(coverage.pages).flatMap(p => p.links.map(l => l.href)))) {
  const m = href.match(/\/blob\/([^/]+)\/([^#]+)#L(\d+)$/); assert(m, href);
  assert(allowedRevisions.has(m[1]), href);
  const source = lean(m[2], m[1]), line = source.split('\n')[Number(m[3]) - 1];
  const decl = line.match(/^(?:theorem|lemma) (\w+)/); assert(decl, href);
  const namespace = source.match(/^namespace (\w+)/m); assert(namespace, m[2]);
  const qualified = namespace[1] + '.' + decl[1];
  assert(auditedByRevision.get(m[1]).has(qualified), 'Missing axiom report: ' + qualified);
  targets.push({ file: m[2], line: +m[3], declaration: qualified, revision: m[1] });
}

// E8: evaluate each page's enumeration, then check all vectors against the two shapes.
const rootSlices = {
  penteract: ['  const e8Roots = [];', '  // 8 simple roots'],
  pentlite: ['const e8Roots = [];', '// Precompute 5D'],
  e8studio: ['const e8Roots = [];', 'for (let i = 0; i < N; i++)'],
  e8studio2: ['const e8Roots = [];', '// Real Coxeter plane'],
  e8insp: ['  const roots = [];', '  // Tag the 8 simple roots']
};
const rootRecords = {};
let canonicalRoots;
for (const [key, [start, end]] of Object.entries(rootSlices)) {
  const source = between(template(key), start, end, key + '.roots');
  const vectors = run(source + '\n' + (key === 'e8insp' ? 'roots' : 'e8Roots') + '.map(r => r.v);');
  let integer = 0, half = 0;
  const encoded = new Set();
  for (const v of vectors) {
    assert.equal(v.length, 8);
    assert.equal(v.reduce((s, x) => s + x * x, 0), 2);
    if (v.every(Number.isInteger)) {
      assert.equal(v.filter(x => x !== 0).length, 2);
      assert(v.every(x => [-1, 0, 1].includes(x))); integer++;
    } else {
      assert(v.every(x => Math.abs(x) === 0.5));
      assert.equal(v.filter(x => x < 0).length % 2, 0); half++;
    }
    encoded.add(v.join(','));
  }
  assert.equal(integer, 112); assert.equal(half, 128); assert.equal(encoded.size, 240);
  const sorted = [...encoded].sort();
  if (canonicalRoots) same(sorted, canonicalRoots); else canonicalRoots = sorted;
  rootRecords[key] = { integer, even_parity_half: half, distinct: encoded.size, squared_norm: 2, vector_set_sha256: sha(sorted.join('\n')) };
}

// Read the integer matrix from Lean, not from its explanatory comment.
const matrixMatch = lean('E8PlumbingBridge.lean').match(/def E8_matrix[^]*?:=\s*!!\[([^]*?)\]/);
assert(matrixMatch);
const leanMatrix = matrixMatch[1].split(';').map(row => row.trim().split(/,\s*/).map(Number));
assert.equal(leanMatrix.length, 8); assert(leanMatrix.every(row => row.length === 8));
function det(input) {
  const a = input.map(row => row.map(BigInt)); let prev = 1n, sign = 1n;
  for (let k = 0; k < a.length - 1; k++) {
    let p = k; while (p < a.length && a[p][k] === 0n) p++;
    if (p === a.length) return 0;
    if (p !== k) { [a[p], a[k]] = [a[k], a[p]]; sign = -sign; }
    const pivot = a[k][k];
    for (let i = k + 1; i < a.length; i++) {
      for (let j = k + 1; j < a.length; j++) {
        const numerator = a[i][j] * pivot - a[i][k] * a[k][j];
        assert.equal(numerator % prev, 0n); a[i][j] = numerator / prev;
      }
      a[i][k] = 0n;
    }
    prev = pivot;
  }
  return Number(sign * a[a.length - 1][a.length - 1]);
}
assert.equal(det(leanMatrix), 1);
function arrayDeclaration(text, name, id) {
  const found = text.match(new RegExp('const ' + name + ' = (\\[[\\s\\S]*?\\]);'));
  assert(found, id); pieces[id] = { sha256: sha(found[0]) }; return run(found[1]);
}
const permutation = [0, 1, 2, 3, 4, 7, 5, 6]; // tab index -> Lean matrix index
const grams = {};
for (const [key, name] of [['penteract', 'e8SimpleVectors'], ['e8insp', 'SIMPLE_ROOTS'], ['e8studio2', 'simple']]) {
  const simple = arrayDeclaration(template(key), name, key + '.simple');
  const gram = simple.map(v => simple.map(w => v.reduce((s, x, k) => s + x * w[k], 0)));
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) assert(gram[i][j] === -leanMatrix[permutation[i]][permutation[j]]); // +0 and -0 are the same matrix entry
  assert.equal(det(gram), 1); grams[key] = { tab_to_lean: permutation, sign: -1, entries_checked: 64, determinant: 1 };
  if (key === 'e8insp') {
    const subsets = [[7,4], [0,2], [5,8]];
    grams[key].subset_determinants_external_only = subsets.map(([drop, expected]) => {
      const sub = gram.filter((_, i) => i !== drop).map(row => row.filter((_, j) => j !== drop));
      const d = det(sub); assert.equal(d, expected); return { dropped_zero_based_index: drop, determinant: d };
    });
  }
}
const trees = {};
for (const key of ['e8studio', 'e8studio2']) {
  const edges = arrayDeclaration(template(key), 'dynkinEdges', key + '.tree');
  const tree = Array.from({ length: 8 }, (_, i) => Array.from({ length: 8 }, (_, j) => i === j ? -2 : 0));
  for (const [i, j] of edges) tree[i][j] = tree[j][i] = 1;
  const p = key === 'e8studio' ? [0,1,2,3,4,5,6,7] : permutation;
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) assert.equal(tree[i][j], leanMatrix[p[i]][p[j]]);
  trees[key] = { tab_to_lean: p, entries_checked: 64, determinant: det(tree) };
}

// Leech: execute the actual generator and all three vector loops, stopping before UI.
const leechCode = between(template('leech'), 'const Q = [];', "document.getElementById('sTotal')", 'leech.generator_and_vectors');
const leechResult = run(leechCode + `
  const distribution = {}; for (const w of weights) distribution[w] = (distribution[w] || 0) + 1;
  const shells = [0,0,0], distinct = new Set();
  for (let i=0; i<n; i++) { shells[shellOf[i]]++; distinct.add(vecs.slice(i*24, (i+1)*24).join(',')); }
  ({code, basis, distribution, shells, vectors: n, allocated: N, distinct: distinct.size, allNorm32});
`);
same(leechResult.distribution, {0:1, 8:759, 12:2576, 16:759, 24:1});
same(leechResult.shells, [1104,97152,98304]);
assert.equal(leechResult.vectors,196560); assert.equal(leechResult.distinct,196560);
assert.equal(leechResult.allocated,196560); assert(leechResult.allNorm32);
const parityRows = [...lean('GolayMatrixDistance.lean').matchAll(/=>\s*#\[([^\]]+)\]/g)].map(m => m[1].split(',').map(x => x.trim() === 'true'));
assert.equal(parityRows.length,12);
const masks = parityRows.map((row, i) => row.reduce((m, b, j) => b ? m | (1 << (12+j)) : m, 1 << i));
let formalCode = [0]; for (const mask of masks) formalCode = formalCode.concat(formalCode.map(x => x ^ mask));
const tabSet = new Set(leechResult.code), formalSet = new Set(formalCode);
assert.equal(tabSet.size,4096); assert.equal(formalSet.size,4096);
const common = formalCode.filter(w => tabSet.has(w)).length; assert.equal(common,4);
const table = Object.fromEntries([...lean('GolayLeechBridge.lean').matchAll(/^\s*\| (\d+) => (\d+)$/gm)].map(m => [+m[1],+m[2]]));
same(table, leechResult.distribution);
delete leechResult.code;
leechResult.golay_codewords = tabSet.size;
leechResult.mod11_codewords_in_common_without_permutation = common;
const bridge = lean('PlaygroundGolay.lean');
function bridgeArray(name) {
  const m = bridge.match(new RegExp('def ' + name + '[\\s\\S]*?#\\[([^\\]]+)\\]'));
  assert(m, name); return m[1].split(',').map(Number);
}
same(leechResult.basis, bridgeArray('basisMasks'));
const coordinateMap = bridgeArray('coordinateMap');
assert.equal(new Set(coordinateMap).size, 24);
const permuteWord = w => coordinateMap.reduce((v,j,i) => v | (((w >>> i) & 1) << j), 0);
for (const w of tabSet) assert(formalSet.has(permuteWord(w)));
leechResult.playground_to_lean_coordinates = coordinateMap;
leechResult.mapped_codewords = tabSet.size;
leechResult.correspondence_status = 'Code equivalence and lattice-result transfer are proved in PlaygroundGolay/PlaygroundLeech; this script separately replays the JavaScript.';
const replay = JSON.parse(execFileSync(process.execPath,
  [path.join(leanRoot, 'scripts/check_playground_golay.cjs'), process.argv[3] || path.join(root, 'index.html')],
  {encoding:'utf8'}));
assert.equal(replay.status, 'PASS');
leechResult.mapped_vectors_satisfying_lattice_rule = replay.mapped_vectors_satisfying_InLeech_rule;

// Ferro: isolate the actual three simultaneous smoothing passes, before area rescaling.
const smoothing = between(html, '    const smoothAmount = Math.min(0.95, surfaceTension);', '    //    (c) Rescale edge radii', 'ferro.smoothing');
const ferro = [];
for (let tick = 1; tick <= 45; tick++) {
  const s = tick * .02, input = Array.from({length:180}, (_,j) => 10 + Math.cos(2*Math.PI*j/180) + .2*Math.cos(16*Math.PI*j/180));
  const observed = run(`const N=180, surfaceTension=${s}, nextRadii=Float64Array.from(${JSON.stringify(input)}), radii=new Float64Array(N); ${smoothing} ({radii:Array.from(radii),t:subAlpha/2});`);
  let expected = input;
  for (let pass=0; pass<3; pass++) expected=expected.map((x,j,a)=>x+observed.t*(a[(j+1)%180]-2*x+a[(j+179)%180]));
  const error=Math.max(...expected.map((x,j)=>Math.abs(x-observed.radii[j])));
  assert(error<1e-12);
  const covered = observed.t <= .25; assert.equal(covered, tick<=43);
  ferro.push({surface_tension:s,t:observed.t,within_linked_step_bound:covered,maximum_stencil_difference:error});
}

// Ring: the first displayed frequency squared agrees with the cited gap identity.
const ringSource=between(template('ringsum'), '  // Exact sums for k = 1 .. n-1', "  document.getElementById('bar-total-val')", 'ringsum.bars');
const ring=[];
for(const n of [6,24,120]) {
  const observed=run(`const n=${n}; ${ringSource} heights[0];`);
  const gap=2-2*Math.cos(2*Math.PI/n), error=Math.abs(observed**2-gap); assert(error<1e-12);
  ring.push({n,first_height_squared:observed**2,gap,difference:error});
}

// Pendulum: use a tiny time step to recover the implementation's initial acceleration.
const pendulumSource=between(template('pendulum'), 'function stepCoupled(dt) {', 'function drawCoupled', 'pendulum.step');
const pendulum=[];
for(const mode of ['line','ring']) {
  const n=14, input=Array.from({length:n},(_,j)=>Math.cos(2*Math.PI*j/n));
  const dt=1e-7, k=.45*18;
  const observed=run(`const nodes=${JSON.stringify(input)}.map(x=>({x,v:0,trail:[]})); const draggedNode=-1,couplingK=.45,coupledDamp=.004,coupledMode='${mode}'; function playChime(){} ${pendulumSource} stepCoupled(${dt}); nodes.map(x=>x.v/${dt});`);
  const expected=input.map((x,j)=>-9*x+k*((j>0?input[j-1]:mode==='ring'?input[n-1]:x)-x)+k*((j<n-1?input[j+1]:mode==='ring'?input[0]:x)-x));
  const error=Math.max(...expected.map((x,j)=>Math.abs(x-observed[j]))); assert(error<1e-6);
  pendulum.push({mode,n,maximum_acceleration_difference:error,scope:'neighbor stencil only; no trajectory proof'});
}

// Compile every inline script (including templates), without executing page handlers.
let scriptCount=0;
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) { new vm.Script(m[1]); scriptCount++; }
assert(!html.includes('GUE Match: 99.4%'));
const statusCounts={}; for(const page of Object.values(coverage.pages)) statusCounts[page.status]=(statusCounts[page.status]||0)+1;
console.log(JSON.stringify({
  status:'PASS', scope:'External source/computation comparison; no new Lean theorem and no interactive browser test',
  proof_revision:coverage.revision, proof_added_revision:coverage.addedRevision || null, proof_symmetry_revision:coverage.symmetryRevision, html_sha256:sha(html), coverage_js_sha256:sha(fs.readFileSync(path.join(root,'proof-coverage.js'),'utf8').replace(/\r\n/g,'\n')),
  node_version:process.version, tabs_checked:tabs.length, status_counts:statusCounts,
  theorem_targets:targets, axiom_declarations:auditNames.size, inline_scripts_syntax_checked:scriptCount,
  e8_enumerations:rootRecords, e8_gram_correspondence:grams, e8_tree_correspondence:trees,
  leech:leechResult, ferro, ring, pendulum, source_slices:pieces, lean_source_sha256:leanHashes
},null,2));
