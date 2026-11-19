// Keep the published tab-by-tab record aligned with the visible proof notes.
'use strict';
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..'), {revision, pages} = require('../proof-coverage.js');
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
const tabs = [...html.slice(0,html.indexOf('<div class="controls"')).matchAll(/<button class="tab(?: active)?" data-mode="([^"]+)"[^>]*>(.*?)<\/button>/g)];
const base = 'https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/' + revision + '/';
const intro = `# Playground tabs and Lean proofs

All 33 tabs were compared with the definitions and theorem statements in [discrete-gap-inequalities-lean at ${revision.slice(0,7)}](${base}README.md). This is a review of that project, not a search of every Lean library or a proof of the playground as a whole. The starting playground revision was [7914e9d](https://github.com/NousVolition/sparkle-sand-playground/commit/7914e9dd7677e3f801c7ac9e7cdbf23e6be81468).

Nine tabs have matching mathematical results with limits, three have a related theorem that covers only part of their calculation, and 21 have no matching proof in this library. The “Lean proofs” menu follows the selected tab. A missing proof here does not mean a mathematical claim is false.

## What was checked

The cited Lean revision passed its [build and axiom audit](https://github.com/NousVolition/discrete-gap-inequalities-lean/actions/runs/44488762286). Its CheckAxioms file lists 559 declarations, including the seven Golay-to-Leech arithmetic results. The audit accepts only propext, Classical.choice and Quot.sound. No new Lean theorem is claimed by this review.

The source comparison reads the actual JavaScript enumerations, smoothing code and simple-root arrays and checks them against the cited Lean definitions. The [saved results](lean-coverage-check.json) record the source hashes, theorem lines, selectors and numerical tolerances. Those checks are external computations, not Lean proofs of the code correspondence or floating-point execution. The remaining tabs were reviewed by their displayed claims, source models and the proof library's module scopes. They were not all numerically simulated.

- **E8 counts:** all five E8 tabs enumerate the same 240 distinct vectors: 112 of the integer shape and 128 even-parity half-integer sign patterns. The Lean results count those two finite families; they do not define the full root lattice or prove its packing properties.
- **E8 matrices:** the first Milnor tab's tree uses Lean's numbering. In 5D / E8, E8 Inspector and Milnor v2, the tab-to-Lean index permutation is [0,1,2,3,4,7,5,6]. Every Gram entry equals the negative of the corresponding Lean matrix entry. The matrix size is eight, so the whole-matrix sign change preserves its determinant. This correspondence and the Inspector's subset determinants 4, 2 and 8 were checked externally. The linked Lean determinant theorem proves neither the boundary topology nor an exotic-sphere classification. Comments about topology in the Lean source are not theorem statements.
- **Leech:** the actual tab generates 4,096 codewords and 196,560 distinct vectors with squared norm 32 in its scaled coordinates. The three families have sizes 1,104, 97,152 and 98,304. GolayLeechBridge proves arithmetic on a hand-entered weight table. It does not import the separately proved GolayMatrixDistance construction. The tab's modulo-23 code and that file's modulo-11 code share only four words without a coordinate permutation. Equivalence under a permutation, lattice membership, minimality and completeness of the shortest-vector list remain unproved here.
- **Ferro:** each isolated smoothing pass has the RingDecay form with t = (1 − (1 − s)^(1/3))/2, where s is the surface-tension setting. The theorem requires t ≤ 1/4, hence s ≤ 7/8. Of the 45 slider settings, 43 meet that restriction; 0.88 and 0.90 do not. All 45 were compared with the step formula. This says nothing about failure at those two settings; they are outside this theorem's hypotheses. Magnetic forcing, constant-area rescaling and the measured swirl-decay rate are separate.
- **Ring and Pendulum:** Ring's first frequency squared agrees with the cycle gap; the −1/12 limit is not covered. Pendulum's neighbor forces match a path or cycle coupling term, but it evolves a damped second-order system, not the heat step.
- **Zeros:** “GUE Match: 99.4%” was fixed markup, with no computed fit behind that badge. It now reads “GUE-like illustration.” The tab's drum bars are drawn from the stored Riemann zeros rather than obtained by solving a drum eigenvalue problem. These are illustrations, not a Lean proof of their correspondence.
- **Other tempting matches:** a drawn torus is not the finite periodic grid of Torus.lean; Crystal uses six neighbors and freezing; Stretch uses a nonlinear Fourier/RK4 vorticity solver; a polychoron is not the planar polygon inequality. E8CostMirror's quadratic cost/flip identity has no matching displayed quantity in the E8 tabs, so it has no proof link there.

## Reproduce

Use this playground checkout and a separate checkout of the pinned proof revision:

\`\`\`sh
git clone https://github.com/NousVolition/discrete-gap-inequalities-lean.git ../discrete-gap-inequalities-lean
git -C ../discrete-gap-inequalities-lean checkout ${revision}
node scripts/check-proof-coverage.cjs ../discrete-gap-inequalities-lean
node scripts/check-proof-notes-ui.cjs
\`\`\`

The comparison uses Node's standard libraries, does not start a browser or solver trajectory, and prints JSON. An optional second argument selects a downloaded index.html. Rebuild Lean separately with lake build and run the axiom checker as specified by that repository's workflow. The recorded successful Lean run is linked above; this review did not repeat the full Lean build locally.

The proof-menu check exercises all 33 selections, safe external links, an unknown-tab fallback and closing behavior with DOM stand-ins. It is not a rendered browser test. Regenerate the record after changing a note with node scripts/write-proof-coverage.cjs.

## Tab-by-tab comparison
`;
let text=intro;
for(const [,key,label] of tabs) {
  const page=pages[key];
  text+=`\n<a id="${key}"></a>\n\n### ${label}\n\n**${page.status}.** ${page.note}\n\n`;
  text+=page.links.length ? page.links.map(p=>`[${p.label}](${p.href})`).join(' · ')+'\n' : 'No proof link added.\n';
}
fs.mkdirSync(path.join(root,'docs'),{recursive:true});
fs.writeFileSync(path.join(root,'docs/lean-coverage.md'),text);
