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
  function shellLayerTable(squaredLength, counts, proofUrl) {
    const id = 'e8Length' + squaredLength;
    const format = n => n.toLocaleString('en-US');
    const rows = counts.map(([k, n]) => {
      const product = k === 0 ? '0' : '−' + k + ' or +' + k;
      const number = format(n) + (k === 0 ? '' : ' each');
      return '<tr><th scope="row">' + product + '</th><td>' + number + '</td></tr>';
    }).join('');
    const total = counts.reduce((sum, [k, n]) => sum + (k === 0 ? n : 2 * n), 0);
    return `<section id="${id}Panel" class="e8-shell-table" hidden aria-labelledby="${id}Heading">
      <h3 id="${id}Heading">Vectors of squared length ${squaredLength}</h3>
      <p class="e8-layer-notes">These counts hold for any shortest vector s. <a id="${id}Proof" href="${proofUrl}" target="_blank" rel="noopener noreferrer">Lean proof of the length-${squaredLength} table</a>.</p>
      <table id="${id}Table" aria-labelledby="${id}Heading">
        <thead><tr><th scope="col">Dot product s · v</th><th scope="col">Number of vectors</th></tr></thead>
        <tbody>${rows}<tr><th scope="row">Every other integer</th><td>0</td></tr></tbody>
        <tfoot><tr><th scope="row">All layers</th><td>${format(total)}</td></tr></tfoot>
      </table>
    </section>`;
  }
  function mount({vecs,shellOf,N}) {
    const longerTables = [
      { length: 48, counts: [[0,6476800], [8,4147200], [16,953856], [24,47104]],
        proof: 'https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/c343b5adea27413b96f7b23872916ef32bf52bdd/LeechLayers.lean#L446' },
      { length: 64, counts: [[0,133204500], [8,95385600], [16,32788800], [24,4147200], [32,93150]],
        proof: 'https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/833c92ecdde614aae59c6a2e66b33ee78dbb1653/LeechNorm64Layers.lean#L159' },
      { length: 80, counts: [[0,1384998912], [8,1062195200], [16,458086400], [24,95385600], [32,6476800], [40,47104]],
        proof: 'https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/ee2705706ef6cb5d573ee4c34e9ca4a6dacbf786/LeechNorm80Layers.lean#L160' },
      { length: 96, counts: [[0,9403968600], [8,7535462400], [16,3771829800], [24,1062195200], [32,133204500], [40,4147200], [48,4600]],
        proof: 'https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/861fb2e42c155fe97e7bce9db7b3240adf9d5657/LeechNorm96Layers.lean#L67' },
      { length: 112, counts: [[0,47406643200], [8,39253082112], [16,21771763200], [24,7535462400], [32,1384998912], [40,95385600], [48,953856], [56,0]],
        proof: 'https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/878f487402521c083dbd9552045f7a99b01ea749/LeechNorm112Layers.lean#L71' },
      { length: 128, counts: [[0,192825064350], [8,163357849600], [16,97917423808], [24,39253082112], [32,9403968600], [40,1062195200], [48,32788800], [56,47104], [64,1]],
        proof: 'https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/fc841b0622b2f85645f55b74835d3712e7e0e32d/LeechNorm128Layers.lean#L75' },
      { length: 144, counts: [[0,663509299200], [8,573172070400], [16,364086835200], [24,163357849600], [32,47406643200], [40,7535462400], [48,458086400], [56,4147200]],
        proof: 'https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/eadb0ef627b4f3efc3c3fec12101fb7175e0b5d6/LeechNorm144Layers.lean#L96' },
      { length: 160, counts: [[0,2007834672456], [8,1758528921600], [16,1171711866600], [24,573172070400], [32,192825064350], [40,39253082112], [48,3771829800], [56,95385600], [64,93150]],
        proof: 'https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/f0e7c291733f50a950f40cfc786c945b8cf06b99/LeechNorm160Layers.lean#L75' }
    ];
    const tableLengths = [32, ...longerTables.map(table => table.length)];
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
      <div class="e8-bottom"><section class="e8-shell" aria-label="Combined Leech projection"><div class="e8-shell-top"><div><h2>One lattice.</h2><p id="e8CloudCount">196,560 shortest vectors · 24D → 2D</p></div><div class="e8-shell-heading-tools"><div class="e8-projection-switch" role="group" aria-label="Projection"><button id="e8CloudMode" aria-pressed="true">Cloud</button><button id="e8LayersMode" aria-pressed="false">Layers</button></div><span class="e8-kicker" id="e8ViewLabel">FULL SHELL</span></div></div><canvas id="e8Cloud" role="img" aria-label="Leech shortest-vector projection. Click a point to inspect it, or use Previous and Next vector."></canvas><div id="e8LayersPanel" class="e8-layer-panel" hidden><div id="e8LayersData"><canvas id="e8LayerPlot" role="img" aria-label="Vectors of squared length 32 projected along the selected shortest vector. Dashed guides mark the empty slots."></canvas><p class="e8-layer-notes">The browser plots the vectors of squared length 32. The selected vector s points right. Horizontal distance is (s · v) / √32. The vertical direction is perpendicular to s.</p>
        <label class="e8-table-picker" for="e8TableLength">Table for squared length
          <select id="e8TableLength">${tableLengths.map(n => `<option value="${n}">${n}</option>`).join('')}</select>
        </label>
        <section id="e8Length32Panel" aria-label="Vectors of squared length 32">
          <p class="e8-layer-legend">Dot product s · v and number of vectors · counted in the browser</p><dl id="e8LayerCounts" class="e8-layer-counts" aria-label="Vectors by dot product"></dl>
          <p class="e8-layer-notes" id="e8LayerProofs">The <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/e059e5cc14aaffd64fce444678f53eb65e60051c/LeechLayers.lean#L304" target="_blank" rel="noopener noreferrer">Lean proof of the length-32 table</a> gives the counts for any shortest vector s. Every dot product except 0, ±8, ±16 and ±32 has count zero.</p>
          <details class="e8-layer-details"><summary>Proofs for individual layers</summary><p class="e8-layer-notes">The <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/76cd2ec6457370a1d110935a570987d48b1edd34/LeechLayers.lean#L211" target="_blank" rel="noopener noreferrer" aria-label="Lean proof for the −8 layer">−8</a> and <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/76cd2ec6457370a1d110935a570987d48b1edd34/LeechLayers.lean#L206" target="_blank" rel="noopener noreferrer" aria-label="Lean proof for the +8 layer">+8</a> layers each have 47,104 vectors. The <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/76cd2ec6457370a1d110935a570987d48b1edd34/LeechLayers.lean#L221" target="_blank" rel="noopener noreferrer" aria-label="Lean proof for the −16 layer">−16</a> and <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/76cd2ec6457370a1d110935a570987d48b1edd34/LeechLayers.lean#L216" target="_blank" rel="noopener noreferrer" aria-label="Lean proof for the +16 layer">+16</a> layers each have 4,600. The <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/af2deea39a014d3e4f646a69dcf6106b16a0339b/LeechLayers.lean#L233" target="_blank" rel="noopener noreferrer" aria-label="Lean proof for the +32 layer">+32</a> layer contains only s. The <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/af2deea39a014d3e4f646a69dcf6106b16a0339b/LeechLayers.lean#L246" target="_blank" rel="noopener noreferrer" aria-label="Lean proof for the −32 layer">−32</a> layer contains only −s. Of the <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/7c0ffef39dc742f86fbe739e4ea8d5479c5c5d65/LeechKissing.lean#L105" target="_blank" rel="noopener noreferrer">196,560 shortest vectors</a>, <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/7c0ffef39dc742f86fbe739e4ea8d5479c5c5d65/ConwayOrder.lean#L15" target="_blank" rel="noopener noreferrer">93,150 are perpendicular to s</a>. At +24 the difference would have squared length 16. At −24 the sum would. Both fall below the <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/7c0ffef39dc742f86fbe739e4ea8d5479c5c5d65/PlaygroundLeech.lean#L57" target="_blank" rel="noopener noreferrer">minimum of 32</a>. <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/7c0ffef39dc742f86fbe739e4ea8d5479c5c5d65/LeechLayers.lean#L27" target="_blank" rel="noopener noreferrer">Proof of the two empty slots</a>.</p></details>
        </section>
        ${longerTables.map(table => shellLayerTable(table.length, table.counts, table.proof)).join('')}
        </div></div><p id="e8Empty" class="e8-empty" hidden>This shift has no vectors of squared length 32.<br>It still contains infinitely many lattice vectors.</p><div class="e8-shell-controls"><button id="e8Filter" aria-pressed="false">Show this shift</button><label id="e8TurnControl" for="e8Turn">Turn the view <input id="e8Turn" type="range" min="0" max="6.28" step=".02" value="0"></label></div></section>
      <aside class="e8-inspect" aria-label="Selected vector"><div class="e8-kicker">Follow one vector</div><h2 id="e8SelectedTitle">Its three pieces</h2><p id="e8SelectedDescription">The highlighted point splits into the three components above. Their squared lengths add up to 32.</p><div class="e8-equation" aria-live="polite" aria-atomic="true"><span id="e8Sum0">8</span><i>+</i><span id="e8Sum1">8</span><i>+</i><span id="e8Sum2">16</span><i>=</i><strong id="e8SumTotal">32</strong></div><dl class="e8-metrics"><div><dt>Glue label (0–4,095)</dt><dd id="e8Label">—</dd></div><div><dt>Vectors in this shift · counted</dt><dd id="e8ClassCount">—</dd></div><div><dt>Selected vector</dt><dd id="e8VectorNumber">—</dd></div><div><dt>After subtracting the shift</dt><dd id="e8Remainder">Three E₈ blocks</dd></div></dl><p class="e8-caption">The faint points show E₈ roots as a reference. A colored ring marks the selected component, which can belong to a shifted copy of E₈.</p><div class="e8-step"><button id="e8Prev" aria-label="Previous vector">← Previous</button><button id="e8Next" aria-label="Next vector">Next →</button></div><p class="e8-fine">Coordinates are multiplied by √8 throughout. A displayed squared length of 32 means 4 in the usual Leech scale. Each base block is 4E₈ here, or √2 E₈ in that usual scale.</p></aside></div>
      <details class="e8-evidence"><summary>What Lean proves, and what the browser checks</summary><div class="e8-evidence-grid"><div><h3>Lean proofs</h3><p>The three orthogonal blocks have the E₈ Gram matrix. Gluing the blocks gives the Leech lattice defined from the Golay code. Each vector has one of 4,096 glue labels. The earlier proofs of the minimum squared length and the basis determinant also apply here. The 196,560 shortest vectors have squared length 32 and form <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/f5a4018b1e0cf675a902f13a666ba0a79271d471/LeechShellPairs.lean#L11" target="_blank" rel="noopener noreferrer">98,280 opposite pairs</a>.</p><p><a href="${proof}LeechThreeE8.lean" target="_blank" rel="noopener noreferrer">Construction, lengths and volume ↗</a><br><a href="${proof}LeechThreeE8Cosets.lean" target="_blank" rel="noopener noreferrer">Unique gluing labels ↗</a><br><a href="${proof}E8PlumbingBridge.lean#L67" target="_blank" rel="noopener noreferrer">The same E₈ matrix as the plumbing tree ↗</a></p></div><div><h3>Leech lattice symmetries</h3><p>For the Leech lattice with the origin fixed, the full symmetry group has order 8,315,553,613,086,720,000, with explicit generators, proved in Lean. <a href="${symmetryProof}ConwayOrder.lean#L29" target="_blank" rel="noopener noreferrer">Group order ↗</a></p><ol><li><a href="${symmetryProof}MathieuGroup.lean#L52" target="_blank" rel="noopener noreferrer">Golay code reorderings</a></li><li><a href="${symmetryProof}MathieuGroup.lean#L147" target="_blank" rel="noopener noreferrer">Reordering group of size 244,823,040</a></li><li><a href="${symmetryProof}LeechSextet.lean#L135" target="_blank" rel="noopener noreferrer">An involution moving a standard axis</a></li><li><a href="${symmetryProof}ConwayTransitivity.lean#L108" target="_blank" rel="noopener noreferrer">Every squared-length-64 vector is reachable</a></li><li><a href="${symmetryProof}ConwayGenerators.lean#L21" target="_blank" rel="noopener noreferrer">Generators for the full group</a></li></ol><p>There are <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/9a05fcf6e1dd83a4115804ea86ddcb45cf6f0f00/LeechCoordinateFrames.lean#L129" target="_blank" rel="noopener noreferrer">8,292,375 coordinate frames</a>. Each is an unordered set of 48 lattice vectors of squared length 64. Any two differ by twice a lattice vector. <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/9a05fcf6e1dd83a4115804ea86ddcb45cf6f0f00/LeechCoordinateFrames.lean#L16" target="_blank" rel="noopener noreferrer">Frame definition</a> · <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/9a05fcf6e1dd83a4115804ea86ddcb45cf6f0f00/LeechCoordinateFrames.lean#L86" target="_blank" rel="noopener noreferrer">Why every frame is counted</a>. Every vector of squared length 64 belongs to <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/3188e216102390669b64427d43577c573261e657/LeechCoordinateFrames.lean#L140" target="_blank" rel="noopener noreferrer">one coordinate frame</a>. That gives <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/3188e216102390669b64427d43577c573261e657/LeechCoordinateFrames.lean#L151" target="_blank" rel="noopener noreferrer">398,034,000 vectors</a> (8,292,375 × 48), counting both signs. They form <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/f5a4018b1e0cf675a902f13a666ba0a79271d471/LeechShellPairs.lean#L19" target="_blank" rel="noopener noreferrer">199,017,000 opposite pairs</a>.</p><p>There are <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/fa2721c46268f3768f1d44e1b2e5b6074f37145d/LeechNorm48.lean#L171" target="_blank" rel="noopener noreferrer">16,773,120 vectors</a> of squared length 48. Pairing each vector with its negative gives <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/f5a4018b1e0cf675a902f13a666ba0a79271d471/LeechNorm48Pairs.lean#L25" target="_blank" rel="noopener noreferrer">8,386,560 pairs</a>. In the usual normalization, the squared length is 6. <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/f5a4018b1e0cf675a902f13a666ba0a79271d471/docs/leech-symmetry.md#vectors-of-squared-length-48" target="_blank" rel="noopener noreferrer">How the Golay count works</a>.</p><p>At squared length 80, the <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/7c0ffef39dc742f86fbe739e4ea8d5479c5c5d65/LeechNorm80.lean#L88" target="_blank" rel="noopener noreferrer">4,629,381,120 vectors</a> form <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/7c0ffef39dc742f86fbe739e4ea8d5479c5c5d65/LeechNorm80.lean#L109" target="_blank" rel="noopener noreferrer">2,314,690,560 opposite pairs</a>. This is squared length 10 in the usual scale.</p><p>Squared lengths use the integer coordinates of the proof.</p><p><a href="${symmetryProof}docs/leech-symmetry-order.md" target="_blank" rel="noopener noreferrer">Proof walkthrough</a> · <a href="https://github.com/NousVolition/discrete-gap-inequalities-lean/blob/f0e7c291733f50a950f40cfc786c945b8cf06b99/docs/axioms-2026-11-20-norm160-dot-layers.txt" target="_blank" rel="noopener noreferrer">Merged audit · 1117 declarations</a></p><h3>Separate browser evidence</h3><p>The integer replay checks every displayed shortest vector against the construction data and recovers its three base components. The projection, colors, point picking and browser execution are not Lean-verified.</p><p><a href="${proof}docs/three-e8.md" target="_blank" rel="noopener noreferrer">Construction data, scope and reproducible checks ↗</a></p><p>This is an explicit three-E₈ gluing in the project’s coordinates. It does not claim to reproduce the labeling of a particular published Turyn glue table.</p></div></div></details>
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
    const tablePicker = $('e8TableLength');
    function showSelectedTable() {
      for (const length of tableLengths) {
        $('e8Length' + length + 'Panel').hidden = String(length) !== tablePicker.value;
      }
    }
    tablePicker.onchange = showSelectedTable;
    const labels=new Uint16Array(N), members=Array.from({length:4096},()=>[]), px=new Float32Array(N), py=new Float32Array(N);
    const p24=plane(24), order=data.blocks.flat();
    for(let k=0;k<N;k++) {
      const v=toLean(vecs.subarray(k*24,(k+1)*24));labels[k]=label(v);members[labels[k]].push(k);
      for(let j=0;j<24;j++){px[k]+=v[order[j]]*p24[0][j];py[k]+=v[order[j]]*p24[1][j];}
    }
    let selected=98256, mask=labels[selected], filtered=false, angle=0, current=null;
    const cloud=$('e8Cloud'), cloudCtx=cloud.getContext('2d'), back=document.createElement('canvas');back.width=back.height=640;
    const backCtx=back.getContext('2d');let cloudGeometry={};
    let layerView = false, layers = null;
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
    function drawLayers() {
      const hasVector = selected !== null;
      $('e8LayersData').hidden = !hasVector;
      $('e8Empty').hidden = hasVector;
      $('e8ViewLabel').textContent = 'LAYERS';
      $('e8CloudCount').textContent = hasVector
        ? 'Along vector ' + (selected + 1).toLocaleString() + ' · all ' + N.toLocaleString() + ' shortest vectors'
        : 'Choose a shortest vector to see its layers.';
      if (!hasVector) return;
      if (!layers || layers.selected !== selected) layers = projectLayers(vecs, selected);
      const {counts, products, heights, norm} = layers;
      const slots = [...new Set([...counts.keys(), -24, 24])].sort((a, b) => a - b);
      const signed = k => k < 0 ? '−' + (-k) : k > 0 ? '+' + k : '0';
      $('e8LayerCounts').innerHTML = slots.map(k => {
        const n = counts.get(k) || 0;
        return '<div class="' + (n ? 'occupied' : 'empty') + '"><dt>' + signed(k) +
          '</dt><dd>' + (n ? n.toLocaleString() : '0 · empty') + '</dd></div>';
      }).join('');

      const {ctx, w, h} = size($('e8LayerPlot'));
      const margin = 24, top = 10, foot = 27;
      const cy = (h - foot + top) / 2;
      const scaleX = (w - 2 * margin) / (2 * norm);
      const scaleY = (h - top - foot) / (2 * norm);
      const xFor = product => w / 2 + (product / norm) * scaleX;
      const bins = new Map(slots.map(k => [k, new Uint32Array(Math.ceil(h) + 1)]));
      for (let i = 0; i < products.length; i++) {
        const y = Math.round(cy - heights[i] * scaleY);
        bins.get(products[i])[y]++;
      }
      for (const k of slots) {
        const x = xFor(k), n = counts.get(k) || 0;
        ctx.strokeStyle = n ? '#36515b' : '#526169';
        ctx.setLineDash(n ? [] : [2, 5]);
        ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, h - foot); ctx.stroke();
        ctx.setLineDash([]);
        const color = k < 0 ? '#8caef1' : k > 0 ? '#edaccb' : '#92e2c7';
        const column = bins.get(k);
        ctx.fillStyle = color;
        for (let y = 0; y < column.length; y++) {
          if (!column[y]) continue;
          ctx.globalAlpha = Math.min(1, 0.36 + Math.log1p(column[y]) / 10);
          ctx.fillRect(x - 1.75, y, 3.5, 1.35);
        }
        ctx.globalAlpha = 1;
        if (n === 1) {
          ctx.beginPath(); ctx.arc(x, cy, 3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = n ? '#dce6e9' : '#a5b2bc';
        ctx.textAlign = 'center'; ctx.font = '11px system-ui';
        ctx.fillText(signed(k), x, h - 6);
      }
      ctx.strokeStyle = '#fff1cd'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(xFor(products[selected]), cy, 6, 0, Math.PI * 2); ctx.stroke();
    }
    function setProjection(showLayers) {
      layerView = showLayers;
      $('e8CloudMode').setAttribute('aria-pressed', String(!showLayers));
      $('e8LayersMode').setAttribute('aria-pressed', String(showLayers));
      cloud.hidden = showLayers;
      $('e8LayersPanel').hidden = !showLayers;
      $('e8TurnControl').hidden = showLayers;
      renderAll();
    }
    $('e8CloudMode').onclick = () => setProjection(false);
    $('e8LayersMode').onclick = () => setProjection(true);
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
      $('e8Filter').setAttribute('aria-pressed',String(filtered));$('e8Filter').textContent=layerView ? (filtered?'Follow all vectors':'Follow this shift') : (filtered?'Show all vectors':'Show this shift');
    }
    function renderAll(){if(!global.__leechThreeE8Active)return;updateSelection();for(let i=0;i<3;i++)drawRoot(i);if(layerView)drawLayers();else drawCloud();}
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
  function projectLayers(vecs, selected) {
    const n = vecs.length / 24;
    const s = vecs.subarray(24 * selected, 24 * (selected + 1));
    const norm = Math.sqrt(dot(s, s));
    const horizontal = Array.from(s, x => x / norm);
    const reference = plane(24);
    // Keep a fixed vertical direction for this selection, independent of the cloud's rotation.
    const axis = Math.abs(dot(reference[1], horizontal)) < 0.9 ? reference[1] : reference[0];
    const component = dot(axis, horizontal);
    const vertical = axis.map((x, j) => x - component * horizontal[j]);
    const length = Math.hypot(...vertical);
    for (let j = 0; j < 24; j++) vertical[j] /= length;

    const products = new Int8Array(n);
    const heights = new Float32Array(n);
    const counts = new Map();
    for (let i = 0; i < n; i++) {
      let product = 0, height = 0;
      for (let j = 0; j < 24; j++) {
        const coordinate = vecs[24 * i + j];
        product += s[j] * coordinate;
        height += vertical[j] * coordinate;
      }
      products[i] = product;
      heights[i] = height;
      counts.set(product, (counts.get(product) || 0) + 1);
    }
    return {selected, norm, vertical, products, heights, counts};
  }
  global.LeechThreeE8={mount,toLean,label,shift,decompose,roots,projectLayers};
})(typeof window!=='undefined'?window:globalThis);
