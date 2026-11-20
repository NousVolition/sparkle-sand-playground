/* Copyright © 2026 NousVolition. All rights reserved. */
/* Integer decomposition is replayed separately; canvas projections are not Lean proofs. */
(function (global) {
  'use strict';
  const data = global.LEECH_THREE_E8_DATA;
  const mod = (x,n) => ((x % n) + n) % n;
  function toLean(v) { return data.leanToPlay.map(j => v[j]); }
  function label(v) {
    let mask=0;
    for(let i=0;i<12;i++) {
      const r=mod(data.readout[i].reduce((s,c,j)=>s+c*v[j],0),8);
      if(r!==0 && r!==4) throw new Error('Vector has no binary glue label.');
      if(r===4) mask|=1<<i;
    }
    return mask;
  }
  function shift(mask) { return Array.from({length:24},(_,j)=>data.glue.reduce((s,g,i)=>s+((mask>>i)&1)*g[j],0)); }
  function decompose(playVector) {
    const v=toLean(playVector), mask=label(v), g=shift(mask), remainder=v.map((x,j)=>x-g[j]);
    const coefficients=Array.from({length:24},(_,i)=>remainder.reduce((s,x,j)=>s+x*data.inverseTimes8[j][i],0)/8);
    return {v,mask,shift:g,coefficients,blocks:data.blocks.map(block=>block.map(j=>v[j]))};
  }
  function roots() {
    const out=[];
    for(let i=0;i<8;i++) for(let j=i+1;j<8;j++) for(const a of [-4,4]) for(const b of [-4,4]) {
      const v=Array(8).fill(0);v[i]=a;v[j]=b;out.push(v);
    }
    for(let m=0;m<256;m++) {
      let n=0;for(let k=0;k<8;k++)n+=(m>>k)&1;
      if(n%2===0)out.push(Array.from({length:8},(_,k)=>(m>>k)&1?-2:2));
    }
    return out;
  }
  function plane(n) {
    const x=Array.from({length:n},(_,j)=>Math.cos((j+.31)*Math.PI*2/n)+.43*Math.cos(j*6*Math.PI/n+.2));
    const y=Array.from({length:n},(_,j)=>Math.sin((j+.31)*Math.PI*2/n)+.39*Math.sin(j*6*Math.PI/n+.7));
    const nx=Math.hypot(...x);x.forEach((v,j)=>x[j]=v/nx);
    const dot=x.reduce((s,v,j)=>s+v*y[j],0);y.forEach((v,j)=>y[j]=v-dot*x[j]);
    const ny=Math.hypot(...y);y.forEach((v,j)=>y[j]=v/ny);
    return [x,y];
  }
  const rootVectors=roots(), plane8=plane(8), colors=['#92e2c7','#8caef1','#edaccb'];
  const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
  function mount({vecs,shellOf,N}) {
    const proof='https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/8d520965e87e391ae4ce31bb5ee398733e8781bf/';
    const symmetryProof='https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/a0498c80c24b1e14925e25233afc93b235429e7b/';
    const nav=document.createElement('nav');nav.className='e8-nav';nav.setAttribute('aria-label','Leech views');
    nav.innerHTML='<span class="e8-brand">THE LEECH LATTICE</span><div class="e8-modes"><button id="e8Mode" aria-pressed="true">Three E₈</button><button id="e8Original" aria-pressed="false">23-fold view</button></div>';
    const page=document.createElement('main');page.className='e8-page';page.id='e8Construction';
    page.innerHTML=`
      <div class="e8-heading"><div><div class="e8-kicker">An eight-dimensional building block, three times</div><h1>Three E₈s, glued together.</h1><p class="e8-intro">Three blocks of eight coordinates. Twelve switches choose how they fit together. The result is the same Leech lattice, with all 196,560 shortest vectors.</p></div><a class="e8-proof-badge" href="${proof}LeechThreeE8.lean#L85" target="_blank" rel="noopener noreferrer">Construction proved in Lean ↗</a></div>
      <section class="e8-blocks" aria-label="The three eight-dimensional components">
        ${['I','II','III'].map((name,i)=>`<article class="e8-block"><header><h2>E₈ <small>${name}</small></h2><span>8 COORDINATES</span></header><canvas id="e8Root${i}" role="img" aria-label="Two-dimensional projection of 240 scaled E8 roots, with the selected component highlighted"></canvas><div class="e8-coords" id="e8Coords${i}"></div><footer><span>Squared length of component</span><span class="e8-energy" id="e8Energy${i}">—</span></footer></article>`).join('')}
      </section>
      <section class="e8-glue" aria-label="Choose a gluing shift"><div><h2>One of 4,096 allowed shifts</h2><p>Twelve on/off choices. Each switch adds one glue vector.</p></div><div class="e8-bits" role="group" aria-label="Glue switches">${Array.from({length:12},(_,i)=>`<button data-glue="${i}" aria-label="Glue switch ${i+1}" aria-pressed="false">0</button>`).join('')}</div></section>
      <div class="e8-bottom"><section class="e8-shell" aria-label="Combined Leech projection"><div class="e8-shell-top"><div><h2>One lattice.</h2><p id="e8CloudCount">196,560 shortest vectors · 24D → 2D</p></div><span class="e8-kicker" id="e8ViewLabel">FULL SHELL</span></div><canvas id="e8Cloud" role="img" aria-label="Leech shortest-vector projection. Click a point to inspect it, or use Previous and Next vector."></canvas><p id="e8Empty" class="e8-empty" hidden>This shift has no vectors of squared length 32.<br>It still contains infinitely many lattice vectors.</p><div class="e8-shell-controls"><button id="e8Filter" aria-pressed="false">Show this shift</button><label for="e8Turn">Turn the view <input id="e8Turn" type="range" min="0" max="6.28" step=".02" value="0"></label></div></section>
      <aside class="e8-inspect" aria-label="Selected vector"><div class="e8-kicker">Follow one vector</div><h2 id="e8SelectedTitle">Its three pieces</h2><p id="e8SelectedDescription">The highlighted point splits into the three components above. Their squared lengths add up to 32.</p><div class="e8-equation" aria-live="polite" aria-atomic="true"><span id="e8Sum0">8</span><i>+</i><span id="e8Sum1">8</span><i>+</i><span id="e8Sum2">16</span><i>=</i><strong id="e8SumTotal">32</strong></div><dl class="e8-metrics"><div><dt>Glue label (0–4,095)</dt><dd id="e8Label">—</dd></div><div><dt>Vectors in this shift · counted</dt><dd id="e8ClassCount">—</dd></div><div><dt>Selected vector</dt><dd id="e8VectorNumber">—</dd></div><div><dt>After subtracting the shift</dt><dd id="e8Remainder">Three E₈ blocks</dd></div></dl><p class="e8-caption">The faint points show E₈ roots as a reference. A colored ring marks the selected component, which can belong to a shifted copy of E₈.</p><div class="e8-step"><button id="e8Prev" aria-label="Previous vector">← Previous</button><button id="e8Next" aria-label="Next vector">Next →</button></div><p class="e8-fine">Coordinates are multiplied by √8 throughout. A displayed squared length of 32 means 4 in the usual Leech scale. Each base block is 4E₈ here, or √2 E₈ in that usual scale.</p></aside></div>
      <details class="e8-evidence"><summary>What Lean proves, and what the browser checks</summary><div class="e8-evidence-grid"><div><h3>Lean proofs</h3><p>The three orthogonal blocks have the E₈ Gram matrix. Gluing them gives precisely the existing Leech lattice. Every lattice vector has one of 4,096 distinct glue labels. The established minimum, 196,560 count and basis determinant carry across this equality.</p><p><a href="${proof}LeechThreeE8.lean" target="_blank" rel="noopener noreferrer">Construction, lengths and volume ↗</a><br><a href="${proof}LeechThreeE8Cosets.lean" target="_blank" rel="noopener noreferrer">Unique gluing labels ↗</a><br><a href="${proof}E8PlumbingBridge.lean#L67" target="_blank" rel="noopener noreferrer">The same E₈ matrix as the plumbing tree ↗</a></p></div><div><h3>Leech lattice symmetries</h3><p>For the Leech lattice with the origin fixed, the full symmetry group has order 8,315,553,613,086,720,000, with explicit generators, proved in Lean. <a href="${symmetryProof}ConwayOrder.lean#L29" target="_blank" rel="noopener noreferrer">Group order ↗</a></p><ol><li><a href="${symmetryProof}MathieuGroup.lean#L52" target="_blank" rel="noopener noreferrer">Golay code reorderings</a></li><li><a href="${symmetryProof}MathieuGroup.lean#L147" target="_blank" rel="noopener noreferrer">Reordering group of size 244,823,040</a></li><li><a href="${symmetryProof}LeechSextet.lean#L135" target="_blank" rel="noopener noreferrer">An involution moving a standard axis</a></li><li><a href="${symmetryProof}ConwayTransitivity.lean#L108" target="_blank" rel="noopener noreferrer">Every squared-length-64 vector is reachable</a></li><li><a href="${symmetryProof}ConwayGenerators.lean#L21" target="_blank" rel="noopener noreferrer">Generators for the full group</a></li></ol><p>There are <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/9a05fcf6e1dd83a4115804ea86ddcb45cf6f0f00/LeechCoordinateFrames.lean#L129" target="_blank" rel="noopener noreferrer">8,292,375 coordinate frames</a>. Each is an unordered set of 48 lattice vectors of squared length 64. Any two differ by twice a lattice vector. <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/9a05fcf6e1dd83a4115804ea86ddcb45cf6f0f00/LeechCoordinateFrames.lean#L16" target="_blank" rel="noopener noreferrer">Frame definition</a> · <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/9a05fcf6e1dd83a4115804ea86ddcb45cf6f0f00/LeechCoordinateFrames.lean#L86" target="_blank" rel="noopener noreferrer">Why every frame is counted</a>. Every vector of squared length 64 belongs to <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/3188e216102390669b64427d43577c573261e657/LeechCoordinateFrames.lean#L140" target="_blank" rel="noopener noreferrer">one coordinate frame</a>. That gives <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/3188e216102390669b64427d43577c573261e657/LeechCoordinateFrames.lean#L151" target="_blank" rel="noopener noreferrer">398,034,000 vectors</a> (8,292,375 × 48), counting both signs.</p><p>Squared lengths use the integer coordinates of the proof.</p><p><a href="${symmetryProof}docs/leech-symmetry-order.md" target="_blank" rel="noopener noreferrer">Proof walkthrough</a> · <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/3188e216102390669b64427d43577c573261e657/docs/axioms-2026-11-20-norm64-shell.txt" target="_blank" rel="noopener noreferrer">Merged audit · 954 declarations</a></p><h3>Separate browser evidence</h3><p>The integer replay checks every displayed shortest vector against the construction data and recovers its three base components. The projection, colors, point picking and browser execution are not Lean-verified.</p><p><a href="${proof}docs/three-e8.md" target="_blank" rel="noopener noreferrer">Construction data, scope and reproducible checks ↗</a></p><p>This is an explicit three-E₈ gluing in the project’s coordinates. It does not claim to reproduce the labeling of a particular published Turyn glue table.</p></div></div></details>
      <p class="e8-fine">E₈ supplies the geometry of each block; the gluing supplies the Leech lattice. Lines and glow help you read a projection, not a physical assembly in three-dimensional space.</p>`;
    if(!/\/blob\/[0-9a-f]{40}\/$/.test(proof)) {
      page.querySelectorAll('a').forEach(a=>{
        a.removeAttribute('href');a.removeAttribute('target');
        a.setAttribute('aria-disabled','true');a.title='Proofs checked locally; publication is in progress.';
      });
      page.querySelector('.e8-proof-badge').textContent='Lean checked locally · publication pending';
    }
    document.body.prepend(nav);document.body.append(page);
    const $=id=>document.getElementById(id);
    const labels=new Uint16Array(N), members=Array.from({length:4096},()=>[]), px=new Float32Array(N), py=new Float32Array(N);
    const p24=plane(24), order=data.blocks.flat();
    for(let k=0;k<N;k++) {
      const v=toLean(vecs.subarray(k*24,(k+1)*24));labels[k]=label(v);members[labels[k]].push(k);
      for(let j=0;j<24;j++){px[k]+=v[order[j]]*p24[0][j];py[k]+=v[order[j]]*p24[1][j];}
    }
    let selected=98256, mask=labels[selected], filtered=false, angle=0, current=null;
    const cloud=$('e8Cloud'), cloudCtx=cloud.getContext('2d'), back=document.createElement('canvas');back.width=back.height=640;
    const backCtx=back.getContext('2d');let cloudGeometry={};
    function setMode(on) {
      global.__leechThreeE8Active=on;document.body.classList.toggle('e8-mode',on);page.hidden=!on;
      $('e8Mode').setAttribute('aria-pressed',String(on));$('e8Original').setAttribute('aria-pressed',String(!on));
      if(on)renderAll();
    }
    $('e8Mode').onclick=()=>setMode(true);$('e8Original').onclick=()=>setMode(false);
    function size(c) {
      const rect=c.getBoundingClientRect(),dpr=Math.min(global.devicePixelRatio||1,2);
      c.width=Math.round(rect.width*dpr);c.height=Math.round(rect.height*dpr);
      const context=c.getContext('2d');context.setTransform(dpr,0,0,dpr,0,0);
      return {ctx:context,w:rect.width,h:rect.height};
    }
    function drawRoot(i) {
      const {ctx,w,h}=size($('e8Root'+i)),scale=Math.min(w,h)*.38/Math.sqrt(32),cx=w/2,cy=h/2;
      const points=rootVectors.map(v=>[cx+dot(v,plane8[0])*scale,cy+dot(v,plane8[1])*scale]);
      ctx.strokeStyle=colors[i]+'0a';ctx.lineWidth=.6;ctx.beginPath();
      for(let a=0;a<240;a++)for(let b=a+1;b<240;b++)if((a+b)%3===0&&dot(rootVectors[a],rootVectors[b])===16){ctx.moveTo(...points[a]);ctx.lineTo(...points[b]);}
      ctx.stroke();
      ctx.strokeStyle=colors[i]+'25';ctx.beginPath();ctx.arc(cx,cy,Math.min(w,h)*.39,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle=colors[i];ctx.shadowColor=colors[i];ctx.shadowBlur=5;
      for(const [x,y] of points){ctx.beginPath();ctx.arc(x,y,1.25,0,Math.PI*2);ctx.fill();}ctx.shadowBlur=0;
      if(current){const v=current.blocks[i],x=cx+dot(v,plane8[0])*scale,y=cy+dot(v,plane8[1])*scale;
        ctx.strokeStyle='#fff6dd';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle='#fff8e8';ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill();}
    }
    function drawCloud() {
      const {w,h}=size(cloud);cloudGeometry={w,h,cx:w/2,cy:h/2+12,scale:Math.min(w,h)*.39/Math.sqrt(32)};
      const S=640,buffer=new Float32Array(S*S),cs=Math.cos(angle),sn=Math.sin(angle),sc=S*.43/Math.sqrt(32);
      const visible=filtered?members[mask]:null;
      const draw=k=>{const x=Math.round(S/2+(px[k]*cs-py[k]*sn)*sc),y=Math.round(S/2+(px[k]*sn+py[k]*cs)*sc);if(x>0&&x<S-1&&y>0&&y<S-1){buffer[y*S+x]+=1;buffer[y*S+x-1]+=.2;buffer[y*S+x+1]+=.2;buffer[(y-1)*S+x]+=.2;buffer[(y+1)*S+x]+=.2;}};
      if(visible)visible.forEach(draw);else for(let k=0;k<N;k++)draw(k);
      const image=backCtx.createImageData(S,S);
      for(let k=0;k<S*S;k++){const a=1-Math.exp(-buffer[k]*(filtered?1.2:.23));image.data[k*4]=130+100*a;image.data[k*4+1]=165+65*a;image.data[k*4+2]=200+35*a;image.data[k*4+3]=Math.round(255*a);}
      backCtx.putImageData(image,0,0);
      const sizePx=Math.min(w,h)*.39/.43;
      cloudCtx.drawImage(back,w/2-sizePx/2,h/2+12-sizePx/2,sizePx,sizePx);
      const rad=Math.min(w,h)*.39;cloudCtx.strokeStyle='#34434e60';cloudCtx.lineWidth=1;cloudCtx.setLineDash([2,7]);cloudCtx.beginPath();cloudCtx.arc(w/2,h/2+12,rad,0,Math.PI*2);cloudCtx.stroke();cloudCtx.setLineDash([]);
      if(current){const {cx,cy,scale}=cloudGeometry,x=cx+(px[selected]*cs-py[selected]*sn)*scale,y=cy+(px[selected]*sn+py[selected]*cs)*scale;
        cloudCtx.strokeStyle='#fff0cd';cloudCtx.lineWidth=1.4;cloudCtx.beginPath();cloudCtx.arc(x,y,6,0,Math.PI*2);cloudCtx.stroke();cloudCtx.fillStyle='#fff5df';cloudCtx.beginPath();cloudCtx.arc(x,y,2.1,0,Math.PI*2);cloudCtx.fill();}
      $('e8CloudCount').textContent=(filtered?members[mask].length:N).toLocaleString()+' shortest vectors · 24D → 2D';
      $('e8ViewLabel').textContent=filtered?'SHIFT '+mask:'FULL SHELL';$('e8Empty').hidden=!filtered||members[mask].length!==0;
    }
    function updateSelection() {
      current=selected===null?null:decompose(vecs.subarray(selected*24,(selected+1)*24));
      const energies=current?current.blocks.map(v=>dot(v,v)):null;
      for(let i=0;i<3;i++){$('e8Coords'+i).textContent=current?'['+current.blocks[i].join(', ')+']':'No shortest vector';$('e8Energy'+i).textContent=energies?energies[i]:'—';$('e8Sum'+i).textContent=energies?energies[i]:'—';}
      $('e8SumTotal').textContent=current?'32':'—';$('e8Label').textContent=mask.toLocaleString();$('e8ClassCount').textContent=members[mask].length.toLocaleString();$('e8VectorNumber').textContent=current?(selected+1).toLocaleString()+' / 196,560':'None in this shift';
      $('e8Remainder').textContent=current&&current.coefficients.every(Number.isInteger)?'Three E₈ blocks':'—';
      $('e8SelectedTitle').textContent=current?'Its three pieces':'No shortest vector here';
      $('e8SelectedDescription').textContent=current?'The highlighted point splits into the three components above. Their squared lengths add up to 32.':'This glue label is valid, but its coset contains no shortest vectors. Choose another shift or return to the full shell.';
      $('e8Prev').disabled=$('e8Next').disabled=filtered&&members[mask].length===0;
      page.querySelectorAll('[data-glue]').forEach(b=>{const on=(mask>>Number(b.dataset.glue))&1;b.setAttribute('aria-pressed',String(Boolean(on)));b.textContent=on;});
      $('e8Filter').setAttribute('aria-pressed',String(filtered));$('e8Filter').textContent=filtered?'Show all vectors':'Show this shift';
    }
    function renderAll(){if(!global.__leechThreeE8Active)return;updateSelection();for(let i=0;i<3;i++)drawRoot(i);drawCloud();}
    page.querySelectorAll('[data-glue]').forEach(b=>b.onclick=()=>{mask^=1<<Number(b.dataset.glue);filtered=true;selected=members[mask][0]??null;renderAll();});
    $('e8Filter').onclick=()=>{filtered=!filtered;if(selected===null&&!filtered){selected=98256;mask=labels[selected];}renderAll();};
    $('e8Turn').oninput=e=>{angle=Number(e.target.value);drawCloud();};
    function step(delta){if(filtered){const list=members[mask];if(!list.length)return;selected=list[mod(list.indexOf(selected)+delta,list.length)];}else{selected=mod((selected??0)+delta,N);mask=labels[selected];}renderAll();}
    $('e8Prev').onclick=()=>step(-1);$('e8Next').onclick=()=>step(1);
    cloud.addEventListener('click',e=>{const r=cloud.getBoundingClientRect(),{cx,cy,scale}=cloudGeometry,cs=Math.cos(angle),sn=Math.sin(angle);let best=144,chosen=null;
      const visit=k=>{const dx=cx+(px[k]*cs-py[k]*sn)*scale-(e.clientX-r.left),dy=cy+(px[k]*sn+py[k]*cs)*scale-(e.clientY-r.top),d=dx*dx+dy*dy;if(d<best){best=d;chosen=k;}};
      if(filtered)members[mask].forEach(visit);else for(let k=0;k<N;k++)visit(k);
      if(chosen!==null){selected=chosen;mask=labels[selected];renderAll();}
    });
    let resizeRequest;global.addEventListener('resize',()=>{cancelAnimationFrame(resizeRequest);resizeRequest=requestAnimationFrame(renderAll);});
    global.__threeE8Check={labels:members.length,rootCount:rootVectors.length,vectorCount:N,classCounts:members.map(x=>x.length),decompose};
    setMode(true);
  }
  global.LeechThreeE8={mount,toLean,label,shift,decompose,roots};
})(typeof window!=='undefined'?window:globalThis);
