/* Local product charts for the tangent disk bundles in the E8 plumbing. */
const E8Plumbing = (() => {
  const radius = 1 / 3;
  const minHeight = Math.sqrt(1 - radius * radius);
  const epsilon = 1e-10;
  const colors = { muted: '#8996ad', joined: '#46d3ab', selected: '#ffcc71', base: '#66d7f4', fiber: '#f3b973' };
  const rootName = i => 'α' + '₁₂₃₄₅₆₇₈'[i];
  const jointName = j => rootName(j.a) + ' – ' + rootName(j.b);
  const dot = (a, b) => a.reduce((sum, n, i) => sum + n * b[i], 0);
  const frameAxis = (slot, i) => (slot + i + 1) % 5;

  // The base cap is centered on coordinate axis c=e_slot. Parallel transport
  // from c to x gives an orthonormal frame for the tangent vector on this cap.
  function bundlePoint(slot, base, fiber) {
    const x = Array(5).fill(0);
    const atCenter = Array(5).fill(0);
    for (let i = 0; i < 4; i++) {
      x[frameAxis(slot, i)] = radius * base[i];
      atCenter[frameAxis(slot, i)] = fiber[i];
    }
    x[slot] = Math.sqrt(1 - radius * radius * dot(base, base));
    const scale = dot(atCenter, x) / (1 + x[slot]);
    const v = atCenter.map((n, i) => n - scale * (x[i] + Number(i === slot)));
    return { x, v };
  }

  function chartCoordinates(slot, point) {
    const { x, v } = point;
    if (x[slot] < minHeight - epsilon) return null;
    const base = [];
    const fiber = [];
    for (let i = 0; i < 4; i++) {
      const axis = frameAxis(slot, i);
      base.push(x[axis] / radius);
      fiber.push(v[axis] - v[slot] * x[axis] / (1 + x[slot]));
    }
    return { base, fiber };
  }

  function create(roots, innerProduct) {
    const sites = roots.map(() => []);
    const edges = [];
    roots.forEach((a, i) => {
      for (let j = i + 1; j < roots.length; j++) {
        if (innerProduct(a, roots[j]) !== -1) continue;
        const edge = { id: edges.length, a: i, b: j, slotA: sites[i].length, slotB: sites[j].length };
        edges.push(edge);
        sites[i].push(edge);
        sites[j].push(edge);
      }
    });
    const glued = new Set();
    let active = roots.map(() => true);
    let joints = edges.slice();

    // Closed caps at different sites are disjoint (their centers are orthogonal).
    // A point therefore has at most one partner, even on the three-way branch.
    function mate(piece, point) {
      for (const joint of sites[piece]) {
        if (!glued.has(joint.id)) continue;
        const forward = piece === joint.a;
        const local = chartCoordinates(forward ? joint.slotA : joint.slotB, point);
        if (!local) continue;
        const next = bundlePoint(forward ? joint.slotB : joint.slotA, local.fiber, local.base);
        return { piece: forward ? joint.b : joint.a, point: next };
      }
      return null;
    }
    return {
      sites, mate,
      get active() { return active; },
      get joints() { return joints; },
      get gluedCount() { return glued.size; },
      // Every subgraph of the Dynkin tree is a forest.
      get components() { return active.filter(Boolean).length - glued.size; },
      isGlued(joint) { return glued.has(joint.id); },
      glue(joint) { if (joints.includes(joint)) glued.add(joint.id); },
      reset() { glued.clear(); },
      setPieces(mask) {
        active = mask.slice();
        joints = edges.filter(j => active[j.a] && active[j.b]);
        for (const j of edges) if (!active[j.a] || !active[j.b]) glued.delete(j.id);
      },
    };
  }

  function context(canvas) {
    const width = canvas.clientWidth, height = canvas.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 3);
    const w = Math.round(width * ratio), h = Math.round(height * ratio);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx, width, height };
  }

  // Display positions in Tab 30's numbering. All connections come from the Gram data.
  const layout = [[0,0],[1,0],[2,0],[3,0],[4,0],[4,1],[5,0],[6,0]];
  function positions(width, height) {
    const inset = Math.min(33, width / 12);
    return layout.map(([x,y]) => ({ x: inset + (width - 2 * inset) * x / 6, y: height * (y ? .76 : .31) }));
  }

  function drawTree(canvas, model, selected) {
    const { ctx, width, height } = context(canvas);
    if (!width || !height) return;
    const pos = positions(width, height);
    for (const j of model.joints) {
      const a = pos[j.a], b = pos[j.b], joined = model.isGlued(j);
      ctx.beginPath();
      ctx.setLineDash(joined ? [] : [4,4]);
      ctx.strokeStyle = joined ? colors.joined : colors.muted;
      ctx.lineWidth = joined ? 3.4 : 1.6;
      ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
      ctx.setLineDash([]);
      if (selected === j) {
        ctx.beginPath(); ctx.arc((a.x+b.x)/2,(a.y+b.y)/2,6,0,2*Math.PI);
        ctx.fillStyle = '#0d1421'; ctx.fill();
        ctx.strokeStyle = colors.selected; ctx.lineWidth = 2; ctx.stroke();
      }
    }
    pos.forEach((p, i) => {
      const on = model.active[i];
      const attached = model.sites[i].some(j => model.isGlued(j));
      ctx.beginPath(); ctx.arc(p.x,p.y,Math.min(16, width/24),0,2*Math.PI);
      ctx.fillStyle = on ? (attached ? '#153a32' : '#1b2a3c') : '#101621'; ctx.fill();
      ctx.strokeStyle = on ? (attached ? colors.joined : '#8faac0') : '#334052';
      ctx.lineWidth = 1.5; ctx.stroke();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = 'bold 13px monospace';
      ctx.fillStyle = on ? '#e4eef7' : '#707c8e'; ctx.fillText(rootName(i),p.x,p.y);
    });
  }

  function drawSlice(canvas, x, y, preview, axis, reverse) {
    const { ctx, width, height } = context(canvas);
    if (!width || !height) return;
    const cx = width/2, cy = height/2, half = Math.min((width-34)/2, (height-22)/2);
    ctx.fillStyle = '#111e2e'; ctx.fillRect(cx-half,cy-half,2*half,2*half);
    ctx.strokeStyle = '#384a60'; ctx.lineWidth = 1; ctx.strokeRect(cx-half,cy-half,2*half,2*half);
    const horizontal = reverse ? colors.fiber : colors.base;
    const vertical = reverse ? colors.base : colors.fiber;
    ctx.globalAlpha = .77;
    ctx.strokeStyle = horizontal; ctx.beginPath(); ctx.moveTo(cx-half,cy); ctx.lineTo(cx+half,cy); ctx.stroke();
    ctx.strokeStyle = vertical; ctx.beginPath(); ctx.moveTo(cx,cy-half); ctx.lineTo(cx,cy+half); ctx.stroke();
    ctx.globalAlpha = 1; ctx.font = '10px monospace'; ctx.textBaseline = 'middle';
    ctx.fillStyle = horizontal; ctx.textAlign = 'left'; ctx.fillText('b'+axis,cx+half+3,cy);
    ctx.fillStyle = vertical; ctx.textAlign = 'center'; ctx.fillText('f'+axis,cx,cy-half-6);
    ctx.beginPath(); ctx.arc(cx+x*half,cy-y*half,4.5,0,2*Math.PI);
    ctx.strokeStyle = colors.selected; ctx.fillStyle = colors.selected;
    if (preview) { ctx.lineWidth = 1.8; ctx.stroke(); } else { ctx.fill(); }
  }

  const vectorText = (v, digits = 2) => '(' + v.map(n => (Math.abs(n) < .5 * 10 ** -digits ? 0 : n).toFixed(digits)).join(', ') + ')';
  function showVectors(element, base, fiber, reversed) {
    const row = (name, vector, color) => {
      const line = document.createElement('div');
      line.className = color; line.textContent = name + ' ' + vectorText(vector);
      return line;
    };
    element.replaceChildren(row('Base',base,reversed ? 'pl-p' : 'pl-q'), row('Fiber',fiber,reversed ? 'pl-q' : 'pl-p'));
  }

  function mount(roots, innerProduct) {
    const model = create(roots, innerProduct);
    const el = name => document.getElementById('pl-' + name);
    const tree = el('tree'), selector = el('joint'), glue = el('glue');
    const base = [.55,0,0,0], fiber = [-.28,.22,0,0];
    let selected = model.joints[0];
    const pending = () => model.joints.find(j => !model.isGlued(j));
    const axis = () => el('axis').selectedIndex;
    document.querySelector('.pl-jump').onclick = event => {
      event.preventDefault();
      document.getElementById('plumbing').scrollIntoView({ block: 'start' });
    };

    function renderPoint() {
      if (!selected) return;
      const j = selected, k = axis();
      const source = bundlePoint(j.slotA, base, fiber);
      const partner = model.mate(j.a, source);
      const target = partner ? partner.point : bundlePoint(j.slotB, fiber, base);
      const targetLocal = chartCoordinates(j.slotB, target);
      el('left-name').textContent = rootName(j.a) + ' · patch ' + (j.slotA+1);
      el('right-name').textContent = rootName(j.b) + ' · patch ' + (j.slotB+1);
      showVectors(el('left-vectors'),base,fiber,false);
      showVectors(el('right-vectors'),targetLocal.base,targetLocal.fiber,true);
      drawSlice(el('left'),base[k],fiber[k],false,k+1,false);
      drawSlice(el('right'),targetLocal.base[k],targetLocal.fiber[k],!partner,k+1,true);
      el('ambient').textContent = [[j.a,source],[j.b,target]].map(([i,p]) =>
        rootName(i) + '   x = ' + vectorText(p.x,3) + '\n     v = ' + vectorText(p.v,3)).join('\n');
      for (const [id,values] of [['base',base],['fiber',fiber]]) {
        const limit = Math.sqrt(Math.max(0, 1 - values.reduce((s,n,i) => s + (i === k ? 0 : n*n), 0)));
        const slider = el(id);
        slider.min = -limit; slider.max = limit; slider.value = values[k];
        slider.setAttribute('aria-valuetext', values[k].toFixed(2));
      }
      const centered = base.every(x => x === 0) && fiber.every(x => x === 0);
      el('relation').textContent = partner
        ? (centered ? 'The two zero sections meet at this point.' : 'One point, two descriptions. The base here is the fiber there.')
        : 'Two separate points. Gluing identifies the marked point with its outlined partner.';
    }

    function render() {
      const joints = model.joints;
      if (!joints.includes(selected)) selected = joints[0];
      selector.replaceChildren(...joints.map(j => new Option(jointName(j) + (model.isGlued(j) ? ' · glued' : ''),j.id)));
      selector.disabled = !selected;
      if (selected) selector.value = selected.id;
      const left = model.components;
      const unit = left === 1 ? ' connected assembly' : model.gluedCount ? ' groups' : ' separate pieces';
      el('progress').textContent = model.gluedCount + ' / ' + joints.length + ' joints glued · ' + left + unit;
      el('state').textContent = selected ? (model.isGlued(selected) ? 'Glued joint' : 'Open joint') : '';
      glue.disabled = !pending();
      glue.textContent = !joints.length ? 'Glue this joint' : !pending() ? 'All joints glued' :
        model.isGlued(selected) ? 'Glue next joint' : 'Glue this joint';
      el('reset').disabled = !model.gluedCount;
      el('empty').hidden = !!selected; el('detail').hidden = !selected;
      drawTree(tree,model,selected);
      renderPoint();
    }

    selector.onchange = () => { selected = model.joints.find(j => j.id === Number(selector.value)); render(); };
    tree.onclick = event => {
      const box = tree.getBoundingClientRect(), pos = positions(tree.clientWidth, tree.clientHeight);
      const x = event.clientX-box.left, y = event.clientY-box.top;
      // Pick a segment using its nearest point, with priority to its midpoint at shared ends.
      let best = null, bestScore = 16;
      for (const j of model.joints) {
        const a = pos[j.a], b = pos[j.b], dx = b.x-a.x, dy = b.y-a.y;
        const t = Math.min(1, Math.max(0, ((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy)));
        const score = Math.hypot(x-a.x-t*dx,y-a.y-t*dy) + 2*Math.abs(.5-t);
        if (score < bestScore) { best = j; bestScore = score; }
      }
      if (best) { selected = best; render(); }
    };
    glue.onclick = () => {
      if (!selected || model.isGlued(selected)) selected = pending();
      if (selected) { model.glue(selected); render(); }
    };
    el('reset').onclick = () => { model.reset(); selected = model.joints[0]; render(); };
    el('axis').onchange = renderPoint;
    el('base').oninput = event => { base[axis()] = Number(event.target.value); renderPoint(); };
    el('fiber').oninput = event => { fiber[axis()] = Number(event.target.value); renderPoint(); };
    el('zero').onclick = () => { base.fill(0); fiber.fill(0); renderPoint(); };
    const observer = new ResizeObserver(() => { drawTree(tree,model,selected); renderPoint(); });
    observer.observe(tree);
    observer.observe(el('left'));
    return {
      get joints() { return model.joints; },
      setPieces(mask) { model.setPieces(mask); render(); }
    };
  }
  return { create, bundlePoint, chartCoordinates, mount };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = E8Plumbing;
