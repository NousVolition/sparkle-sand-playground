# Following the space into zeta

Copyright © 2026 NousVolition. All rights reserved.

Michele’s starting idea was “the shortcut works because of the space.” Tab 11
keeps that space explicit: softened unit-width bars minus the smooth area.
The Zeros tab extends the same subtraction to a complex exponent.

## Mathematical connection

For real ε > 0 and complex s with Re(s) < 1, use

G(s, ε) = Σ(n ≥ 1) n^(−s) exp(−ε n) − Γ(1−s) ε^(s−1).

The second term is the integral over x > 0 of x^(−s) exp(−ε x). At s = −1,
this is the real bars-minus-area expression proved in the Lean library.
The [polylogarithm expansion, DLMF 25.12.12](https://dlmf.nist.gov/25.12.E12)
gives G(s, ε) = ζ(s) + Σ(k ≥ 1) ζ(s−k)(−ε)^k/k! for 0 < ε < 2π in
this domain. Thus the gap approaches zeta. This complex extension is
mathematical source material; it has not yet been formalized in this project.

The [merged real-case proofs](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/4a1e2f0798c5186e8cbb118a7d57b6a84f5c2f8d/RamanujanGap.lean)
prove the integral, area cancellation, softened alternating identity and limit
at s = −1. The earlier RingSumMinusTwelfth file proves existence of the limit.
The complete PR build and axiom audit passed with 1,058 declarations;
only propext, Classical.choice and Quot.sound are allowed by that audit.

## Independent numerical search

`zeros-gap-math.js` contains no stored zero ordinates. It sums directly with
compensated addition, using ceil(48/ε) terms and a Lanczos Gamma evaluation.
Its tail bound covers omitted series terms, not all floating-point error.
A coarse grid supplies the initial point for a damped complex Newton search.
Both σ and t are free. Search results are numerical estimates, not certified
intervals or proof that all zeros in the window have been found.

Five successive ε values, each half the preceding one, give a Richardson
extrapolation canceling the first four powers of ε. A separate Euler–Maclaurin
zeta implementation checks the result afterwards; it is not used by the search.
The displayed window is 0.1 ≤ σ ≤ 0.9, 12 ≤ t ≤ 16.

The independent reference fixtures use mpmath 1.3.0 at 60 decimal digits.
They evaluate the gap by polylogarithm minus Gamma rather than repeating the
JavaScript summation. `tests/zeros-gap.cjs` also checks zero-location stability
under ε halving and a doubled summation cutoff, and off-line control points.
See [the saved results](zeros-gap-check.json).

At ε = 0.1, the finite-gap zero is near 0.3462767296 + 14.1192442462i.
At ε = 0.025, it is near 0.4615718415 + 14.1308224298i.
The five-level limit estimate from ε = 0.025 is near
0.499999999997 + 14.134725141730i. These checks support the expected limiting
behavior in this one window. They establish no statement about all zeta zeros.

## Golay and Leech

The module also computes the coefficients through q⁵ of E₄³ − 720Δ using exact
BigInt arithmetic. They are 1, 0, 196560, 16773120, 398034000 and 4629381120,
matching the corresponding existing lattice counts. The finite match is not
a formal proof of the complete theta-series identity. Sources:
[Elkies, October 28](https://people.math.harvard.edu/~elkies/M272.19/oct28.pdf)
and [November 4](https://people.math.harvard.edu/~elkies/M272.19/nov04.pdf).

The code guard requires 24 binary digits and membership in the playground's
Golay code, as well as an allowed Hamming weight. A word of weight 8 can fail
membership; the initial example demonstrates this. The generated basis agrees
with PlaygroundGolay.lean. Membership is not inferred from weight alone.

The three-E₈ construction starts with (√2 E₈)³ in ordinary Leech units.
Its 4,096 glue cosets add vectors to that scaled base. They do not remove
roots from an unscaled unimodular E₈³. The absent squared-length-2 shell
becomes the absent q coefficient. A theorem connecting this absence to the
location of zeta zeros has not been established here.

## Replay

```sh
node tests/staircase-space.cjs
node tests/staircase-shortcut.cjs
node tests/zeros-gap.cjs --save
```

Tab 12's HTML, mathematics and controls are preserved byte for byte; only its
separate coverage note changes. The older Zeros illustrations stay available.
Their drum bars use stored zeta ordinates, and their GUE badge is labeled as an
illustration rather than a measured fit.
