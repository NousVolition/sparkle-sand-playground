// Proof notes for the active playground. Mathematical scope, not a browser certificate.
(function () {
  'use strict';
  const revision = '9c7a22abd740c3e614a7e585511c0a903e4af391';
  const base = `https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/${revision}/`;
  const proof = (label, file, line) => ({ label, href: `${base}${file}#L${line}` });
  const cycle = proof('Cycle inequality', 'Wirtinger.lean', 168);
  const equality = proof('Cosine equality case', 'Wirtinger.lean', 228);
  const decay = proof('Ring smoothing step', 'RingDecay.lean', 191);
  const counts = proof('112 + 128 = 240 count', 'E8PlumbingBridge.lean', 188);
  const determinant = proof('E8 matrix determinant', 'E8PlumbingBridge.lean', 79);
  const none = note => ({ status: 'No matching proof in this library', note, links: [] });
  const partial = (note, links) => ({ status: 'Some results proved; limits below', note, links });
  const related = (note, links) => ({ status: 'Related theorem; limited match', note, links });
  const pages = {
    sand: none('The grain movement, collisions, tools and settling rules are not formalized in the reviewed Lean project.'),
    loop: none('These are driven particle orbits with cursor forces. A ring-shaped picture does not make this the nearest-neighbor heat flow proved in RingDecay.'),
    bubbles: none('Bubble merging, dragging and surface-tension rules are not covered by the gap inequalities.'),
    plate: none('The plate draws prescribed standing-wave fields and moves grains toward their nodes. No matching plate equation or particle-motion proof was found.'),
    waves: none('The standing-wave patterns and grain-following rules are not the periodic grid heat step in Torus.lean.'),
    silk: none('The vector fields, particle trails and fitted settling readouts are numerical demonstrations; no matching motion proof was found.'),
    crystal: none('This uses a six-neighbor hexagonal growth model with freezing and boundary feeding. Torus.lean concerns a four-neighbor periodic square grid, so its heat theorem does not cover this tab.'),
    magnets: none('The softened magnetic field, particle updates and fitted decay readouts are not formalized in the reviewed project.'),
    stretch: none('This tab uses Fourier derivatives, dealiasing and RK4 for periodic vorticity, with an optional Boussinesq temperature field. Torus.lean proves a nearest-neighbor heat step, not this nonlinear spectral solver or its production/dissipation diagnostics.'),
    ferro: related('Only the isolated radius-smoothing pass matches RingDecay: t = subAlpha / 2 must be at most 1/4. This covers surface tension up to 0.875; the 0.88 and 0.90 slider settings exceed that theorem’s bound. Magnetic forces, area rescaling, swirl motion and the measured decay rate are outside the proof.', [decay]),
    sum: none('The regularized −1/12 limit, alternating-series bridge and Casimir interpretation are not proved in this project. −1/12 is not the ordinary sum of the positive integers.'),
    ringsum: related('The first bar has height 2 sin(π/n); its square is the proved cycle gap. This does not prove the sum of all bars, the −1/12 limit or the Casimir model.', [cycle, proof('Gap = 4 sin²(π/n)', 'RingDecay.lean', 41)]),
    zeros: none('The zero-spacing and quantum-drum pictures are illustrations. The earlier “99.4%” badge was fixed text, not a computed fit. No Riemann-hypothesis, GUE-statistics or drum-spectrum theorem is proved here.'),
    pendulum: related('The centered displacement on the closed ring has the cycle energy bound; the open line has the general path bound. The tab evolves a damped second-order oscillator, not heat flow. Its motion, damping and recurrence times are outside these proofs.', [cycle, proof('General path inequality', 'Poincare.lean', 69)]),
    trilogy: partial('Lean proves the six-point path gap and rounding, cycle gap, cube gap and maximum internal-edge count. The cycle update also matches RingDecay with t = 0.004 × speed (0.004 to 0.04). The real-number theorems do not certify floating-point trajectories.', [proof('Six-point path gap', 'PathSix.lean', 70), cycle, proof('Cube gap', 'CubeCheeger.lean', 179), proof('Cube internal-edge maximum', 'EdgeOptimal.lean', 230), decay]),
    blackhole: none('The light paths, orbital pictures and ringdown model have no matching general-relativity theorem in this Lean project.'),
    ocean: none('The prescribed ocean field, presets and anomaly readouts are outside these proofs. Subtracting a background is not a proof that this field obeys the heat equation.'),
    fourd: none('The complex-root surfaces, Clifford torus and 24-cell have no matching theorem here. Torus.lean proves a finite grid inequality, not the topology of a continuous torus.'),
    polychora: none('The polytope vertex constructions, face counts and projections are not covered by the planar polygon isoperimetric theorem.'),
    fireflies: none('The prescribed Faraday-wave pictures and moving-neighbor Kuramoto swarm are outside the linear cycle and grid heat proofs.'),
    horned: none('The horned-sphere, cork-twist and handle pictures are not formalized here. E8PlumbingBridge proves matrix arithmetic, not these topology claims.'),
    nonorient: none('The Möbius, Klein-bottle and projective-plane parametrizations and embedding claims have no matching theorem in this project.'),
    penteract: partial('The E8 mode uses the 112 integer and 128 even-parity sign patterns counted in Lean. Its simple-root Gram matrix matches the negative of the Lean matrix after relabeling. That correspondence was checked externally. E6, 5D unknotting, edge counts and projections remain outside the linked proofs.', [counts, determinant]),
    leech: partial('Lean proves the Golay generator correspondence, lattice membership, minimum squared length 32, classification and 196,560 count. It now also proves that three orthogonal scaled E₈ blocks with twelve glue vectors give the same infinite lattice, with 4,096 distinct binary glue cosets. The construction reuses the existing basis, determinant 8^12 and evenness proofs. The integer JavaScript replay is separate evidence; browser execution, projection, animation and the symmetry group remain outside Lean.', [proof('Three E₈ blocks give the Leech lattice', 'LeechThreeE8.lean', 85), proof('Unique glue label for every lattice vector', 'LeechThreeE8Cosets.lean', 118), proof('4,096 gluing labels', 'LeechThreeE8Cosets.lean', 131), proof('E₈ Gram matrix and plumbing connection', 'LeechThreeE8.lean', 42), proof('Reuse the basis and volume proof', 'LeechThreeE8.lean', 122), proof('196,560 vectors in the construction', 'LeechThreeE8.lean', 135), proof('Playground coordinate correspondence', 'LeechThreeE8.lean', 116), proof('Golay generator correspondence', 'PlaygroundGolay.lean', 182), proof('Unimodularity after rescaling', 'LeechBasis.lean', 415)]),
    pentlite: partial('The 112 + 128 enumeration matches the two finite counts in Lean. The lattice characterization, displayed rings, projection and 5D unknotting are not established by these count theorems.', [counts]),
    hopf: none('The Hopf map, stereographic projection and linking claims have no matching theorem in the reviewed project. The continuous tori here are not the finite grid of Torus.lean.'),
    bh2: none('The lensing, spinning-grid picture and ringdown model have no matching general-relativity theorem in this Lean project.'),
    bh3: none('The ray integrator, disk model and fitted ringdown parameters are not certified by this project’s gap or heat-flow proofs.'),
    e8studio: partial('The plumbing tree has the same vertex labels as the Lean matrix, and the 112 + 128 enumeration matches its count statements. Lean proves the determinant and counts only. Hamming-to-E8 correspondence, lattice packing, the morph and the exotic-sphere topology are not proved there.', [counts, determinant]),
    e8insp: partial('For all eight simple roots, the tab’s Gram matrix is the negative of the Lean matrix after relabeling; this finite correspondence was checked externally. Lean also proves the 112 + 128 counts. Root-subset determinants, the Hamming lift, neighbor graph and boundary topology are outside these proofs.', [counts, determinant]),
    e8studio2: partial('The plumbing graph and simple-root Gram matrix match the Lean matrix after relabeling and the stated sign change. The finite correspondence was checked externally. Lean proves the determinant and 112 + 128 counts, not the Coxeter projection, morph, signature argument or exotic-sphere classification.', [counts, determinant]),
    'unit-distances': partial('The centered direction coordinates fit the cycle inequality. The cosine equality theorem is general: it does not prove the tab’s claim that only four-direction grid rings attain equality. Grid pair counts and floating-point calculations are also outside these proofs.', [cycle, equality]),
    cipher: partial('The roughness bound applies to centered, nonconstant real windows with n ≥ 3. Flat windows have an undefined ratio. Solver convergence, the stall threshold, intended plaintext and generated key certificates are outside this library’s cycle proofs.', [cycle, equality])
  };
  const data = { revision, pages };
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
