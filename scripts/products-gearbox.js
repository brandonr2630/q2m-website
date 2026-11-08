/* Gear Reducers category page: interactive 3D cutaway of a two-stage helical gearbox (12:1 = 3:1 x 4:1).
   Inlined at the end of the page by build-product-pages.js. three.js is self-hosted and loaded only when the
   figure is about to scroll into view, so the page itself stays light. Strings come from #gbx-data. */
(function () {
  'use strict';
  var fig = document.getElementById('gbx');
  var dataEl = document.getElementById('gbx-data');
  if (!fig || !dataEl) return;
  var D = JSON.parse(dataEl.textContent);
  var stage = fig.querySelector('.gbx-stage');
  fig.hidden = false;

  var started = false;
  function loadScript(src, ok, fail) {
    var s = document.createElement('script');
    s.src = src; s.async = true; s.onload = ok; s.onerror = fail;
    document.head.appendChild(s);
  }
  function noGl() { stage.classList.add('nogl'); }
  function start() {
    if (started) return;
    started = true;
    loadScript('/assets/vendor/three/three.min.js', function () {
      loadScript('/assets/vendor/three/OrbitControls.js', build, noGl);
    }, noGl);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { io.disconnect(); start(); }
    }, { rootMargin: '300px' });
    io.observe(stage);
  } else {
    start();
  }

  function build() {
    var T = window.THREE;
    if (!T || !T.OrbitControls) return noGl();
    var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- helpers ---------- */
    function mat(color, o) { return new T.MeshStandardMaterial(Object.assign({ color: color, metalness: 0.35, roughness: 0.5 }, o || {})); }
    function box(w, h, d, m) { return new T.Mesh(new T.BoxGeometry(w, h, d), m); }
    function put(parent, mesh, x, y, z) { mesh.position.set(x || 0, y || 0, z || 0); parent.add(mesh); return mesh; }
    // cylinder from a to b along an axis; p1, p2 are the two other coordinates (x: y,z  y: x,z  z: x,y)
    function rod(parent, axis, r, a, b, m, p1, p2, seg) {
      var g = new T.CylinderGeometry(r, r, Math.abs(b - a), seg || 40, 1, false);
      if (axis === 'x') g.rotateZ(Math.PI / 2);
      if (axis === 'z') g.rotateX(Math.PI / 2);
      var mesh = new T.Mesh(g, m), c = (a + b) / 2; p1 = p1 || 0; p2 = p2 || 0;
      if (axis === 'x') mesh.position.set(c, p1, p2);
      if (axis === 'y') mesh.position.set(p1, c, p2);
      if (axis === 'z') mesh.position.set(p1, p2, c);
      parent.add(mesh); return mesh;
    }
    function anchor(parent, x, y, z) { var o = new T.Object3D(); o.position.set(x, y, z); parent.add(o); return o; }
    function ring(parent, axis, rin, rout, width, m, pos) {
      var pts = [new T.Vector2(rin, -width / 2), new T.Vector2(rout, -width / 2), new T.Vector2(rout, width / 2), new T.Vector2(rin, width / 2), new T.Vector2(rin, -width / 2)];
      var g = new T.LatheGeometry(pts, 36);
      if (axis === 'x') g.rotateZ(Math.PI / 2);
      if (axis === 'z') g.rotateX(Math.PI / 2);
      var mesh = new T.Mesh(g, m); mesh.material.side = T.DoubleSide;
      mesh.position.set(pos[0], pos[1], pos[2]); parent.add(mesh); return mesh;
    }
    function centerline(parent, a, b, color) {
      var g = new T.BufferGeometry().setFromPoints([new T.Vector3(0, 0, a), new T.Vector3(0, 0, b)]);
      var l = new T.Line(g, new T.LineDashedMaterial({ color: color, dashSize: 1.6, gapSize: 0.6, transparent: true, opacity: 0.8 }));
      l.computeLineDistances(); parent.add(l); return l;
    }

    /* ---------- helical gear with a real tooth profile ---------- */
    function gearGeo(z, m, width, helixDeg, hand) {
      var rp = m * z / 2, ra = rp + m, rf = rp - 1.25 * m, pitch = 2 * Math.PI / z;
      var tpl = [[-0.32, rf], [-0.15, ra], [0.15, ra], [0.32, rf], [0.5, rf]];
      var prof = [], k, i, s;
      for (k = 0; k < z; k++) for (i = 0; i < tpl.length; i++) prof.push([k * pitch + tpl[i][0] * pitch, tpl[i][1]]);
      var N = prof.length, S = helixDeg ? 10 : 1, tan = Math.tan(helixDeg * Math.PI / 180);
      var pos = [], idx = [];
      for (s = 0; s <= S; s++) {
        var h = -width / 2 + width * s / S, psi = hand * tan * h / rp;
        for (i = 0; i < N; i++) pos.push(prof[i][1] * Math.cos(prof[i][0] + psi), prof[i][1] * Math.sin(prof[i][0] + psi), h);
      }
      for (s = 0; s < S; s++) for (i = 0; i < N; i++) {
        var j = (i + 1) % N, a = s * N + i, b = s * N + j, c = (s + 1) * N + i, d = (s + 1) * N + j;
        idx.push(a, b, c, b, d, c);
      }
      var c0 = pos.length / 3; pos.push(0, 0, -width / 2);
      var c1 = c0 + 1; pos.push(0, 0, width / 2);
      for (i = 0; i < N; i++) { var jj = (i + 1) % N; idx.push(c0, jj, i); idx.push(c1, S * N + i, S * N + jj); }
      var g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
      g.setIndex(idx); g.computeVertexNormals();
      return { geo: g, rp: rp };
    }
    function gearObj(z, m, width, helix, hand, color) {
      var G = gearGeo(z, m, width, helix, hand), grp = new T.Group();
      grp.add(new T.Mesh(G.geo, mat(color, { metalness: 0.5, roughness: 0.38, flatShading: true, side: T.DoubleSide })));
      if (G.rp > 5) rod(grp, 'z', 0.62 * G.rp, -width / 2 - 0.08, width / 2 + 0.08, mat(0x4a5663, { metalness: 0.4 }), 0, 0, 48);
      return grp;
    }

    /* ---------- renderer, camera, controls, labels, loop ---------- */
    var canvas = stage.querySelector('canvas'), renderer;
    try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); } catch (e) { return noGl(); }
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.localClippingEnabled = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(32, 1.8, 0.5, 700);
    var home = new T.Vector3(21, 46, 38), target = new T.Vector3(15, 0, 0);
    camera.position.copy(home);
    var controls = new T.OrbitControls(camera, canvas);
    controls.target.copy(target);
    controls.enableZoom = false; controls.enablePan = false;
    controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.6;
    controls.update();

    scene.add(new T.HemisphereLight(0xffffff, 0x8b97a5, 0.85));
    var key = new T.DirectionalLight(0xffffff, 0.95); key.position.set(30, 60, 40); scene.add(key);
    var fill = new T.DirectionalLight(0xffffff, 0.4); fill.position.set(-40, 12, -30); scene.add(fill);
    var rim = new T.DirectionalLight(0xffffff, 0.25); rim.position.set(0, -20, 40); scene.add(rim);
    var grid = new T.GridHelper(150, 30, 0x8a96a3, 0x8a96a3);
    grid.position.set(15, -15, 0);
    grid.material.transparent = true; grid.material.opacity = 0.22; scene.add(grid);

    var size = { w: 1, h: 1 };
    function resize() {
      var w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
      renderer.setSize(w, h, false); camera.aspect = w / h;
      // keep the same horizontal coverage on narrow (phone) stages by widening the vertical field of view
      camera.fov = camera.aspect < 1.8 ? 2 * Math.atan(Math.tan(16 * Math.PI / 180) * 1.8 / camera.aspect) * 180 / Math.PI : 32;
      camera.updateProjectionMatrix(); size.w = w; size.h = h;
    }
    if (window.ResizeObserver) new ResizeObserver(resize).observe(stage); else window.addEventListener('resize', resize);
    resize();

    var labels = [], visible = true;
    function addLabel(text, obj, cls) {
      var s = document.createElement('span'); s.className = 'gbx-lbl ' + cls; s.textContent = text; stage.appendChild(s);
      labels.push({ el: s, obj: obj, v: new T.Vector3() });
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(stage);

    /* ---------- two-stage helical gearbox ---------- */
    var rig = new T.Group(); scene.add(rig);
    var clip = new T.Plane(new T.Vector3(0, -1, 0), 0);
    var clipMats = [];
    var z1 = 14, z2 = 42, m1 = 0.36, z3 = 12, z4 = 48, m2 = 0.4;
    var X0 = 0, X1 = (z1 + z2) / 2 * m1, X2 = X1 + (z3 + z4) / 2 * m2;       // shaft x-positions
    var ZA = -2.6, ZB = 2.6, HX = 15, hw = 39.5, hh = 23, hd = 11.6;          // gear z-positions, housing
    var shIn = mat(0x3f6fc4), shMid = mat(0x8a96a3), shOut = mat(0xc87a1d), brgM = mat(0x39434e, { metalness: 0.6, roughness: 0.35 });

    function shaftAsm(x, r, za, zb, m, keyZ) {
      var asm = new T.Group(); asm.position.set(x, 0, 0); rig.add(asm);
      var spin = new T.Group(); asm.add(spin);
      rod(spin, 'z', r, za, zb, m, 0, 0);
      var kw = put(spin, box(0.55, 0.5, 3.4, mat(0x2a323b)), 0, r, keyZ);
      centerline(asm, -13, 13, 0xd9534f);
      [-5.2, 5.2].forEach(function (bz) { ring(asm, 'z', r, r + 0.9, 0.8, brgM, [0, 0, bz]); });
      return { asm: asm, spin: spin, key: kw };
    }
    var A1 = shaftAsm(X0, 0.9, -11, 5.6, shIn, -8.4);
    var A2 = shaftAsm(X1, 1.3, -5.6, 5.6, shMid, 99);
    var A3 = shaftAsm(X2, 1.7, -5.6, 11, shOut, 8.6);
    A2.key.visible = false;

    var gP1 = gearObj(z1, m1, 2.4, 18, +1, 0x5b8fe0), gG2 = gearObj(z2, m1, 2.4, 18, -1, 0xaab4bf);
    var gP3 = gearObj(z3, m2, 3.2, 18, -1, 0xaab4bf), gG4 = gearObj(z4, m2, 3.2, 18, +1, 0xe0953a);
    put(A1.spin, gP1, 0, 0, ZA); put(A2.spin, gG2, 0, 0, ZA);
    put(A2.spin, gP3, 0, 0, ZB); put(A3.spin, gG4, 0, 0, ZB);

    var hMat = new T.MeshStandardMaterial({ color: 0x9fb0c4, metalness: 0.2, roughness: 0.6, transparent: true, opacity: 0.30, side: T.DoubleSide, depthWrite: false, clippingPlanes: [clip] });
    var hGeo = new T.BoxGeometry(hw, hh, hd);
    put(rig, new T.Mesh(hGeo, hMat), HX, 0, 0);
    var eMat = new T.LineBasicMaterial({ color: 0x5c6b7a, clippingPlanes: [clip] });
    put(rig, new T.LineSegments(new T.EdgesGeometry(hGeo), eMat), HX, 0, 0);
    var feetM = mat(0x6d7b89);
    [HX - 15, HX + 15].forEach(function (fx) { put(rig, box(6, 1.2, hd + 5, feetM), fx, -hh / 2 - 0.6, 0); });
    var brM = mat(0x5a6773, { clippingPlanes: [clip] }); clipMats.push(brM);
    rod(rig, 'y', 0.8, hh / 2, hh / 2 + 1.6, brM, HX + 10, 0, 24);
    rod(rig, 'y', 1.1, hh / 2 + 1.6, hh / 2 + 2.1, brM, HX + 10, 0, 24);
    rod(rig, 'y', 0.7, -hh / 2 - 0.5, -hh / 2, mat(0x2a323b), HX - 8, 3, 20);
    var oil = new T.Mesh(new T.BoxGeometry(hw - 0.8, 2.8, hd - 0.8), new T.MeshStandardMaterial({ color: 0x2b7fd8, transparent: true, opacity: 0.42, roughness: 0.2, metalness: 0.1, depthWrite: false }));
    oil.position.set(HX, -hh / 2 + 0.4 + 1.4, 0); rig.add(oil);

    // labels: three shafts, two stages, oil sump
    addLabel(D.s.lIn, anchor(A1.asm, -7, 2, -10.5), 'gbx-in');
    addLabel(D.s.lMid, anchor(A2.asm, 0, 2.9, 5.4), 'gbx-mid');
    addLabel(D.s.lOut, anchor(A3.asm, 0, 3.4, 10.2), 'gbx-out');
    addLabel(D.s.lS1, anchor(rig, X1 * 0.8, 12.5, ZA), 'gbx-stage-lbl');
    addLabel(D.s.lS2, anchor(rig, X1 + (X2 - X1) * 0.3, 11.5, ZB), 'gbx-stage-lbl');
    addLabel(D.s.lSump, anchor(rig, HX + hw / 2 - 6, -hh / 2 + 2, hd / 2), 'gbx-sump');

    // controls
    var running = !reduceMotion;
    var runBtn = fig.querySelector('[data-act=run]'), cutBox = fig.querySelector('[data-act=cut]'), resetBtn = fig.querySelector('[data-act=reset]');
    function syncRun() { runBtn.textContent = running ? D.s.pause : D.s.run; }
    runBtn.addEventListener('click', function () { running = !running; syncRun(); });
    resetBtn.addEventListener('click', function () { camera.position.copy(home); controls.target.copy(target); controls.update(); });
    function setCut(on) {
      var cp = on ? [clip] : [];
      hMat.clippingPlanes = cp; eMat.clippingPlanes = cp; hMat.needsUpdate = true; eMat.needsUpdate = true;
      clipMats.forEach(function (m) { m.clippingPlanes = cp; m.needsUpdate = true; });
    }
    cutBox.addEventListener('change', function () { setCut(cutBox.checked); });
    setCut(cutBox.checked); syncRun();

    // kinematics: the gear phase is set so teeth enter the gaps of the mating gear
    var th = 0, W = 2.2;
    var phi2 = Math.PI - Math.PI / z2, phi4 = Math.PI - Math.PI / z4;
    function pose(t) {
      var t2 = phi2 - t * z1 / z2, t4 = phi4 - t2 * z3 / z4;
      A1.spin.rotation.z = t; A2.spin.rotation.z = t2; A3.spin.rotation.z = t4;
    }
    pose(0);

    var clock = new T.Clock();
    function frame() {
      requestAnimationFrame(frame);
      var dt = Math.min(clock.getDelta(), 0.05);
      if (!visible || document.hidden) return;
      if (running) { th += W * dt; pose(th); }
      controls.update();
      scene.updateMatrixWorld();
      for (var j = 0; j < labels.length; j++) {
        var L = labels[j]; L.obj.getWorldPosition(L.v); L.v.project(camera);
        var x = (L.v.x * 0.5 + 0.5) * size.w, y = (-L.v.y * 0.5 + 0.5) * size.h;
        L.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) translate(-50%,-50%)';
        L.el.classList.add('on');
      }
      renderer.render(scene, camera);
    }
    frame();
  }
})();
