/* Copyright © 2026 NousVolition. All rights reserved. */
(function (root) {
  'use strict';
  const math = typeof module === 'object' && module.exports ? require('./zeros-gap-math.js') : root.ZeroGapMath;
  const sigmaMin = 0.25, sigmaMax = 0.75, tMin = 12, tMax = 68;
  const columns = 9, intervals = 224, middle = (columns - 1) / 2;
  // Four damping levels, 0.008 down to 0.001. Even at t = 68, εt/(2π) < 0.087.
  const epsilon = 0.008, levels = 4;
  const sigmaAt = u => sigmaMin + (sigmaMax - sigmaMin) * u;
  const tAt = v => tMin + (tMax - tMin) * v;
  const xFor = (sigma, width) => width * (sigma - sigmaMin) / (sigmaMax - sigmaMin);
  const yFor = (t, height) => height * (t - tMin) / (tMax - tMin);

  function theta(t) {
    return t / 2 * Math.log(t / (2 * Math.PI)) - t / 2 - Math.PI / 8
      + 1 / (48 * t) + 7 / (5760 * t ** 3);
  }

  function criticalValue(t, damping) {
    const [re, im] = math.extrapolate([0.5, t], damping, levels).value;
    const angle = theta(t);
    return re * Math.cos(angle) - im * Math.sin(angle);
  }

  function crossing(left, right, damping) {
    let lo = left.t, hi = right.t, loValue = left.re[middle];
    let x = hi, fx = right.re[middle], previous = lo, previousValue = loValue;
    for (let i = 0; i < 40; i++) {
      const secant = x - fx * (x - previous) / (fx - previousValue);
      const t = i < 8 && secant > lo && secant < hi ? secant : (lo + hi) / 2;
      const value = criticalValue(t, damping);
      if (Math.abs(value) < 1e-11 || hi - lo < 1e-10) return t;
      if (Math.sign(value) === Math.sign(loValue)) { lo = t; loValue = value; }
      else hi = t;
      previous = x; previousValue = fx; x = t; fx = value;
    }
    return (lo + hi) / 2;
  }

  async function buildField(damping = epsilon, yieldWork) {
    const sigmas = Array.from({length: columns}, (_, i) => sigmaAt(i / (columns - 1)));
    const evaluateRow = math.prepareExtrapolatedRow(sigmas, damping, levels);
    function sample(t) {
      const angle = theta(t), c = Math.cos(angle), s = Math.sin(angle);
      const values = evaluateRow(t);
      return {t, re: values.map(([x,y]) => c*x - s*y), im: values.map(([x,y]) => s*x + c*y)};
    }

    const rows = [], zeros = [];
    let sliceStart = performance.now();
    for (let j = 0; j <= intervals; j++) {
      const current = sample(tAt(j / intervals)), previous = rows[rows.length - 1];
      if (previous && previous.re[middle] * current.re[middle] < 0) {
        const t = crossing(previous, current, damping);
        zeros.push(t);
        // The interpolated field also gets a measured row at the crossing.
        // Its complex values come from the gap, including the center sample.
        rows.push(sample(t));
      }
      if (current.re[middle] === 0) zeros.push(current.t);
      rows.push(current);
      if (yieldWork && (j % 4 === 3 || performance.now() - sliceStart >= 8)) {
        await yieldWork();
        sliceStart = performance.now();
      }
    }
    return {rows, zeros};
  }

  function palette(target) {
    const base = [5, 8, 17], bytes = new Uint8ClampedArray(256 * 4);
    for (let i = 0; i < 256; i++) {
      for (let ch = 0; ch < 3; ch++) bytes[4*i + ch] = base[ch] + (target[ch] - base[ch]) * i / 255;
      bytes[4*i + 3] = 255;
    }
    return new Uint32Array(bytes.buffer);
  }
  const teal = palette([42, 205, 180]), purple = palette([170, 113, 238]);
  const lerp = (a, b, weight) => a + (b - a) * weight;

  function makeRaster(field, width, height) {
    const re = new Float32Array(width * height), im = new Float32Array(re.length);
    const shade = new Uint8Array(re.length);
    let row = 0;
    for (let y = 0; y < height; y++) {
      const t = tAt((y + 0.5) / height);
      while (field.rows[row + 1].t < t) row++;
      const a = field.rows[row], b = field.rows[row + 1], v = (t - a.t) / (b.t - a.t);
      const rowRe = a.re.map((value, i) => lerp(value, b.re[i], v));
      const rowIm = a.im.map((value, i) => lerp(value, b.im[i], v));
      for (let x = 0; x < width; x++) {
        const col = (x + 0.5) / width * (columns - 1), i = Math.floor(col), u = col - i;
        const p = y * width + x;
        re[p] = lerp(rowRe[i], rowRe[i+1], u);
        im[p] = lerp(rowIm[i], rowIm[i+1], u);
        const magnitude = Math.hypot(re[p], im[p]);
        shade[p] = Math.round(255 * magnitude / (0.8 + magnitude));
      }
    }
    return {re, im, shade};
  }

  function colorFrame(raster, phase, pixels) {
    const c = Math.cos(phase), s = Math.sin(phase), {re, im, shade} = raster;
    for (let i = 0; i < pixels.length; i++) {
      pixels[i] = (c * re[i] - s * im[i] >= 0 ? teal : purple)[shade[i]];
    }
  }

  function createPlot(canvas) {
    const ctx = canvas.getContext('2d');
    let pending, field, raster, image, pixels, start;
    return function draw(time, probe) {
      const width = canvas.clientWidth, height = canvas.clientHeight;
      if (!width || !height) return;
      const dpr = window.devicePixelRatio || 1;
      const backingWidth = Math.round(width * dpr), backingHeight = Math.round(height * dpr);
      if (canvas.width !== backingWidth || canvas.height !== backingHeight) {
        canvas.width = backingWidth;
        canvas.height = backingHeight;
      }
      ctx.setTransform(backingWidth / width, 0, 0, backingHeight / height, 0, 0);
      ctx.clearRect(0, 0, width, height);
      if (!field) {
        if (!pending) {
          const yieldWork = () => new Promise(resolve => setTimeout(resolve, 0));
          pending = buildField(epsilon, yieldWork).then(result => { field = result; });
        }
        ctx.fillStyle = '#c5d5e6';
        ctx.font = '14px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Computing crossings from Michele’s gap…', width / 2, height / 2);
        return;
      }

      const yScale = backingHeight / height, topPixel = Math.round(24 * yScale);
      const rasterHeight = Math.round((height - 20) * yScale) - topPixel;
      const top = topPixel / yScale, plotHeight = rasterHeight / yScale;
      if (!raster || image.width !== backingWidth || image.height !== rasterHeight) {
        raster = makeRaster(field, backingWidth, rasterHeight);
        image = ctx.createImageData(backingWidth, rasterHeight);
        pixels = new Uint32Array(image.data.buffer);
      }
      if (start === undefined) start = time;
      colorFrame(raster, (time - start) * 0.00024, pixels);
      ctx.putImageData(image, 0, topPixel);

      const center = xFor(0.5, width), probeX = xFor(probe, width);
      ctx.strokeStyle = '#e0e8f6';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(probeX, top);
      ctx.lineTo(probeX, top + plotHeight);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.textAlign = 'center';
      ctx.font = '600 12px system-ui';
      ctx.fillStyle = '#fbe49f';
      ctx.fillText('σ = ½', center, 16);
      ctx.fillStyle = '#d3dbea';
      ctx.fillText('probe ' + probe.toFixed(2), probeX, height - 5);
      ctx.textAlign = 'left';
      ctx.fillText('t = ' + tMin, 7, 16);
      ctx.fillText('t = ' + tMax, 7, height - 5);
      ctx.font = '12px system-ui';
      field.zeros.forEach((zero, i) => {
        const y = top + yFor(zero, plotHeight), side = i % 2 === 0 ? 1 : -1;
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(center, y, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.textAlign = side > 0 ? 'left' : 'right';
        ctx.fillStyle = '#eff5fb';
        ctx.fillText(zero.toFixed(2), center + 8 * side, y + 4);
      });
    };
  }

  const api = {buildField, makeRaster, colorFrame, createPlot, theta};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ZeroGapTightrope = api;
})(typeof globalThis === 'object' ? globalThis : this);
