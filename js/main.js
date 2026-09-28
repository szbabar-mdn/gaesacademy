/* ===== GAES — main script ===== */
(function () {
  'use strict';

  /* ---------- Hero slider: 5 slides, auto-change every 10 seconds ---------- */
  var INTERVAL = 10000; // 10 seconds
  var slides = document.querySelectorAll('.slide');
  var dotsBox = document.getElementById('dots');
  var bar = document.getElementById('progressBar');
  var hero = document.getElementById('home');
  var current = 0, timer = null, startTime = 0, elapsedBeforePause = 0, paused = false, raf = null;

  slides.forEach(function (_, i) {
    var b = document.createElement('button');
    b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    b.addEventListener('click', function () { goTo(i); });
    dotsBox.appendChild(b);
  });
  var dots = dotsBox.querySelectorAll('button');

  function show(n) {
    var prev = slides[current];
    prev.classList.remove('active');
    prev.classList.add('leaving');
    setTimeout(function () { prev.classList.remove('leaving'); }, 1700);
    current = (n + slides.length) % slides.length;
    // restart the Ken Burns zoom on the incoming slide
    var next = slides[current];
    next.style.animation = 'none'; void next.offsetWidth; next.style.animation = '';
    next.classList.add('active');
    dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
  }

  function tickProgress(ts) {
    if (paused) return;
    var pct = Math.min(((ts - startTime) + elapsedBeforePause) / INTERVAL, 1);
    bar.style.width = (pct * 100) + '%';
    raf = requestAnimationFrame(tickProgress);
  }

  function schedule(remaining) {
    clearTimeout(timer);
    cancelAnimationFrame(raf);
    startTime = performance.now();
    raf = requestAnimationFrame(function (t) { startTime = t; tickProgress(t); });
    timer = setTimeout(function () { show(current + 1); elapsedBeforePause = 0; schedule(INTERVAL); }, remaining);
  }

  function goTo(n) { show(n); elapsedBeforePause = 0; bar.style.width = '0'; if (!paused) schedule(INTERVAL); }

  document.getElementById('nextSlide').addEventListener('click', function () { goTo(current + 1); });
  document.getElementById('prevSlide').addEventListener('click', function () { goTo(current - 1); });

  hero.addEventListener('mouseenter', function () {
    paused = true; clearTimeout(timer); cancelAnimationFrame(raf);
    elapsedBeforePause += performance.now() - startTime;
  });
  hero.addEventListener('mouseleave', function () {
    paused = false; schedule(Math.max(INTERVAL - elapsedBeforePause, 0));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') goTo(current + 1);
    if (e.key === 'ArrowLeft') goTo(current - 1);
  });

  // touch swipe
  var sx = null;
  hero.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
    sx = null;
  });

  // pause when the tab is hidden
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { clearTimeout(timer); cancelAnimationFrame(raf); elapsedBeforePause += performance.now() - startTime; }
    else if (!paused) { schedule(Math.max(INTERVAL - elapsedBeforePause, 0)); }
  });

  dots[0].classList.add('active');
  schedule(INTERVAL);

  /* ---------- Header: solid on scroll, mobile menu, active link ---------- */
  var header = document.getElementById('siteHeader');
  var toggle = document.getElementById('menuToggle');
  var links = document.getElementById('navLinks');
  var toTop = document.getElementById('toTop');

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 40);
    toTop.classList.toggle('show', window.scrollY > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    links.classList.remove('open');
    header.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  var sections = document.querySelectorAll('main section[id], section[id]');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.querySelectorAll('a').forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });

    /* ---------- Scroll reveal (below-the-fold content only) ---------- */
    var revealEls = document.querySelectorAll('#about .grid-2 > *, .mv-card, .p-card, .g-item, .admission-form-wrap, .contact > *');
    revealEls.forEach(function (el, i) { el.classList.add('reveal'); el.style.transitionDelay = (i % 4) * 80 + 'ms'; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Forms (demo behaviour – connect to your backend / email service) ---------- */
  function handleForm(formId, msgId) {
    var f = document.getElementById(formId), m = document.getElementById(msgId);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      m.classList.add('show');
      f.reset();
      setTimeout(function () { m.classList.remove('show'); }, 8000);
    });
  }
  handleForm('admissionForm', 'admMsg');
  handleForm('contactForm', 'formMsg');

  document.getElementById('year').textContent = new Date().getFullYear();
})();
