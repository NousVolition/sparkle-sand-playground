// Tab 11 · Copyright © 2026 NousVolition. All rights reserved.
(function () {
  'use strict';

  function epsilonAt(position) {
    const decade = Math.min(2, Math.floor(position / 90));
    return (100 - (position - 90 * decade)) * 10 ** (2 - decade) / 10000;
  }

  function totals(epsilon) {
    // expm1 retains precision in 1 − exp(−ε) at the small end of the slider.
    const denominator = -Math.expm1(-epsilon);
    const bars = Math.exp(-epsilon) / (denominator * denominator);
    const area = 1 / (epsilon * epsilon);
    return { bars, area, space: bars - area };
  }

  function height(x, epsilon) {
    return x * Math.exp(-epsilon * x);
  }

  function staircase(epsilon) {
    // The remaining infinite tail is below 7.0e-14 throughout the slider range.
    const steps = new Float64Array(Math.ceil(48 / epsilon));
    for (let i = 0; i < steps.length; i++) steps[i] = height(i + 1, epsilon);
    return steps;
  }

  function fullColumns(steps, plotWidth) {
    const stride = Math.max(1, Math.ceil(steps.length / Math.max(1, Math.floor(plotWidth))));
    const columns = [];
    for (let start = 0; start < steps.length; start += stride) {
      const end = Math.min(start + stride, steps.length);
      let sum = 0, correction = 0;
      for (let i = start; i < end; i++) {
        const term = steps[i] - correction;
        const next = sum + term;
        correction = (next - sum) - term;
        sum = next;
      }
      columns.push({ start, width: end - start, height: sum / (end - start) });
    }
    return columns;
  }

  function paintFullColumns(ctx, columns, left, bottom, xScale, yScale) {
    for (const column of columns) {
      const h = column.height * yScale;
      ctx.fillRect(left + column.start * xScale, bottom - h, column.width * xScale, h);
    }
  }

  function viewRange(epsilon, view) {
    if (view === 'overview' || view === 'full') {
      return { lo: 0, hi: Math.ceil((view === 'full' ? 48 : 5) / epsilon), low: 0, high: 1.12 / (Math.E * epsilon) };
    }
    const lo = view === 'rise' ? Math.max(0, Math.ceil(0.45 / epsilon) - 1) : Math.ceil(2 / epsilon);
    const hi = lo + 1;
    const a = height(lo, epsilon), b = height(hi, epsilon);
    const margin = 0.18 * Math.abs(b - a);
    return { lo, hi, low: Math.max(0, Math.min(a, b) - margin), high: Math.max(a, b) + margin };
  }

  function traceSteps(path, steps, lo, hi, x, y) {
    path.moveTo(x(lo), y(steps[lo]));
    for (let n = lo + 1; n <= hi; n++) {
      path.lineTo(x(n), y(steps[n - 1]));
      if (n < hi) path.lineTo(x(n), y(steps[n]));
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { epsilonAt, totals, height, staircase, fullColumns, paintFullColumns, viewRange, traceSteps };
  }
  if (typeof document === 'undefined') return;
  window.StaircaseSpace = { epsilonAt, totals, height, staircase, fullColumns, paintFullColumns };

  const byId = id => document.getElementById(id);
  const slider = byId('epsSlider'), chart = byId('space-chart'), strip = byId('space-strip');
  const sweep = byId('sweepBtn'), sound = byId('soundBtn');
  const viewButtons = [...document.querySelectorAll('[data-space-view]')];
  const colors = { grid: '#293746', ink: '#b9c9d6', common: '#203545', bar: '#ffbe78',
    curve: '#7ae3dc', above: '#d99754', below: '#41a9ad' };
  const numbers = new Intl.NumberFormat('en-US', { minimumFractionDigits: 9, maximumFractionDigits: 9 });
  let epsilon, steps, view = 'overview', playing = false, toneOn = false;
  let audio, oscillator, gain, lastAdvance, animation;

  function surface(canvas) {
    const { width, height } = canvas.getBoundingClientRect();
    if (width < 1 || height < 1) return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(width * dpr), h = Math.round(height * dpr);
    if (w !== canvas.width || h !== canvas.height) { canvas.width = w; canvas.height = h; }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(w / width, 0, 0, h / height, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx, width, height };
  }

  function axisNumber(x, span) {
    const digits = Math.min(5, Math.max(0, 1 - Math.floor(Math.log10(span))));
    return Number(x.toFixed(digits)).toLocaleString('en-US', { maximumFractionDigits: digits });
  }

  function drawChart(range) {
    const surfaceData = surface(chart);
    if (!surfaceData) return;
    const { ctx, width, height: h } = surfaceData;
    const { lo, hi, low, high } = range;
    ctx.font = '12px system-ui, sans-serif';
    const left = Math.max(35, ...[low, (high + low) / 2, high].map(v => ctx.measureText(axisNumber(v, high - low)).width + 10));
    const right = width - 15, top = 25, bottom = h - 37;
    const x = n => left + (n - lo) * (right - left) / (hi - lo);
    const y = v => bottom - (v - low) * (bottom - top) / (high - low);
    ctx.fillStyle = colors.ink;
    const magnified = view === 'rise' || view === 'fall';
    ctx.textAlign = 'left'; ctx.fillText(magnified ? 'Height · magnified' : 'Height', 3, 13);
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const v = low + i * (high - low) / 4;
      ctx.strokeStyle = colors.grid; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(left, y(v)); ctx.lineTo(right, y(v)); ctx.stroke();
      ctx.fillText(axisNumber(v, high - low), left - 6, y(v) + 4);
    }
    const ticks = magnified ? 2 : Math.min(5, hi - lo);
    for (let i = 0; i <= ticks; i++) {
      const at = magnified ? lo + (hi - lo) * i / ticks : Math.round(lo + (hi - lo) * i / ticks);
      ctx.textAlign = i === ticks ? 'right' : (i === 0 ? 'left' : 'center');
      ctx.fillText(at.toLocaleString('en-US'), x(at), bottom + 16);
    }
    ctx.textAlign = 'right'; ctx.fillText('Step position x', right, h - 2);

    // Unit-width rectangles use the height at the right endpoint of each interval.
    const stair = new Path2D();
    traceSteps(stair, steps, lo, hi, x, y);
    const curve = new Path2D(), samples = Math.ceil((right - left) * 2);
    for (let i = 0; i <= samples; i++) {
      const at = lo + (hi - lo) * i / samples;
      if (i === 0) curve.moveTo(x(at), y(height(at, epsilon)));
      else curve.lineTo(x(at), y(height(at, epsilon)));
    }
    function areaUnder(line) {
      const path = new Path2D(line);
      path.lineTo(right, bottom); path.lineTo(left, bottom); path.closePath();
      return path;
    }
    const bars = areaUnder(stair), smooth = areaUnder(curve);
    ctx.save(); ctx.beginPath(); ctx.rect(left, top, right - left, bottom - top); ctx.clip();
    ctx.fillStyle = colors.above; ctx.fill(bars);
    ctx.fillStyle = colors.below; ctx.fill(smooth);
    ctx.save(); ctx.clip(bars); ctx.fillStyle = colors.common; ctx.fill(smooth); ctx.restore();
    ctx.strokeStyle = colors.bar; ctx.lineWidth = 1.6; ctx.stroke(stair);
    ctx.strokeStyle = colors.curve; ctx.lineWidth = 2.2; ctx.stroke(curve);
    ctx.restore();
  }

  function drawStrip(range) {
    const surfaceData = surface(strip);
    if (!surfaceData) return;
    const { ctx, width, height: h } = surfaceData;
    const sx = width / steps.length, sy = (h - 6) * Math.E * epsilon;
    const columns = fullColumns(steps, width);
    ctx.fillStyle = '#7594a9';
    paintFullColumns(ctx, columns, 0, h, sx, sy);
    ctx.strokeStyle = colors.curve; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let pixel = 0; pixel <= Math.ceil(width); pixel++) {
      const px = Math.min(width, pixel), py = h - height(px / sx, epsilon) * sy;
      if (!pixel) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    const a = range.lo * sx, widthShown = (range.hi - range.lo) * sx;
    ctx.fillStyle = 'rgba(255,190,120,0.09)'; ctx.fillRect(a, 0, widthShown, h);
    ctx.strokeStyle = colors.bar; ctx.strokeRect(a + .5, .5, Math.max(0, widthShown - 1), h - 1);
  }

  function render() {
    const range = viewRange(epsilon, view);
    drawChart(range); drawStrip(range);
    byId('full-end').textContent = steps.length.toLocaleString('en-US');
    const wholeProfile = view === 'overview' || view === 'full';
    const description = wholeProfile ? 'The curve and the unit-width steps from 0 to ' + range.hi + '.'
      : 'Step ' + range.hi + ' from x ' + range.lo + ' to ' + range.hi + ', with a magnified height scale.';
    chart.setAttribute('aria-label', description + ' Amber marks bars above the curve. Teal marks the curve above the bars.');
    byId('view-caption').textContent = view === 'full' ? 'All plotted bars on linear axes. Their combined area agrees with the bars total to within one billionth.'
      : view === 'overview' ? 'A closer look at the rise and fall. Both axes rescale with ε.'
      : 'One unit-wide step with its height magnified. The full strip marks its position.';
  }

  function update() {
    epsilon = epsilonAt(Number(slider.value)); steps = staircase(epsilon);
    const v = totals(epsilon), label = String(epsilon);
    byId('epsVal').textContent = label; slider.setAttribute('aria-valuetext', 'epsilon ' + label);
    byId('statTotal').textContent = numbers.format(v.bars);
    byId('statGrowth').textContent = numbers.format(v.area);
    byId('statOffset').textContent = numbers.format(v.space).replace('-', '−');
    if (toneOn) oscillator.frequency.setTargetAtTime(140 + 340 * epsilon, audio.currentTime, .05);
    render();
    document.dispatchEvent(new CustomEvent('space-change', { detail: { epsilon } }));
  }
  function setPlaying(on) {
    if (!on) cancelAnimationFrame(animation);
    playing = on; sweep.setAttribute('aria-pressed', String(on));
    sweep.textContent = on ? 'Pause glide' : 'Glide toward 0';
  }
  function advance(now) {
    if (!playing) return;
    if (now - lastAdvance >= 65) {
      lastAdvance = now; slider.value = Number(slider.value) + 1; update();
      if (Number(slider.value) >= Number(slider.max)) setPlaying(false);
    }
    if (playing) animation = requestAnimationFrame(advance);
  }
  sweep.addEventListener('click', () => {
    setPlaying(!playing);
    if (playing) {
      if (slider.value === slider.max) { slider.value = slider.min; update(); }
      lastAdvance = performance.now(); animation = requestAnimationFrame(advance);
    }
  });
  sound.addEventListener('click', () => {
    if (!audio) {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      audio = new Audio(); oscillator = audio.createOscillator(); gain = audio.createGain();
      gain.gain.value = 0; oscillator.connect(gain); gain.connect(audio.destination); oscillator.start();
    }
    toneOn = !toneOn;
    if (toneOn) { audio.resume(); oscillator.frequency.value = 140 + 340 * epsilon; }
    gain.gain.setTargetAtTime(toneOn ? .035 : 0, audio.currentTime, .08);
    sound.setAttribute('aria-pressed', String(toneOn)); sound.textContent = toneOn ? 'Tone on' : 'Tone off';
  });
  slider.addEventListener('input', () => { setPlaying(false); update(); });
  viewButtons.forEach(button => button.addEventListener('click', () => {
    view = button.dataset.spaceView;
    viewButtons.forEach(b => b.setAttribute('aria-pressed', String(b === button))); render();
  }));
  update();
  if (window.ResizeObserver) new ResizeObserver(render).observe(chart);
  window.addEventListener('resize', render);
})();
