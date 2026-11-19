# sparkle-sand-playground
Interactive particle playground: kinetic sand, bubbles, sound plate, waves

## Trilogy's cube maximum

[Trilogy](https://nousvolition.github.io/sparkle-sand-playground/#trilogy) compares a selected set's internal edges with the exact maximum `h(m)`: the total number of 1 bits in the binary labels `0` through `m-1`. It shows the logarithmic upper bound `(m/2) log₂(m)` separately. For example, `{0,1,2}` has two internal edges, which is optimal; the upper bound of about `2.38` is not attainable.

The formula is proved in [EdgeOptimal.lean](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/3e2226e2af6b356b6c1bf47ab931cbeedcc33f66/EdgeOptimal.lean). The JavaScript implementation and its labels are checked separately by enumerating all **65,808 subsets** of the supported 2D, 3D and 4D cubes:

```sh
node tests/trilogy-cube.cjs
```

The test uses Node's built-in libraries and exercises the actual HUD calculation with text-only DOM stand-ins. These are regression checks, not new Lean proofs or a browser-rendering test. An optional HTML path lets the same checks run against a downloaded deployment.


Copyright © 2026 NousVolition. All rights reserved. [Reuse terms](LICENSE).
