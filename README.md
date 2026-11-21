# sparkle-sand-playground
Interactive particle playground: kinetic sand, bubbles, sound plate, waves

## Leech browser checks

The [saved browser checks](docs/browser-checks/leech-2026-11-20/README.md) record Cloud as the default, the seven layer counts, both empty slots, and Next/Previous at revision `f01f401`. One visual check by this Codex chat and Claude's independently reported check have separate records. They describe the page and its controls; Lean proof results are recorded separately below.

## Lean proofs across the playground

The **Lean proofs** menu follows the selected tab. The [35-tab comparison](docs/lean-coverage.md) checks the tab's formulas, matrices and constructions against the Lean statements and their hypotheses. It distinguishes matching results, limited connections and pages with no matching proof in the reviewed library. The [reproducible checks](scripts/check-proof-coverage.cjs) and [saved output](docs/lean-coverage-check.json) record the external comparisons; they are separate from Lean's proof checking.

## Trilogy's gap proofs

The path label in [Trilogy](https://nousvolition.github.io/sparkle-sand-playground/#trilogy) reads `2 − √3 ≈ 0.268`, with a link to [PathSix.lean](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/fbcad67fcec4fb48bbcb924e520d55aefc7d04c0/PathSix.lean#L70). The Lean proof establishes the bound, an equality case and the rounding.

The cycle card links to [Wirtinger.lean](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/fbcad67fcec4fb48bbcb924e520d55aefc7d04c0/Wirtinger.lean#L168), which proves the cycle inequality and its sharpness. The cube card links to [CubeCheeger.lean](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/fbcad67fcec4fb48bbcb924e520d55aefc7d04c0/CubeCheeger.lean#L179) for the gap bound 2. The browser's floating-point updates are outside these proofs.

## Unit Distances and Cipher Inspector

[Unit Distances](https://nousvolition.github.io/sparkle-sand-playground/#unit-distances) and [Cipher Inspector](https://nousvolition.github.io/sparkle-sand-playground/#cipher) link to the [cycle inequality](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/fbcad67fcec4fb48bbcb924e520d55aefc7d04c0/Wirtinger.lean#L168) and its [cosine equality case](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/fbcad67fcec4fb48bbcb924e520d55aefc7d04c0/Wirtinger.lean#L228). These are the results behind the ring comparison and the roughness gauge. The links point to the audited proof revision; grid counts, browser calculations, solver convergence and decoded text are outside these proofs.

## Trilogy's cube maximum

[Trilogy](https://nousvolition.github.io/sparkle-sand-playground/#trilogy) compares a selected set's internal edges with the exact maximum `h(m)`: the total number of 1 bits in the binary labels `0` through `m-1`. It shows the logarithmic upper bound `(m/2) log₂(m)` separately. For example, `{0,1,2}` has two internal edges, which is optimal; the upper bound of about `2.38` is not attainable.

The formula is proved in [EdgeOptimal.lean](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/3e2226e2af6b356b6c1bf47ab931cbeedcc33f66/EdgeOptimal.lean). The JavaScript implementation and its labels are checked separately by enumerating all **65,808 subsets** of the supported 2D, 3D and 4D cubes:

```sh
node tests/trilogy-cube.cjs
```

The test uses Node's built-in libraries and exercises the actual HUD calculation with text-only DOM stand-ins. These are regression checks, not new Lean proofs or a browser-rendering test. An optional HTML path lets the same checks run against a downloaded deployment.


Copyright © 2026 NousVolition. All rights reserved. [Reuse terms](LICENSE).
