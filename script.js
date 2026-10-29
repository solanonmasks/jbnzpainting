/* ==========================================================================
   Jnbz Painting — site behaviour (plain JavaScript, no libraries)
   ========================================================================== */

/* --------------------------------------------------------------------------
   FORM SETTING
   Paste the address of your form service here to receive quote requests
   by email, for example a Formspree endpoint:
     const FORM_ENDPOINT = 'https://formspree.io/f/abcdwxyz';
   While it is empty, the form only shows the thank-you message
   (nothing is sent anywhere). See README.md for details.
   -------------------------------------------------------------------------- */
const FORM_ENDPOINT = '';

document.addEventListener('DOMContentLoaded', function () {
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.16,.84,.3,1)';

  setUpScrollReveal(reduceMotion, EASE);
  setUpLightbox();
  setUpQuoteForm();
});

/* --------------------------------------------------------------------------
   1. SCROLL REVEAL
   Items marked data-reveal fade and slide up as they scroll into view.
   Items already on screen when the page loads are left as they are.
   -------------------------------------------------------------------------- */
function setUpScrollReveal(reduceMotion, EASE) {
  if (reduceMotion) return; // visitor prefers less motion: show everything as-is

  const items = Array.from(document.querySelectorAll('[data-reveal]'));

  function show(el, i) {
    if (el.dataset.shown) return;
    el.dataset.shown = '1';
    const delay = i * 0.08; // small stagger when several appear together
    el.style.transition = 'opacity 1s ' + EASE + ' ' + delay + 's, transform 1s ' + EASE + ' ' + delay + 's';
    el.classList.remove('reveal-hidden');
  }

  // Hide only the items that start below the visible screen
  items.forEach(function (el) {
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.dataset.shown = '1';
    } else {
      el.classList.add('reveal-hidden');
    }
  });

  // On scroll, reveal items once their top passes 92% of the screen height
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      const limit = window.innerHeight * 0.92;
      let i = 0;
      items.forEach(function (el) {
        if (!el.dataset.shown && el.getBoundingClientRect().top < limit) show(el, i++);
      });
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Safety net: after 3.5 seconds, show everything no matter what
  setTimeout(function () {
    items.forEach(function (el) { show(el, 0); });
  }, 3500);
}

/* --------------------------------------------------------------------------
   2. PHOTO VIEWER (lightbox)
   Click a gallery photo to see it larger. Click anywhere, press Escape,
   or use the Close button (keyboard) to close it.
   -------------------------------------------------------------------------- */
function setUpLightbox() {
  const box = document.getElementById('lightbox');
  if (!box) return;
  const img = box.querySelector('img');
  const closeBtn = box.querySelector('.lightbox-close');
  let lastTrigger = null;

  function open(src, trigger) {
    lastTrigger = trigger;
    img.src = src;
    box.hidden = false;
    closeBtn.focus();
  }

  function close() {
    if (box.hidden) return;
    box.hidden = true;
    img.src = '';
    if (lastTrigger) lastTrigger.focus(); // return keyboard focus to the photo
  }

  document.querySelectorAll('.gallery-item').forEach(function (btn) {
    btn.addEventListener('click', function () { open(btn.dataset.full, btn); });
  });

  box.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
    // Keep keyboard focus inside the viewer while it is open
    if (e.key === 'Tab' && !box.hidden) { e.preventDefault(); closeBtn.focus(); }
  });
}

/* --------------------------------------------------------------------------
   3. QUOTE FORM
   - Project type buttons ("chips") toggle on/off.
   - On submit, the form is sent to FORM_ENDPOINT (if set), then the
     thank-you message replaces the form.
   -------------------------------------------------------------------------- */
function setUpQuoteForm() {
  const form = document.getElementById('quote-form');
  if (!form) return;
  const thanks = document.getElementById('quote-thanks');
  const chips = form.querySelectorAll('.chip');
  const typesField = form.querySelector('input[name="project_types"]');
  const errorMsg = form.querySelector('.form-error');
  const submitBtn = form.querySelector('.form-submit');

  // Toggle chips and keep the hidden field up to date
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      const on = chip.getAttribute('aria-pressed') !== 'true';
      chip.setAttribute('aria-pressed', on ? 'true' : 'false');
      typesField.value = Array.from(chips)
        .filter(function (c) { return c.getAttribute('aria-pressed') === 'true'; })
        .map(function (c) { return c.textContent.trim(); })
        .join(', ');
    });
  });

  function showThanks() {
    form.hidden = true;
    thanks.hidden = false;
    thanks.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorMsg.hidden = true;

    if (!FORM_ENDPOINT) {
      console.warn('Jnbz Painting: no FORM_ENDPOINT is set in script.js, so this quote request was not sent anywhere.');
      showThanks();
      return;
    }

    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Form service replied with status ' + response.status);
        showThanks();
      })
      .catch(function (err) {
        console.error(err);
        errorMsg.hidden = false;
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      });
  });
}
