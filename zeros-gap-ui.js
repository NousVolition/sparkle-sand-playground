/* Copyright © 2026 NousVolition. All rights reserved. */
(function () {
  'use strict';
  const M = window.ZeroGapMath, abs = M.complex.abs;
  const revision = '4a1e2f0798c5186e8cbb118a7d57b6a84f5c2f8d';
  const lean = (file,line) => 'https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/'+revision+'/'+file+'#L'+line;
  const section = document.createElement('section'); section.id = 'tab-gap'; section.className = 'workspace';
  section.innerHTML = `
    <div class="gap-intro"><p class="gap-eyebrow">THE SPACE, FOLLOWED INTO ZETA</p>
      <h2>Where does the gap vanish?</h2>
      <p>Start with softened steps. Subtract their smooth background. Let both the horizontal position σ and the height t move, and look for a place where the remaining complex value is zero.</p>
      <p class="gap-formula">s = σ + it &nbsp; · &nbsp; G(s, ε) = ∑<sub>n≥1</sub> n<sup>−s</sup>e<sup>−εn</sup> − Γ(1−s) ε<sup>s−1</sup></p>
      <p class="gap-muted">At s = −1 this is your bars-minus-area space. For Re(s) &lt; 1, G(s, ε) approaches ζ(s) as ε approaches zero. The search below uses this gap, without a list of zero locations.</p>
    </div>
    <div class="gap-layout">
      <figure class="gap-card"><h3>Search the plane</h3>
        <div class="gap-controls"><label>Softening ε <select id="gap-epsilon"><option>.2</option><option>.1</option><option selected>.05</option><option>.025</option></select></label><button id="gap-locate" type="button">Read the estimated zero</button></div>
        <canvas id="gap-map" role="img" aria-describedby="gap-map-caption"></canvas>
        <div class="gap-legend"><span>○ Finite-ε zero</span><span>◇ Estimated ε → 0 zero</span><span>+ Your reading</span></div>
        <figcaption id="gap-map-caption">Brightness shows smaller |G| on a sampled grid. The dashed line marks σ = ½. Click anywhere to read that point.</figcaption>
      </figure>
      <section class="gap-card" aria-labelledby="gap-reading-title"><h3 id="gap-reading-title">Read one point</h3>
        <div class="gap-controls"><label>σ <input id="gap-sigma" type="number" min="0.1" max="0.9" step="0.01" value="0.5"></label><label>t <input id="gap-height" type="number" min="12" max="16" step="0.01" value="14"></label><button id="gap-read" type="button">Read point</button></div>
        <p id="gap-input-error" role="alert"></p>
        <dl id="gap-readings" aria-live="polite">
          <div><dt>Gap at this ε</dt><dd id="gap-raw"></dd></div>
          <div><dt>Gap extrapolated toward ε = 0</dt><dd id="gap-limit"></dd></div>
          <div><dt>Independent ζ evaluation</dt><dd id="gap-reference"></dd></div>
          <div><dt>Difference: extrapolation versus reference</dt><dd id="gap-reference-error"></dd></div>
        </dl>
        <p class="gap-muted">The reference uses Euler–Maclaurin summation. It is checked afterwards; it does not guide the search. Extrapolation combines five successive halvings of ε.</p>
      </section>
    </div>
    <section class="gap-card"><h3>Does the location settle as the softening changes?</h3>
      <p>Both coordinates are free. A finite amount of softening shifts the zero left; the limit estimate returns close to σ = ½.</p>
      <div class="gap-table-wrap"><table><thead><tr><th>ε</th><th>Finite-ε σ</th><th>Finite-ε t</th><th>Limit estimate σ</th><th>Limit estimate t</th></tr></thead><tbody id="gap-root-rows"></tbody></table></div>
      <p class="gap-status" id="gap-status"></p>
      <p class="gap-muted">This tests one window: 0.1 ≤ σ ≤ 0.9 and 12 ≤ t ≤ 16. It does not prove that every zero is on the critical line, or that the search finds every zero. The reported digits are numerical estimates, not certified intervals.</p>
      <button id="gap-export" type="button">Save this experiment</button>
    </section>
    <details class="gap-card" id="gap-leech"><summary>Golay → Leech → a missing coefficient</summary>
      <p>Your Leech lattice has no vectors of squared length 2. In its theta series, that becomes the missing q term:</p>
      <p class="gap-formula">Θ<sub>Λ₂₄</sub>(τ) = E₄(τ)³ − 720 Δ(τ) = 1 + 0q + 196560q² + …</p>
      <p class="gap-muted">q = e<sup>2πiτ</sup>; a vector of squared length 2k contributes to q<sup>k</sup>. The existing Lean coordinates are scaled by √8, so their squared lengths are divided by 16 to obtain k.</p>
      <div class="gap-table-wrap"><table><thead><tr><th>Term</th><th>Computed coefficient</th><th>Existing lattice count</th></tr></thead><tbody id="gap-theta-rows"></tbody></table></div>
      <p>These coefficients are recomputed with exact integers from E₄ and the product Δ = q ∏<sub>n≥1</sub>(1−qⁿ)²⁴. Agreement through q⁵ checks the finite counts. It does not formalize the whole theta identity or establish a constraint on zeta zeros.</p>
      <h3>A weight guard for the Golay input</h3>
      <label for="golay-word">24 bits, most significant bit first</label><input id="golay-word" value="000000000000000011111111" maxlength="24" inputmode="numeric" spellcheck="false">
      <p id="golay-result" role="status"></p>
      <p class="gap-muted">Weights 0, 8, 12, 16 and 24 are allowed. Membership must also pass: eight ones alone are not enough. This guard uses the playground's proved Golay generator convention.</p>
      <p>Your construction glues the scaled base (√2 E₈)³ with 4,096 cosets. Scaling raises the old roots from squared length 2 to 4; gluing adds vectors. It does not erase old ones.</p>
      <p class="gap-source"><a href="${lean('LeechThreeE8.lean',85)}" target="_blank" rel="noopener">Lean: equality of the constructed lattices</a> · <a href="https://people.math.harvard.edu/~elkies/M272.19/oct28.pdf" target="_blank" rel="noopener">Theta-series identity</a> · <a href="https://people.math.harvard.edu/~elkies/M272.19/nov04.pdf" target="_blank" rel="noopener">Leech shell counts</a></p>
    </details>
    <section class="gap-card"><h3>What is established?</h3>
      <p>Lean proves the real space at s = −1, the cancellation of the two smooth areas, the softened alternating identity, and the limit's agreement with ζ(−1). The complex gap used in this search is a further numerical experiment, supported by the polylogarithm expansion; it has not yet been formalized in this library.</p>
      <p class="gap-source"><a href="${lean('RamanujanGap.lean',113)}" target="_blank" rel="noopener">Merged Lean result</a> · <a href="https://dlmf.nist.gov/25.12.E12" target="_blank" rel="noopener">Complex expansion: DLMF 25.12.12</a> · <a href="docs/zeros-gap-check.json" target="_blank" rel="noopener">Saved numerical checks</a> · <a href="https://github.com/NousVolition/sparkle-sand-playground/blob/main/docs/zeros-gap-experiment.md" target="_blank" rel="noopener">Methods and limits</a></p>
      <p class="gap-muted">The other three views use illustrative constructions and stored zero ordinates. Their drum bars are not an independently solved drum spectrum.</p>
    </section>`;
  document.getElementById('tab-spacing').before(section);
  const button = document.createElement('button'); button.className='tab-btn'; button.dataset.tab='gap'; button.textContent='Gap → Zeta';
  document.querySelector('header .tabs').prepend(button);
  function show() {
    document.querySelectorAll('.tab-btn, .workspace').forEach(el=>el.classList.remove('active'));
    button.classList.add('active'); section.classList.add('active'); draw();
  }
  button.addEventListener('click',show);
  const by = id=>document.getElementById(id), cache = new Map();
  let epsilon=.05, point=[.5,14], map, current;
  const num = n=>n.toFixed(10), complex=z=>`${z[0].toExponential(6)} ${z[1]<0?'−':'+'} ${Math.abs(z[1]).toExponential(6)}i`;
  function roots(e) { if(!cache.has(e))cache.set(e,{epsilon:e,raw:M.search(e),limit:M.search(e,5)});return cache.get(e); }
  function read() {
    const sigma=Number(by('gap-sigma').value),t=Number(by('gap-height').value);
    if(!Number.isFinite(sigma)||!Number.isFinite(t)||sigma<.1||sigma>.9||t<12||t>16){by('gap-input-error').textContent='Use 0.1 ≤ σ ≤ 0.9 and 12 ≤ t ≤ 16.';return;}
    by('gap-input-error').textContent='';point=[sigma,t];
    const raw=M.gap(point,epsilon),limit=M.extrapolate(point,epsilon).value,reference=M.zetaReference(point);
    by('gap-raw').textContent=complex(raw.value);by('gap-limit').textContent=complex(limit);by('gap-reference').textContent=complex(reference);
    by('gap-reference-error').textContent=abs(M.complex.sub(limit,reference)).toExponential(3);
    current={epsilon,point,raw,limit,reference,roots:roots(epsilon)};draw();
  }
  function draw() {
    if(!map)return;const canvas=by('gap-map'),rect=canvas.getBoundingClientRect(),w=rect.width,h=rect.height;if(!w||!h)return;
    const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    const c=canvas.getContext('2d');c.scale(dpr,dpr);
    const left=44,right=w-14,top=16,bottom=h-42,px=s=>left+(s-.1)/.8*(right-left),py=t=>bottom-(t-12)/4*(bottom-top);
    c.save();c.beginPath();c.rect(left,top,right-left,bottom-top);c.clip();
    for(let j=0;j<map.rows;j++)for(let i=0;i<map.cols;i++){
      const v=map.values[j*map.cols+i],strength=Math.max(0,Math.min(1,(1-Math.log10(Math.max(v,1e-9)))/4));
      c.fillStyle=`hsl(${230-55*strength} 55% ${12+55*strength}%)`;
      const dx=(right-left)/(map.cols-1),dy=(bottom-top)/(map.rows-1);c.fillRect(left+i*dx-dx/2,bottom-j*dy-dy/2,dx+1,dy+1);
    }
    c.strokeStyle='#d3dbe8';c.setLineDash([4,5]);c.beginPath();c.moveTo(px(.5),top);c.lineTo(px(.5),bottom);c.stroke();c.setLineDash([]);
    const r=roots(epsilon);c.lineWidth=2.5;c.strokeStyle='#ffbe78';c.beginPath();c.arc(px(r.raw.sigma),py(r.raw.t),7,0,2*Math.PI);c.stroke();
    const x=px(r.limit.sigma),y=py(r.limit.t);c.strokeStyle='#7ae3dc';c.beginPath();c.moveTo(x,y-9);c.lineTo(x+9,y);c.lineTo(x,y+9);c.lineTo(x-9,y);c.closePath();c.stroke();
    const a=px(point[0]),b=py(point[1]);c.strokeStyle='white';c.lineWidth=1.5;c.beginPath();c.moveTo(a-6,b);c.lineTo(a+6,b);c.moveTo(a,b-6);c.lineTo(a,b+6);c.stroke();c.restore();
    c.fillStyle='#c6d4e6';c.font='13px system-ui';c.textAlign='center';for(const s of [.1,.3,.5,.7,.9])c.fillText(s,px(s),h-23);
    c.fillText('Horizontal position σ', (left+right)/2,h-4);c.textAlign='right';for(const t of [12,13,14,15,16])c.fillText(t,left-8,py(t)+4);
    c.fillText('t',left-10,top-3);
    canvas.setAttribute('aria-label',`Sampled gap magnitudes. At epsilon ${epsilon}, zero near sigma ${num(r.raw.sigma)}, height ${num(r.raw.t)}; limit estimate sigma ${num(r.limit.sigma)}, height ${num(r.limit.t)}.`);
  }
  function change() {
    epsilon=Number(by('gap-epsilon').value);map=M.grid(epsilon);const r=roots(epsilon);
    by('gap-status').textContent=`At ε = ${epsilon}, |G| at the located point is ${r.raw.residual.toExponential(2)}; the extrapolated residual is ${r.limit.residual.toExponential(2)}. ${r.raw.converged&&r.limit.converged?'Both searches met the numerical residual target.':'A search did not meet the residual target.'}`;
    read();
  }
  by('gap-root-rows').innerHTML=[.2,.1,.05,.025].map(e=>{const r=roots(e);return `<tr><td>${e}</td><td>${num(r.raw.sigma)}</td><td>${num(r.raw.t)}</td><td>${num(r.limit.sigma)}</td><td>${num(r.limit.t)}</td></tr>`;}).join('');
  by('gap-epsilon').addEventListener('change',change);by('gap-read').addEventListener('click',read);
  by('gap-locate').addEventListener('click',()=>{const r=roots(epsilon).limit;by('gap-sigma').value=r.sigma;by('gap-height').value=r.t;read();});
  by('gap-map').addEventListener('click',event=>{const box=by('gap-map').getBoundingClientRect(),x=event.clientX-box.left,y=event.clientY-box.top;
    const sigma=.1+.8*(x-44)/(box.width-58),t=12+4*(box.height-42-y)/(box.height-58);
    if(sigma<.1||sigma>.9||t<12||t>16)return;by('gap-sigma').value=sigma.toFixed(6);by('gap-height').value=t.toFixed(6);read();});
  by('gap-export').addEventListener('click',()=>{const payload={method:'damped sum minus Gamma area; five-level extrapolation',scope:'finite window, numerical estimates',...current,allRoots:[...cache.values()]};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='zeros-gap-experiment.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  const shellCounts=[1,0,196560,16773120,398034000,4629381120];
  by('gap-theta-rows').innerHTML=M.thetaCoefficients().theta.map((v,n)=>`<tr><td>q${n===0?'⁰':n===1?'':'^'+n}</td><td>${v.toLocaleString('en-US')}</td><td>${shellCounts[n].toLocaleString('en-US')}</td></tr>`).join('');
  function guard(){const r=M.guard(by('golay-word').value);by('golay-result').textContent=(r.weight===null?'':'Weight '+r.weight+'. ')+r.reason;}
  by('golay-word').addEventListener('input',guard);guard();
  new ResizeObserver(draw).observe(by('gap-map'));change();show();
})();
