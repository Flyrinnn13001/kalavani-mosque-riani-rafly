/* ==========================================================================
   KALAVANI 3D MOSQUE — MAIN CONTROLLER
   Guest URL ?to= personalization, Music control, Live Countdown,
   Wedding Gift Drawer + Clipboard Copy, Gallery Lightbox & Scroll UI
   ========================================================================== */
(function () {
  'use strict';

  var TARGET_WEDDING_ISO = '2027-08-22T08:00:00+07:00';
  var toastTimer = null;

  /* ------------------------------------------------------------------------
     TOAST HELPER
     ------------------------------------------------------------------------ */
  function showToast(message) {
    var toast = document.getElementById('toast-banner');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2600);
  }

  /* ------------------------------------------------------------------------
     GUEST NAME FROM URL ?to=<nama tamu>
     ------------------------------------------------------------------------ */
  function resolveGuestName() {
    var params = new URLSearchParams(window.location.search);
    var raw = params.get('to') || params.get('untuk') || params.get('guest') || '';
    var cleaned = raw.replace(/\+/g, ' ').trim();
    if (!cleaned) cleaned = 'Tamu Undangan';
    if (cleaned.length > 80) cleaned = cleaned.slice(0, 80);

    var guestEl = document.getElementById('guest-name');
    if (guestEl) guestEl.textContent = cleaned;
    return cleaned;
  }

  /* ------------------------------------------------------------------------
     BACKGROUND MUSIC CONTROLLER (USER'S REAL MP3 + SMOOTH FADE-IN)
     ------------------------------------------------------------------------ */
  function createMusicController() {
    var audio = document.getElementById('bg-music');
    var fab = document.getElementById('music-toggle');
    var isPlaying = false;
    var fadeInterval = null;

    function syncUI() {
      if (!fab) return;
      fab.classList.toggle('is-playing', isPlaying);
      fab.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    }

    function start() {
      if (!audio) return;
      if (fab) fab.classList.remove('is-hidden');

      audio.volume = 0;
      var playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(function () {
          isPlaying = true;
          syncUI();
          if (fadeInterval) window.clearInterval(fadeInterval);
          fadeInterval = window.setInterval(function () {
            if (audio.volume < 0.85) {
              audio.volume = Math.min(0.85, audio.volume + 0.08);
            } else {
              window.clearInterval(fadeInterval);
            }
          }, 120);
        }).catch(function () {
          isPlaying = false;
          syncUI();
        });
      }
    }

    function toggle() {
      if (!audio) return;
      if (isPlaying) {
        audio.pause();
        isPlaying = false;
        syncUI();
      } else {
        audio.volume = 0.85;
        audio.play().then(function () {
          isPlaying = true;
          syncUI();
        }).catch(function () {
          isPlaying = false;
          syncUI();
        });
      }
    }

    if (fab) {
      fab.addEventListener('click', toggle);
    }

    return { start: start, toggle: toggle };
  }

  /* ------------------------------------------------------------------------
     LIVE COUNTDOWN TO 22 AGUSTUS 2027 08:00 WIB
     ------------------------------------------------------------------------ */
  function initCountdown() {
    var daysEl = document.getElementById('cd-days');
    var hoursEl = document.getElementById('cd-hours');
    var minsEl = document.getElementById('cd-mins');
    var secsEl = document.getElementById('cd-secs');

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    var targetTime = new Date(TARGET_WEDDING_ISO).getTime();

    function pad(num) {
      return num < 10 ? '0' + num : String(num);
    }

    function update() {
      var now = Date.now();
      var diff = Math.max(0, targetTime - now);

      var days = Math.floor(diff / (1000 * 60 * 60 * 24));
      var hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      var mins = Math.floor((diff / (1000 * 60)) % 60);
      var secs = Math.floor((diff / 1000) % 60);

      daysEl.textContent = String(days);
      hoursEl.textContent = pad(hours);
      minsEl.textContent = pad(mins);
      secsEl.textContent = pad(secs);
    }

    update();
    window.setInterval(update, 1000);
  }

  /* ------------------------------------------------------------------------
     WEDDING GIFT DRAWER & CLIPBOARD COPY ("Rekening Disalin!" / "Alamat Disalin!")
     ------------------------------------------------------------------------ */
  function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  function initGiftSection() {
    var toggleBtn = document.getElementById('btn-toggle-accounts');
    var toggleLabel = document.getElementById('gift-toggle-label');
    var drawer = document.getElementById('gift-accounts-drawer');

    if (toggleBtn && drawer) {
      toggleBtn.addEventListener('click', function () {
        var isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
        var nextState = !isExpanded;
        toggleBtn.setAttribute('aria-expanded', nextState ? 'true' : 'false');
        drawer.hidden = !nextState;
        if (toggleLabel) {
          toggleLabel.textContent = nextState ? 'Tutup Rekening' : 'Lihat Rekening';
        }
        // Keep ScrollTrigger measurements accurate when height changes
        if (window.ScrollTrigger) {
          window.setTimeout(function () { window.ScrollTrigger.refresh(); }, 180);
        }
      });
    }

    var copyButtons = document.querySelectorAll('[data-copy]');
    copyButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var value = btn.getAttribute('data-copy');
        var type = btn.getAttribute('data-copy-type');
        if (!value) return;

        var labelSpan = btn.querySelector('span');
        var originalText = labelSpan ? labelSpan.textContent : '';
        var confirmMsg = type === 'address' ? 'Alamat Disalin!' : 'Rekening Disalin!';

        copyTextToClipboard(value).then(function () {
          showToast(confirmMsg);
          if (labelSpan) {
            labelSpan.textContent = confirmMsg;
            window.setTimeout(function () {
              labelSpan.textContent = originalText;
            }, 2200);
          }
        }).catch(function () {
          showToast('Silakan salin manual: ' + value);
        });
      });
    });
  }

  /* ------------------------------------------------------------------------
     POLAROID LIGHTBOX PREVIEW
     ------------------------------------------------------------------------ */
  function initLightbox() {
    var modal = document.getElementById('lightbox-modal');
    var backdrop = document.getElementById('lightbox-backdrop');
    var closeBtn = document.getElementById('lightbox-close');
    var imgEl = document.getElementById('lightbox-img');
    var captionEl = document.getElementById('lightbox-caption');

    if (!modal || !imgEl) return;

    function open(src, caption) {
      imgEl.src = src;
      imgEl.alt = caption || 'Foto Mempelai';
      if (captionEl) captionEl.textContent = caption || '';
      modal.hidden = false;
    }

    function close() {
      modal.hidden = true;
    }

    document.querySelectorAll('[data-lightbox]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        open(trigger.getAttribute('data-lightbox'), trigger.getAttribute('data-caption'));
      });
      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open(trigger.getAttribute('data-lightbox'), trigger.getAttribute('data-caption'));
        }
      });
    });

    if (backdrop) backdrop.addEventListener('click', close);
    if (closeBtn) closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) close();
    });
  }

  /* ------------------------------------------------------------------------
     SCROLL PROGRESS BAR & AUTO-HIDE SCROLL CUE
     ------------------------------------------------------------------------ */
  function initScrollUI() {
    var progressBar = document.getElementById('scroll-progress-bar');
    var scrollCue = document.getElementById('scroll-cue');

    if (scrollCue) {
      scrollCue.addEventListener('click', function () {
        window.scrollBy({ top: 460, behavior: 'smooth' });
      });
    }

    function onScroll() {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100)) : 0;
      if (progressBar) progressBar.style.width = pct.toFixed(1) + '%';

      if (scrollCue && window.scrollY > 90) {
        scrollCue.style.opacity = '0';
        scrollCue.style.pointerEvents = 'none';
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------------------
     SOCIAL SHARING (WHATSAPP, INSTAGRAM, FACEBOOK & COPY LINK)
     ------------------------------------------------------------------------ */
  function initShareButtons() {
    var PROD_URL = 'https://flyrinnn13001.github.io/kalavani-mosque-riani-rafly/';
    var isHttp = window.location.protocol === 'https:' || window.location.protocol === 'http:';
    var isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    var shareUrl = (isHttp && !isLocal)
      ? (window.location.origin + window.location.pathname + window.location.search)
      : (PROD_URL + window.location.search);

    var shareText =
      'Assalamu\'alaikum Warahmatullahi Wabarakatuh.\n\n' +
      'Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan:\n\n' +
      '✨ *Siti Riani & Muhamad Rafly Kristiadi* ✨\n' +
      '📅 Minggu, 22 Agustus 2027\n' +
      '🕗 Akad Nikah: 08.00 WIB | Resepsi: 09.00 WIB s/d Selesai\n' +
      '📍 Kediaman Mempelai Wanita, Karangtengah, Karangsembung, Cirebon\n\n' +
      'Buka undangan digital:\n' + shareUrl;

    var waBtn = document.getElementById('share-wa');
    var fbBtn = document.getElementById('share-fb');
    var igBtn = document.getElementById('share-ig');
    var copyBtn = document.getElementById('share-copy');

    if (waBtn) {
      waBtn.addEventListener('click', function () {
        var waLink = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(shareText);
        window.open(waLink, '_blank', 'noopener,noreferrer');
      });
    }

    if (fbBtn) {
      fbBtn.addEventListener('click', function () {
        var fbLink = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareUrl) +
          '&quote=' + encodeURIComponent('The Wedding of Riani & Rafly — Minggu, 22 Agustus 2027');
        window.open(fbLink, '_blank', 'noopener,noreferrer');
      });
    }

    if (igBtn) {
      igBtn.addEventListener('click', function () {
        if (navigator.share) {
          navigator.share({
            title: 'The Wedding of Riani & Rafly',
            text: 'Undangan Pernikahan Siti Riani & Muhamad Rafly Kristiadi — 22 Agustus 2027',
            url: shareUrl
          }).catch(function () {
            // User canceled share sheet
          });
          return;
        }
        copyTextToClipboard(shareText).then(function () {
          showToast('Link & caption IG disalin! Tempel di Story / DM / Bio Instagram');
        }).catch(function () {
          showToast('Buka halaman Generator Link untuk unduh kartu Story IG');
        });
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        copyTextToClipboard(shareUrl).then(function () {
          showToast('Link Undangan Disalin!');
        }).catch(function () {
          showToast('Silakan salin URL dari address bar');
        });
      });
    }
  }

  /* ------------------------------------------------------------------------
     BOOTSTRAP APPLICATION
     ------------------------------------------------------------------------ */
  function bootstrap() {
    // Detect low-end devices or prefers-reduced-motion before initializing visuals
    if (window.KalavaniCamera && window.KalavaniCamera.detectLiteMode()) {
      document.body.classList.add('lite-mode');
    }

    var guestName = resolveGuestName();
    var music = createMusicController();

    initCountdown();
    initGiftSection();
    initLightbox();
    initScrollUI();
    initShareButtons();

    if (window.KalavaniRSVP) {
      window.KalavaniRSVP.init(guestName, showToast);
    }
    if (window.KalavaniParticles) {
      window.KalavaniParticles.init();
    }

    // Subtle 3D Pointer Parallax on Cover (sky clouds, facade, doves at distinct Z-speeds)
    var coverSection = document.getElementById('sec-cover');
    var coverBg = document.getElementById('cover-bg-layer');
    var coverDoves = coverSection ? coverSection.querySelector('.cover-doves') : null;
    if (coverSection && coverBg && !document.body.classList.contains('lite-mode')) {
      coverSection.addEventListener('pointermove', function (e) {
        if (opened || e.pointerType === 'touch') return;
        var rect = coverSection.getBoundingClientRect();
        var nx = (e.clientX - rect.left) / rect.width - 0.5;
        var ny = (e.clientY - rect.top) / rect.height - 0.5;
        coverBg.style.transform = 'translate3d(' + (-nx * 14).toFixed(1) + 'px, ' + (-ny * 10).toFixed(1) + 'px, 0) scale(1.04)';
        if (coverDoves) {
          coverDoves.style.transform = 'translate3d(' + (nx * 22).toFixed(1) + 'px, ' + (ny * 16).toFixed(1) + 'px, 0)';
        }
      }, { passive: true });
    }

    // Cover Open Button -> Starts Music + Fires 6-Level Arch Tunnel + Initializes Scroll Camera
    var openBtn = document.getElementById('btn-open-invitation');
    var opened = false;

    if (openBtn) {
      openBtn.addEventListener('click', function () {
        if (opened) return;
        opened = true;
        if (coverBg) coverBg.style.transform = '';
        if (coverDoves) coverDoves.style.transform = '';

        music.start();

        if (window.KalavaniCamera) {
          window.KalavaniCamera.playArchTunnelTransition(function () {
            window.KalavaniCamera.initScrollCamera();
          });
        } else {
          var cover = document.getElementById('sec-cover');
          if (cover) cover.classList.add('is-opened');
          document.body.classList.remove('is-locked');
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
