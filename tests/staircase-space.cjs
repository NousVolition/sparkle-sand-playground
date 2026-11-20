'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { epsilonAt, totals, staircase, fullColumns, paintFullColumns, viewRange, traceSteps } = require('../staircase-space.js');

// Independently evaluated from exp(−ε)/(1 − exp(−ε))² and 1/ε² with 65-digit decimal arithmetic.
const reference = [
  [0, 1, 0.920673594207792319, -0.079326405792207681],
  [50, .5, 3.917698089032763765, -0.082301910967236235],
  [90, .1, 99.916708316804726958, -0.083291683195273042],
  [180, .01, 9999.916667083331679900, -0.083332916668320100],
  [270, .001, 999999.916666670833333168, -0.083333329166666832]
];
const tolerance = 1e-9;
function close(actual, expected, description) {
  const error = Math.abs(actual - expected);
  assert(error < tolerance, `${description}: ${actual} versus ${expected}, error ${error}`);
  return error;
}
function accumulator() {
  let value = 0, correction = 0;
  return {
    add(x) { const y = x - correction, t = value + y; correction = (t - value) - y; value = t; },
    total() { return value; }
  };
}
let maxReadoutError = 0, maxDrawnError = 0;
for (const [position, e, expectedBars, expectedSpace] of reference) {
  assert.equal(epsilonAt(position), e);
  const { bars, area, space } = totals(e);
  close(bars, expectedBars, 'bars total');
  close(area, (1 / e) ** 2, 'area under the curve');
  close(space, expectedSpace, 'space');
  maxReadoutError = Math.max(maxReadoutError, close(Number(space.toFixed(9)), expectedSpace, 'displayed space'));
  const steps = staircase(e), full = viewRange(e, 'full');
  assert.equal(full.lo, 0); assert.equal(full.hi, steps.length);
  const q = Math.exp(-e), tail = Math.exp(-e * (steps.length + 1)) *
    (steps.length + 1 - steps.length * q) / (-Math.expm1(-e)) ** 2;
  assert(tail < 1e-12);
  for (const width of [240, 375, 823]) {
    const sx = width / steps.length, sy = 178 / full.high, baseline = 205;
    const totalsInPlot = accumulator(), totalsInStrip = accumulator();
    let lastX, lastY, barsDrawn = 0;
    const plot = {
      moveTo(x, y) { lastX = x; lastY = y; },
      lineTo(x, y) {
        if (x !== lastX) {
          assert.equal(y, lastY);
          assert(Math.abs((x - lastX) / sx - 1) < 1e-10);
          totalsInPlot.add((x - lastX) / sx * ((baseline - y) / sy));
          barsDrawn++;
        }
        lastX = x; lastY = y;
      }
    };
    traceSteps(plot, steps, full.lo, full.hi, n => n * sx, h => baseline - h * sy);
    assert.equal(barsDrawn, steps.length);
    const strip = { fillRect(x, y, w, h) { totalsInStrip.add((w / sx) * (h / sy)); } };
    const columns = fullColumns(steps, width);
    assert.equal(columns.reduce((n, col) => n + col.width, 0), steps.length);
    paintFullColumns(strip, columns, 0, baseline, sx, sy);
    for (const drawn of [totalsInPlot.total(), totalsInStrip.total()]) {
      close(drawn, expectedBars, 'painted area against independent closed form');
      close(drawn, bars, 'painted area against the bars model');
      maxDrawnError = Math.max(maxDrawnError, close(drawn, Number(bars.toFixed(9)), 'painted area against the readout'));
    }
  }
  for (const side of ['rise', 'fall']) {
    const { lo, hi } = viewRange(e, side);
    assert.equal(hi - lo, 1);
    const middle = (lo + .5) * Math.exp(-e * (lo + .5));
    assert(side === 'rise' ? steps[lo] > middle : steps[lo] < middle);
  }
}
for (let i = 1; i <= 270; i++) assert(epsilonAt(i) < epsilonAt(i - 1));

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const tab = html.match(/<template id="page-src-sum">([\s\S]*?)<\/template>/)[1];
const history = tab.match(/<details\b[^>]*id="sum-history"[^>]*>[\s\S]*?<\/details>/)[0];
assert(!/\bopen\b/.test(history.split('>')[0]));
assert(history.includes('A famous shortcut that needs a special rule'));
assert(history.includes('under my theory') && history.includes('1913') && history.includes('S − 4S'));
assert(!tab.replace(history, '').includes('S − 4S'));
const title = '1 + 2 + 3 + … grows forever. The space left over is −1/12.';
assert(tab.replace(/<[^>]+>/g, '').includes(title));
const outsideHistory = html.replace(history, '')
  .replace(/&(?:minus|#8722|#x2212);/gi, '−').replace(/&(?:nbsp|#160);/gi, ' ');
assert(!/=\s*[−-]\s*1\s*\/\s*12\b/.test(outsideHistory));
console.log(JSON.stringify({ checkedEpsilon: reference.map(row => row[1]), maxReadoutError, maxDrawnError, tolerance }));
