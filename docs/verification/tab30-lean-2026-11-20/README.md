# Tab 30: fresh Lean source verification

The unchanged `E8PlumbingBridge.lean` compiled successfully with Lean 4.34.0-rc2. All eight public theorem declarations passed a fresh axiom audit. Their reported dependencies are limited to Lean’s standard `propext`, `Classical.choice` and `Quot.sound`; no `sorryAx` or additional axioms appeared.

This checks the exact [source cited by Tab 30](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/f0e7c291733f50a950f40cfc786c945b8cf06b99/E8PlumbingBridge.lean). Its Git blob is `49f88cf46f59e29c2d6c01f9ba4289d97053be88`, also unchanged at the observed newer branch revision `d34dae902b30774e28d7e97bf936f4c305a13268`.

The [verification record](verification.json) includes timestamps, source and compiler hashes, the pinned dependency revisions, commands, exit codes and the axiom results. The [compiler log](E8PlumbingBridge.log) is empty on success; the [axiom log](E8SourceAudit.log) lists the eight declarations. The preserved [source](E8PlumbingBridge.lean) is byte-for-byte identical to the cited file. No theorem statement, equation or proof was edited.

## What this establishes

In particular, `E8PlumbingBridge.E8_det` proves `E8_matrix.det = 1` for its explicitly defined integer matrix. The module also proves its symmetry and trace, the A₄ matrix facts, and the finite counts 112, 128 and 240. These are the existing declarations, freshly checked; no new mathematical theorem was added.

The browser-to-Lean matrix correspondence remains an [external exact-arithmetic check](../../e8-inspector-check.json). The [browser check](../../e8-inspector-ui-check.json) covers the controls and rendering separately. The topology comments surrounding the Lean declarations are prose; this compilation does not prove statements about homology groups, plumbing manifolds or exotic spheres.

## Reproduce

Use the recorded Lean version and the nine dependency revisions in `lake-manifest.json`, with their compiled Lean libraries available in an existing Lake packages directory. In a fresh copy of this verification folder, omit the saved `.log` and `attempts.json` outputs before running:

```sh
python verify.py --lean /path/to/lean --packages /path/to/.lake/packages
```

The script preserves sources and checks dependency revisions before and after compilation. This run reused existing compiled dependencies; it did not rebuild mathlib, run Comparator, replay an independent kernel, or build the whole proof repository. The complete source and dependency hashes allow this evidence to be evaluated within that scope.
