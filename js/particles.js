/* ==========================================================================
   FLOATING PASTEL LIGHT PARTICLES (PINK, LIGHT BLUE & WHITE — ZERO GOLD)
   Lightweight canvas renderer constrained to the 480px viewport
   ========================================================================== */
(function () {
  'use strict';

  function initParticles() {
    if (document.body.classList.contains('lite-mode')) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width = 0;
    var height = 0;
    var rafId = null;
    var running = true;

    // Strictly pastel pink, baby blue, and luminous white (zero gold)
    var palette = [
      'rgba(255, 255, 255, ',
      'rgba(247, 193, 208, ',
      'rgba(174, 214, 246, ',
      'rgba(236, 142, 166, ',
      'rgba(124, 182, 232, '
    ];

    var particleCount = 26;
    var particles = [];

    function resize() {
      var rect = canvas.getBoundingClientRect();
      width = Math.max(rect.width, 320);
      height = Math.max(rect.height, 480);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticle(randomY) {
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : height + Math.random() * 40,
        r: 1.4 + Math.random() * 3.0,
        vy: -(0.18 + Math.random() * 0.42),
        vx: (Math.random() - 0.5) * 0.22,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.012 + Math.random() * 0.02,
        baseAlpha: 0.25 + Math.random() * 0.45,
        color: palette[Math.floor(Math.random() * palette.length)]
      };
    }

    function seed() {
      particles = [];
      for (var i = 0; i < particleCount; i++) {
        particles.push(createParticle(true));
      }
    }

    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.phase += p.phaseSpeed;
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.phase) * 0.18;

        if (p.y < -12 || p.x < -16 || p.x > width + 16) {
          particles[i] = createParticle(false);
          continue;
        }

        var alpha = p.baseAlpha * (0.55 + 0.45 * Math.sin(p.phase * 1.4));
        var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.6);
        grad.addColorStop(0, p.color + Math.min(alpha * 1.25, 0.92).toFixed(2) + ')');
        grad.addColorStop(0.5, p.color + (alpha * 0.45).toFixed(2) + ')');
        grad.addColorStop(1, p.color + '0)');

        ctx.beginPath();
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.r * 2.6, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = window.requestAnimationFrame(tick);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        running = false;
        if (rafId) window.cancelAnimationFrame(rafId);
      } else {
        running = true;
        rafId = window.requestAnimationFrame(tick);
      }
    });

    window.addEventListener('resize', resize, { passive: true });
    resize();
    seed();
    rafId = window.requestAnimationFrame(tick);
  }

  window.KalavaniParticles = { init: initParticles };
})();
