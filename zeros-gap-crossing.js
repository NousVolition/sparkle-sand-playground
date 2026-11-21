/* Copyright © 2026 NousVolition. All rights reserved. */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./zeros-gap-math.js'));
  else { root.ZeroGapCrossing = factory(root.ZeroGapMath); root.ZeroGapCrossing.mount(); }
})(typeof globalThis === 'undefined' ? this : globalThis, function (M) {
  'use strict';
  // Only the horizontal offset is exposed. Neither the plane controls nor a
  // slider reading changes this pass's height, softening, or estimated center.
  function createPass() {
    const epsilon = .05, root = M.search(epsilon);
    if (!root.converged) throw new Error('The fixed pass could not locate its center.');
    const config = Object.freeze({ epsilon, height: root.t, center: root.sigma,
      centerResidual: root.residual, minOffset: -.02, maxOffset: .02, step: .0001 });
    function read(offset) {
      if (!Number.isFinite(offset) || offset < config.minOffset || offset > config.maxOffset)
        throw new RangeError('Horizontal offset must be between -0.02 and +0.02.');
      const sigma = config.center + offset, result = M.gap([sigma, config.height], config.epsilon);
      return { offset, sigma, height: config.height, epsilon: config.epsilon,
        real: result.value[0], imaginary: result.value[1], magnitude: M.complex.abs(result.value),
        terms: result.terms, tailBound: result.tailBound };
    }
    function profile() { return Array.from({length:161}, (_,i)=>read((i-80)/4000)); }
    return Object.freeze({config, read, profile});
  }
  function mount() {
    const intro = document.querySelector('#tab-gap .gap-intro');
    if (!intro) return;
    const pass = createPass(), cfg = pass.config, samples = pass.profile();
    const panel = document.createElement('section'); panel.id = 'gap-crossing'; panel.className = 'gap-card';
    panel.setAttribute('aria-labelledby','cross-title');
    panel.innerHTML = `
      <p class="gap-eyebrow">ONE HEIGHT · ONE SOFTENING · BOTH SIDES</p>
      <h3 id="cross-title">Go past where the gap closes</h3>
      <p>Move left or right through the estimated zero. The size falls toward zero and rises again; the real part changes from negative to positive.</p>
      <div class="cross-fixed"><span>Height t <strong id="cross-height"></strong></span><span>Softening ε <strong>0.05</strong></span><span>Both stay fixed</span></div>
      <div class="cross-plots">
        <figure><h4>Gap size <span>|G|</span></h4><canvas id="cross-size-chart" role="img" aria-describedby="cross-size-caption"></canvas><figcaption id="cross-size-caption">Size is never negative. It does not tell you the sign of the real part.</figcaption></figure>
        <figure><h4>Real part of the gap <span>Re G</span></h4><canvas id="cross-real-chart" role="img" aria-describedby="cross-real-caption"></canvas><figcaption id="cross-real-caption">The signed real component crosses the horizontal zero line.</figcaption></figure>
      </div>
      <label for="cross-offset">Move horizontally, keeping height and softening fixed</label>
      <input id="cross-offset" type="range" min="-0.02" max="0.02" step="0.0001" value="-0.01">
      <div class="cross-slider-ends"><span>Before · σ ≈ ${(cfg.center-.02).toFixed(5)}</span><span>Beyond · σ ≈ ${(cfg.center+.02).toFixed(5)}</span></div>
      <div class="cross-buttons"><button type="button" data-cross-offset="-0.01">Before</button><button type="button" data-cross-offset="0">Near zero</button><button type="button" data-cross-offset="0.01">Beyond</button></div>
      <dl class="cross-readings" aria-live="polite" aria-atomic="true">
        <div><dt>Horizontal position σ</dt><dd id="cross-position"></dd></div>
        <div><dt>Gap size |G|</dt><dd id="cross-size"></dd></div>
        <div><dt>Real part Re G</dt><dd id="cross-real"></dd></div>
      </dl>
      <p id="cross-meaning" class="gap-status"></p>
      <p class="gap-muted">Here σ is the real part of the input s; Re G is the real part of its gap reading. The imaginary part of the current gap is <span id="cross-imaginary"></span>.</p>
      <details class="cross-evidence"><summary>The numerical reading and the Lean statement</summary>
        <p>The center is found from this softened gap, at σ ≈ <span id="cross-center"></span>. Its computed size is <span id="cross-residual"></span>, not an exact zero. This is the finite-ε gap; its center is not asserted to be a zero of ζ itself.</p>
        <p>Lean proves: if f(c) = 0 exactly and the real part of f is strictly increasing on an interval, then before c the real part is negative, and after c it is positive. The gap size is positive on both sides.</p>
        <pre><code>theorem after_zero (f : ℝ → ℂ) {a b c y : ℝ}
    (hmono : StrictMonoOn (fun r => (f r).re) (Set.Icc a b))
    (hc : c ∈ Set.Icc a b) (hz : f c = 0)
    (hy : y ∈ Set.Icc a b) (hcy : c &lt; y) :
    0 &lt; (f y).re ∧ 0 &lt; ‖f y‖</code></pre>
        <p>Those exact-zero and monotonicity assumptions have not been proved for this numerical curve. Lean also checks the counterexample f(x) = x + i: its real part changes sign, but the whole value never reaches zero.</p>
        <p class="gap-source" id="cross-proof-link"><a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/394543d34125c52b41813ee2917158f2058808ae/GapCrossing.lean#L26" target="_blank" rel="noopener">Lean: both sides of a zero and the sign-change control</a> · Verification by Codex using Lean 4.34.0-rc2; <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/actions/runs/44845361754" target="_blank" rel="noopener">full build and axiom audit passed</a>.</p>
        <p class="gap-source"><a href="docs/zeros-gap-crossing-check.json" target="_blank" rel="noopener">Saved numerical checks</a></p>
      </details>
      <button id="cross-export" type="button">Save this pass</button>`;
    intro.after(panel);
    const by = id=>panel.querySelector('#'+id);
    const signed = n=>(n < 0 ? '−' : '+')+Math.abs(n).toExponential(7);
    by('cross-height').textContent = cfg.height.toFixed(11);
    by('cross-center').textContent = cfg.center.toFixed(12);
    by('cross-residual').textContent = cfg.centerResidual.toExponential(5);
    let current;
    function plot(id,key,color) {
      const canvas=by(id),w=canvas.clientWidth,h=canvas.clientHeight;
      if(w<1||h<1) return;
      const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
      const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
      const left=62,right=w-12,top=18,bottom=h-50;
      const ymin=key==='real'?-.018:-.001,ymax=.018;
      const px=offset=>left+(offset+.02)/.04*(right-left),py=value=>bottom-(value-ymin)/(ymax-ymin)*(bottom-top);
      ctx.font='14px system-ui';ctx.fillStyle='#b3c2da';ctx.textAlign='right';
      for(const y of key==='real'?[-.015,0,.015]:[0,.005,.01,.015]) {
        ctx.strokeStyle=y===0?'#b3c2da':'#34465c';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left,py(y));ctx.lineTo(right,py(y));ctx.stroke();ctx.fillText(y.toFixed(3),left-8,py(y)+5);
      }
      ctx.textAlign='center';
      for(const offset of [-.02,0,.02]) { ctx.textAlign=offset===.02?'right':'center'; ctx.fillText((cfg.center+offset).toFixed(3),px(offset),h-25); }
      ctx.textAlign='center';
      ctx.fillText('Horizontal position σ',(left+right)/2,h-4);
      ctx.strokeStyle='#8d9bb1';ctx.setLineDash([4,5]);ctx.beginPath();ctx.moveTo(px(0),top);ctx.lineTo(px(0),bottom);ctx.stroke();ctx.setLineDash([]);
      ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.beginPath();samples.forEach((p,i)=>i?ctx.lineTo(px(p.offset),py(p[key])):ctx.moveTo(px(p.offset),py(p[key])));ctx.stroke();
      ctx.strokeStyle='#ffffff77';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px(current.offset),top);ctx.lineTo(px(current.offset),bottom);ctx.stroke();
      ctx.fillStyle=color;ctx.strokeStyle='#0b1322';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px(current.offset),py(current[key]),6,0,Math.PI*2);ctx.fill();ctx.stroke();
      canvas.setAttribute('aria-label',`${key==='real'?'Real part':'Gap size'} at horizontal position ${current.sigma}: ${current[key]}. Dashed vertical line: estimated zero.`);
    }
    function draw() { plot('cross-size-chart','magnitude','#7ae3dc'); plot('cross-real-chart','real','#ffbe78'); }
    function update() {
      current=pass.read(Number(by('cross-offset').value));
      by('cross-position').textContent=current.sigma.toFixed(12);
      by('cross-size').textContent=current.magnitude.toExponential(7);
      by('cross-real').textContent=signed(current.real);by('cross-imaginary').textContent=signed(current.imaginary);
      const where=current.offset<0?'Before':current.offset>0?'Beyond':'Near';
      by('cross-meaning').textContent=current.offset===0
        ?'Near the estimated zero: both components are very small. The displayed residual is the computed value.'
        :`${where} the estimated zero: the real part is ${current.real<0?'negative':'positive'}, and the gap has positive size.`;
      by('cross-offset').setAttribute('aria-valuetext',`σ ${current.sigma.toFixed(6)}; ${where.toLowerCase()} the estimated zero`);
      panel.querySelectorAll('[data-cross-offset]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.crossOffset)===current.offset)));
      draw();
    }
    by('cross-offset').addEventListener('input',update);
    panel.querySelectorAll('[data-cross-offset]').forEach(b=>b.addEventListener('click',()=>{by('cross-offset').value=b.dataset.crossOffset;update();}));
    by('cross-export').addEventListener('click',()=>{
      const payload={method:'Fixed-height slice of the softened complex gap',config:cfg,reading:current,profile:samples,
        limitations:'Floating-point observations; no certified exact root or interval monotonicity. The Lean result is conditional.'};
      const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='zeros-gap-fixed-pass.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    });
    new ResizeObserver(draw).observe(by('cross-size-chart'));update();
  }
  return {createPass,mount};
});
