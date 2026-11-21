/* The exposed sphere bundles and their shared rims in the Tab 30 plumbing. */
const E8Boundary = (() => {
  const colors = {
    face: '#74d9e8', seam: '#68dcc1', selected: '#ffd17d', muted: '#99abba',
    outline: '#426575', body: '#152d36', outside: '#0b131d'
  };
  const circle = 2 * Math.PI;

  // A great circle inside the S³ rim, chosen in the displayed base S².
  function direction(slot, sign, angle = 0) {
    const vector = [0, 0, 0, 0];
    vector[((slot + 1) % 3 - slot + 4) % 5] = sign * Math.cos(angle);
    vector[((slot + 2) % 3 - slot + 4) % 5] = sign * Math.sin(angle);
    return vector;
  }

  function trace(model, bundlePoint, joint, t, angle = 0) {
    const base = direction(joint.slotA, 1, angle);
    const fiber = direction(joint.slotB, -1);
    // The second piece uses the opposite chart order (fiber, base).
    const baseRadius = 1 + .35 * Math.max(0, -t);
    const fiberRadius = 1 + .35 * Math.max(0, t);
    const sides = [];
    if (t <= 0) {
      sides.push({ piece: joint.a, point: bundlePoint(joint.slotA, base.map(n => n * baseRadius), fiber) });
    }
    let identified = false;
    if (t >= 0) {
      const partner = t === 0 ? model.mate(joint.a, sides[0].point) : null;
      identified = partner !== null;
      sides.push(partner || { piece: joint.b, point: bundlePoint(joint.slotB, fiber.map(n => n * fiberRadius), base) });
    }
    return { baseRadius, fiberRadius, sides, identified, angle };
  }

  function surface(canvas) {
    const width = canvas.clientWidth, height = canvas.clientHeight;
    if (!width || !height) return null;
    const scale = Math.min(window.devicePixelRatio || 1, 3);
    const w = Math.round(width * scale), h = Math.round(height * scale);
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, width, height);
    return { ctx, width, height };
  }

  // Sample a circle perpendicular to axis. All three small cap rims face the
  // viewer along (1,1,1)/√3. For a great circle, draw only its near hemisphere.
  function circlePath(ctx, project, axis, height, radius, nearOnly) {
    ctx.beginPath();
    let penDown = false;
    for (let k = 0; k <= 80; k++) {
      const theta = circle * k / 80, xyz = [0, 0, 0];
      xyz[axis] = height;
      xyz[(axis + 1) % 3] = radius * Math.cos(theta);
      xyz[(axis + 2) % 3] = radius * Math.sin(theta);
      if (nearOnly && xyz[0] + xyz[1] + xyz[2] < 0) {
        penDown = false;
        continue;
      }
      const [x, y] = project(xyz);
      if (penDown) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
      penDown = true;
    }
    if (!nearOnly) ctx.closePath();
  }

  function marker(ctx, x, y) {
    ctx.beginPath(); ctx.arc(x, y, 4, 0, circle);
    ctx.fillStyle = colors.selected; ctx.fill();
    ctx.strokeStyle = '#16212a'; ctx.lineWidth = 1.5; ctx.stroke();
  }

  // Orient each base slice toward its neighbors. Rotating or reflecting this
  // screen projection leaves the underlying five-dimensional coordinates alone.
  function atlasFrame(sites, piece, centers, radius) {
    const [cx, cy] = centers[piece];
    const directions = sites.map(j => {
      const fromA = j.a === piece, slot = fromA ? j.slotA : j.slotB;
      const [nx, ny] = centers[fromA ? j.b : j.a];
      return [Math.atan2(ny - cy, nx - cx), Math.PI / 6 + slot * circle / 3];
    });
    let best = -1, rotation = 0, orientation = 1;
    for (const sign of [1, -1]) {
      let u = 0, v = 0;
      for (const [wanted, axis] of directions) {
        u += Math.cos(wanted - sign * axis);
        v += Math.sin(wanted - sign * axis);
      }
      const fit = Math.hypot(u, v);
      if (fit > best) { best = fit; rotation = Math.atan2(v, u); orientation = sign; }
    }
    const c = Math.cos(rotation), s = Math.sin(rotation);
    return xyz => {
      const u = radius * (xyz[0] - xyz[1]) / Math.sqrt(2);
      const v = orientation * radius * (xyz[0] + xyz[1] - 2 * xyz[2]) / Math.sqrt(6);
      return [cx + c * u - s * v, cy + s * u + c * v];
    };
  }

  function drawAtlas(canvas, model, geometry, selected, sample) {
    const view = surface(canvas);
    if (!view) return [];
    const { ctx, width, height } = view;
    const r = Math.min(30, width / 19, height * .18), inset = r + 6;
    const centers = geometry.layout.map(([x, y]) =>
      [inset + (width - 2 * inset) * x / 6, y ? height - r - 4 : r + 8]);
    const project = model.sites.map((sites, piece) => atlasFrame(sites, piece, centers, r));
    model.sites.forEach((sites, piece) => {
      const [cx, cy] = centers[piece];
      const active = model.active[piece];
      const gradient = ctx.createRadialGradient(cx - r * .4, cy - r * .45, 0, cx, cy, r);
      gradient.addColorStop(0, active ? '#63b5bd' : '#293543');
      gradient.addColorStop(1, active ? '#1a4857' : '#15202c');
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, circle);
      ctx.fillStyle = gradient; ctx.fill();
      ctx.strokeStyle = active ? '#699aa8' : '#3b495a'; ctx.lineWidth = 1; ctx.stroke();
      if (active) {
        for (let axis = 0; axis < 3; axis++) {
          circlePath(ctx, project[piece], axis, 0, 1, true);
          ctx.strokeStyle = '#ffffff34'; ctx.lineWidth = .8; ctx.stroke();
        }
        for (const joint of sites) {
          if (!model.active[joint.a] || !model.active[joint.b]) continue;
          const slot = piece === joint.a ? joint.slotA : joint.slotB;
          circlePath(ctx, project[piece], slot, geometry.minHeight, geometry.radius, false);
          const glued = model.isGlued(joint);
          if (glued) { ctx.fillStyle = colors.outside; ctx.fill(); }
          ctx.strokeStyle = joint === selected ? colors.selected : glued ? colors.seam : '#a3c5ce';
          ctx.lineWidth = joint === selected ? 2 : 1.3;
          ctx.setLineDash(glued ? [] : [2, 3]); ctx.stroke(); ctx.setLineDash([]);
        }
      }
      ctx.fillStyle = active ? '#dce8f1' : '#798594';
      ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.font = 'bold 13px monospace';
      ctx.strokeStyle = '#17353f'; ctx.lineWidth = 3; ctx.strokeText(geometry.rootName(piece), cx, cy);
      ctx.fillText(geometry.rootName(piece), cx, cy);
    });
    const links = model.joints.map(joint => {
      const anchors = [[joint.a, joint.slotA], [joint.b, joint.slotB]].map(([piece, slot]) => {
        const center = [0, 0, 0]; center[slot] = geometry.minHeight;
        return project[piece](center);
      });
      const [[ax, ay], [bx, by]] = anchors, a = centers[joint.a], b = centers[joint.b];
      const reach = .32 * Math.hypot(bx - ax, by - ay) / r;
      const path = new Path2D();
      path.moveTo(ax, ay);
      path.bezierCurveTo(ax + reach * (ax - a[0]), ay + reach * (ay - a[1]),
        bx + reach * (bx - b[0]), by + reach * (by - b[1]), bx, by);
      const glued = model.isGlued(joint), chosen = joint === selected;
      ctx.lineCap = 'round';
      if (glued) {
        ctx.strokeStyle = chosen ? '#866736' : '#2b7367'; ctx.lineWidth = chosen ? 9 : 7; ctx.stroke(path);
      }
      ctx.strokeStyle = chosen ? colors.selected : glued ? colors.seam : colors.muted;
      ctx.lineWidth = glued ? 2.4 : 1.6; ctx.setLineDash(glued ? [] : [3, 6]);
      ctx.stroke(path); ctx.setLineDash([]); ctx.lineCap = 'butt';
      return { joint, path };
    });
    for (const side of sample ? sample.sides : []) marker(ctx, ...project[side.piece](side.point.x));
    return links;
  }

  function drawCollar(canvas, sample, glued, firstName, secondName) {
    const view = surface(canvas);
    if (!view || !sample) return;
    const { ctx, width, height } = view;
    const left = 24, right = width - 12, top = 12, bottom = height - 23;
    const x = r => left + (r - .55) * (right - left) / .9;
    const y = r => bottom - (r - .55) * (bottom - top) / .9;
    const cx = x(1), cy = y(1);
    ctx.fillStyle = glued ? colors.body : '#182632'; ctx.fillRect(left, top, right - left, bottom - top);
    ctx.fillStyle = colors.outside; ctx.fillRect(cx, top, right - cx, cy - top);
    ctx.strokeStyle = colors.outline; ctx.lineWidth = 1; ctx.strokeRect(left, top, right - left, bottom - top);
    function line(x1, y1, x2, y2, color, weight) {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.strokeStyle = color; ctx.lineWidth = weight; ctx.stroke();
    }
    line(glued ? cx : left, cy, right, cy, colors.face, 2.5);
    line(cx, glued ? cy : bottom, cx, top, colors.seam, 2.5);
    ctx.font = '11px monospace'; ctx.fillStyle = colors.muted; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(glued ? 'plumbing interior' : 'separate charts', left + 7, bottom - 17);
    ctx.fillText('outside', cx + 8, top + 6);
    ctx.textAlign = 'right'; ctx.fillStyle = colors.face; ctx.fillText(firstName, right - 5, cy + 6);
    ctx.fillStyle = colors.seam; ctx.fillText(secondName, cx - 6, top + 6);
    ctx.fillStyle = colors.muted; ctx.fillText('base radius', right, bottom + 5);
    ctx.textAlign = 'center'; ctx.fillText('1', cx, bottom + 5);
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText('1', left - 4, cy);
    ctx.save(); ctx.translate(8, top + 1); ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'right'; ctx.fillText('fiber radius', 0, 0); ctx.restore();
    marker(ctx, x(sample.baseRadius), y(sample.fiberRadius));
  }

  // Display S¹ × [-1,1] in the collar of one seam. The angle varies a real
  // base direction on A and the same fiber direction on B. The embedding and
  // shading are illustrative. Each plotted half ends at the same t=0 ring
  // exactly when the model identifies the rim points.
  function drawNeighborhood(canvas, sample, glued, names, zoom) {
    const view = surface(canvas);
    if (!view) return;
    const { ctx, width, height } = view;
    const halfWidth = width * .395, radius = Math.min(height * .27, width * .14);
    const t = (sample.fiberRadius - sample.baseRadius) / .35;
    const position = (u, angle) => {
      const r = radius * (1 + .27 * u * u);
      return [halfWidth * u + .43 * r * Math.cos(angle),
        -r * Math.sin(angle) - height * .115 * u + .13 * r * Math.cos(angle)];
    };
    const focus = position(t, sample.angle);
    const gap = glued ? 0 : Math.min(width * .10, radius * .65);
    function point(u, angle, side) {
      const [x, y] = position(u, angle);
      return [width / 2 + focus[0] + (x - focus[0]) * zoom + side * gap,
        height * .51 + focus[1] + (y - focus[1]) * zoom];
    }
    const resolution = Math.ceil(Math.sqrt(zoom));
    const angles = 32 * resolution, lengths = 7 * resolution;
    const strips = Array.from({ length: angles }, (_, i) => i);
    const depth = i => Math.cos((i + .5) * circle / angles);
    strips.sort((i, j) => depth(i) - depth(j));
    for (const k of strips) {
      const a = k * circle / angles, b = (k + 1) * circle / angles;
      const light = .54 + .38 * Math.cos((a + b) / 2 - .72);
      for (const side of [-1, 1]) {
        const rgb = side < 0 ? [70, 187, 188] : [128, 143, 216];
        ctx.fillStyle = 'rgb(' + rgb.map(c => Math.round(c * light)).join(',') + ')';
        ctx.strokeStyle = depth(k) > 0 ? 'rgba(178,224,234,.21)' : 'rgba(123,160,184,.13)';
        ctx.lineWidth = .7;
        let u = 0, p = point(u, a, side), q = point(u, b, side);
        for (let j = 1; j <= lengths; j++) {
          u = side * j / lengths;
          const nextP = point(u, a, side), nextQ = point(u, b, side);
          if (Math.max(p[0], q[0], nextP[0], nextQ[0]) >= 0 && Math.min(p[0], q[0], nextP[0], nextQ[0]) <= width &&
              Math.max(p[1], q[1], nextP[1], nextQ[1]) >= 0 && Math.min(p[1], q[1], nextP[1], nextQ[1]) <= height) {
            ctx.beginPath(); ctx.moveTo(...p); ctx.lineTo(...nextP);
            ctx.lineTo(...nextQ); ctx.lineTo(...q); ctx.closePath(); ctx.fill(); ctx.stroke();
          }
          p = nextP; q = nextQ;
        }
      }
    }
    // Show the back of the seam as a dashed construction line.
    for (const side of glued ? [0] : [-1, 1]) {
      for (const front of [false, true]) {
        const start = front ? -Math.PI / 2 : Math.PI / 2;
        ctx.beginPath();
        for (let k = 0; k <= 80; k++) {
          const p = point(0, start + Math.PI * k / 80, side);
          if (k === 0) ctx.moveTo(...p); else ctx.lineTo(...p);
        }
        ctx.strokeStyle = front ? colors.selected : '#bfa975';
        ctx.lineWidth = front ? 2.8 : 1.3; ctx.setLineDash(front ? [] : [3, 5]); ctx.stroke();
      }
    }
    // The marked curve uses the same two radii as the coordinate readout.
    ctx.setLineDash(Math.cos(sample.angle) < 0 ? [3, 5] : []);
    for (const side of [-1, 1]) {
      ctx.beginPath();
      for (let k = 0; k <= 32; k++) {
        const p = point(side * k / 32, sample.angle, side);
        if (k === 0) ctx.moveTo(...p); else ctx.lineTo(...p);
      }
      ctx.strokeStyle = '#ffe0a2a8'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    ctx.setLineDash([]);
    const markedSides = t === 0 && !sample.identified ? [-1, 1] : [Math.sign(t)];
    for (const side of markedSides) {
      const [x, y] = point(t, sample.angle, side);
      ctx.beginPath(); ctx.arc(x, y, 8, 0, circle); ctx.fillStyle = '#0e1c27cb'; ctx.fill();
      ctx.lineWidth = 1.5; ctx.strokeStyle = colors.selected; ctx.stroke(); marker(ctx, x, y);
    }
    ctx.font = 'bold 13px monospace'; ctx.textBaseline = 'top';
    [[names[0], 12, 'left', '#a5efe6'], [names[1], width - 12, 'right', '#cbcaff']].forEach(([s, x, align, color]) => {
      ctx.textAlign = align; ctx.fillStyle = color; ctx.strokeStyle = '#0b1722'; ctx.lineWidth = 4;
      ctx.strokeText(s, x, 10); ctx.fillText(s, x, 10);
    });
  }

  function mount(model, geometry, actions) {
    const el = id => document.getElementById('bd-' + id);
    const atlas = el('atlas'), collar = el('collar'), select = el('joint'), slider = el('position');
    const scene = el('neighborhood'), angle = el('angle'), crossing = el('cross');
    let selected, links = [], zoom = 1, animation = null, routeKey;
    function inspectJoint(joint, travel = 0) {
      if (!joint) return;
      stopCrossing(); slider.value = travel; angle.value = 0;
      actions.select(joint);
    }
    function adjoiningRims(sides) {
      const choices = sides.flatMap(({ piece }) => model.sites[piece]
        .filter(j => j !== selected && model.isGlued(j)).map(joint => ({ piece, joint })));
      const key = choices.map(c => c.piece + '/' + c.joint.id).join(',');
      if (routeKey === key) return;
      routeKey = key;
      const box = el('onward');
      box.replaceChildren();
      if (!choices.length) { box.textContent = 'No other glued rim on this side.'; return; }
      for (const { piece, joint } of choices) {
        const next = piece === joint.a ? joint.b : joint.a, btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'btn-sm';
        btn.textContent = geometry.rootName(piece) + ' → ' + geometry.rootName(next);
        btn.setAttribute('aria-label', 'Inspect the other rim on ' + geometry.rootName(piece) + ' leading to ' + geometry.rootName(next));
        btn.onclick = () => {
          inspectJoint(joint, piece === joint.a ? -100 : 100);
          crossing.focus({ preventScroll: true });
        };
        box.append(btn);
      }
    }
    function renderTrace() {
      const t = Number(slider.value) / 100;
      const theta = Number(angle.value) * Math.PI / 180;
      const sample = selected ? trace(model, geometry.bundlePoint, selected, t, theta) : null;
      links = drawAtlas(atlas, model, geometry, selected, sample);
      if (!sample) return;
      const name = i => geometry.rootName(i);
      const glued = model.isGlued(selected);
      const names = [name(selected.a), name(selected.b)];
      drawNeighborhood(scene, sample, glued, names, zoom);
      drawCollar(collar, sample, glued, ...names);
      el('radii').textContent = 'Plot radii · |q| ' + sample.baseRadius.toFixed(4) +
        ' · |p| ' + sample.fiberRadius.toFixed(4);
      const pointText = t === 0
        ? (sample.identified ? 'One seam point in both charts. The two S³ factors exchange places.'
          : 'Two separate rim points. Glue this joint to identify them.')
        : 'On the exposed sheet of ' + name(sample.sides[0].piece) + ', outside its attachment cap.';
      if (el('point').textContent !== pointText) el('point').textContent = pointText;
      el('swap').textContent = glued ? 'Turning around this circle moves along the base rim on ' +
        names[0] + ' and along the fiber on ' + names[1] + '.' : 'The two cut edges belong to separate sheets until this joint is glued.';
      adjoiningRims(sample.sides);
      slider.setAttribute('aria-valuetext', pointText);
      scene.setAttribute('aria-valuenow', slider.value);
      scene.setAttribute('aria-valuetext', pointText);
      el('angle-value').textContent = angle.value + '°';
      const vector = xs => '(' + xs.map(n => (Math.abs(n) < .0005 ? 0 : n).toFixed(3)).join(', ') + ')';
      el('coordinates').textContent = sample.sides.map(({ piece, point }) =>
        name(piece) + '  x = ' + vector(point.x) + '\n    v = ' + vector(point.v)).join('\n');
    }
    function stopCrossing() {
      if (animation !== null) cancelAnimationFrame(animation);
      animation = null; crossing.textContent = 'Cross seam';
    }
    function setZoom(value) {
      zoom = Math.max(1, Math.min(16, value));
      el('zoom-level').textContent = Number(zoom.toFixed(1)) + '×';
      el('zoom-in').disabled = zoom >= 16; el('zoom-out').disabled = zoom <= 1;
      el('fit').disabled = zoom <= 1;
      renderTrace();
    }
    function update(joint) {
      if (joint !== selected || !joint || !model.isGlued(joint)) stopCrossing();
      selected = joint;
      const pieces = model.active.filter(Boolean).length, seams = model.gluedCount;
      const complete = pieces === 8 && seams === 7;
      el('status').textContent = pieces + (pieces === 1 ? ' piece' : ' pieces') + ' · ' + seams + (seams === 1 ? ' glued seam' : ' glued seams');
      el('complete').disabled = complete;
      el('complete').textContent = complete ? 'All eight pieces assembled' : 'Assemble all eight pieces';
      el('invariant').hidden = !complete; el('partial').hidden = complete;
      select.replaceChildren(...model.joints.map(j =>
        new Option(geometry.jointName(j) + (model.isGlued(j) ? ' · glued' : ' · open'), j.id)));
      select.disabled = !joint;
      el('seam-panel').hidden = !joint; el('empty').hidden = !!joint;
      if (joint) {
        select.value = joint.id;
        el('left-label').textContent = geometry.rootName(joint.a);
        el('right-label').textContent = geometry.rootName(joint.b);
        el('joint-title').textContent = 'Inside the joint · ' + geometry.jointName(joint);
        crossing.disabled = !model.isGlued(joint);
      }
      renderTrace();
    }
    select.onchange = () => inspectJoint(model.joints.find(j => j.id === Number(select.value)));
    atlas.onclick = event => {
      const rect = atlas.getBoundingClientRect(), ctx = atlas.getContext('2d');
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.lineWidth = 20; ctx.lineCap = 'round';
      const link = links.find(({ path }) => ctx.isPointInStroke(path, event.clientX - rect.left, event.clientY - rect.top));
      ctx.restore();
      if (link) inspectJoint(link.joint);
    };
    slider.oninput = angle.oninput = () => { stopCrossing(); renderTrace(); };
    el('center').onclick = () => { stopCrossing(); slider.value = '0'; renderTrace(); };
    el('zoom-in').onclick = () => setZoom(zoom * 2);
    el('zoom-out').onclick = () => setZoom(zoom / 2);
    el('fit').onclick = () => setZoom(1);
    el('zoom-out').disabled = true; el('fit').disabled = true;
    crossing.onclick = () => {
      if (animation !== null) { stopCrossing(); return; }
      if (!selected || !model.isGlued(selected)) return;
      const start = Number(slider.value) > 0 ? 100 : -100;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        slider.value = -start; renderTrace(); return;
      }
      crossing.textContent = 'Stop';
      let phase = 0, began;
      function advance(now) {
        if (began === undefined) began = now;
        // Start the hold when the ring is actually drawn, even on a slow display.
        const elapsed = Math.min(1, (now - began) / (phase === 1 ? 700 : 850));
        const progress = elapsed * elapsed * (3 - 2 * elapsed);
        const value = Math.round(phase === 0 ? start * (1 - progress) : phase === 1 ? 0 : -start * progress);
        if (Number(slider.value) !== value) { slider.value = value; renderTrace(); }
        if (elapsed === 1) {
          if (phase === 2) { stopCrossing(); return; }
          phase++; began = now;
        }
        animation = requestAnimationFrame(advance);
      }
      animation = requestAnimationFrame(advance);
    };
    scene.addEventListener('wheel', event => {
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? scene.clientHeight : 1);
      if (!delta || (delta > 0 && zoom === 1) || (delta < 0 && zoom === 16)) return;
      event.preventDefault();
      setZoom(zoom * Math.exp(-delta * .0025));
    }, { passive: false });
    const pointers = new Map();
    let gesture;
    function distance() {
      const [a, b] = pointers.values();
      return Math.hypot(a.x - b.x, a.y - b.y);
    }
    function startGesture() {
      if (pointers.size === 1) {
        const [p] = pointers.values();
        gesture = { x: p.x, y: p.y, travel: Number(slider.value), angle: Number(angle.value) };
      } else if (pointers.size === 2) {
        gesture = { distance: Math.max(1, distance()), zoom };
      }
    }
    scene.onpointerdown = event => {
      if (event.button !== 0 || pointers.size >= 2) return;
      stopCrossing(); scene.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY }); startGesture();
    };
    scene.onpointermove = event => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 2) { setZoom(gesture.zoom * distance() / gesture.distance); return; }
      slider.value = gesture.travel + (event.clientX - gesture.x) * 250 / (scene.clientWidth * zoom);
      const degrees = Math.round(gesture.angle + (gesture.y - event.clientY) * 300 / (scene.clientHeight * zoom));
      angle.value = ((degrees + 180) % 360 + 360) % 360 - 180;
      renderTrace();
    };
    scene.onlostpointercapture = scene.onpointerup = scene.onpointercancel = event => {
      if (pointers.delete(event.pointerId)) startGesture();
    };
    scene.onkeydown = event => {
      switch (event.key) {
        case 'ArrowLeft': slider.value = Number(slider.value) - 2; break;
        case 'ArrowRight': slider.value = Number(slider.value) + 2; break;
        case 'ArrowUp': angle.value = Number(angle.value) + 5; break;
        case 'ArrowDown': angle.value = Number(angle.value) - 5; break;
        case 'Home': slider.value = -100; break;
        case 'End': slider.value = 100; break;
        case '+': case '=': setZoom(zoom * 2); break;
        case '-': setZoom(zoom / 2); break;
        default: return;
      }
      event.preventDefault(); stopCrossing(); renderTrace();
    };
    el('complete').onclick = actions.complete;
    const panel = document.getElementById('plumbing-boundary');
    document.querySelector('.bd-jump').onclick = event => {
      event.preventDefault();
      panel.scrollIntoView({ block: 'start' });
    };
    if (new URL(document.baseURI).searchParams.get('view') === 'boundary') {
      window.addEventListener('load', () => {
        actions.complete();
        inspectJoint(model.joints.find(joint => joint.a === 4 && joint.b === 6));
        panel.scrollIntoView({ block: 'start' });
      }, { once: true });
    }
    el('assembly').onclick = event => {
      event.preventDefault();
      document.getElementById('plumbing').scrollIntoView({ block: 'start' });
    };
    const observer = new ResizeObserver(renderTrace);
    observer.observe(atlas); observer.observe(collar); observer.observe(scene);
    return { update };
  }
  return { trace, mount };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = E8Boundary;
