/* ==========================================================================
   RSVP & UCAPAN MANAGER (XSS-SAFE DOM + LOCALSTORAGE PERSISTENCE)
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'kalavani_riani_rafly_wishes_v1';

  var SEED_WISHES = [
    {
      name: 'Keluarga Besar Bapak Ahyadi',
      attendance: 'Hadir',
      message: 'Barakallahu lakuma wa baraka alaikuma wa jamaa bainakuma fi khair. Semoga Riani & Rafly menjadi keluarga sakinah, mawaddah, warahmah.',
      createdAt: 'Baru saja'
    },
    {
      name: 'Nadia Putri & Partner',
      attendance: 'Hadir',
      message: 'Selamat menempuh hidup baru Riani dan Rafly! Lancar terus sampai hari H, insya Allah kami hadir merayakan hari bahagia kalian.',
      createdAt: '10 menit lalu'
    },
    {
      name: 'Dimas Pratama',
      attendance: 'Hadir',
      message: 'Masya Allah, semoga Allah SWT senantiasa melimpahkan keberkahan, kebahagiaan, dan cinta yang tak pernah pudar untuk kalian berdua.',
      createdAt: '1 jam lalu'
    }
  ];

  function loadWishes() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return SEED_WISHES.slice();
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      // Fallback safely if storage disabled
    }
    return SEED_WISHES.slice();
  }

  function saveWishes(list) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 60)));
    } catch (e) {
      // Ignore storage quota errors gracefully
    }
  }

  function formatNowLabel() {
    try {
      var now = new Date();
      return now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) + ' • ' + now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Baru saja';
    }
  }

  function initRSVP(guestName, showToast) {
    var form = document.getElementById('rsvp-form');
    var nameInput = document.getElementById('rsvp-name');
    var msgInput = document.getElementById('rsvp-message');
    var listEl = document.getElementById('wishes-list');
    var statHadirEl = document.getElementById('stat-hadir');
    var statTidakEl = document.getElementById('stat-tidak');

    if (!form || !listEl) return;

    // Prefill guest name from ?to= if present and not generic default
    if (guestName && guestName !== 'Tamu Undangan' && nameInput && !nameInput.value) {
      nameInput.value = guestName;
    }

    var wishes = loadWishes();

    function render() {
      var hadirCount = 0;
      var tidakCount = 0;

      listEl.innerHTML = '';

      wishes.forEach(function (item) {
        if (item.attendance === 'Hadir') hadirCount++;
        else tidakCount++;

        var card = document.createElement('article');
        card.className = 'wish-card';

        var top = document.createElement('div');
        top.className = 'wish-top';

        var author = document.createElement('span');
        author.className = 'wish-author';
        author.textContent = item.name;

        var badge = document.createElement('span');
        badge.className = 'wish-badge ' + (item.attendance === 'Hadir' ? 'wish-badge-hadir' : 'wish-badge-tidak');
        badge.textContent = item.attendance;

        top.appendChild(author);
        top.appendChild(badge);

        var text = document.createElement('p');
        text.className = 'wish-text';
        text.textContent = item.message;

        var time = document.createElement('p');
        time.className = 'wish-time';
        time.textContent = item.createdAt || 'Baru saja';

        card.appendChild(top);
        card.appendChild(text);
        card.appendChild(time);
        listEl.appendChild(card);
      });

      if (statHadirEl) statHadirEl.textContent = String(hadirCount);
      if (statTidakEl) statTidakEl.textContent = String(tidakCount);
    }

    form.addEventListener('submit', function (evt) {
      evt.preventDefault();

      var name = (nameInput.value || '').trim();
      var message = (msgInput.value || '').trim();
      var checkedRadio = form.querySelector('input[name="attendance"]:checked');
      var attendance = checkedRadio ? checkedRadio.value : 'Hadir';

      if (!name) {
        nameInput.focus();
        if (showToast) showToast('Mohon isi nama Anda terlebih dahulu');
        return;
      }
      if (!message) {
        msgInput.focus();
        if (showToast) showToast('Mohon tuliskan ucapan & doa terbaik Anda');
        return;
      }

      wishes.unshift({
        name: name,
        attendance: attendance,
        message: message,
        createdAt: formatNowLabel()
      });

      saveWishes(wishes);
      render();

      msgInput.value = '';
      if (showToast) showToast('Terima kasih! Ucapan & konfirmasi Anda telah tersimpan');
    });

    render();
  }

  window.KalavaniRSVP = { init: initRSVP };
})();
