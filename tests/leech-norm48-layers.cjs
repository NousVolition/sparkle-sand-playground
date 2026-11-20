'use strict';

// Count the length-48 layers along (4, −4, 0, …) using the playground's Golay words.
// A word fixes the residue mod 4 at each coordinate. Squared length 48 bounds each coordinate by 6.
module.exports = function countLength48Layers(words, weights) {
  const values = [
    [[-4, 0, 4], [-6, -2, 2, 6]],
    [[-3, 1, 5], [-5, -1, 3]]
  ];
  const mod8 = n => ((n % 8) + 8) % 8;
  const memo = new Map();

  // The remaining coordinates must use the given squared length and sum to the given residue mod 8.
  function completions(parity, zeros, ones, squaredLength, residue) {
    if (squaredLength < 0) return 0;
    if (zeros + ones === 0) return Number(squaredLength === 0 && residue === 0);
    const key = [parity, zeros, ones, squaredLength, residue].join(',');
    if (memo.has(key)) return memo.get(key);

    const bit = zeros > 0 ? 0 : 1;
    let count = 0;
    for (const value of values[parity][bit]) {
      count += completions(parity, zeros - (1 - bit), ones - bit,
        squaredLength - value * value, mod8(residue - value));
    }
    memo.set(key, count);
    return count;
  }

  const totals = new Map();
  for (let i = 0; i < words.length; i++) {
    const first = words[i] & 1, second = (words[i] >>> 1) & 1;
    const ones = weights[i] - first - second;
    for (const parity of [0, 1]) {
      for (const a of values[parity][first]) {
        for (const b of values[parity][second]) {
          const count = completions(parity, 22 - ones, ones, 48 - a * a - b * b, mod8(4 * parity - a - b));
          if (count > 0) {
            const dot = 4 * (a - b);
            totals.set(dot, (totals.get(dot) || 0) + count);
          }
        }
      }
    }
  }
  return [...totals].sort(([a], [b]) => a - b);
};
