// landing.js — Shakies Co Landing Page

// ── Sticky navbar shadow ──────────────────────────────────────
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('navbar--scrolled', window.scrollY > 50);
  }, { passive: true });
}

// ── Copyright year ────────────────────────────────────────────
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = '2023';

// ── Smooth scroll fallback (browsers without CSS scroll-behavior) ─
if (!('scrollBehavior' in document.documentElement.style)) {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// ── Flash Discount Timer ──────────────────────────────────────
(function () {
  const DURATION_MS   = 2 * 60 * 60 * 1000; // 2 jam dalam ms
  const TOTAL_SLOTS   = 5;
  const LS_START_KEY  = 'shakies_flash_start';
  const LS_SLOTS_KEY  = 'shakies_flash_slots';
  const COUPON_CODE   = 'SHAKIE50';

  const elActive      = document.getElementById('flash-active');
  const elExpired     = document.getElementById('flash-expired');
  const elSlots       = document.getElementById('flash-slots');
  const elHours       = document.getElementById('timer-hours');
  const elMinutes     = document.getElementById('timer-minutes');
  const elSeconds     = document.getElementById('timer-seconds');
  const elCopyBtn     = document.getElementById('copy-coupon-btn');
  const elCopyConfirm = document.getElementById('copy-confirm');

  if (!elActive || !elExpired) return;

  // Ambil atau set waktu mulai kunjungan pertama
  let startTime = parseInt(localStorage.getItem(LS_START_KEY), 10);
  if (!startTime || isNaN(startTime)) {
    startTime = Date.now();
    localStorage.setItem(LS_START_KEY, startTime);
  }

  // Ambil atau set sisa slot
  let slotsLeft = parseInt(localStorage.getItem(LS_SLOTS_KEY), 10);
  if (isNaN(slotsLeft) || slotsLeft > TOTAL_SLOTS) {
    slotsLeft = TOTAL_SLOTS;
    localStorage.setItem(LS_SLOTS_KEY, slotsLeft);
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function showExpired() {
    elActive.hidden = true;
    elExpired.hidden = false;
  }

  function isExpired() {
    return (Date.now() - startTime) >= DURATION_MS || slotsLeft <= 0;
  }

  function updateTimer() {
    const remaining = DURATION_MS - (Date.now() - startTime);

    if (remaining <= 0) {
      elHours.textContent   = '00';
      elMinutes.textContent = '00';
      elSeconds.textContent = '00';
      return;
    }

    const totalSeconds = Math.floor(remaining / 1000);
    elHours.textContent   = pad(Math.floor(totalSeconds / 3600));
    elMinutes.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
    elSeconds.textContent = pad(totalSeconds % 60);

    if (elSlots) elSlots.textContent = slotsLeft;
  }

  // Langsung cek expired saat load
  if (isExpired()) {
    showExpired();
    return;
  }

  // Jalankan timer pertama kali
  updateTimer();

  const timerInterval = setInterval(() => {
    if (isExpired()) {
      clearInterval(timerInterval);
      showExpired();
      return;
    }
    updateTimer();
  }, 1000);

  // ── Tombol salin kupon ──
  if (elCopyBtn) {
    elCopyBtn.addEventListener('click', () => {
      if (isExpired()) {
        clearInterval(timerInterval);
        showExpired();
        return;
      }

      // Tiap klik kurangi 1 slot
      slotsLeft = Math.max(0, slotsLeft - 1);
      localStorage.setItem(LS_SLOTS_KEY, slotsLeft);
      if (elSlots) elSlots.textContent = slotsLeft;

      // Copy ke clipboard
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(COUPON_CODE).then(showCopyFeedback).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }

      // Kalau slot habis langsung expired
      if (slotsLeft <= 0) {
        clearInterval(timerInterval);
        setTimeout(showExpired, 1500); // beri jeda biar feedback copy kebaca dulu
      }
    });
  }

  function fallbackCopy() {
    const ta = document.createElement('textarea');
    ta.value = COUPON_CODE;
    ta.style.position = 'fixed';
    ta.style.opacity  = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showCopyFeedback();
  }

  function showCopyFeedback() {
    if (elCopyConfirm) elCopyConfirm.textContent = '✅ Kode berhasil disalin! Paste di kolom Kode Voucher saat checkout.';
    elCopyBtn.textContent = '✓ Tersalin!';
    elCopyBtn.disabled = true;
    setTimeout(() => {
      if (elCopyConfirm) elCopyConfirm.textContent = '';
      elCopyBtn.textContent = '🎁 Salin Kode Diskon';
      elCopyBtn.disabled = false;
    }, 4000);
  }

})();
