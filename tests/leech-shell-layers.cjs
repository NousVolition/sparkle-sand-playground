'use strict';

// Count vectors along (4, −4, 0, …) using the playground's Golay words.
module.exports = function countShellLayers(words, weights, squaredLength) {
  // Parity and the Golay bit fix a coordinate's residue mod 4.
  const values = [[[], []], [[], []]];
  const bound = Math.floor(Math.sqrt(squaredLength));
  for (let value = -bound; value <= bound; value++) {
    const residue = ((value % 4) + 4) % 4;
    values[residue % 2][Math.floor(residue / 2)].push(value);
  }
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
          const count = completions(parity, 22 - ones, ones, squaredLength - a * a - b * b, mod8(4 * parity - a - b));
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
