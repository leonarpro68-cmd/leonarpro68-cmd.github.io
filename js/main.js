// Theme toggle (remembers choice) + footer year + walking-robot animation.
(function () {
  const root = document.documentElement;
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
    startWalker();
  });

  // ------------------------------------------------------------------
  // Robot: walks in -> trips in the middle -> gets up -> walks on ->
  // fires foot thrusters near the end -> flies off on a parabola -> repeats.
  function startWalker() {
    const el = document.getElementById('walker');
    if (!el) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const WALK = 55;            // px/s
    const G = 900;              // px/s^2, "gravity" of the flight
    const W0 = 38;              // robot width
    const ease = {
      inQuad: t => t * t,
      outBack: t => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
      inOut: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    };

    let state, t0, x, y, rot, vx, vy, xStart, tFall, tLaunch;

    function setClass(c) { el.className = 'walker ' + c; }
    function draw() { el.style.transform = `translate(${x}px, ${-y}px) rotate(${rot}deg)`; }
    function reset(now) {
      const W = window.innerWidth;
      state = 'walk1'; t0 = now; x = -60; y = 0; rot = 0;
      xStart = x; tFall = W * 0.5 - W0 / 2; tLaunch = W * 0.82;
      setClass('walking');
    }

    let last = performance.now();
    reset(last);

    function step(now) {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      const s = (now - t0) / 1000;               // seconds in current state
      const go = (next, cls) => { state = next; t0 = now; if (cls !== undefined) setClass(cls); };

      switch (state) {
        case 'walk1':                            // walk to the middle
          x += WALK * dt; rot = 0;
          if (x >= tFall) go('stumble', '');
          break;
        case 'stumble':                          // catches a foot, leans forward
          rot = 14 * Math.sin(Math.min(s / 0.25, 1) * Math.PI / 2);
          if (s >= 0.25) go('fall');
          break;
        case 'fall':                             // falls flat on its face, small bounce
          if (s < 0.45) rot = 14 + (90 - 14) * ease.inQuad(s / 0.45);
          else if (s < 0.75) rot = 90 - 7 * Math.sin((s - 0.45) / 0.3 * Math.PI);
          else rot = 90;
          if (s >= 1.6) go('getup');
          break;
        case 'getup':                            // pushes itself back up
          { const k = Math.min(s / 0.9, 1); rot = 90 * (1 - ease.outBack(k)); }
          if (s >= 0.9) { rot = 0; go('shake'); }
          break;
        case 'shake':                            // shakes it off
          rot = 4 * Math.sin(s * 30) * Math.max(0, 1 - s / 0.6);
          if (s >= 0.7) { rot = 0; go('walk2', 'walking'); }
          break;
        case 'walk2':                            // keeps walking to the launch point
          x += WALK * dt;
          if (x >= tLaunch) go('crouch', '');
          break;
        case 'crouch':                           // stops and ignites the thrusters
          y = 0; rot = 0;
          if (s >= 0.2 && el.className.indexOf('ignite') < 0) setClass('ignite');
          if (s >= 1.0) {
            const W = window.innerWidth;
            vx = Math.max(220, (W - x + 80) / 1.3); // always leaves through the right side
            vy = 620;
            setClass('thrust'); go('fly');
          }
          break;
        case 'fly':                              // parabolic flight: x = vx t, y = vy t - g t^2 / 2
          x += vx * dt; vy -= G * dt; y += vy * dt;
          rot = Math.atan2(vx, Math.max(vy, -vx)) * 180 / Math.PI * 0.6;
          if (x > window.innerWidth + 80 || y > window.innerHeight + 120 || y < -120) go('gone', '');
          break;
        case 'gone':                             // pause off-screen, then start again
          if (s >= 3) reset(now);
          break;
      }
      draw();
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    window.addEventListener('resize', () => {
      const W = window.innerWidth;
      tFall = W * 0.5 - W0 / 2; tLaunch = W * 0.82;
    });
  }
})();
