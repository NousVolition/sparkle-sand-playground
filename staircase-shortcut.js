/* Copyright © 2026 NousVolition. All rights reserved. */
(function (root) {
  'use strict';
  const math = typeof module !== 'undefined' && module.exports ? require('./staircase-space.js') : root.StaircaseSpace;
  function shortcut(epsilon) {
    const first = math.totals(epsilon), second = math.totals(2 * epsilon);
    const q = Math.exp(-epsilon), closed = q / (1 + q) ** 2;
    let alternating = 0, correction = 0;
    const steps = math.staircase(epsilon);
    for (let i = 0; i < steps.length; i++) {
      const y = (i % 2 ? -steps[i] : steps[i]) - correction, t = alternating + y;
      correction = (t - alternating) - y; alternating = t;
    }
    return { epsilon, first, second, difference: first.space - 4 * second.space, closed, alternating };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { shortcut };
  if (typeof document === 'undefined') return;
  const panel = document.getElementById('space-shortcut');
  const fmt = n => n.toLocaleString('en-US', { minimumFractionDigits: 9, maximumFractionDigits: 9 }).replace('-', '−');
  let epsilon = math.epsilonAt(Number(document.getElementById('epsSlider').value));
  function draw(canvas, e) {
    const box = canvas.getBoundingClientRect(), w = box.width, h = box.height;
    if (!w || !h) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    const c = canvas.getContext('2d'); c.scale(dpr, dpr);
    const left = 34, right = w - 10, top = 12, bottom = h - 32;
    const end = Math.ceil(5 / e), peak = 1.1 / (Math.E * e);
    const x = n => left + (right - left) * n / end, y = v => bottom - (bottom - top) * v / peak;
    const steps = math.staircase(e);
    c.fillStyle = '#d99754';
    // Every visible rectangle is unit-width; narrow ones are grouped by area.
    math.paintFullColumns(c, math.fullColumns(steps.subarray(0, end), right - left), left, bottom, (right - left) / end, (bottom - top) / peak);
    c.beginPath(); c.moveTo(left, bottom);
    for (let i = 0; i <= 500; i++) c.lineTo(x(end * i / 500), y(math.height(end * i / 500, e)));
    c.lineTo(right, bottom); c.closePath(); c.fillStyle = 'rgba(65,169,173,.65)'; c.fill();
    c.beginPath();
    for (let i = 0; i <= 500; i++) { const xx = end * i / 500; if (!i) c.moveTo(x(xx), y(math.height(xx,e))); else c.lineTo(x(xx),y(math.height(xx,e))); }
    c.strokeStyle = '#7ae3dc'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#bdcbd1'; c.font = '12px system-ui'; c.textAlign = 'left'; c.fillText('0', left, h - 12);
    c.textAlign = 'right'; c.fillText('x = ' + end, right, h - 12); c.fillText('height ' + peak.toFixed(2), right, 12);
  }
  function update(e) {
    epsilon = e; const r = shortcut(e);
    const fields = { e, twice: 2*e, l1: r.first.space, l2: r.second.space, area1: r.first.area,
      area2: 4*r.second.area, difference: r.difference, alternating: r.alternating, closed: r.closed };
    for (const [key, value] of Object.entries(fields)) panel.querySelector('[data-shortcut="'+key+'"]').textContent = ['e','twice'].includes(key) ? Number(value.toPrecision(5)) : fmt(value);
    draw(document.getElementById('shortcut-first'), e); draw(document.getElementById('shortcut-second'), 2*e);
    panel.querySelector('[data-shortcut="error"]').textContent = Math.abs(r.difference-r.alternating).toExponential(2);
  }
  document.addEventListener('space-change', event => update(event.detail.epsilon));
  new ResizeObserver(() => update(epsilon)).observe(panel);
  update(epsilon);
})(typeof globalThis !== 'undefined' ? globalThis : this);
