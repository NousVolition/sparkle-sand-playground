# Playground tabs and Lean proofs

All 33 tabs were compared with the definitions and theorem statements in [discrete-gap-inequalities-lean at c881c38](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/README.md). This is a review of that project, not a search of every Lean library or a proof of the playground as a whole. The starting playground revision was [7914e9d](https://github.com/NousVolition/sparkle-sand-playground/commit/7914e9dd7677e3f801c7ac9e7cdbf23e6be81468).

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

```sh
git clone https://github.com/NousVolition/discrete-gap-inequalities-lean.git ../discrete-gap-inequalities-lean
git -C ../discrete-gap-inequalities-lean checkout c881c38ed38e582eca656752f660526b25ba7307
node scripts/check-proof-coverage.cjs ../discrete-gap-inequalities-lean
node scripts/check-proof-notes-ui.cjs
```

The comparison uses Node's standard libraries, does not start a browser or solver trajectory, and prints JSON. An optional second argument selects a downloaded index.html. Rebuild Lean separately with lake build and run the axiom checker as specified by that repository's workflow. The recorded successful Lean run is linked above; this review did not repeat the full Lean build locally.

The proof-menu check exercises all 33 selections, safe external links, an unknown-tab fallback and closing behavior with DOM stand-ins. It is not a rendered browser test. Regenerate the record after changing a note with node scripts/write-proof-coverage.cjs.

## Tab-by-tab comparison

<a id="sand"></a>

### 1. Sand

**No matching proof in this library.** The grain movement, collisions, tools and settling rules are not formalized in the reviewed Lean project.

No proof link added.

<a id="loop"></a>

### 2. Loop

**No matching proof in this library.** These are driven particle orbits with cursor forces. A ring-shaped picture does not make this the nearest-neighbor heat flow proved in RingDecay.

No proof link added.

<a id="bubbles"></a>

### 3. Bubbles

**No matching proof in this library.** Bubble merging, dragging and surface-tension rules are not covered by the gap inequalities.

No proof link added.

<a id="plate"></a>

### 4. Plate

**No matching proof in this library.** The plate draws prescribed standing-wave fields and moves grains toward their nodes. No matching plate equation or particle-motion proof was found.

No proof link added.

<a id="waves"></a>

### 5. Waves

**No matching proof in this library.** The standing-wave patterns and grain-following rules are not the periodic grid heat step in Torus.lean.

No proof link added.

<a id="silk"></a>

### 6. Silk

**No matching proof in this library.** The vector fields, particle trails and fitted settling readouts are numerical demonstrations; no matching motion proof was found.

No proof link added.

<a id="crystal"></a>

### 7. Crystal

**No matching proof in this library.** This uses a six-neighbor hexagonal growth model with freezing and boundary feeding. Torus.lean concerns a four-neighbor periodic square grid, so its heat theorem does not cover this tab.

No proof link added.

<a id="magnets"></a>

### 8. Magnets

**No matching proof in this library.** The softened magnetic field, particle updates and fitted decay readouts are not formalized in the reviewed project.

No proof link added.

<a id="stretch"></a>

### 9. Stretch

**No matching proof in this library.** This tab uses Fourier derivatives, dealiasing and RK4 for periodic vorticity, with an optional Boussinesq temperature field. Torus.lean proves a nearest-neighbor heat step, not this nonlinear spectral solver or its production/dissipation diagnostics.

No proof link added.

<a id="ferro"></a>

### 10. Ferro

**Related theorem; limited match.** Only the isolated radius-smoothing pass matches RingDecay: t = subAlpha / 2 must be at most 1/4. This covers surface tension up to 0.875; the 0.88 and 0.90 slider settings exceed that theorem’s bound. Magnetic forces, area rescaling, swirl motion and the measured decay rate are outside the proof.

[Ring smoothing step](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/RingDecay.lean#L191)

<a id="sum"></a>

### 11. −1/12

**No matching proof in this library.** The regularized −1/12 limit, alternating-series bridge and Casimir interpretation are not proved in this project. −1/12 is not the ordinary sum of the positive integers.

No proof link added.

<a id="ringsum"></a>

### 12. Ring

**Related theorem; limited match.** The first bar has height 2 sin(π/n); its square is the proved cycle gap. This does not prove the sum of all bars, the −1/12 limit or the Casimir model.

[Cycle inequality](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/Wirtinger.lean#L168) · [Gap = 4 sin²(π/n)](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/RingDecay.lean#L41)

<a id="zeros"></a>

### 13. Zeros

**No matching proof in this library.** The zero-spacing and quantum-drum pictures are illustrations. The earlier “99.4%” badge was fixed text, not a computed fit. No Riemann-hypothesis, GUE-statistics or drum-spectrum theorem is proved here.

No proof link added.

<a id="pendulum"></a>

### 14. Pendulum

**Related theorem; limited match.** The centered displacement on the closed ring has the cycle energy bound; the open line has the general path bound. The tab evolves a damped second-order oscillator, not heat flow. Its motion, damping and recurrence times are outside these proofs.

[Cycle inequality](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/Wirtinger.lean#L168) · [General path inequality](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/Poincare.lean#L69)

<a id="trilogy"></a>

### 15. Trilogy

**Some results proved; limits below.** Lean proves the six-point path gap and rounding, cycle gap, cube gap and maximum internal-edge count. The cycle update also matches RingDecay with t = 0.004 × speed (0.004 to 0.04). The real-number theorems do not certify floating-point trajectories.

[Six-point path gap](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/PathSix.lean#L70) · [Cycle inequality](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/Wirtinger.lean#L168) · [Cube gap](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/CubeCheeger.lean#L179) · [Cube internal-edge maximum](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/EdgeOptimal.lean#L230) · [Ring smoothing step](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/RingDecay.lean#L191)

<a id="blackhole"></a>

### 16. Black Hole

**No matching proof in this library.** The light paths, orbital pictures and ringdown model have no matching general-relativity theorem in this Lean project.

No proof link added.

<a id="ocean"></a>

### 17. Ocean

**No matching proof in this library.** The prescribed ocean field, presets and anomaly readouts are outside these proofs. Subtracting a background is not a proof that this field obeys the heat equation.

No proof link added.

<a id="fourd"></a>

### 18. 4D

**No matching proof in this library.** The complex-root surfaces, Clifford torus and 24-cell have no matching theorem here. Torus.lean proves a finite grid inequality, not the topology of a continuous torus.

No proof link added.

<a id="polychora"></a>

### 19. Polychora

**No matching proof in this library.** The polytope vertex constructions, face counts and projections are not covered by the planar polygon isoperimetric theorem.

No proof link added.

<a id="fireflies"></a>

### 20. Fireflies

**No matching proof in this library.** The prescribed Faraday-wave pictures and moving-neighbor Kuramoto swarm are outside the linear cycle and grid heat proofs.

No proof link added.

<a id="horned"></a>

### 21. Horned

**No matching proof in this library.** The horned-sphere, cork-twist and handle pictures are not formalized here. E8PlumbingBridge proves matrix arithmetic, not these topology claims.

No proof link added.

<a id="nonorient"></a>

### 22. Non-Orientable

**No matching proof in this library.** The Möbius, Klein-bottle and projective-plane parametrizations and embedding claims have no matching theorem in this project.

No proof link added.

<a id="penteract"></a>

### 23. 5D / E₈

**Some results proved; limits below.** The E8 mode uses the 112 integer and 128 even-parity sign patterns counted in Lean. Its simple-root Gram matrix matches the negative of the Lean matrix after relabeling. That correspondence was checked externally. E6, 5D unknotting, edge counts and projections remain outside the linked proofs.

[112 + 128 = 240 count](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/E8PlumbingBridge.lean#L188) · [E8 matrix determinant](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/E8PlumbingBridge.lean#L79)

<a id="leech"></a>

### 24. Leech

**Some results proved; limits below.** Lean checks 1,104 + 97,152 + 98,304 = 196,560 using a hand-entered Golay weight table. It does not derive that table from this tab’s modulo-23 generator or prove the Leech lattice construction. The separately proved modulo-11 Golay generator differs; their coordinate correspondence remains unproved.

[Leech count arithmetic](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/GolayLeechBridge.lean#L78) · [Related Golay weight proof — different generator](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/GolayMatrixDistance.lean#L140)

<a id="pentlite"></a>

### 25. 5D Lite

**Some results proved; limits below.** The 112 + 128 enumeration matches the two finite counts in Lean. The lattice characterization, displayed rings, projection and 5D unknotting are not established by these count theorems.

[112 + 128 = 240 count](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/E8PlumbingBridge.lean#L188)

<a id="hopf"></a>

### 26. Hopf

**No matching proof in this library.** The Hopf map, stereographic projection and linking claims have no matching theorem in the reviewed project. The continuous tori here are not the finite grid of Torus.lean.

No proof link added.

<a id="bh2"></a>

### 27. Black Hole B

**No matching proof in this library.** The lensing, spinning-grid picture and ringdown model have no matching general-relativity theorem in this Lean project.

No proof link added.

<a id="bh3"></a>

### 28. Black Hole C (Disk) v2

**No matching proof in this library.** The ray integrator, disk model and fitted ringdown parameters are not certified by this project’s gap or heat-flow proofs.

No proof link added.

<a id="e8studio"></a>

### 29. E₈ → Milnor

**Some results proved; limits below.** The plumbing tree has the same vertex labels as the Lean matrix, and the 112 + 128 enumeration matches its count statements. Lean proves the determinant and counts only. Hamming-to-E8 correspondence, lattice packing, the morph and the exotic-sphere topology are not proved there.

[112 + 128 = 240 count](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/E8PlumbingBridge.lean#L188) · [E8 matrix determinant](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/E8PlumbingBridge.lean#L79)

<a id="e8insp"></a>

### 30. E₈ Inspector

**Some results proved; limits below.** For all eight simple roots, the tab’s Gram matrix is the negative of the Lean matrix after relabeling; this finite correspondence was checked externally. Lean also proves the 112 + 128 counts. Root-subset determinants, the Hamming lift, neighbor graph and boundary topology are outside these proofs.

[112 + 128 = 240 count](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/E8PlumbingBridge.lean#L188) · [E8 matrix determinant](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/E8PlumbingBridge.lean#L79)

<a id="e8studio2"></a>

### 31. E₈ → Milnor v2

**Some results proved; limits below.** The plumbing graph and simple-root Gram matrix match the Lean matrix after relabeling and the stated sign change. The finite correspondence was checked externally. Lean proves the determinant and 112 + 128 counts, not the Coxeter projection, morph, signature argument or exotic-sphere classification.

[112 + 128 = 240 count](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/E8PlumbingBridge.lean#L188) · [E8 matrix determinant](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/E8PlumbingBridge.lean#L79)

<a id="unit-distances"></a>

### 32. Unit Distances

**Some results proved; limits below.** The centered direction coordinates fit the cycle inequality. The cosine equality theorem is general: it does not prove the tab’s claim that only four-direction grid rings attain equality. Grid pair counts and floating-point calculations are also outside these proofs.

[Cycle inequality](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/Wirtinger.lean#L168) · [Cosine equality case](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/Wirtinger.lean#L228)

<a id="cipher"></a>

### 33. Cipher Inspector

**Some results proved; limits below.** The roughness bound applies to centered, nonconstant real windows with n ≥ 3. Flat windows have an undefined ratio. Solver convergence, the stall threshold, intended plaintext and generated key certificates are outside this library’s cycle proofs.

[Cycle inequality](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/Wirtinger.lean#L168) · [Cosine equality case](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c881c38ed38e582eca656752f660526b25ba7307/Wirtinger.lean#L228)
