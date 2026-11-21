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

## The Critical Line Tightrope

Across 0.25 ≤ σ ≤ 0.75 and 12 ≤ t ≤ 68, the tightrope estimates the gap limit
using ε = 0.008, 0.004, 0.002 and 0.001. It multiplies the result by
exp(iθ(t)). On σ = ½ this approximates Hardy’s real-valued Z(t).
[DLMF 25.10.1](https://dlmf.nist.gov/25.10.E1)

The plot brackets sign changes in the center column, refines each height
against the same gap evaluator and samples a new row there. This gives
the dots and bands a common height scale. The offset slider moves a probe.
The numerical mesh is shared across sizes. A resize resamples it at the
new pixel centers. Animation rotates the cached complex values while
their magnitudes and the computed zero positions stay fixed.

Run `node tests/zeros-tightrope.cjs` to compare the computed crossings with
reference ordinates and check the rasterized field at several phases.

The 15 requested reference heights agreed within 4.88 × 10⁻⁷. The same
search found a sixteenth crossing at t ≈ 67.079811. Across seven phases,
the largest measured dot-to-edge distance was 0.52 device pixels. All
16 magnitude minima retained their positions at φ = 0 and φ = 1.

An isolated headless Chrome 157 session measured the critical-tab draw
over 120 animation frames after 20 warm-up frames, against
[main at 84dbeb4](https://github.com/NousVolition/sparkle-sand-playground/commit/84dbeb438c0ef5547507aa3769a63a7769c604c9).

| Viewport | Median draw on main | Median draw with gap bands |
| --- | ---: | ---: |
| 1280 × 900, 1× | 5.7 ms | 0.7 ms |
| 390 × 844, 3× phone emulation | 3.1 ms | 2.3 ms |

The first field build took 1.9 seconds on desktop and 2.1 seconds in phone emulation. Subsequent frames,
probe changes and resizes reused it. The phone view fit in 390 CSS pixels.

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

## A fixed-height pass through the estimated zero

The crossing view fixes softening at ε = 0.05 and computes a center with the existing two-dimensional gap search. That gives height t ≈ 14.126941386244061 and horizontal center c ≈ 0.4231418192314683. Only σ changes during the pass, from c − 0.02 to c + 0.02. The plane controls below it do not change this pass. No stored zeta ordinates are used.

The two plots share a horizontal coordinate: |G| is the nonnegative size, while Re G is its signed real component. The separate σ readout is the real part of the input s, not the real part of G. The imaginary component remains available below the readings. At the estimated center the actual residual, approximately 3.03 × 10⁻¹⁴, is retained rather than overwritten with zero. This is a zero estimate for the softened gap, not an assertion of an exact zeta zero.

The slider recomputes the direct sum at every selected position; 161 additional samples draw the two curves. Save this pass exports the immutable parameters, current reading and those 161 samples. The seven-point [independent check](zeros-gap-crossing-check.json) uses 60-digit mpmath polylog/Gamma values. The sampled signs and falling/rising size are empirical observations; no interval certificate is claimed.

[GapCrossing.lean](https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/394543d34125c52b41813ee2917158f2058808ae/GapCrossing.lean) proves six general statements, including the conditional rule for both sides. It assumes an exact zero f(c) = 0 and a strictly increasing real component on the stated interval. These assumptions have not been proved for this numerical slice. The counterexample f(x) = x + i shows why a real sign change alone is insufficient. Lean 4.34.0-rc2 and the full 1,074-declaration axiom audit passed for [PR #30](https://github.com/NousVolition/discrete-gap-inequalities-lean/pull/30).

Run `node tests/zeros-gap-crossing.cjs` to repeat the numerical checks. The [browser check](zeros-gap-crossing-ui-check.json) records independent-control isolation, slider/keyboard use, export, and 390px/320px layouts.
