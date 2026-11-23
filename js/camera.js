/* ==========================================================================
   KALAVANI 3D MOSQUE — GSAP SCROLLTRIGGER 3D CAMERA & ARCH TUNNEL ENGINE
   Scroll = Cinematic 3D Camera Movement (Pin + Scrub) + Low-End Fallback
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

    if (!overlay || !cover) {
      if (onComplete) onComplete();
      return;
    }

    var isLite = document.body.classList.contains('lite-mode');
    var hasGSAP = typeof window.gsap !== 'undefined';

    // Lightweight fallback if GSAP CDN unavailable or reduced-motion/lite device
    if (!hasGSAP || isLite) {
      overlay.classList.add('is-active');
      overlay.style.transition = 'opacity 0.55s ease';
      overlay.style.opacity = '1';
      if (tunnelTitle) {
        tunnelTitle.style.transition = 'opacity 0.5s ease, transform 0.65s ease';
        tunnelTitle.style.opacity = '1';
        tunnelTitle.style.transform = 'translate(-50%, -50%) scale(1)';
      }
      window.setTimeout(function () {
        if (whiteFlash) {
          whiteFlash.style.transition = 'opacity 0.45s ease';
          whiteFlash.style.opacity = '1';
        }
        cover.classList.add('is-opened');
        document.body.classList.remove('is-locked');
        window.scrollTo(0, 0);
      }, 900);
      window.setTimeout(function () {
        overlay.style.opacity = '0';
        window.setTimeout(function () {
          overlay.classList.remove('is-active');
          if (onComplete) onComplete();
        }, 450);
      }, 1450);
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

    overlay.classList.add('is-active');

    var tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: function () {
        overlay.classList.remove('is-active');
        gsap.set(overlay, { clearProps: 'opacity' });
        if (onComplete) onComplete();
      }
    });

    // 1. Cover camera pushes smoothly forward into the mosque mouth
    tl.to(coverBg, { scale: 1.38, duration: 0.55, ease: 'power2.in' }, 0)
      .to(overlay, { opacity: 1, duration: 0.45, ease: 'power1.out' }, 0.12)
      .add(function () {
        cover.classList.add('is-opened');
        document.body.classList.remove('is-locked');
        window.scrollTo(0, 0);
      }, 0.56);

    // 2. Camera rockets through all 6 concentric arches sequentially (1 outer -> 6 innermost)
    arches.forEach(function (arch, idx) {
      if (!arch) return;
      var startTime = 0.35 + idx * 0.24;
      tl.to(arch, {
        scale: 7.4,
        opacity: 0,
        duration: 1.05,
        ease: 'power2.in'
      }, startTime);
    });

    // 3. Center "The Wedding of Riani & Rafly" flies into sharp focus inside tunnel
    tl.fromTo(
      tunnelTitle,
      { opacity: 0, scale: 0.48 },
      { opacity: 1, scale: 1.04, duration: 0.85, ease: 'power2.out' },
      0.62
    )
    .to(tunnelTitle, {
      scale: 1.75,
      opacity: 0,
      duration: 0.62,
      ease: 'power2.in'
    }, 1.85);

    // 4. Radiant white light portal expands and pierces into Section 3 (Ayat Suci)
    tl.to(portalGlow, {
      scale: 6.5,
      duration: 1.4,
      ease: 'power2.in'
    }, 1.15)
    .to(whiteFlash, {
      opacity: 1,
      duration: 0.48,
      ease: 'power2.in'
    }, 2.08)
    .add(function () {
      // Initialize scroll camera while white portal fully covers viewport so zero jump occurs
      if (onComplete) {
        onComplete();
        onComplete = null;
      }
    }, 2.54)
    .to(overlay, {
      opacity: 0,
      duration: 0.65,
      ease: 'power2.out'
    }, 2.60);
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
    }, { threshold: 0.14 });

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
        var rotY = x * 14;
        var rotX = -y * 12;
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

      card.addEventListener('touchmove', function (e) {
        if (e.touches && e.touches[0]) {
          handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });

      card.addEventListener('pointerleave', handleReset);
      card.addEventListener('touchend', handleReset);
      card.addEventListener('touchcancel', handleReset);
    });
  }

  /* ------------------------------------------------------------------------
     MAIN GSAP SCROLLTRIGGER 3D CAMERA SEQUENCES (SECTIONS 3 – 8)
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

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    // Clear any stale triggers if re-initialized
    ScrollTrigger.getAll().forEach(function (t) { t.kill(); });

    /* ======================================================================
       SCENE 3: AYAT SUCI -> PAN UP ALONG GRAND LIGHT-BLUE DOME -> PAN BACK DOWN
       ====================================================================== */
    var ayatTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#sec-ayat',
        start: 'top top',
        end: '+=2400',
        pin: '#ayat-viewport',
        scrub: 1.05,
        anticipatePin: 1
      }
    });

    // Subtle hold at 0..0.18 while guest reads QS Ar-Rum 21 over the pink pavilion
    ayatTl
      .to('#ayat-doves', { yPercent: -10, scale: 1.08, duration: 0.25, ease: 'none' }, 0)
      .to('#ayat-lanterns', { yPercent: -18, duration: 0.35, ease: 'none' }, 0)
      // Fade Ayat card gently as camera lifts off toward grand blue dome
      .to('#ayat-card-wrap', { y: -40, opacity: 0, duration: 0.22, ease: 'power1.in' }, 0.22)
      .to('#ayat-pavilion-layer', { scale: 1.24, yPercent: 8, duration: 0.36, ease: 'power1.inOut' }, 0.20)
      .to('#ayat-doves', { yPercent: -35, opacity: 0.15, duration: 0.28 }, 0.24)
      // Reveal Grand Blue Dome macro layer & PAN UPWARD from diamond lattice -> pink calligraphy -> pink spire finial
      .to('#ayat-dome-layer', { opacity: 1, duration: 0.24, ease: 'power1.inOut' }, 0.32)
      .fromTo(
        '#ayat-dome-layer .dome-pan-img',
        { yPercent: -35, scale: 1.06 },
        { yPercent: 0, scale: 1.0, duration: 0.48, ease: 'power1.inOut' },
        0.34
      )
      .to('#dome-finial-glow', { opacity: 0.95, scale: 1.15, duration: 0.28 }, 0.58)
      .to('#dome-caption', { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' }, 0.62)
      // Pan smoothly back down into Section 4 (Mempelai)
      .to('#dome-caption', { opacity: 0, y: -16, duration: 0.14 }, 0.84)
      .to('#ayat-dome-layer .dome-pan-img', { yPercent: -26, scale: 1.04, duration: 0.22, ease: 'power1.in' }, 0.82);

    /* ======================================================================
       SCENE 4: MEMPELAI (LIVING PHOTO IN MOSQUE -> ZOOM -> PAN RIGHT -> PAN LEFT -> ZOOM OUT)
       Note: In couple-mempelai.jpg, Riani is on LEFT and Rafly is on RIGHT!
       ====================================================================== */
    gsap.set('#mempelai-photo-stage', { xPercent: -50, yPercent: -44 });

    var mempelaiTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#sec-mempelai',
        start: 'top top',
        end: '+=3600',
        pin: '#mempelai-viewport',
        scrub: 1.05,
        anticipatePin: 1
      }
    });

    // Act 1 (0 -> 0.22): Two large white doves fly boldly across top of pavilion photo, then photo expands full-screen
    mempelaiTl
      .fromTo('.mempelai-dove-1', { xPercent: -30, yPercent: 20, scale: 0.88 }, { xPercent: 390, yPercent: -30, scale: 1.15, duration: 0.30, ease: 'none' }, 0)
      .fromTo('.mempelai-dove-2', { xPercent: 30, yPercent: 10, scale: 0.85 }, { xPercent: -390, yPercent: -35, scale: 1.12, duration: 0.30, ease: 'none' }, 0.04)
      .to('#mempelai-intro-badge', { opacity: 0, y: -26, duration: 0.14, ease: 'power1.in' }, 0.12)
      .to('#mempelai-facade-layer', { scale: 1.32, duration: 0.24, ease: 'power1.inOut' }, 0.08)
      .to('#mempelai-photo-stage', {
        width: '100%',
        height: '100%',
        xPercent: -50,
        yPercent: -50,
        duration: 0.24,
        ease: 'power2.inOut'
      }, 0.10)
      .to('#mempelai-photo-window', { borderRadius: '0px', duration: 0.22 }, 0.10)
      .to('#mempelai-arch-frame', { opacity: 0, scale: 1.16, duration: 0.18 }, 0.12)

      // Act 2 (0.28 -> 0.54): Camera PAN RIGHT to Groom (Muhamad Rafly Kristiadi) close-up
      .to('#mempelai-photo-img', {
        scale: 1.78,
        xPercent: -32,
        yPercent: 18,
        duration: 0.22,
        ease: 'power2.inOut'
      }, 0.28)
      .to('#mempelai-photo-veil', { opacity: 0.65, duration: 0.15 }, 0.32)
      .to('#card-groom', { opacity: 1, y: 0, duration: 0.14, ease: 'power2.out' }, 0.38)
      // Hold slightly for reading Groom details
      .to('#card-groom', { opacity: 0, y: -18, duration: 0.11, ease: 'power1.in' }, 0.56)

      // Act 3 (0.58 -> 0.82): Camera PAN LEFT to Bride (Siti Riani) close-up
      .to('#mempelai-photo-img', {
        scale: 1.85,
        xPercent: 28,
        yPercent: -2,
        duration: 0.22,
        ease: 'power2.inOut'
      }, 0.58)
      .to('#card-bride', { opacity: 1, y: 0, duration: 0.14, ease: 'power2.out' }, 0.68)
      .to('#card-bride', { opacity: 0, y: -18, duration: 0.10, ease: 'power1.in' }, 0.83)

      // Act 4 (0.84 -> 1.0): Grand Zoom-Out back into overall light-blue & pink Mosque Facade!
      .to('#mempelai-photo-img', {
        scale: 1.0,
        xPercent: 0,
        yPercent: 0,
        duration: 0.20,
        ease: 'power2.inOut'
      }, 0.84)
      .to('#mempelai-photo-veil', { opacity: 0.18, duration: 0.16 }, 0.84)
      .to('#mempelai-facade-layer', { scale: 1.0, duration: 0.22, ease: 'power2.out' }, 0.84)
      .to('#mempelai-photo-stage', {
        width: '31%',
        height: '24%',
        xPercent: -50,
        yPercent: 48,
        duration: 0.22,
        ease: 'power2.out'
      }, 0.84)
      .to('#mempelai-photo-window', { borderRadius: '90px 90px 14px 14px', duration: 0.20 }, 0.84)
      .to('#mempelai-arch-frame', { opacity: 0.95, scale: 1.0, duration: 0.18 }, 0.86)
      .to('#mempelai-zoomout-caption', { opacity: 1, y: 0, duration: 0.14, ease: 'power2.out' }, 0.90);

    /* ======================================================================
       SCENE 5: SAVE THE DATE — SUBTLE DEPTH PARALLAX
       ====================================================================== */
    gsap.to('.savedate-bg-img', {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: {
        trigger: '#sec-savedate',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.8
      }
    });
    gsap.to('.savedate-lanterns', {
      yPercent: -14,
      ease: 'none',
      scrollTrigger: {
        trigger: '#sec-savedate',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.8
      }
    });

    /* ======================================================================
       SCENE 6: AKAD NIKAH — SIDEWAYS PAN ACROSS MOSQUE FACADE + SPARROW FLIGHT
       ====================================================================== */
    var akadTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#sec-akad',
        start: 'top top',
        end: '+=1900',
        pin: '#akad-viewport',
        scrub: 1.0,
        anticipatePin: 1
      }
    });

    akadTl
      // Pan wide mosque panorama sideways with layered sky & foreground lantern parallax
      .fromTo('#akad-panorama-track', { xPercent: -4 }, { xPercent: -55, duration: 1.0, ease: 'none' }, 0)
      .fromTo('#akad-sky-layer', { xPercent: 0 }, { xPercent: -12, duration: 1.0, ease: 'none' }, 0)
      .fromTo('#akad-fg-lanterns', { xPercent: -2 }, { xPercent: -58, duration: 1.0, ease: 'none' }, 0)
      // Slide left-aligned light-blue framed Akad panel smoothly into place
      .fromTo(
        '#akad-panel-wrap',
        { xPercent: -34, opacity: 0 },
        { xPercent: 0, opacity: 1, duration: 0.34, ease: 'power2.out' },
        0.26
      )
      // Small brown sparrow flutters gracefully right across the Akad panel
      .fromTo(
        '#akad-sparrow',
        { x: -240, y: 52, rotate: -14, opacity: 0 },
        { x: 18, y: -12, rotate: 6, opacity: 1, duration: 0.42, ease: 'power1.inOut' },
        0.42
      )
      .to('#akad-sparrow', { x: 120, y: -38, rotate: -10, duration: 0.25, ease: 'power1.in' }, 0.82);

    /* ======================================================================
       SCENE 7: RESEPSI — CAMERA TILT UP TO SKY + FLOCK + DOME ZOOM TRANSITION
       ====================================================================== */
    var resepsiTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#sec-resepsi',
        start: 'top top',
        end: '+=2400',
        pin: '#resepsi-viewport',
        scrub: 1.0,
        anticipatePin: 1
      }
    });

    resepsiTl
      // Tilt camera smoothly upward from bottom domes into expansive baby-blue-to-pink sky
      .fromTo(
        '#resepsi-sky-layer .resepsi-sky-img',
        { scale: 1.75, transformOrigin: 'center 94%' },
        { scale: 1.0, transformOrigin: 'center 94%', duration: 0.36, ease: 'power1.inOut' },
        0
      )
      // Flock of dark-blue silhouette birds flies across sky
      .fromTo(
        '#sky-bird-flock',
        { xPercent: -35, yPercent: 14, opacity: 0.2 },
        { xPercent: 42, yPercent: -12, opacity: 0.92, duration: 0.72, ease: 'none' },
        0.04
      )
      // Resepsi text appears softly in the sky
      .fromTo(
        '#resepsi-sky-content',
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.24, ease: 'power2.out' },
        0.24
      )
      // Hold text cleanly in sky, then dissolve as camera zooms into grand light-blue dome texture
      .to('#resepsi-sky-content', { opacity: 0, y: -24, duration: 0.16, ease: 'power1.in' }, 0.64)
      .fromTo(
        '#resepsi-dome-zoom',
        { opacity: 0, scale: 0.86 },
        { opacity: 1, scale: 1.08, duration: 0.20, ease: 'power1.out' },
        0.66
      )
      .to('#resepsi-dome-zoom', {
        scale: 2.75,
        duration: 0.24,
        ease: 'power2.in'
      }, 0.80);

    /* ======================================================================
       SCENE 8: GALERI — 4 POLAROID 3D SCROLL ENTRANCES + REVERSE ARCH CORRIDOR
       ====================================================================== */
    gsap.utils.toArray('.polaroid-card').forEach(function (card) {
      var isRight = card.dataset.tilt === 'right';
      gsap.from(card, {
        opacity: 0,
        y: 68,
        rotationZ: isRight ? 10 : -10,
        rotationY: isRight ? -18 : 18,
        scale: 0.9,
        duration: 0.85,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 86%',
          toggleActions: 'play none none reverse'
        }
      });
    });

    // Reverse Layered Pastel Arch Corridor Pull-Back after Polaroid 4
    var corridorOutTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#sec-corridor-out',
        start: 'top top',
        end: '+=1300',
        pin: '#corridor-out-viewport',
        scrub: 1.0,
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
      0.32
    );

    ScrollTrigger.refresh();
  }

  window.KalavaniCamera = {
    detectLiteMode: detectLiteMode,
    playArchTunnelTransition: playArchTunnelTransition,
    initScrollCamera: initScrollCamera
  };
})();
