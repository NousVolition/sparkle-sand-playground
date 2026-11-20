// Tab 11 · Copyright © 2026 NousVolition. All rights reserved.
(function () {
  'use strict';
  function setup(details, alternating) {
    const [leftCanvas, rightCanvas] = details.querySelectorAll('canvas');
    const lCtx = leftCanvas.getContext('2d'), rCtx = rightCanvas.getContext('2d');
    const slider = details.querySelector('.comp-slider'), value = details.querySelector('.comp-value');
    const glide = details.querySelector('.comp-glide');
    const flip = details.querySelector('#flipBtn');
    let flipOn = false, playing = false, queued = false, elapsed = 0, previous, time = 0;
    let eps = Number(slider.value);
    if (flip) {
      try { flipOn = localStorage.getItem('sparkle.t11.flip') === '1'; } catch {}
      flip.setAttribute('aria-pressed', String(flipOn));
      flip.addEventListener('click', () => {
        flipOn = !flipOn;
        flip.setAttribute('aria-pressed', String(flipOn));
        try { localStorage.setItem('sparkle.t11.flip', flipOn ? '1' : '0'); } catch {}
        schedule();
      });
    }

    const lFill = lCtx.fillText;
    lCtx.fillText = function (txt, x, y, maxW) {
      const T = this.getTransform();
      if (T.a >= 0) return maxW === undefined ? lFill.call(this, txt, x, y) : lFill.call(this, txt, x, y, maxW);
      const q = T.transformPoint(new DOMPoint(x, y));
      const al = this.textAlign;
      this.save();
      this.setTransform(1, 0, 0, 1, 0, 0);
      this.textAlign = (al === 'left' || al === 'start') ? 'right' : (al === 'right' || al === 'end') ? 'left' : al;
      if (maxW === undefined) lFill.call(this, txt, q.x, q.y); else lFill.call(this, txt, q.x, q.y, maxW);
      this.restore();
    };

    function drawCasimirMode() {
      const lw = leftCanvas.width, lh = leftCanvas.height;
      const rw = rightCanvas.width, rh = rightCanvas.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      // LEFT: Two metallic plates with standing waves n=1..6 trapped inside vs continuous waves outside
      lCtx.clearRect(0, 0, lw, lh);
      const centerX = lw * 0.5;
      const gapPx = Math.min((65 + eps * 190) * dpr, lw * .62);
      const leftPlateX = centerX - gapPx / 2;
      const rightPlateX = centerX + gapPx / 2;

      // Subtle inward Casimir force arrows
      const arrowPulse = 0.5 + 0.5 * Math.sin(time * 3);
      lCtx.fillStyle = `rgba(251, 113, 133, ${0.45 + 0.35 * arrowPulse})`;
      lCtx.font = `bold ${12 * dpr}px sans-serif`;
      lCtx.textAlign = 'right'; lCtx.fillText('Pull →', leftPlateX - 7 * dpr, lh * 0.5);
      lCtx.textAlign = 'left'; lCtx.fillText('← Pull', rightPlateX + 7 * dpr, lh * 0.5);

      // Draw plates
      lCtx.fillStyle = '#38bdf8';
      lCtx.fillRect(leftPlateX - 5 * dpr, 24 * dpr, 5 * dpr, lh - 48 * dpr);
      lCtx.fillRect(rightPlateX, 24 * dpr, 5 * dpr, lh - 48 * dpr);

      // Draw discrete harmonic standing waves n = 1..6 inside plates
      const harmonics = 6;
      for (let n = 1; n <= harmonics; n++) {
        const bandY = 36 * dpr + ((lh - 72 * dpr) * (n - 0.5)) / harmonics;
        const amp = (14 * dpr) / Math.sqrt(n);
        const omega = n * 2.2;
        const hue = 190 + n * 24;

        lCtx.strokeStyle = `hsla(${hue}, 90%, 68%, 0.88)`;
        lCtx.lineWidth = 2.2 * dpr;
        lCtx.beginPath();
        for (let x = leftPlateX; x <= rightPlateX; x += 2 * dpr) {
          const u = (x - leftPlateX) / gapPx;
          const y = bandY + Math.sin(n * Math.PI * u) * Math.cos(time * omega) * amp;
          if (x === leftPlateX) lCtx.moveTo(x, y);
          else lCtx.lineTo(x, y);
        }
        lCtx.stroke();

        lCtx.fillStyle = '#94a3b8';
        lCtx.font = `${10 * dpr}px monospace`;
        lCtx.fillText(`n=${n}`, centerX - 10 * dpr, bandY - amp - 3 * dpr);
      }

      // RIGHT: Attractive Casimir Energy Curve -1/12 * (1/d^2)
      rCtx.clearRect(0, 0, rw, rh);
      const padL = 52 * dpr, padR = 24 * dpr, padT = 28 * dpr, padB = 34 * dpr;
      const pW = rw - padL - padR;
      const pH = rh - padT - padB;

      // Top zero energy line
      rCtx.strokeStyle = 'rgba(255,255,255,0.25)';
      rCtx.lineWidth = 1.2 * dpr;
      rCtx.beginPath();
      rCtx.moveTo(padL, padT + 14 * dpr);
      rCtx.lineTo(rw - padR, padT + 14 * dpr);
      rCtx.stroke();
      rCtx.fillStyle = '#94a3b8';
      rCtx.font = `${11 * dpr}px monospace`;
      rCtx.fillText('E = 0', 10 * dpr, padT + 18 * dpr);

      // Curve E(d) = -1 / (12 * d^2)
      rCtx.strokeStyle = '#fb7185';
      rCtx.lineWidth = 2.8 * dpr;
      rCtx.beginPath();
      let first = true;
      for (let px = 0; px <= pW; px += 3 * dpr) {
        const d = 0.08 + (px / pW) * 0.77;
        const energy = -1 / (12 * d * d);
        const normY = Math.min(1, Math.abs(energy) / 14);
        const py = padT + 14 * dpr + normY * (pH - 20 * dpr);
        if (first) { rCtx.moveTo(padL + px, py); first = false; }
        else rCtx.lineTo(padL + px, py);
      }
      rCtx.stroke();

      const curNormX = (eps - 0.08) / 0.77;
      const curX = padL + Math.max(0, Math.min(1, curNormX)) * pW;
      const curEnergy = -1 / (12 * eps * eps);
      const curNormY = Math.min(1, Math.abs(curEnergy) / 14);
      const curY = padT + 14 * dpr + curNormY * (pH - 20 * dpr);

      rCtx.fillStyle = '#fff';
      rCtx.beginPath();
      rCtx.arc(curX, curY, 5.5 * dpr, 0, Math.PI * 2);
      rCtx.fill();

      rCtx.fillStyle = '#fda4af';
      rCtx.font = `bold ${11 * dpr}px monospace`;
      rCtx.fillText(`Scaled energy ∝ −1/d²`, padL + 12 * dpr, rh - 14 * dpr);
    }

    function drawAlternatingMode() {
      const lw = leftCanvas.width, lh = leftCanvas.height;
      const rw = rightCanvas.width, rh = rightCanvas.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const r = Math.exp(-eps * 0.45);
      // Smooth span: Nc is the (real-valued) term count where the next term (n+1)·r^n reaches 0.004 (at least 24).
      // It changes smoothly with r, so the x-axis never jumps while gliding; whole terms past the right edge are clipped.
      const lnr = Math.log(r), TOL = 0.004;
      let Nc = 24;
      {
        const g = n => Math.log(n + 1) + n * lnr - Math.log(TOL);   // falls past its peak; find where it crosses 0
        let lo = Math.max(1, -1 / lnr - 1), hi = lo + 10;
        if (g(lo) > 0) {
          while (g(hi) > 0 && hi < 5000) hi *= 1.6;
          for (let i = 0; i < 60; i++) { const m = 0.5 * (lo + hi); if (g(m) > 0) lo = m; else hi = m; }
          Nc = Math.max(24, 0.5 * (lo + hi));
        }
      }
      const lastFull = Math.floor(Nc);              // last whole term inside the span: its partial sum is the settled value
      const maxTerms = lastFull;
      drawAlternatingMode.maxTerms = maxTerms;

      // LEFT: Oscillating partial sums of 1 - 2r + 3r^2 - 4r^3 ... settling at +1/4
      lCtx.clearRect(0, 0, lw, lh);
      const padL = 48 * dpr, padR = 20 * dpr, padT = 26 * dpr, padB = 34 * dpr;
      const pW = lw - padL - padR;
      const pH = lh - padT - padB;

      const midY = padT + pH * 0.55;
      const yScale = pH * 0.16;                    // fixed for every r; big early swings are clipped at the plot edges
      const targetY = midY - 0.25 * yScale;
      const limitNow = 1 / ((1 + r) * (1 + r));
      const nowY = midY - limitNow * yScale;
      const xOf = n => padL + ((n - 1) / Nc) * pW;   // term Nc+1 sits at the right edge

      // Zero line
      lCtx.strokeStyle = 'rgba(255,255,255,0.16)';
      lCtx.beginPath();
      lCtx.moveTo(padL, midY);
      lCtx.lineTo(lw - padR, midY);
      lCtx.stroke();

      // +1/4 center line
      lCtx.save();
      lCtx.setLineDash([5 * dpr, 5 * dpr]);
      lCtx.strokeStyle = '#38bdf8';
      lCtx.lineWidth = 1.6 * dpr;
      lCtx.beginPath();
      lCtx.moveTo(padL, targetY);
      lCtx.lineTo(lw - padR, targetY);
      lCtx.stroke();
      lCtx.restore();
      lCtx.fillStyle = '#7dd3fc';
      lCtx.font = `${11 * dpr}px monospace`;
      lCtx.textAlign = 'right';   // right end, where the zigzag has settled
      lCtx.fillText('+1/4 (limit as r→1)', lw - padR - 4 * dpr, targetY + 14 * dpr);
      lCtx.textAlign = 'left';
      // where the curve settles at this r: 1/(1+r)²
      lCtx.strokeStyle = 'rgba(251,191,36,0.75)';
      lCtx.lineWidth = 1.2 * dpr;
      lCtx.beginPath();
      lCtx.moveTo(padL, nowY);
      lCtx.lineTo(lw - padR, nowY);
      lCtx.stroke();
      lCtx.fillStyle = '#fbbf24';
      lCtx.textAlign = 'right';
      lCtx.fillText(`settles at 1/(1+r)² = ${limitNow.toFixed(4)}`, lw - padR - 4 * dpr, nowY - 6 * dpr);
      lCtx.textAlign = 'left';
      // x-axis: first and last term
      lCtx.fillStyle = 'rgba(203,213,225,0.7)';
      lCtx.font = `${10 * dpr}px sans-serif`;
      lCtx.fillText('n = 1', padL, lh - 10 * dpr);
      lCtx.textAlign = 'right';
      lCtx.fillText(`n = ${lastFull}`, lw - padR, lh - 10 * dpr);
      lCtx.textAlign = 'left';

      // everything on the curve is clipped to the plot area
      lCtx.save();
      lCtx.beginPath();
      lCtx.rect(padL, padT, pW, pH);
      lCtx.clip();

      // Partial sums zigzag (one term past the right edge, so the clipped end slides smoothly)
      const nDraw = Math.ceil(Nc) + 1;
      let sum = 0;
      lCtx.strokeStyle = '#fbbf24';
      const t = Math.max(0, Math.min(1, (Nc - 24) / 96));    // line thins smoothly as the span grows
      lCtx.lineWidth = (2.4 - 1.0 * t) * dpr;
      lCtx.beginPath();
      for (let n = 1; n <= nDraw; n++) {
        const sign = (n % 2 === 1) ? 1 : -1;
        sum += sign * n * Math.pow(r, n - 1);
        const x = xOf(n);
        const y = midY - sum * yScale;
        if (n === 1) lCtx.moveTo(x, y);
        else lCtx.lineTo(x, y);
      }
      lCtx.stroke();

      // Dots: fade smoothly as their spacing shrinks; the dots at the end of the span stay visible,
      // and the next one fades in at the right edge (no popping)
      const spacing = pW / Nc;
      const aSpace = Math.max(0, Math.min(1, (spacing - 2 * dpr) / (4 * dpr)));
      const frame = { Nc, lastFull, spacing, aSpace, dots: 0, alphaSum: 0, endX: 0, endY: 0, nowY, targetY, yScale, lastSum: 0, r, alphas: [], sums: [] };
      sum = 0;
      for (let n = 1; n <= nDraw; n++) {
        const sign = (n % 2 === 1) ? 1 : -1;
        sum += sign * n * Math.pow(r, n - 1);
        const edge = Math.max(0, Math.min(1, Nc + 1 - n));          // fades in over the last step before the edge
        const tail = Math.max(0, Math.min(1, 1 - (Nc - n) / 2));     // keeps the end dots visible however tight the spacing
        const a = edge * Math.max(aSpace, tail);
        if (n === lastFull) frame.lastSum = sum;
        frame.alphas.push(a); frame.sums.push(sum);
        if (a < 0.02) continue;
        const x = xOf(n), y = midY - sum * yScale;
        lCtx.globalAlpha = a;
        lCtx.fillStyle = (n % 2 === 1) ? '#34d399' : '#fb7185';
        lCtx.beginPath();
        lCtx.arc(x, y, 3.5 * dpr, 0, Math.PI * 2);
        lCtx.fill();
        frame.dots++; frame.alphaSum += a;
        if (n === lastFull) { frame.endX = x; frame.endY = y; }
      }
      lCtx.globalAlpha = 1;
      lCtx.restore();
      drawAlternatingMode.frame = frame; window.__altFrame = frame;   // read-only numbers for checking the glide

      // Formal subtraction in the historical shortcut.
      rCtx.clearRect(0, 0, rw, rh);
      const altVal = 1 / ((1 + r) * (1 + r));
      const sVal = -altVal / 3;

      const boxes = [
        { label: 'Alternating expression', val: altVal, exact: '+1/4 as r→1', color: '#38bdf8', y: rh * 0.26 },
        { label: 'Divide by −3 in S − 4S', val: sVal, exact: '−1/12 as r→1', color: '#fb7185', y: rh * 0.68 }
      ];

      boxes.forEach(b => {
        rCtx.fillStyle = 'rgba(255,255,255,0.04)';
        rCtx.strokeStyle = b.color;
        rCtx.lineWidth = 1.6 * dpr;
        rCtx.beginPath();
        rCtx.roundRect(30 * dpr, b.y - 34 * dpr, rw - 60 * dpr, 68 * dpr, 12 * dpr);
        rCtx.fill();
        rCtx.stroke();

        rCtx.fillStyle = '#cbd5e1';
        rCtx.font = `${12 * dpr}px sans-serif`;
        rCtx.fillText(b.label, 46 * dpr, b.y - 10 * dpr);

        rCtx.fillStyle = b.color;
        rCtx.font = `bold ${15 * dpr}px monospace`;
        rCtx.fillText(`${b.val.toFixed(4)}   →   ${b.exact}`, 46 * dpr, b.y + 16 * dpr, rw - 92 * dpr);
      });
    }

    function setGlide(on) {
      playing = on;
      glide.setAttribute('aria-pressed', String(on));
      glide.textContent = on ? 'Pause glide' : 'Glide';
    }
    function frame(now) {
      queued = false;
      if (!details.open) { previous = undefined; return; }
      const delta = previous === undefined ? 0 : Math.min(80, now - previous);
      previous = now;
      time += delta / 1000;
      if (playing) {
        elapsed += delta;
        if (elapsed >= 30) {
          slider.value = Math.max(Number(slider.min), Number(slider.value) - .001 * Math.floor(elapsed / 15));
          elapsed %= 15;
          if (slider.value === slider.min) setGlide(false);
        }
      }
      eps = Number(slider.value); value.value = eps.toFixed(3);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (const c of [leftCanvas, rightCanvas]) {
        const w = Math.round(c.clientWidth * dpr), h = Math.round(c.clientHeight * dpr);
        if (w !== c.width || h !== c.height) { c.width = w; c.height = h; }
      }
      if (alternating) {
        lCtx.save();
        if (flipOn) lCtx.setTransform(-1, 0, 0, 1, leftCanvas.width, 0);
        drawAlternatingMode(); lCtx.restore();
      } else {
        drawCasimirMode();
      }
      if (playing || !alternating) schedule();
    }
    function schedule() {
      if (details.open && !queued) { queued = true; requestAnimationFrame(frame); }
    }
    glide.addEventListener('click', () => {
      setGlide(!playing);
      if (playing && slider.value === slider.min) slider.value = slider.max;
      schedule();
    });
    slider.addEventListener('input', () => { setGlide(false); schedule(); });
    details.addEventListener('toggle', () => {
      if (!details.open) { setGlide(false); previous = undefined; }
      schedule();
    });
    if (window.ResizeObserver) new ResizeObserver(schedule).observe(leftCanvas);
    window.addEventListener('resize', schedule);
  }
  setup(document.getElementById('sum-history'), true);
  setup(document.getElementById('sum-casimir'), false);
})();
