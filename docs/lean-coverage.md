# Playground tabs and Lean proofs

The table covers all 35 tabs. The original review compared the playground with [discrete-gap-inequalities-lean at 8d52096](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/README.md). This is a review of that project, not a search of every Lean library or a proof of the playground as a whole. The starting playground revision was [7914e9d](https://github.com/NousVolition/sparkle-sand-playground/commit/7914e9dd7677e3f801c7ac9e7cdbf23e6be81468).

17 tabs have matching mathematical results with limits. 2 have a related theorem for part of their calculation, 1 has a related result only, and 14 have no matching proof in this library. 1 newly added tab has not yet been reviewed. Links added after GapWaveTail.lean landed are pinned to [53ecf1d](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/53ecf1d4dc11a97871c9512b58020d926a85304c/GapWaveTail.lean). The “Lean proofs” menu follows the selected tab. A missing proof here does not mean a mathematical claim is false.

The Ramanujan space proofs are pinned to [the merged addition](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/4a1e2f0798c5186e8cbb118a7d57b6a84f5c2f8d/RamanujanGap.lean). Its full [build and axiom audit](https://github.com/NousVolition/discrete-gap-inequalities-lean/actions/runs/44839441230) passed with 1,058 audited declarations. The [gap experiment](zeros-gap-experiment.md) records the separate numerical checks and their limits.

The fixed-height crossing view links to [the merged conditional Lean rule](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/394543d34125c52b41813ee2917158f2058808ae/GapCrossing.lean). Its [full build and axiom audit](https://github.com/NousVolition/discrete-gap-inequalities-lean/actions/runs/44845361754) passed with 1,074 declarations. The exact zero and monotonicity hypotheses have not been certified for the browser curve. See the [separate numerical crossing checks](zeros-gap-crossing-check.json).

## What was checked

The cited Lean revision includes the [three-E₈ construction](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/docs/three-e8.md), the [Golay correspondence](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/docs/playground-golay.md) and the existing [basis and volume proof](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/LeechBasis.lean) from commit 14518ce. The complete local axiom audit passes with 743 declarations, 0 nonstandard and 0 missing; see the [verification record](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/docs/three-e8-verification.json) for compilation and artifact reuse. The [GitHub build for the new proof](https://github.com/NousVolition/discrete-gap-inequalities-lean/actions/runs/44653527254) records the separate CI result. The audit accepts only propext, Classical.choice and Quot.sound. The later [comment wording check](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/docs/lean-comment-verification-2026-11-20.json) compares all 49 Lean files and confirms that no formal code changed. Its [source-hash record](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/docs/three-e8-verification-2026-11-20-comments.json) identifies the reused audit. The previous 711-, 682- and 559-declaration audits remain historical evidence.

The [light bounce and capture proofs](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/cb7c8ef9fb7153b01fcfbec3d78b736fcd95f72d/LightBounceAndCapture.lean) cover Super Black Grain on tab 34 and the capture rules at a fixed horizon on tabs 16, 27 and 28. The light model uses 0.00035 as its chosen upper bound on the reflected share. The [GitHub build and full axiom audit](https://github.com/NousVolition/discrete-gap-inequalities-lean/actions/runs/44715071656/job/136216245803) passed with 1,009 declarations, 0 nonstandard and 0 missing.

The source comparison reads the actual JavaScript enumerations, smoothing code and simple-root arrays and checks them against the cited Lean definitions. The [saved results](lean-coverage-check.json) record the source hashes, theorem lines, selectors and numerical tolerances. Those checks are external computations. The Leech code correspondence has a separate Lean proof for the formal recipe; JavaScript semantics and floating-point execution are not formalized. The remaining tabs were reviewed by their displayed claims, source models and the proof library's module scopes. They were not all numerically simulated. The Leech update starts from playground revision [692e5ad](https://github.com/NousVolition/sparkle-sand-playground/commit/692e5ad30d767984704ff7d79cedcc57e9374603), preserving the later Ocean replacement.

- **E₈ counts.** All five E₈ tabs enumerate the same 240 vectors, with 112 integer patterns and 128 even-parity half-integer patterns. For the Inspector’s Hamming recipe, Lean proves that the 16 codewords with eight choices each give exactly the 128 vectors with coordinates ±½ and an even number of minus signs. [Hamming recipe and proof](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/HammingCode.lean#L147-L175).
- **E₈ matrices.** The first Milnor tab’s tree uses Lean’s numbering. In 5D / E₈, E₈ Inspector and Milnor v2, external checks match the JavaScript Gram matrices to the negative plumbing matrix under the permutation [0,1,2,3,4,7,5,6]. For the Inspector’s eight rational roots, Lean proves all 64 entries and the full determinant 1. The Inspector’s exact-arithmetic check compares the JavaScript determinant for all 256 root selections. The Inspector cites the topology of the boundary separately. [Gram and determinant proofs](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/E8Tab30Bridge.lean#L38-L68) · [Exact subset checks](e8-inspector-check.json).
- **Leech:** Lean proves the correspondence between the modulo-23 recipe and the modulo-11 code, and transfers membership, minimum squared length 32, the three-shape classification and the 196,560 count. The new three-E₈ construction has three orthogonal scaled E₈ blocks and twelve glue vectors. Lean proves equality with the whole existing lattice and 4,096 distinct binary gluing cosets. It reuses the basis determinant 8^12 and evenness results; LeechBasis also gives unimodularity after rescaling. The source replay checks all 196,560 generated vectors, their glue labels and their integer decompositions. The measured coset-size and component-energy distributions are external checks, not additional Lean theorems. For the Leech lattice with the origin fixed, the full symmetry group has order 8,315,553,613,086,720,000, with explicit generators, proved in Lean. JavaScript execution and screen projection remain outside the proofs. See [construction evidence](three-e8-check.json) and [interaction checks](three-e8-ui-check.json).
- **Ferro:** each isolated smoothing pass has the RingDecay form with t = (1 − (1 − s)^(1/3))/2, where s is the surface-tension setting. The theorem requires t ≤ 1/4, hence s ≤ 7/8. Of the 45 slider settings, 43 meet that restriction; 0.88 and 0.90 do not. All 45 were compared with the step formula. This says nothing about failure at those two settings; they are outside this theorem's hypotheses. Magnetic forcing, constant-area rescaling and the measured swirl-decay rate are separate.
- **Ring and Pendulum:** Ring's first frequency squared agrees with the cycle gap. RingSumMinusTwelfth now also proves the finite bar sum and normalized leftover limit. Pendulum's neighbor forces match a path or cycle coupling term, but it evolves a damped second-order system, not the heat step.
- **Zeros:** “GUE Match: 99.4%” was fixed markup, with no computed fit behind that badge. It now reads “GUE-like illustration.” The tab's drum bars are drawn from the stored Riemann zeros rather than obtained by solving a drum eigenvalue problem. These are illustrations, not a Lean proof of their correspondence. The separate Gap → Zeta experiment computes values and locates a zero without that stored list; its complex extension is not yet formalized.
- **Other tempting matches:** a drawn torus is not the finite periodic grid of Torus.lean; Crystal uses six neighbors and freezing; Stretch uses a nonlinear Fourier/RK4 vorticity solver, now with a partial match in GapWaveTail.lean (the feed formula and tail, not the measured +0.75 rate, the dP/dt budget, or Hot/Cold); a polychoron is not the planar polygon inequality. E8CostMirror's quadratic cost/flip identity has no matching displayed quantity in the E8 tabs, so it has no proof link there.

**Tab 30 — OLD IN THE PROJECT.** The merged proof revision has a [saved verification record](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/docs/three-e8-verification-2026-11-21-e8-wirtinger-integration.json), a [1,165-declaration axiom transcript](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/docs/axioms-2026-11-21-e8-wirtinger-integration.txt) and a [successful full build](https://github.com/NousVolition/discrete-gap-inequalities-lean/actions/runs/44885643672). These records belong to that pinned revision; later library additions do not change their recorded scope. The comparison of the web page's arrays with the formal data is an external file check, not a Lean proof of the web page. The existing [exact-arithmetic record](e8-inspector-check.json) and [browser record](e8-inspector-ui-check.json) remain historical checks of their recorded sources; they are not presented as new tests of this link update.

**E₈ link review — OLD IN THE PROJECT.** Tabs 13, 23, 25, 29 and 31 now also link the existing merged E₈ proof revision and its saved verification records. The 1,165-declaration audit belongs to that pinned revision, not to later library additions. Tab 13’s lattice proofs are separate from the full theta-series identity and the numerical zero search. The Hamming recipe proved for Tab 30 is not presented as a proof of Tab 29’s differently written Hamming highlighting. The saved page-source comparisons remain external evidence; no new lattice proof or numerical experiment is claimed here.

## Reproduce

Use this playground checkout and a separate checkout of the pinned proof revision:

```sh
git clone https://github.com/NousVolition/discrete-gap-inequalities-lean.git ../discrete-gap-inequalities-lean
git -C ../discrete-gap-inequalities-lean checkout 8d520965e87e391ae4ce31bb5ee398733e8781bf
node scripts/check-proof-coverage.cjs ../discrete-gap-inequalities-lean
node scripts/check-proof-notes-ui.cjs
```

The comparison uses Node's standard libraries, does not start a browser or solver trajectory, and prints JSON. An optional second argument selects a downloaded index.html. Rebuild Lean separately with lake build and run the axiom checker as specified by that repository's workflow. The three-E₈ update adds 32 Lean theorems and reuses the existing volume proof. Run node ../discrete-gap-inequalities-lean/scripts/check_three_e8.cjs . for the integer construction replay, and node tests/leech-three-e8.cjs for the interaction checks with DOM/canvas stand-ins. The attempted visual preview was stopped by the computer-use tool because it could not verify the local browser address; that attempt is not claimed as a completed visual review. The proof repository's node scripts/check_playground_golay.cjs also replays its archived Leech source without needing a playground checkout.

The proof-menu check exercises all 35 selections, safe external links, an unknown-tab fallback and closing behavior with DOM stand-ins. It is not a rendered browser test. Regenerate the record after changing a note with node scripts/write-proof-coverage.cjs.

## Tab-by-tab comparison

<a id="sand"></a>

### 1. Sand

**No matching proof in this library.** The grain movement, collisions, tools and settling rules are not formalized in the reviewed Lean project.

No proof link added.

<a id="loop"></a>

### 2. Loop

**Related, not a proof of this tab.** These are driven particle orbits with cursor forces. A ring-shaped picture does not make this the nearest-neighbor heat flow proved in RingDecay. Related results, not a proof of this tab: “With any steady positive input, it passes every bound,” and a store that holds the past stays finite exactly when it has a gap.

[With any steady positive input, it passes every bound](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/53ecf1d4dc11a97871c9512b58020d926a85304c/Gap.lean#L48) · [A store that holds the past stays finite exactly when it has a gap](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/53ecf1d4dc11a97871c9512b58020d926a85304c/Gap.lean#L98)

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

**Some results proved; limits below.** This tab uses Fourier derivatives, dealiasing and RK4 for periodic vorticity, with an optional Boussinesq temperature field. Lean proves “How two waves push on each other,” the rate one pair of waves feeds the difference and sum waves (zero exactly when the stripes are straight), that one wave alone solves the fluid equation, the gap wave’s tail, and “No feed, no broad wave.” The tab’s measured +0.75 starting rate, its dP/dt budget, and Hot/Cold are measured or coded in the tab, not proved; Lean proves the feed formula, not the constant 0.75. Torus.lean proves a nearest-neighbor heat step, not this nonlinear spectral solver as a whole.

[How two waves push on each other](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/53ecf1d4dc11a97871c9512b58020d926a85304c/GapWaveTail.lean#L102) · [The push, written as what it feeds: the difference wave and the sum wave](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/53ecf1d4dc11a97871c9512b58020d926a85304c/GapWaveTail.lean#L134) · [The tested stripes: two and three crests across, m crests up](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/53ecf1d4dc11a97871c9512b58020d926a85304c/GapWaveTail.lean#L162) · [One wave alone solves the full fluid equation](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/53ecf1d4dc11a97871c9512b58020d926a85304c/GapWaveTail.lean#L227) · [The gap wave’s tail](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/53ecf1d4dc11a97871c9512b58020d926a85304c/GapWaveTail.lean#L246) · [No feed, no broad wave](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/53ecf1d4dc11a97871c9512b58020d926a85304c/GapWaveTail.lean#L275) · [Straight stripes have zero feed and hence zero broad-wave forecast](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/53ecf1d4dc11a97871c9512b58020d926a85304c/GapWaveTail.lean#L334)

<a id="ferro"></a>

### 10. Ferro

**Related theorem; limited match.** Only the isolated radius-smoothing pass matches RingDecay: t = subAlpha / 2 must be at most 1/4. This covers surface tension up to 0.875; the 0.88 and 0.90 slider settings exceed that theorem’s bound. Magnetic forces, area rescaling, swirl motion and the measured decay rate are outside the proof.

[Ring smoothing step](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/RingDecay.lean#L191)

<a id="sum"></a>

### 11. −1/12

**Some results proved; limits below.** Lean proves the softened bar sum, the smooth area, the space’s limit −1/12, and the shortcut L(ε) − 4L(2ε) = exp(−ε)/(1 + exp(−ε))². The areas cancel exactly; the alternating sum tends to 1/4. The final theorem identifies the limit with zeta at −1. Canvas rendering and floating-point readouts have separate numerical checks.

[The signed space has a finite limit](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/4a1e2f0798c5186e8cbb118a7d57b6a84f5c2f8d/RingSumMinusTwelfth.lean#L360) · [The smooth area](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/4a1e2f0798c5186e8cbb118a7d57b6a84f5c2f8d/RamanujanGap.lean#L25) · [The areas cancel](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/4a1e2f0798c5186e8cbb118a7d57b6a84f5c2f8d/RamanujanGap.lean#L39) · [The shortcut on the spaces](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/4a1e2f0798c5186e8cbb118a7d57b6a84f5c2f8d/RamanujanGap.lean#L45) · [The alternating series sums to the same value](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/4a1e2f0798c5186e8cbb118a7d57b6a84f5c2f8d/RamanujanGap.lean#L69) · [The alternating limit is 1/4](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/4a1e2f0798c5186e8cbb118a7d57b6a84f5c2f8d/RamanujanGap.lean#L78) · [The limit agrees with zeta at −1](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/4a1e2f0798c5186e8cbb118a7d57b6a84f5c2f8d/RamanujanGap.lean#L113)

<a id="ringsum"></a>

### 12. Ring

**Some results proved; limits below.** Lean proves the finite sum of the ring bars, their relation to the square roots of the heat eigenvalues, and the normalized leftover’s limit −1/12. This updates proof coverage only; tab 12 itself is unchanged. The Casimir illustration and browser execution remain outside the proof.

[Ring bars sum to twice the cotangent](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/4a1e2f0798c5186e8cbb118a7d57b6a84f5c2f8d/RingSumMinusTwelfth.lean#L46) · [Ring leftover tends to −1/12](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/4a1e2f0798c5186e8cbb118a7d57b6a84f5c2f8d/RingSumMinusTwelfth.lean#L194) · [Each bar is the square root of its eigenvalue](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/4a1e2f0798c5186e8cbb118a7d57b6a84f5c2f8d/RingSumMinusTwelfth.lean#L387)

<a id="zeros"></a>

### 13. Zeros

**Some results proved; limits below.** The fixed-height pass shows gap size and real part on both sides of a numerical zero, keeping height and softening fixed. Lean proves a conditional crossing rule: given an exact zero and strict real-part monotonicity, opposite sides have opposite real signs and positive sizes. It also proves that real-part sign change alone does not imply a complex zero. Those hypotheses are not certified for this numerical gap. Lean covers the real starting case at s = −1, but not the complex extension, numerical root search or RH. The Critical Line Tightrope is a numerical illustration. It computes its rotating bands and fixed σ = ½ crossings from the extrapolated gap. The spacing, drum and prime-wave illustrations use tabulated ordinates. The Golay → Leech panel has additional lattice proofs: three scaled E₈ blocks with twelve glue vectors give the same Leech lattice, and each vector has a unique label among 4,096 gluing classes. These lattice proofs do not establish the full theta-series identity or a result about zeta zeros.

[Before an exact zero](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/394543d34125c52b41813ee2917158f2058808ae/GapCrossing.lean#L26) · [Beyond an exact zero](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/394543d34125c52b41813ee2917158f2058808ae/GapCrossing.lean#L37) · [Real sign change without a complex zero](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/394543d34125c52b41813ee2917158f2058808ae/GapCrossing.lean#L49) · [Zero size iff zero reading](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/394543d34125c52b41813ee2917158f2058808ae/GapCrossing.lean#L16) · [Opposite readings have the same size](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/394543d34125c52b41813ee2917158f2058808ae/GapCrossing.lean#L19) · [The real component is bounded by the size](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/394543d34125c52b41813ee2917158f2058808ae/GapCrossing.lean#L22) · [Real gap at s = −1](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/4a1e2f0798c5186e8cbb118a7d57b6a84f5c2f8d/RamanujanGap.lean#L32) · [Its limit equals the zeta value](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/4a1e2f0798c5186e8cbb118a7d57b6a84f5c2f8d/RamanujanGap.lean#L113) · [Three E₈ blocks give the Leech lattice](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/LeechThreeE8.lean#L85) · [Unique gluing class](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/LeechThreeE8Cosets.lean#L118) · [4,096 gluing labels](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/LeechThreeE8Cosets.lean#L131) · [Minimum squared length 32 in integer coordinates](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/LeechThreeE8.lean#L110)

[Saved verification record](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/docs/three-e8-verification-2026-11-21-e8-wirtinger-integration.json) · [Full axiom transcript: 1,165 declarations](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/docs/axioms-2026-11-21-e8-wirtinger-integration.txt) · [Successful merged-main build](https://github.com/NousVolition/discrete-gap-inequalities-lean/actions/runs/44885643672)

<a id="pendulum"></a>

### 14. Pendulum

**Related theorem; limited match.** The centered displacement on the closed ring has the cycle energy bound; the open line has the general path bound. The tab evolves a damped second-order oscillator, not heat flow. Its motion, damping and recurrence times are outside these proofs.

[Cycle inequality](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/Wirtinger.lean#L168) · [General path inequality](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/Poincare.lean#L69)

<a id="trilogy"></a>

### 15. Trilogy

**Some results proved; limits below.** Lean proves the six-point path gap and rounding, cycle gap, cube gap and maximum internal-edge count. Each frame advances by T = 0.006 × speed, split into substeps dt ≤ 0.005. Each cycle substep has the RingDecay form and satisfies its 0 ≤ dt ≤ 1/4 hypothesis. Lean also proves the ring gap equals 4 sin²(π/n); for six points that gives 0, 1, 1, 3, 3, 4, with smallest positive 1. The real-number theorems do not certify floating-point trajectories.

[Six-point path gap](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/PathSix.lean#L70) · [Cycle inequality](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/Wirtinger.lean#L168) · [Cube gap](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/CubeCheeger.lean#L179) · [Cube internal-edge maximum](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/EdgeOptimal.lean#L230) · [Ring smoothing step](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/RingDecay.lean#L191) · [Ring gap = 4 sin²(π/n)](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/53ecf1d4dc11a97871c9512b58020d926a85304c/RingDecay.lean#L41)

<a id="blackhole"></a>

### 16. Black Hole

**Some results proved; limits below.** With the center and horizon radius fixed, a ray moves first. It is captured if its new distance is at most the radius, including the edge. Lean proves that a captured ray stays where it was captured. The light paths and ringdown use separate models.

[Capture at or inside the edge](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/cb7c8ef9fb7153b01fcfbec3d78b736fcd95f72d/LightBounceAndCapture.lean#L334) · [A captured ray stays in place](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/cb7c8ef9fb7153b01fcfbec3d78b736fcd95f72d/LightBounceAndCapture.lean#L297)

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

**Some results proved; limits below.** The E8 mode uses the 112 integer and 128 even-parity sign patterns counted in Lean. The saved source comparison matches this tab’s simple-root Gram matrix to the negative plumbing matrix after relabeling. E8Tab30Bridge proves the matrix identity and determinant 1 for its eight exact rational roots. The comparison with this page remains an external file check. E6, 5D unknotting, edge counts and projections remain outside these proofs.

[112 + 128 = 240 count](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/E8PlumbingBridge.lean#L212) · [E8 matrix determinant](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/E8PlumbingBridge.lean#L80) · [Exact rational Gram entries](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/E8Tab30Bridge.lean#L44) · [Rational Gram determinant](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/E8Tab30Bridge.lean#L67)

[Saved verification record](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/docs/three-e8-verification-2026-11-21-e8-wirtinger-integration.json) · [Full axiom transcript: 1,165 declarations](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/docs/axioms-2026-11-21-e8-wirtinger-integration.txt) · [Successful merged-main build](https://github.com/NousVolition/discrete-gap-inequalities-lean/actions/runs/44885643672)

<a id="leech"></a>

### 24. Leech

**Some results proved; limits below.** Lean proves the Golay generator correspondence, lattice membership, minimum squared length 32, classification and 196,560 count. It now also proves that three orthogonal scaled E₈ blocks with twelve glue vectors give the same infinite lattice, with 4,096 distinct binary glue cosets. The construction reuses the existing basis, determinant 8^12 and evenness proofs. For the Leech lattice with the origin fixed, the full symmetry group has order 8,315,553,613,086,720,000, with explicit generators, proved in Lean. The integer JavaScript replay checks the generated vectors. Browser execution, projection and animation remain outside Lean.

[Order of the full symmetry group](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/a0498c80c24b1e14925e25233afc93b235429e7b/ConwayOrder.lean#L29) · [Explicit generators](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/a0498c80c24b1e14925e25233afc93b235429e7b/ConwayGenerators.lean#L21) · [Three E₈ blocks give the Leech lattice](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/LeechThreeE8.lean#L85) · [Unique glue label for every lattice vector](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/LeechThreeE8Cosets.lean#L118) · [4,096 gluing labels](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/LeechThreeE8Cosets.lean#L131) · [E₈ Gram matrix and plumbing connection](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/LeechThreeE8.lean#L42) · [Reuse the basis and volume proof](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/LeechThreeE8.lean#L122) · [196,560 vectors in the construction](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/LeechThreeE8.lean#L135) · [Playground coordinate correspondence](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/LeechThreeE8.lean#L116) · [Golay generator correspondence](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/PlaygroundGolay.lean#L182) · [Unimodularity after rescaling](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/LeechBasis.lean#L415)

<a id="pentlite"></a>

### 25. 5D Lite

**Some results proved; limits below.** The 112 + 128 enumeration matches the two finite counts in Lean. The lattice characterization, displayed rings, projection and 5D unknotting are not established by these count theorems.

[112 + 128 = 240 count](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/E8PlumbingBridge.lean#L212)

[Saved verification record](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/docs/three-e8-verification-2026-11-21-e8-wirtinger-integration.json) · [Full axiom transcript: 1,165 declarations](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/docs/axioms-2026-11-21-e8-wirtinger-integration.txt) · [Successful merged-main build](https://github.com/NousVolition/discrete-gap-inequalities-lean/actions/runs/44885643672)

<a id="hopf"></a>

### 26. Hopf

**No matching proof in this library.** The Hopf map, stereographic projection and linking claims have no matching theorem in the reviewed project. The continuous tori here are not the finite grid of Torus.lean.

No proof link added.

<a id="bh2"></a>

### 27. Black Hole B

**Some results proved; limits below.** With the center and horizon radius fixed, tab 27 checks distance before a particle moves. At or inside 0.96 times the radius, the particle is captured. Lean proves that it stays captured. The lensing picture, spin and ringdown use separate models.

[Capture before moving](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/cb7c8ef9fb7153b01fcfbec3d78b736fcd95f72d/LightBounceAndCapture.lean#L342)

<a id="bh3"></a>

### 28. Black Hole C (Disk) v2

**Some results proved; limits below.** This tab checks after the ray moves. Its center is (0, 0), and the new distance must be strictly below the fixed horizon radius for capture. Lean proves that a captured ray stays there. The disk image, orbit calculation and ringdown use separate models.

[Capture strictly inside the edge](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/cb7c8ef9fb7153b01fcfbec3d78b736fcd95f72d/LightBounceAndCapture.lean#L351) · [A captured ray stays in place](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/cb7c8ef9fb7153b01fcfbec3d78b736fcd95f72d/LightBounceAndCapture.lean#L297)

<a id="e8studio"></a>

### 29. E₈ → Milnor

**Some results proved; limits below.** The saved source comparison covers this tab’s plumbing tree and 112 + 128 root enumeration. The linked Lean theorems prove the corresponding matrix determinant and finite counts. HammingCode.lean proves the separate recipe used in Tab 30; a correspondence to this tab’s Hamming highlighting has not been established here. Lattice packing, the morph and the exotic-sphere topology remain outside these proofs.

[112 + 128 = 240 count](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/E8PlumbingBridge.lean#L212) · [E8 matrix determinant](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/E8PlumbingBridge.lean#L80)

[Saved verification record](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/docs/three-e8-verification-2026-11-21-e8-wirtinger-integration.json) · [Full axiom transcript: 1,165 declarations](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/docs/axioms-2026-11-21-e8-wirtinger-integration.txt) · [Successful merged-main build](https://github.com/NousVolition/discrete-gap-inequalities-lean/actions/runs/44885643672)

<a id="e8insp"></a>

### 30. E₈ Inspector

**Some results proved; limits below.** The existing lattice proofs (OLD IN THE PROJECT) cover all 64 Gram entries, determinant 1 and the 128 half-integer roots from the Hamming code. External checks compare the page data, all 256 selected determinants and the neighbor graph. The connected boundary view (YOURS ALONE) links ten Lean checks of the local frontier, the seam exchange, the integral matrix, signature +8 and the order-28 invariant arithmetic. The smooth classification uses the cited topology (KNOWN TO THE WORLD).

[All 64 Gram entries](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/E8Tab30Bridge.lean#L44) · [Full Gram determinant](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/E8Tab30Bridge.lean#L67) · [128 distinct Hamming vectors](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/HammingCode.lean#L158) · [All even-parity half-integer vectors](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/HammingCode.lean#L172) · [112 + 128 = 240 count](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/E8PlumbingBridge.lean#L212)

[Ten Lean boundary checks](https://nousvolition.github.io/sparkle-sand-playground/docs/verification/tab30-plumbing-boundary.txt) · [Boundary Lean source](https://github.com/NousVolition/sparkle-sand-playground/blob/main/tests/lean/Tab30PlumbingBoundary.lean)

[Saved verification record](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/docs/three-e8-verification-2026-11-21-e8-wirtinger-integration.json) · [Full axiom transcript: 1,165 declarations](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/docs/axioms-2026-11-21-e8-wirtinger-integration.txt) · [Successful merged-main build](https://github.com/NousVolition/discrete-gap-inequalities-lean/actions/runs/44885643672)

<a id="e8studio2"></a>

### 31. E₈ → Milnor v2

**Some results proved; limits below.** The saved source comparison matches this tab’s plumbing graph and simple-root Gram matrix to the Lean matrix after relabeling and the stated sign change. E8Tab30Bridge proves the matrix identity and determinant 1 for its eight exact rational roots. The comparison with this page remains an external file check. The linked finite-count theorems do not establish the Coxeter projection, morph, signature argument or exotic-sphere classification.

[112 + 128 = 240 count](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/E8PlumbingBridge.lean#L212) · [E8 matrix determinant](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/E8PlumbingBridge.lean#L80) · [Exact rational Gram entries](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/E8Tab30Bridge.lean#L44) · [Rational Gram determinant](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/E8Tab30Bridge.lean#L67)

[Saved verification record](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/docs/three-e8-verification-2026-11-21-e8-wirtinger-integration.json) · [Full axiom transcript: 1,165 declarations](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/0b44d6896c646b64c58141d2b8d6ebc0f0f41e10/docs/axioms-2026-11-21-e8-wirtinger-integration.txt) · [Successful merged-main build](https://github.com/NousVolition/discrete-gap-inequalities-lean/actions/runs/44885643672)

<a id="unit-distances"></a>

### 32. Unit Distances

**Some results proved; limits below.** The centered direction coordinates fit the cycle inequality. The cosine equality theorem is general: it does not prove the tab’s claim that only four-direction grid rings attain equality. Grid pair counts and floating-point calculations are also outside these proofs.

[Cycle inequality](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/Wirtinger.lean#L168) · [Cosine equality case](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/Wirtinger.lean#L228)

<a id="cipher"></a>

### 33. Cipher Inspector

**Some results proved; limits below.** The roughness bound applies to centered, nonconstant real windows with n ≥ 3. Flat windows have an undefined ratio. Solver convergence, the stall threshold, intended plaintext and generated key certificates are outside this library’s cycle proofs.

[Cycle inequality](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/Wirtinger.lean#L168) · [Cosine equality case](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/Wirtinger.lean#L228)

<a id="more-materials"></a>

### 34. More materials

**Some results proved; limits below.** On the grid, a Super Black Grain keeps its material and stays at or below its starting row. Its color channels are at most 17 out of 255. A grain of another material can have up to four Super Black Grain neighbors. Each reduces its color multiplier by 0.18, down to 0.28 before rounding. Lean also studies repeated light bounces with a chosen reflected share capped at 0.00035. The page draws colors directly. The ferrofluid smoothing link covers one ring step with t = 1/4. The other six materials have no proof link here.

[Grain motion across frames](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/cb7c8ef9fb7153b01fcfbec3d78b736fcd95f72d/LightBounceAndCapture.lean#L238) · [Color channel bound](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/cb7c8ef9fb7153b01fcfbec3d78b736fcd95f72d/LightBounceAndCapture.lean#L152) · [Neighbor shading bounds](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/cb7c8ef9fb7153b01fcfbec3d78b736fcd95f72d/LightBounceAndCapture.lean#L157) · [Light left after each bounce](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/cb7c8ef9fb7153b01fcfbec3d78b736fcd95f72d/LightBounceAndCapture.lean#L87) · [Absorbed and remaining light](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/cb7c8ef9fb7153b01fcfbec3d78b736fcd95f72d/LightBounceAndCapture.lean#L106) · [Ring smoothing step](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/RingDecay.lean#L191)

<a id="feathers-bricks"></a>

### 35. Feathers and Bricks

**Not yet reviewed.** No proof links have been registered for this newly added tab. This crossing update preserves its source and does not audit its physics.

No proof link added.
