/* ==========================================================================
   KALAVANI 3D MOSQUE — 60FPS MOBILE-OPTIMIZED GSAP 3D CAMERA ENGINE
   Pure GPU-composited transforms (ZERO layout reflow), ignoreMobileResize,
   off-screen animation pausing, and rock-solid fallback
   ========================================================================== */
(function () {
  'use strict';

  function detectLiteMode() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('lite') === '1') return true;
    if (params.get('lite') === '0') return false;

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
    var cores = navigator.hardwareConcurrency || 4;
    var memory = navigator.deviceMemory || 4;
    if (cores <= 2 || memory <= 2) return true;

    return false;
  }

  function unlockPageScroll() {
    var cover = document.getElementById('sec-cover');
    if (cover) {
      cover.classList.add('is-opened');
      cover.classList.remove('is-inview');
      cover.style.display = 'none';
    }
    document.documentElement.classList.remove('is-locked');
    document.body.classList.remove('is-locked');
    document.documentElement.style.overflow = '';
    document.documentElement.style.overflowY = '';
    document.body.style.overflow = '';
    document.body.style.overflowY = '';
    document.body.style.height = '';
    document.body.style.touchAction = '';
  }

  /* ------------------------------------------------------------------------
     PAUSE OFF-SCREEN CSS ANIMATIONS TO SAVE MOBILE BATTERY & GPU
     ------------------------------------------------------------------------ */
  function initSectionVisibilityObserver() {
    var sections = document.querySelectorAll('section');
    if (!sections.length) return;

    if (!('IntersectionObserver' in window)) {
      sections.forEach(function (s) { s.classList.add('is-inview'); });
      return;
    }

    var visIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('is-inview', entry.isIntersecting);
      });
    }, { rootMargin: '80px 0px 80px 0px', threshold: 0.01 });

    sections.forEach(function (s) { visIO.observe(s); });
  }

  /* ------------------------------------------------------------------------
     SECTION 2: 6-LEVEL 3D ISLAMIC ARCH TUNNEL OPENING TRANSITION
     Capped scale (4.4x) with zero drop-shadow filters for smooth 60fps on mobile
     ------------------------------------------------------------------------ */
  function playArchTunnelTransition(onComplete) {
    var overlay = document.getElementById('arch-tunnel-overlay');
    var cover = document.getElementById('sec-cover');
    var coverBg = document.getElementById('cover-bg-layer');
    var portalGlow = document.getElementById('tunnel-portal-glow');
    var tunnelTitle = document.getElementById('tunnel-title');
    var whiteFlash = document.getElementById('tunnel-white-flash');

    var finished = false;
    function finishOnce() {
      if (finished) return;
      finished = true;
      unlockPageScroll();
      if (overlay) {
        overlay.classList.remove('is-active');
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        overlay.style.display = 'none';
      }
      if (onComplete) {
        var cb = onComplete;
        onComplete = null;
        cb();
      }
    }

    // Hard failsafe: guarantee page is ALWAYS unlocked & scrollable
    window.setTimeout(finishOnce, 3500);

    if (!overlay || !cover) {
      finishOnce();
      return;
    }

    var isLite = document.body.classList.contains('lite-mode');
    var hasGSAP = typeof window.gsap !== 'undefined';

    if (!hasGSAP || isLite) {
      overlay.style.display = 'block';
      overlay.classList.add('is-active');
      overlay.style.transition = 'opacity 0.4s ease';
      overlay.style.opacity = '1';
      if (tunnelTitle) {
        tunnelTitle.style.transition = 'opacity 0.4s ease, transform 0.55s ease';
        tunnelTitle.style.opacity = '1';
        tunnelTitle.style.transform = 'translate(-50%, -50%) scale(1)';
      }
      window.setTimeout(function () {
        if (whiteFlash) {
          whiteFlash.style.transition = 'opacity 0.35s ease';
          whiteFlash.style.opacity = '1';
        }
        unlockPageScroll();
        window.scrollTo(0, 0);
      }, 750);
      window.setTimeout(function () {
        overlay.style.opacity = '0';
        window.setTimeout(finishOnce, 380);
      }, 1200);
      return;
    }

    var gsap = window.gsap;
    gsap.defaults({ force3D: true });

    var arches = [
      overlay.querySelector('.tunnel-arch-1'),
      overlay.querySelector('.tunnel-arch-2'),
      overlay.querySelector('.tunnel-arch-3'),
      overlay.querySelector('.tunnel-arch-4'),
      overlay.querySelector('.tunnel-arch-5'),
      overlay.querySelector('.tunnel-arch-6')
    ];

    overlay.style.display = 'block';
    overlay.classList.add('is-active');

    var cameraReady = false;
    function initCameraOnce() {
      if (cameraReady) return;
      cameraReady = true;
      if (onComplete) {
        var cb = onComplete;
        onComplete = null;
        cb();
      }
    }

    var tl = gsap.timeline({
      defaults: { ease: 'power2.inOut', force3D: true },
      onComplete: finishOnce
    });

    // 1. Cover pushes smoothly forward into mosque mouth
    tl.to(coverBg, { scale: 1.28, duration: 0.45, ease: 'power2.in' }, 0)
      .to(overlay, { opacity: 1, duration: 0.35, ease: 'power1.out' }, 0.08)
      .add(function () {
        unlockPageScroll();
        window.scrollTo(0, 0);
      }, 0.46);

    // 2. Camera zooms through all 6 concentric arches (capped at 4.4x for 60fps mobile GPU!)
    arches.forEach(function (arch, idx) {
      if (!arch) return;
      var startTime = 0.24 + idx * 0.20;
      tl.to(arch, {
        scale: 4.4,
        opacity: 0,
        duration: 0.85,
        ease: 'power2.in'
      }, startTime);
    });

    // 3. Center "The Wedding of Riani & Rafly" flies cleanly through corridor
    tl.fromTo(
      tunnelTitle,
      { opacity: 0, scale: 0.55 },
      { opacity: 1, scale: 1.02, duration: 0.72, ease: 'power2.out' },
      0.50
    )
    .to(tunnelTitle, {
      scale: 1.55,
      opacity: 0,
      duration: 0.50,
      ease: 'power2.in'
    }, 1.55);

    // 4. Radiant white portal flash opens seamlessly into Section 3 (Ayat Suci)
    tl.to(portalGlow, {
      scale: 4.2,
      duration: 1.1,
      ease: 'power2.in'
    }, 0.95)
    .to(whiteFlash, {
      opacity: 1,
      duration: 0.40,
      ease: 'power2.in'
    }, 1.78)
    .add(function () {
      initCameraOnce();
    }, 2.18)
    .to(overlay, {
      opacity: 0,
      duration: 0.52,
      ease: 'power2.out'
    }, 2.24);
  }

  /* ------------------------------------------------------------------------
     GENERIC INTERSECTION OBSERVER REVEALS
     ------------------------------------------------------------------------ */
  function initSimpleReveals() {
    var items = document.querySelectorAll('.reveal-up');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-revealed'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------------
     INTERACTIVE 3D POINTER TILT ON POLAROIDS (Desktop Mouse Only — 0 Touch Lag)
     ------------------------------------------------------------------------ */
  function initPolaroidInteractiveTilt() {
    if (document.body.classList.contains('lite-mode')) return;
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;

    var cards = document.querySelectorAll('.polaroid-card');
    cards.forEach(function (card) {
      var baseRot = card.dataset.tilt === 'right' ? 2.6 : -2.6;

      card.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.animationPlayState = 'paused';
        card.style.transform =
          'perspective(850px) rotateX(' + (-y * 10).toFixed(1) + 'deg) ' +
          'rotateY(' + (x * 12).toFixed(1) + 'deg) rotateZ(' + baseRot + 'deg) scale(1.02)';
      });

      card.addEventListener('pointerleave', function () {
        card.style.transform = '';
        card.style.animationPlayState = 'running';
      });
    });
  }

  /* ------------------------------------------------------------------------
     MAIN GSAP SCROLLTRIGGER 3D CAMERA SEQUENCES (100% PURE GPU TRANSFORMS)
     ------------------------------------------------------------------------ */
  function initScrollCamera() {
    initSectionVisibilityObserver();
    initSimpleReveals();
    initPolaroidInteractiveTilt();

    var isLite = document.body.classList.contains('lite-mode');
    var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

    if (isLite || !hasGSAP) {
      document.body.classList.add('lite-mode');
      return;
    }

    try {
      var gsap = window.gsap;
      var ScrollTrigger = window.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      gsap.defaults({ force3D: true });

      // CRITICAL FOR MOBILE: prevent URL bar resize jank & excess callbacks
      ScrollTrigger.config({
        ignoreMobileResize: true,
        limitCallbacks: true
      });

      ScrollTrigger.getAll().forEach(function (t) { t.kill(); });

      var isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      var scrubVal = isTouch ? 0.25 : 0.55;

      /* ====================================================================
         SCENE 3: AYAT SUCI -> PAN UP ALONG GRAND LIGHT-BLUE DOME -> PAN DOWN
         ==================================================================== */
      var ayatTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#sec-ayat',
          start: 'top top',
          end: isTouch ? '+=1150' : '+=1400',
          pin: true,
          pinSpacing: true,
          scrub: scrubVal,
          anticipatePin: 1
        }
      });

      ayatTl
        .to('#ayat-pavilion-layer', { scale: 1.22, yPercent: 7, duration: 0.36, ease: 'none' }, 0)
        .to('#ayat-doves', { yPercent: -24, scale: 1.10, opacity: 0.12, duration: 0.34, ease: 'none' }, 0)
        .to('#ayat-lanterns', { yPercent: -20, duration: 0.34, ease: 'none' }, 0)
        .to('#ayat-card-wrap', { y: -44, opacity: 0, duration: 0.24, ease: 'power1.in' }, 0.08)
        .to('#ayat-dome-layer', { opacity: 1, duration: 0.22, ease: 'power1.inOut' }, 0.22)
        .fromTo(
          '#ayat-dome-layer .dome-pan-img',
          { yPercent: -35, scale: 1.05 },
          { yPercent: 0, scale: 1.0, duration: 0.52, ease: 'power1.inOut' },
          0.24
        )
        .to('#dome-finial-glow', { opacity: 0.92, scale: 1.12, duration: 0.24 }, 0.52)
        .to('#dome-caption', { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' }, 0.54)
        .to('#dome-caption', { opacity: 0, y: -14, duration: 0.14 }, 0.82)
        .to('#ayat-dome-layer .dome-pan-img', { yPercent: -24, scale: 1.03, duration: 0.20, ease: 'power1.in' }, 0.80);

      /* ====================================================================
         SCENE 4: MEMPELAI — 100% PURE GPU SCALE/TRANSLATE (ZERO WIDTH/HEIGHT REFLOW!)
         In couple-mempelai.jpg: Riani is on LEFT, Rafly is on RIGHT
         ==================================================================== */
      gsap.set('#mempelai-photo-stage', { scale: 0.72, yPercent: 6 });

      var mempelaiTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#sec-mempelai',
          start: 'top top',
          end: isTouch ? '+=1850' : '+=2150',
          pin: true,
          pinSpacing: true,
          scrub: scrubVal,
          anticipatePin: 1
        }
      });

      mempelaiTl
        // Act 1: Two large white doves fly across top of pavilion photo -> pure GPU scale to fullscreen!
        .fromTo('.mempelai-dove-1', { xPercent: -25, yPercent: 18, scale: 0.88 }, { xPercent: 380, yPercent: -28, scale: 1.12, duration: 0.26, ease: 'none' }, 0)
        .fromTo('.mempelai-dove-2', { xPercent: 25, yPercent: 10, scale: 0.85 }, { xPercent: -380, yPercent: -32, scale: 1.10, duration: 0.26, ease: 'none' }, 0.02)
        .to('#mempelai-intro-badge', { opacity: 0, y: -24, duration: 0.12, ease: 'power1.in' }, 0.05)
        .to('#mempelai-facade-layer', { scale: 1.28, duration: 0.20, ease: 'power1.inOut' }, 0.04)
        .to('#mempelai-photo-stage', { scale: 1.14, yPercent: 0, duration: 0.20, ease: 'power2.inOut' }, 0.06)
        .to('#mempelai-arch-frame', { opacity: 0, scale: 1.12, duration: 0.16 }, 0.08)

        // Act 2: Camera PAN RIGHT -> Close-up Muhamad Rafly Kristiadi
        .to('#mempelai-photo-img', {
          scale: 1.62,
          xPercent: -28,
          yPercent: 16,
          duration: 0.20,
          ease: 'power2.inOut'
        }, 0.26)
        .to('#mempelai-photo-veil', { opacity: 0.62, duration: 0.14 }, 0.28)
        .to('#card-groom', { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.34)
        .to('#card-groom', { opacity: 0, y: -18, duration: 0.10, ease: 'power1.in' }, 0.54)

        // Act 3: Camera PAN LEFT -> Close-up Siti Riani
        .to('#mempelai-photo-img', {
          scale: 1.68,
          xPercent: 24,
          yPercent: -2,
          duration: 0.20,
          ease: 'power2.inOut'
        }, 0.56)
        .to('#card-bride', { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.64)
        .to('#card-bride', { opacity: 0, y: -18, duration: 0.10, ease: 'power1.in' }, 0.81)

        // Act 4: Grand Zoom-Out back into overall Mosque Facade (pure GPU scale!)
        .to('#mempelai-photo-img', {
          scale: 1.0,
          xPercent: 0,
          yPercent: 0,
          duration: 0.18,
          ease: 'power2.inOut'
        }, 0.82)
        .to('#mempelai-photo-veil', { opacity: 0.18, duration: 0.14 }, 0.82)
        .to('#mempelai-facade-layer', { scale: 1.0, duration: 0.18, ease: 'power2.out' }, 0.82)
        .to('#mempelai-photo-stage', { scale: 0.30, yPercent: 22, duration: 0.18, ease: 'power2.out' }, 0.82)
        .to('#mempelai-arch-frame', { opacity: 0.95, scale: 1.0, duration: 0.16 }, 0.84)
        .to('#mempelai-zoomout-caption', { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.88);

      /* ====================================================================
         SCENE 5: SAVE THE DATE — LIGHTWEIGHT PARALLAX
         ==================================================================== */
      gsap.to('.savedate-bg-img', {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: '#sec-savedate',
          start: 'top bottom',
          end: 'bottom top',
          scrub: scrubVal
        }
      });

      /* ====================================================================
         SCENE 6: AKAD NIKAH — SIDEWAYS PAN ACROSS MOSQUE FACADE + SPARROW
         ==================================================================== */
      var akadTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#sec-akad',
          start: 'top top',
          end: isTouch ? '+=1050' : '+=1250',
          pin: true,
          pinSpacing: true,
          scrub: scrubVal,
          anticipatePin: 1
        }
      });

      akadTl
        .fromTo('#akad-panorama-track', { xPercent: -4 }, { xPercent: -54, duration: 1.0, ease: 'none' }, 0)
        .fromTo('#akad-sky-layer', { xPercent: 0 }, { xPercent: -10, duration: 1.0, ease: 'none' }, 0)
        .fromTo('#akad-fg-lanterns', { xPercent: -2 }, { xPercent: -56, duration: 1.0, ease: 'none' }, 0)
        .fromTo(
          '#akad-panel-wrap',
          { xPercent: -28, opacity: 0 },
          { xPercent: 0, opacity: 1, duration: 0.30, ease: 'power2.out' },
          0.18
        )
        .fromTo(
          '#akad-sparrow',
          { x: -220, y: 48, rotate: -12, opacity: 0 },
          { x: 18, y: -10, rotate: 6, opacity: 1, duration: 0.42, ease: 'power1.inOut' },
          0.35
        )
        .to('#akad-sparrow', { x: 110, y: -34, rotate: -10, duration: 0.25, ease: 'power1.in' }, 0.78);

      /* ====================================================================
         SCENE 7: RESEPSI — CAMERA TILT UP TO SKY + FLOCK + DOME ZOOM
         ==================================================================== */
      var resepsiTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#sec-resepsi',
          start: 'top top',
          end: isTouch ? '+=1250' : '+=1500',
          pin: true,
          pinSpacing: true,
          scrub: scrubVal,
          anticipatePin: 1
        }
      });

      resepsiTl
        .fromTo(
          '#resepsi-sky-layer .resepsi-sky-img',
          { scale: 1.65, transformOrigin: 'center 94%' },
          { scale: 1.0, transformOrigin: 'center 94%', duration: 0.34, ease: 'power1.inOut' },
          0
        )
        .fromTo(
          '#sky-bird-flock',
          { xPercent: -32, yPercent: 12, opacity: 0.25 },
          { xPercent: 40, yPercent: -10, opacity: 0.92, duration: 0.72, ease: 'none' },
          0
        )
        .fromTo(
          '#resepsi-sky-content',
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' },
          0.18
        )
        .to('#resepsi-sky-content', { opacity: 0, y: -20, duration: 0.16, ease: 'power1.in' }, 0.64)
        .fromTo(
          '#resepsi-dome-zoom',
          { opacity: 0, scale: 0.88 },
          { opacity: 1, scale: 1.06, duration: 0.18, ease: 'power1.out' },
          0.66
        )
        .to('#resepsi-dome-zoom', {
          scale: 2.35,
          duration: 0.24,
          ease: 'power2.in'
        }, 0.78);

      /* ====================================================================
         SCENE 8: GALERI — 4 POLAROIDS + REVERSE LAYERED ARCH CORRIDOR
         ==================================================================== */
      gsap.utils.toArray('.polaroid-card').forEach(function (card) {
        var isRight = card.dataset.tilt === 'right';
        gsap.from(card, {
          opacity: 0,
          y: 44,
          rotationZ: isRight ? 7 : -7,
          scale: 0.94,
          duration: 0.65,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            once: true
          }
        });
      });

      var corridorOutTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#sec-corridor-out',
          start: 'top top',
          end: isTouch ? '+=720' : '+=880',
          pin: true,
          pinSpacing: true,
          scrub: scrubVal,
          anticipatePin: 1
        }
      });

      var coArches = [
        { sel: '.co-arch-1', from: 3.6, to: 1.05 },
        { sel: '.co-arch-2', from: 3.1, to: 0.88 },
        { sel: '.co-arch-3', from: 2.6, to: 0.72 },
        { sel: '.co-arch-4', from: 2.1, to: 0.56 },
        { sel: '.co-arch-5', from: 1.7, to: 0.42 }
      ];

      coArches.forEach(function (item, idx) {
        corridorOutTl.fromTo(
          item.sel,
          { scale: item.from, opacity: 0.15 },
          { scale: item.to, opacity: 1, duration: 0.72, ease: 'power2.out' },
          idx * 0.08
        );
      });

      corridorOutTl.fromTo(
        '.corridor-out-monogram',
        { scale: 1.5, opacity: 0 },
        { scale: 0.95, opacity: 1, duration: 0.5, ease: 'power2.out' },
        0.30
      );

      window.requestAnimationFrame(function () {
        ScrollTrigger.refresh();
      });
    } catch (err) {
      document.body.classList.add('lite-mode');
    }
  }

  window.KalavaniCamera = {
    detectLiteMode: detectLiteMode,
    unlockPageScroll: unlockPageScroll,
    playArchTunnelTransition: playArchTunnelTransition,
    initScrollCamera: initScrollCamera
  };
})();
