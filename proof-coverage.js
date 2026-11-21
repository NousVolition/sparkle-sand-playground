// Proof notes for the active playground. Mathematical scope, not a browser certificate.
(function () {
  'use strict';
  const revision = '8d520965e87e391ae4ce31bb5ee398733e8781bf';
  const addedRevision = '53ecf1d4dc11a97871c9512b58020d926a85304c';
  const symmetryRevision = 'a0498c80c24b1e14925e25233afc93b235429e7b';
  const lightCaptureRevision = 'cb7c8ef9fb7153b01fcfbec3d78b736fcd95f72d';
  const base = `https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/${revision}/`;
  const addedBase = `https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/${addedRevision}/`;
  const proof = (label, file, line) => ({ label, href: `${base}${file}#L${line}` });
  const added = (label, file, line) => ({ label, href: `${addedBase}${file}#L${line}` });
  const symmetry = (label, file, line) => ({ label, href: `https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/${symmetryRevision}/${file}#L${line}` });
  const lightCapture = (label, line) => ({ label, href: `https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/${lightCaptureRevision}/LightBounceAndCapture.lean#L${line}` });
  const cycle = proof('Cycle inequality', 'Wirtinger.lean', 168);
  const equality = proof('Cosine equality case', 'Wirtinger.lean', 228);
  const decay = proof('Ring smoothing step', 'RingDecay.lean', 191);
  const counts = proof('112 + 128 = 240 count', 'E8PlumbingBridge.lean', 188);
  const determinant = proof('E8 matrix determinant', 'E8PlumbingBridge.lean', 79);
  const none = note => ({ status: 'No matching proof in this library', note, links: [] });
  const partial = (note, links) => ({ status: 'Some results proved; limits below', note, links });
  const related = (note, links) => ({ status: 'Related theorem; limited match', note, links });
  const relatedNotProof = (note, links) => ({ status: 'Related, not a proof of this tab', note, links });
  const ramanujanRevision = '4a1e2f0798c5186e8cbb118a7d57b6a84f5c2f8d';
  const spaceProof = (label, file, line) => ({ label, href: 'https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/' + ramanujanRevision + '/' + file + '#L' + line });
  const crossingRevision = '394543d34125c52b41813ee2917158f2058808ae';
  const crossingProof = (label, line) => ({ label, href: 'https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/' + crossingRevision + '/GapCrossing.lean#L' + line });
  const pages = {
    sand: none('The grain movement, collisions, tools and settling rules are not formalized in the reviewed Lean project.'),
    loop: relatedNotProof('These are driven particle orbits with cursor forces. A ring-shaped picture does not make this the nearest-neighbor heat flow proved in RingDecay. Related results, not a proof of this tab: “With any steady positive input, it passes every bound,” and a store that holds the past stays finite exactly when it has a gap.', [added('With any steady positive input, it passes every bound', 'Gap.lean', 48), added('A store that holds the past stays finite exactly when it has a gap', 'Gap.lean', 98)]),
    bubbles: none('Bubble merging, dragging and surface-tension rules are not covered by the gap inequalities.'),
    plate: none('The plate draws prescribed standing-wave fields and moves grains toward their nodes. No matching plate equation or particle-motion proof was found.'),
    waves: none('The standing-wave patterns and grain-following rules are not the periodic grid heat step in Torus.lean.'),
    silk: none('The vector fields, particle trails and fitted settling readouts are numerical demonstrations; no matching motion proof was found.'),
    crystal: none('This uses a six-neighbor hexagonal growth model with freezing and boundary feeding. Torus.lean concerns a four-neighbor periodic square grid, so its heat theorem does not cover this tab.'),
    magnets: none('The softened magnetic field, particle updates and fitted decay readouts are not formalized in the reviewed project.'),
    stretch: partial('This tab uses Fourier derivatives, dealiasing and RK4 for periodic vorticity, with an optional Boussinesq temperature field. Lean proves “How two waves push on each other,” the rate one pair of waves feeds the difference and sum waves (zero exactly when the stripes are straight), that one wave alone solves the fluid equation, the gap wave’s tail, and “No feed, no broad wave.” The tab’s measured +0.75 starting rate, its dP/dt budget, and Hot/Cold are measured or coded in the tab, not proved; Lean proves the feed formula, not the constant 0.75. Torus.lean proves a nearest-neighbor heat step, not this nonlinear spectral solver as a whole.', [added('How two waves push on each other', 'GapWaveTail.lean', 102), added('The push, written as what it feeds: the difference wave and the sum wave', 'GapWaveTail.lean', 134), added('The tested stripes: two and three crests across, m crests up', 'GapWaveTail.lean', 162), added('One wave alone solves the full fluid equation', 'GapWaveTail.lean', 227), added('The gap wave’s tail', 'GapWaveTail.lean', 246), added('No feed, no broad wave', 'GapWaveTail.lean', 275), added('Straight stripes have zero feed and hence zero broad-wave forecast', 'GapWaveTail.lean', 334)]),
    ferro: related('Only the isolated radius-smoothing pass matches RingDecay: t = subAlpha / 2 must be at most 1/4. This covers surface tension up to 0.875; the 0.88 and 0.90 slider settings exceed that theorem’s bound. Magnetic forces, area rescaling, swirl motion and the measured decay rate are outside the proof.', [decay]),
    sum: partial('Lean proves the softened bar sum, the smooth area, the space’s limit −1/12, and the shortcut L(ε) − 4L(2ε) = exp(−ε)/(1 + exp(−ε))². The areas cancel exactly; the alternating sum tends to 1/4. The final theorem identifies the limit with zeta at −1. Canvas rendering and floating-point readouts have separate numerical checks.', [spaceProof('The signed space has a finite limit', 'RingSumMinusTwelfth.lean', 360), spaceProof('The smooth area', 'RamanujanGap.lean', 25), spaceProof('The areas cancel', 'RamanujanGap.lean', 39), spaceProof('The shortcut on the spaces', 'RamanujanGap.lean', 45), spaceProof('The alternating series sums to the same value', 'RamanujanGap.lean', 69), spaceProof('The alternating limit is 1/4', 'RamanujanGap.lean', 78), spaceProof('The limit agrees with zeta at −1', 'RamanujanGap.lean', 113)]),
    ringsum: partial('Lean proves the finite sum of the ring bars, their relation to the square roots of the heat eigenvalues, and the normalized leftover’s limit −1/12. This updates proof coverage only; tab 12 itself is unchanged. The Casimir illustration and browser execution remain outside the proof.', [spaceProof('Ring bars sum to twice the cotangent', 'RingSumMinusTwelfth.lean', 46), spaceProof('Ring leftover tends to −1/12', 'RingSumMinusTwelfth.lean', 194), spaceProof('Each bar is the square root of its eigenvalue', 'RingSumMinusTwelfth.lean', 387)]),
    zeros: partial('The fixed-height pass shows gap size and real part on both sides of a numerical zero, keeping height and softening fixed. Lean proves a conditional crossing rule: given an exact zero and strict real-part monotonicity, opposite sides have opposite real signs and positive sizes. It also proves that real-part sign change alone does not imply a complex zero. Those hypotheses are not certified for this numerical gap. Lean covers the real starting case at s = −1, but not the complex extension, numerical root search or RH. The Critical Line Tightrope is a numerical illustration. It computes its rotating bands and fixed σ = ½ crossings from the extrapolated gap. The spacing, drum and prime-wave illustrations use tabulated ordinates.', [crossingProof('Before an exact zero', 26), crossingProof('Beyond an exact zero', 37), crossingProof('Real sign change without a complex zero', 49), crossingProof('Zero size iff zero reading', 16), crossingProof('Opposite readings have the same size', 19), crossingProof('The real component is bounded by the size', 22), spaceProof('Real gap at s = −1', 'RamanujanGap.lean', 32), spaceProof('Its limit equals the zeta value', 'RamanujanGap.lean', 113)]),
    pendulum: related('The centered displacement on the closed ring has the cycle energy bound; the open line has the general path bound. The tab evolves a damped second-order oscillator, not heat flow. Its motion, damping and recurrence times are outside these proofs.', [cycle, proof('General path inequality', 'Poincare.lean', 69)]),
    trilogy: partial('Lean proves the six-point path gap and rounding, cycle gap, cube gap and maximum internal-edge count. The cycle update also matches RingDecay with t = 0.004 × speed (0.004 to 0.04). Lean also proves the ring gap equals 4 sin²(π/n); for six points that gives 0, 1, 1, 3, 3, 4, with smallest positive 1. The real-number theorems do not certify floating-point trajectories.', [proof('Six-point path gap', 'PathSix.lean', 70), cycle, proof('Cube gap', 'CubeCheeger.lean', 179), proof('Cube internal-edge maximum', 'EdgeOptimal.lean', 230), decay, added('Ring gap = 4 sin²(π/n)', 'RingDecay.lean', 41)]),
    blackhole: partial('With the center and horizon radius fixed, a ray moves first. It is captured if its new distance is at most the radius, including the edge. Lean proves that a captured ray stays where it was captured. The light paths and ringdown use separate models.', [lightCapture('Capture at or inside the edge', 334), lightCapture('A captured ray stays in place', 297)]),
    ocean: none('The prescribed ocean field, presets and anomaly readouts are outside these proofs. Subtracting a background is not a proof that this field obeys the heat equation.'),
    fourd: none('The complex-root surfaces, Clifford torus and 24-cell have no matching theorem here. Torus.lean proves a finite grid inequality, not the topology of a continuous torus.'),
    polychora: none('The polytope vertex constructions, face counts and projections are not covered by the planar polygon isoperimetric theorem.'),
    fireflies: none('The prescribed Faraday-wave pictures and moving-neighbor Kuramoto swarm are outside the linear cycle and grid heat proofs.'),
    horned: none('The horned-sphere, cork-twist and handle pictures are not formalized here. E8PlumbingBridge proves matrix arithmetic, not these topology claims.'),
    nonorient: none('The Möbius, Klein-bottle and projective-plane parametrizations and embedding claims have no matching theorem in this project.'),
    penteract: partial('The E8 mode uses the 112 integer and 128 even-parity sign patterns counted in Lean. Its simple-root Gram matrix matches the negative of the Lean matrix after relabeling. That correspondence was checked externally. E6, 5D unknotting, edge counts and projections remain outside the linked proofs.', [counts, determinant]),
    leech: partial('Lean proves the Golay generator correspondence, lattice membership, minimum squared length 32, classification and 196,560 count. It now also proves that three orthogonal scaled E₈ blocks with twelve glue vectors give the same infinite lattice, with 4,096 distinct binary glue cosets. The construction reuses the existing basis, determinant 8^12 and evenness proofs. For the Leech lattice with the origin fixed, the full symmetry group has order 8,315,553,613,086,720,000, with explicit generators, proved in Lean. The integer JavaScript replay checks the generated vectors. Browser execution, projection and animation remain outside Lean.', [symmetry('Order of the full symmetry group', 'ConwayOrder.lean', 29), symmetry('Explicit generators', 'ConwayGenerators.lean', 21), proof('Three E₈ blocks give the Leech lattice', 'LeechThreeE8.lean', 85), proof('Unique glue label for every lattice vector', 'LeechThreeE8Cosets.lean', 118), proof('4,096 gluing labels', 'LeechThreeE8Cosets.lean', 131), proof('E₈ Gram matrix and plumbing connection', 'LeechThreeE8.lean', 42), proof('Reuse the basis and volume proof', 'LeechThreeE8.lean', 122), proof('196,560 vectors in the construction', 'LeechThreeE8.lean', 135), proof('Playground coordinate correspondence', 'LeechThreeE8.lean', 116), proof('Golay generator correspondence', 'PlaygroundGolay.lean', 182), proof('Unimodularity after rescaling', 'LeechBasis.lean', 415)]),
    pentlite: partial('The 112 + 128 enumeration matches the two finite counts in Lean. The lattice characterization, displayed rings, projection and 5D unknotting are not established by these count theorems.', [counts]),
    hopf: none('The Hopf map, stereographic projection and linking claims have no matching theorem in the reviewed project. The continuous tori here are not the finite grid of Torus.lean.'),
    bh2: partial('With the center and horizon radius fixed, tab 27 checks distance before a particle moves. At or inside 0.96 times the radius, the particle is captured. Lean proves that it stays captured. The lensing picture, spin and ringdown use separate models.', [lightCapture('Capture before moving', 342)]),
    bh3: partial('This tab checks after the ray moves. Its center is (0, 0), and the new distance must be strictly below the fixed horizon radius for capture. Lean proves that a captured ray stays there. The disk image, orbit calculation and ringdown use separate models.', [lightCapture('Capture strictly inside the edge', 351), lightCapture('A captured ray stays in place', 297)]),
    e8studio: partial('The plumbing tree has the same vertex labels as the Lean matrix, and the 112 + 128 enumeration matches its count statements. Lean proves the determinant and counts only. Hamming-to-E8 correspondence, lattice packing, the morph and the exotic-sphere topology are not proved there.', [counts, determinant]),
    e8insp: partial('For all eight simple roots, the tab’s Gram matrix is the negative of the Lean matrix after relabeling; this finite correspondence was checked externally. Lean also proves the 112 + 128 counts. Root-subset determinants, the Hamming lift, neighbor graph and boundary topology are outside these proofs.', [counts, determinant]),
    e8studio2: partial('The plumbing graph and simple-root Gram matrix match the Lean matrix after relabeling and the stated sign change. The finite correspondence was checked externally. Lean proves the determinant and 112 + 128 counts, not the Coxeter projection, morph, signature argument or exotic-sphere classification.', [counts, determinant]),
    'unit-distances': partial('The centered direction coordinates fit the cycle inequality. The cosine equality theorem is general: it does not prove the tab’s claim that only four-direction grid rings attain equality. Grid pair counts and floating-point calculations are also outside these proofs.', [cycle, equality]),
    cipher: partial('The roughness bound applies to centered, nonconstant real windows with n ≥ 3. Flat windows have an undefined ratio. Solver convergence, the stall threshold, intended plaintext and generated key certificates are outside this library’s cycle proofs.', [cycle, equality]),
    'more-materials': partial('On the grid, a Super Black Grain keeps its material and stays at or below its starting row. Its color channels are at most 17 out of 255. A grain of another material can have up to four Super Black Grain neighbors. Each reduces its color multiplier by 0.18, down to 0.28 before rounding. Lean also studies repeated light bounces with a chosen reflected share capped at 0.00035. The page draws colors directly. The ferrofluid smoothing link covers one ring step with t = 1/4. The other six materials have no proof link here.', [lightCapture('Grain motion across frames', 238), lightCapture('Color channel bound', 152), lightCapture('Neighbor shading bounds', 157), lightCapture('Light left after each bounce', 87), lightCapture('Absorbed and remaining light', 106), decay]),
    'feathers-bricks': { status: 'Not yet reviewed', note: 'No proof links have been registered for this newly added tab. This crossing update preserves its source and does not audit its physics.', links: [] }
  };
  const data = { revision, addedRevision, symmetryRevision, lightCaptureRevision, ramanujanRevision, crossingRevision, pages };
  // Also used by the source-comparison script, without starting a browser.
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  if (typeof document === 'undefined') return;

  const panel = document.getElementById('proof-notes');
  const title = document.getElementById('proof-title');
  const status = document.getElementById('proof-status');
  const note = document.getElementById('proof-note');
  const links = document.getElementById('proof-links');
  const record = document.getElementById('proof-record');
  const buttons = [...document.querySelectorAll('.tabs .tab[data-mode]')];
  function render(button) {
    const key = button.dataset.mode, page = pages[key];
    title.textContent = button.textContent.trim();
    status.textContent = page ? page.status : 'Not reviewed';
    note.textContent = page ? page.note : 'This tab was added after the recorded review.';
    links.replaceChildren();
    for (const item of page ? page.links : []) {
      const li = document.createElement('li'), a = document.createElement('a');
      a.textContent = item.label + ' ↗'; a.href = item.href;
      a.target = '_blank'; a.rel = 'noopener';
      a.setAttribute('aria-label', item.label + ' (opens in a new tab)');
      li.append(a); links.append(li);
    }
    record.href = 'https://github.com/NousVolition/sparkle-sand-playground/blob/main/docs/lean-coverage.md#' + key;
  }
  buttons.forEach(button => button.addEventListener('click', () => render(button)));
  const active = buttons.find(button => button.classList.contains('active')) || buttons[0];
  if (active) render(active);
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && panel.open) { panel.open = false; panel.querySelector('summary').focus(); } });
  document.addEventListener('pointerdown', event => { if (!panel.contains(event.target)) panel.open = false; });
})();
