/* ==========================================================================
   FLOATING PASTEL LIGHT PARTICLES (60FPS MOBILE-OPTIMIZED SPRITE RENDERER)
   Pre-rendered offscreen glow sprites + 30fps throttle + zero per-frame GC
   ========================================================================== */
(function () {
  'use strict';

  function initParticles() {
    if (document.body.classList.contains('lite-mode')) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    var cores = navigator.hardwareConcurrency || 4;
    // Skip canvas particles on entry-level phones to keep scroll 100% silky
    if (isTouch && cores <= 4) return;

    var canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    var width = 0;
    var height = 0;
    var rafId = null;
    var running = true;
    var lastFrameTime = 0;
    var FRAME_MS = isTouch ? 40 : 33; // ~25fps mobile / 30fps desktop — buttery & cool

    // Pre-render 3 tiny glow sprites ONCE (zero createRadialGradient per frame!)
    function makeSprite(rgbaCore, rgbaMid) {
      var s = document.createElement('canvas');
      s.width = 24;
      s.height = 24;
      var c = s.getContext('2d');
      var g = c.createRadialGradient(12, 12, 0, 12, 12, 12);
      g.addColorStop(0, rgbaCore);
      g.addColorStop(0.5, rgbaMid);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, 24, 24);
      return s;
    }

    var sprites = [
      makeSprite('rgba(255,255,255,0.9)', 'rgba(255,255,255,0.35)'),
      makeSprite('rgba(247,193,208,0.85)', 'rgba(247,193,208,0.3)'),
      makeSprite('rgba(174,214,246,0.85)', 'rgba(174,214,246,0.3)')
    ];

    var particleCount = isTouch ? 10 : 18;
    var particles = [];

    function resize() {
      var rect = canvas.getBoundingClientRect();
      width = Math.max(rect.width, 320);
      height = Math.max(rect.height, 480);
      // 1x CSS resolution is ideal for soft bokeh glow & saves 75% mobile fill rate
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
    }

    function createParticle(randomY) {
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : height + Math.random() * 30,
        size: 8 + Math.random() * 12,
        vy: -(0.35 + Math.random() * 0.55),
        vx: (Math.random() - 0.5) * 0.25,
        phase: Math.random() * Math.PI * 2,
        sprite: sprites[Math.floor(Math.random() * sprites.length)]
      };
    }

    function seed() {
      particles = [];
      for (var i = 0; i < particleCount; i++) {
        particles.push(createParticle(true));
      }
    }

    function tick(now) {
      if (!running) return;
      rafId = window.requestAnimationFrame(tick);

      if (now - lastFrameTime < FRAME_MS) return;
      lastFrameTime = now;

      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.phase += 0.03;
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.phase) * 0.2;

        if (p.y < -20 || p.x < -20 || p.x > width + 20) {
          particles[i] = createParticle(false);
          continue;
        }

        ctx.globalAlpha = 0.45 + 0.35 * Math.sin(p.phase);
        ctx.drawImage(p.sprite, p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;
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
