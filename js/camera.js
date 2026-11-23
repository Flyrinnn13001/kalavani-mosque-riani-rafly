/* ==========================================================================
   KALAVANI 3D MOSQUE — GSAP SCROLLTRIGGER 3D CAMERA & ARCH TUNNEL ENGINE
   Scroll = Cinematic 3D Camera Movement (Pin + Scrub) + Rock-Solid Fallback
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
     SECTION 2: 6-LEVEL 3D ISLAMIC ARCH TUNNEL OPENING TRANSITION
     Camera zooms forward through 6 concentric alternating blue/pink arches,
     reveals "The Wedding of Riani & Rafly" in center, pierces bright white light
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

    // Hard failsafe: guarantee page is ALWAYS unlocked & scrollable even if anything stalls
    window.setTimeout(finishOnce, 3800);

    if (!overlay || !cover) {
      finishOnce();
      return;
    }

    var isLite = document.body.classList.contains('lite-mode');
    var hasGSAP = typeof window.gsap !== 'undefined';

    // Lightweight fallback if GSAP CDN unavailable or reduced-motion/lite device
    if (!hasGSAP || isLite) {
      overlay.style.display = 'block';
      overlay.classList.add('is-active');
      overlay.style.transition = 'opacity 0.45s ease';
      overlay.style.opacity = '1';
      if (tunnelTitle) {
        tunnelTitle.style.transition = 'opacity 0.45s ease, transform 0.6s ease';
        tunnelTitle.style.opacity = '1';
        tunnelTitle.style.transform = 'translate(-50%, -50%) scale(1)';
      }
      window.setTimeout(function () {
        if (whiteFlash) {
          whiteFlash.style.transition = 'opacity 0.4s ease';
          whiteFlash.style.opacity = '1';
        }
        unlockPageScroll();
        window.scrollTo(0, 0);
      }, 850);
      window.setTimeout(function () {
        overlay.style.opacity = '0';
        window.setTimeout(finishOnce, 420);
      }, 1350);
      return;
    }

    var gsap = window.gsap;
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
      defaults: { ease: 'power2.inOut' },
      onComplete: finishOnce
    });

    // 1. Cover camera pushes smoothly forward into the mosque mouth
    tl.to(coverBg, { scale: 1.38, duration: 0.5, ease: 'power2.in' }, 0)
      .to(overlay, { opacity: 1, duration: 0.4, ease: 'power1.out' }, 0.1)
      .add(function () {
        unlockPageScroll();
        window.scrollTo(0, 0);
      }, 0.52);

    // 2. Camera rockets through all 6 concentric arches sequentially (1 outer -> 6 innermost)
    arches.forEach(function (arch, idx) {
      if (!arch) return;
      var startTime = 0.30 + idx * 0.22;
      tl.to(arch, {
        scale: 7.4,
        opacity: 0,
        duration: 0.95,
        ease: 'power2.in'
      }, startTime);
    });

    // 3. Center "The Wedding of Riani & Rafly" flies into sharp focus inside tunnel
    tl.fromTo(
      tunnelTitle,
      { opacity: 0, scale: 0.48 },
      { opacity: 1, scale: 1.04, duration: 0.8, ease: 'power2.out' },
      0.56
    )
    .to(tunnelTitle, {
      scale: 1.75,
      opacity: 0,
      duration: 0.58,
      ease: 'power2.in'
    }, 1.72);

    // 4. Radiant white light portal expands and pierces into Section 3 (Ayat Suci)
    tl.to(portalGlow, {
      scale: 6.5,
      duration: 1.25,
      ease: 'power2.in'
    }, 1.08)
    .to(whiteFlash, {
      opacity: 1,
      duration: 0.44,
      ease: 'power2.in'
    }, 1.96)
    .add(function () {
      initCameraOnce();
    }, 2.42)
    .to(overlay, {
      opacity: 0,
      duration: 0.58,
      ease: 'power2.out'
    }, 2.48);
  }

  /* ------------------------------------------------------------------------
     GENERIC INTERSECTION OBSERVER REVEALS (Works in BOTH Cinema & Lite Mode)
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
    }, { threshold: 0.1 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------------
     INTERACTIVE 3D TOUCH / POINTER TILT ON POLAROID CARDS
     ------------------------------------------------------------------------ */
  function initPolaroidInteractiveTilt() {
    if (document.body.classList.contains('lite-mode')) return;
    var cards = document.querySelectorAll('.polaroid-card');

    cards.forEach(function (card) {
      var baseRot = card.dataset.tilt === 'right' ? 2.6 : -2.6;

      function handleMove(clientX, clientY) {
        var rect = card.getBoundingClientRect();
        var x = (clientX - rect.left) / rect.width - 0.5;
        var y = (clientY - rect.top) / rect.height - 0.5;
        var rotY = x * 12;
        var rotX = -y * 10;
        card.style.animationPlayState = 'paused';
        card.style.transform =
          'perspective(850px) rotateX(' + rotX.toFixed(2) + 'deg) ' +
          'rotateY(' + rotY.toFixed(2) + 'deg) rotateZ(' + baseRot + 'deg) scale(1.02)';
      }

      function handleReset() {
        card.style.transform = '';
        card.style.animationPlayState = 'running';
      }

      card.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
          handleMove(e.clientX, e.clientY);
        }
      });

      card.addEventListener('pointerleave', handleReset);
    });
  }

  /* ------------------------------------------------------------------------
     MAIN GSAP SCROLLTRIGGER 3D CAMERA SEQUENCES (SECTIONS 3 – 8)
     Snappy, immediate scroll feedback (zero dead zones) + try/catch fallback
     ------------------------------------------------------------------------ */
  function initScrollCamera() {
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

      ScrollTrigger.getAll().forEach(function (t) { t.kill(); });

      /* ====================================================================
         SCENE 3: AYAT SUCI -> PAN UP ALONG GRAND LIGHT-BLUE DOME -> PAN DOWN
         Reacts immediately from scroll pixel 1!
         ==================================================================== */
      var ayatTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#sec-ayat',
          start: 'top top',
          end: '+=1450',
          pin: true,
          pinSpacing: true,
          scrub: 0.6,
          anticipatePin: 1
        }
      });

      ayatTl
        .to('#ayat-pavilion-layer', { scale: 1.24, yPercent: 8, duration: 0.36, ease: 'none' }, 0)
        .to('#ayat-doves', { yPercent: -26, scale: 1.12, opacity: 0.15, duration: 0.34, ease: 'none' }, 0)
        .to('#ayat-lanterns', { yPercent: -22, duration: 0.34, ease: 'none' }, 0)
        .to('#ayat-card-wrap', { y: -48, opacity: 0, duration: 0.24, ease: 'power1.in' }, 0.08)
        // Cross-fade into Grand Light-Blue Diamond Dome & PAN UPWARD to Pink Finial
        .to('#ayat-dome-layer', { opacity: 1, duration: 0.22, ease: 'power1.inOut' }, 0.22)
        .fromTo(
          '#ayat-dome-layer .dome-pan-img',
          { yPercent: -35, scale: 1.06 },
          { yPercent: 0, scale: 1.0, duration: 0.52, ease: 'power1.inOut' },
          0.24
        )
        .to('#dome-finial-glow', { opacity: 0.95, scale: 1.15, duration: 0.25 }, 0.52)
        .to('#dome-caption', { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' }, 0.54)
        // Pan smoothly back down into Section 4 (Mempelai)
        .to('#dome-caption', { opacity: 0, y: -14, duration: 0.14 }, 0.82)
        .to('#ayat-dome-layer .dome-pan-img', { yPercent: -24, scale: 1.04, duration: 0.20, ease: 'power1.in' }, 0.80);

      /* ====================================================================
         SCENE 4: MEMPELAI (PAVILION -> FULL -> PAN RIGHT GROOM -> PAN LEFT BRIDE -> ZOOM OUT)
         In couple-mempelai.jpg: Riani is on LEFT, Rafly is on RIGHT
         ==================================================================== */
      gsap.set('#mempelai-photo-stage', { xPercent: -50, yPercent: -44 });

      var mempelaiTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#sec-mempelai',
          start: 'top top',
          end: '+=2200',
          pin: true,
          pinSpacing: true,
          scrub: 0.6,
          anticipatePin: 1
        }
      });

      mempelaiTl
        // Act 1: Two large white doves sweep across top of photo, photo expands full-screen
        .fromTo('.mempelai-dove-1', { xPercent: -30, yPercent: 18, scale: 0.88 }, { xPercent: 390, yPercent: -30, scale: 1.15, duration: 0.26, ease: 'none' }, 0)
        .fromTo('.mempelai-dove-2', { xPercent: 30, yPercent: 10, scale: 0.85 }, { xPercent: -390, yPercent: -35, scale: 1.12, duration: 0.26, ease: 'none' }, 0.02)
        .to('#mempelai-intro-badge', { opacity: 0, y: -26, duration: 0.12, ease: 'power1.in' }, 0.06)
        .to('#mempelai-facade-layer', { scale: 1.32, duration: 0.20, ease: 'power1.inOut' }, 0.04)
        .to('#mempelai-photo-stage', {
          width: '100%',
          height: '100%',
          xPercent: -50,
          yPercent: -50,
          duration: 0.20,
          ease: 'power2.inOut'
        }, 0.06)
        .to('#mempelai-photo-window', { borderRadius: '0px', duration: 0.18 }, 0.06)
        .to('#mempelai-arch-frame', { opacity: 0, scale: 1.16, duration: 0.16 }, 0.08)

        // Act 2: Camera PAN RIGHT -> Close-up Muhamad Rafly Kristiadi
        .to('#mempelai-photo-img', {
          scale: 1.78,
          xPercent: -32,
          yPercent: 18,
          duration: 0.20,
          ease: 'power2.inOut'
        }, 0.26)
        .to('#mempelai-photo-veil', { opacity: 0.65, duration: 0.14 }, 0.28)
        .to('#card-groom', { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.34)
        .to('#card-groom', { opacity: 0, y: -18, duration: 0.10, ease: 'power1.in' }, 0.54)

        // Act 3: Camera PAN LEFT -> Close-up Siti Riani
        .to('#mempelai-photo-img', {
          scale: 1.85,
          xPercent: 28,
          yPercent: -2,
          duration: 0.20,
          ease: 'power2.inOut'
        }, 0.56)
        .to('#card-bride', { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.64)
        .to('#card-bride', { opacity: 0, y: -18, duration: 0.10, ease: 'power1.in' }, 0.81)

        // Act 4: Grand Zoom-Out back into overall Mosque Facade
        .to('#mempelai-photo-img', {
          scale: 1.0,
          xPercent: 0,
          yPercent: 0,
          duration: 0.18,
          ease: 'power2.inOut'
        }, 0.82)
        .to('#mempelai-photo-veil', { opacity: 0.18, duration: 0.14 }, 0.82)
        .to('#mempelai-facade-layer', { scale: 1.0, duration: 0.18, ease: 'power2.out' }, 0.82)
        .to('#mempelai-photo-stage', {
          width: '31%',
          height: '24%',
          xPercent: -50,
          yPercent: 48,
          duration: 0.18,
          ease: 'power2.out'
        }, 0.82)
        .to('#mempelai-photo-window', { borderRadius: '90px 90px 14px 14px', duration: 0.16 }, 0.82)
        .to('#mempelai-arch-frame', { opacity: 0.95, scale: 1.0, duration: 0.16 }, 0.84)
        .to('#mempelai-zoomout-caption', { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.88);

      /* ====================================================================
         SCENE 5: SAVE THE DATE — SUBTLE DEPTH PARALLAX
         ==================================================================== */
      gsap.to('.savedate-bg-img', {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: '#sec-savedate',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6
        }
      });
      gsap.to('.savedate-lanterns', {
        yPercent: -14,
        ease: 'none',
        scrollTrigger: {
          trigger: '#sec-savedate',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6
        }
      });

      /* ====================================================================
         SCENE 6: AKAD NIKAH — SIDEWAYS PAN ACROSS MOSQUE FACADE + SPARROW
         ==================================================================== */
      var akadTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#sec-akad',
          start: 'top top',
          end: '+=1250',
          pin: true,
          pinSpacing: true,
          scrub: 0.6,
          anticipatePin: 1
        }
      });

      akadTl
        .fromTo('#akad-panorama-track', { xPercent: -4 }, { xPercent: -55, duration: 1.0, ease: 'none' }, 0)
        .fromTo('#akad-sky-layer', { xPercent: 0 }, { xPercent: -12, duration: 1.0, ease: 'none' }, 0)
        .fromTo('#akad-fg-lanterns', { xPercent: -2 }, { xPercent: -58, duration: 1.0, ease: 'none' }, 0)
        .fromTo(
          '#akad-panel-wrap',
          { xPercent: -30, opacity: 0 },
          { xPercent: 0, opacity: 1, duration: 0.30, ease: 'power2.out' },
          0.18
        )
        .fromTo(
          '#akad-sparrow',
          { x: -240, y: 52, rotate: -14, opacity: 0 },
          { x: 18, y: -12, rotate: 6, opacity: 1, duration: 0.42, ease: 'power1.inOut' },
          0.35
        )
        .to('#akad-sparrow', { x: 120, y: -38, rotate: -10, duration: 0.25, ease: 'power1.in' }, 0.78);

      /* ====================================================================
         SCENE 7: RESEPSI — CAMERA TILT UP TO SKY + FLOCK + DOME ZOOM
         ==================================================================== */
      var resepsiTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#sec-resepsi',
          start: 'top top',
          end: '+=1550',
          pin: true,
          pinSpacing: true,
          scrub: 0.6,
          anticipatePin: 1
        }
      });

      resepsiTl
        .fromTo(
          '#resepsi-sky-layer .resepsi-sky-img',
          { scale: 1.75, transformOrigin: 'center 94%' },
          { scale: 1.0, transformOrigin: 'center 94%', duration: 0.34, ease: 'power1.inOut' },
          0
        )
        .fromTo(
          '#sky-bird-flock',
          { xPercent: -35, yPercent: 14, opacity: 0.25 },
          { xPercent: 42, yPercent: -12, opacity: 0.92, duration: 0.72, ease: 'none' },
          0
        )
        .fromTo(
          '#resepsi-sky-content',
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' },
          0.18
        )
        .to('#resepsi-sky-content', { opacity: 0, y: -24, duration: 0.16, ease: 'power1.in' }, 0.64)
        .fromTo(
          '#resepsi-dome-zoom',
          { opacity: 0, scale: 0.86 },
          { opacity: 1, scale: 1.08, duration: 0.18, ease: 'power1.out' },
          0.66
        )
        .to('#resepsi-dome-zoom', {
          scale: 2.75,
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
          y: 56,
          rotationZ: isRight ? 9 : -9,
          rotationY: isRight ? -15 : 15,
          scale: 0.92,
          duration: 0.75,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none reverse'
          }
        });
      });

      var corridorOutTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#sec-corridor-out',
          start: 'top top',
          end: '+=880',
          pin: true,
          pinSpacing: true,
          scrub: 0.6,
          anticipatePin: 1
        }
      });

      var coArches = [
        { sel: '.co-arch-1', from: 5.2, to: 1.05 },
        { sel: '.co-arch-2', from: 4.3, to: 0.88 },
        { sel: '.co-arch-3', from: 3.5, to: 0.72 },
        { sel: '.co-arch-4', from: 2.8, to: 0.56 },
        { sel: '.co-arch-5', from: 2.2, to: 0.42 }
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
        { scale: 1.65, opacity: 0 },
        { scale: 0.95, opacity: 1, duration: 0.5, ease: 'power2.out' },
        0.30
      );

      // Refresh ScrollTrigger cleanly after DOM settles
      window.requestAnimationFrame(function () {
        ScrollTrigger.refresh();
      });
      window.setTimeout(function () {
        ScrollTrigger.refresh();
      }, 450);
    } catch (err) {
      // Never leave user stuck if GSAP encounters any issue
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
