'use strict';
const assert = require('node:assert/strict');
const math = require('../zeros-gap-math.js');
const tightrope = require('../zeros-gap-tightrope.js');

// Test references only. The sixteenth crossing is also inside 12 ≤ t ≤ 68.
const reference = [
  14.134725, 21.022040, 25.010858, 30.424876, 32.935062, 37.586178,
  40.918719, 43.327073, 48.005151, 49.773832, 52.970321, 56.446248,
  59.347044, 60.831779, 65.112544, 67.079811
];
const phases = [0, 1, Math.PI / 2, 2.8, Math.PI, 3 * Math.PI / 2, 5.9];

// Distance to a shared edge between two differently colored raster pixels.
function edgeDistance(rgba, width, x, y) {
  const positive = (a, b) => {
    const k = 4 * (b * width + a);
    return rgba[k+1] - 8 > 1.5 * (rgba[k] - 5);
  };
  let best = Infinity;
  for (let j = Math.floor(y) - 2; j <= Math.floor(y) + 2; j++) {
    for (let i = Math.floor(x) - 2; i <= Math.floor(x) + 2; i++) {
      if (positive(i,j) !== positive(i+1,j)) {
        best = Math.min(best, Math.hypot(x-i-1, Math.max(j-y, 0, y-j-1)));
      }
      if (positive(i,j) !== positive(i,j+1)) {
        best = Math.min(best, Math.hypot(Math.max(i-x, 0, x-i-1), y-j-1));
      }
    }
  }
  return best;
}

async function main() {
  for (const t of [-68, 68]) assert(math.gap([0.5,t], 0.008).value.every(Number.isFinite));
  for (const t of [-68.01, 68.01]) assert.throws(() => math.gap([0.5,t], 0.008), RangeError);
  const field = await tightrope.buildField();
  assert.equal(field.zeros.length, reference.length);
  const maxReferenceError = Math.max(...field.zeros.map((t, i) => Math.abs(t - reference[i])));
  assert(maxReferenceError < 1e-6);

  // Recover the actual crossings of the interpolant independently of its markers.
  const mid = (field.rows[0].re.length - 1) / 2, crossings = [];
  for (let j = 1; j < field.rows.length; j++) {
    const a = field.rows[j-1], b = field.rows[j];
    if (a.re[mid] === 0) crossings.push(a.t);
    if (a.re[mid] * b.re[mid] < 0) {
      crossings.push(a.t + (b.t - a.t) * a.re[mid] / (a.re[mid] - b.re[mid]));
    }
  }
  assert.equal(crossings.length, reference.length);
  crossings.forEach((t, i) => assert(Math.abs(t - reference[i]) < 1e-6));

  // Check the phase convention against Gamma and the whole strip against
  // the independent Euler–Maclaurin implementation, including both sides.
  let maxFieldError = 0;
  for (const row of field.rows.filter((_, i) => i % 20 === 0)) {
    const t = row.t, gamma = math.gamma([0.25, t / 2]);
    const angle = Math.atan2(gamma[1], gamma[0]) - t / 2 * Math.log(Math.PI);
    for (const i of [0, mid, row.re.length - 1]) {
      const sigma = 0.25 + 0.5 * i / (row.re.length - 1);
      const z = math.zetaReference([sigma, t]);
      const exact = math.complex.mul(z, [Math.cos(angle), Math.sin(angle)]);
      maxFieldError = Math.max(maxFieldError, Math.hypot(row.re[i]-exact[0], row.im[i]-exact[1]));
    }
  }
  assert(maxFieldError < 3e-7, maxFieldError);

  // Locate each local magnitude minimum from both rotated components.
  for (const t of field.zeros) {
    const nearby = field.rows.filter(r => Math.abs(r.t - t) < 0.5);
    for (const phase of [0, 1]) {
      const c = Math.cos(phase), s = Math.sin(phase);
      let best = {magnitude: Infinity};
      for (const row of nearby) {
        for (let i = 0; i < row.re.length; i++) {
          const re = row.re[i], im = row.im[i];
          const magnitude = Math.hypot(c*re - s*im, s*re + c*im);
          assert(Math.abs(magnitude - Math.hypot(re, im)) < 2e-15);
          if (magnitude < best.magnitude) best = {magnitude, t: row.t, column: i};
        }
      }
      assert.equal(best.t, t);
      assert.equal(best.column, mid);
    }
  }

  let maxEdgePixels = 0;
  for (const [width, height] of [[631, 316], [978, 948]]) {
    const raster = tightrope.makeRaster(field, width, height);
    const pixels = new Uint32Array(width * height), rgba = new Uint8Array(pixels.buffer);
    for (const phase of phases) {
      tightrope.colorFrame(raster, phase, pixels);
      for (const t of field.zeros) {
        maxEdgePixels = Math.max(maxEdgePixels, edgeDistance(rgba, width, width / 2, (t - 12) / 56 * height));
      }
      for (let i = 0; i < pixels.length; i += 37) {
        if (raster.shade[i] < 5) continue;
        const projection = Math.cos(phase) * raster.re[i] - Math.sin(phase) * raster.im[i];
        assert.equal(rgba[4*i+1] - 8 > 1.5 * (rgba[4*i] - 5), projection >= 0);
      }
    }
  }
  assert(maxEdgePixels <= 1, maxEdgePixels);
  console.log(JSON.stringify({crossings: crossings.length, maxReferenceError, maxFieldError, maxEdgePixels,
    testedPhases: phases, magnitudeMinimaPhases: [0, 1]}, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
