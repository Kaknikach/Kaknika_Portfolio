// =========================================================
// Kaknika Chea — Portfolio script (shared by every page)
// Each block checks that its elements exist, so it's safe
// to load on pages that don't use every feature.
// =========================================================

const html = document.documentElement;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== Theme toggle (remembers your choice) =====
// The <head> of each page sets the starting theme before anything draws,
// so the page never flashes the wrong colours.
const themeToggle = document.getElementById('themeToggle');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* private mode: fine */ }
  });
}

// ===== Nav: highlight the current page + mobile menu =====
const nav = document.getElementById('nav');
const navMenu = document.getElementById('navMenu');
const currentPage = location.pathname.split('/').pop() || 'index.html';

document.querySelectorAll('.nav__links a').forEach((link) => {
  if (link.getAttribute('href') === currentPage) link.setAttribute('aria-current', 'page');
});

if (nav && navMenu) {
  const setMenu = (open) => {
    nav.classList.toggle('nav--open', open);
    navMenu.setAttribute('aria-expanded', String(open));
    navMenu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  navMenu.addEventListener('click', () => setMenu(!nav.classList.contains('nav--open')));
  nav.querySelectorAll('.nav__links a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) setMenu(false); });
}

// ===== Cursor-reactive hero words =====
const heroWords = document.querySelectorAll('[data-word]');
const hasCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (!prefersReducedMotion && heroWords.length && hasCursor) {
  let ticking = false;
  let mouseX = -9999;
  let mouseY = -9999;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!ticking) {
      requestAnimationFrame(updateWords);
      ticking = true;
    }
  });

  function updateWords() {
    const green = getComputedStyle(html).getPropertyValue('--green').trim();
    heroWords.forEach((word) => {
      const rect = word.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(mouseX - cx, mouseY - cy);
      const maxDist = 180;
      const proximity = Math.max(0, Math.min(1, 1 - dist / maxDist));
      const eased = proximity * proximity; // sharper response near the word

      word.style.textShadow = eased > 0
        ? `0 0 ${10 * eased}px ${green}, 0 0 ${26 * eased}px ${green}`
        : 'none';
      word.style.color = eased > 0
        ? `color-mix(in srgb, ${green} ${Math.min(eased * 100, 100)}%, var(--text))`
        : 'var(--text)';
      word.style.fontVariationSettings = `'wght' ${700 + eased * 100}`;
    });
    ticking = false;
  }
}

// On phones and tablets (no cursor) the words take turns lighting up instead
if (!prefersReducedMotion && heroWords.length && !hasCursor) {
  let lit = 0;
  setTimeout(() => {
    setInterval(() => {
      heroWords.forEach((w, i) => w.classList.toggle('is-lit', i === lit));
      lit = (lit + 1) % heroWords.length;
    }, 1600);
  }, 900);
}

// ===== Count-up stats on scroll into view =====
const statNumbers = document.querySelectorAll('[data-count]');

const countUp = (el) => {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  if (prefersReducedMotion) { el.textContent = target + suffix; return; }
  const duration = 1200;
  const start = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target + suffix;
  };
  requestAnimationFrame(step);
};

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      countUp(entry.target);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statNumbers.forEach((el) => statObserver.observe(el));

// ===== Scroll reveal: fade + slide in as things enter view =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal, .reveal-x').forEach((el) => revealObserver.observe(el));

// ===== Student Council timeline (Leadership page) =====
// Wide screens: the section pins in place and scrolling down moves the
// timeline sideways, one direction only, then lets go after "President".
// Phones / reduced motion: it stays a simple vertical list.
const timeline = document.querySelector('.tl');

if (timeline) {
  const track = timeline.querySelector('.tl__track');
  const stages = [...timeline.querySelectorAll('.tl__stage')];
  const wide = window.matchMedia('(min-width: 900px)');
  let pinned = false;

  const update = () => {
    if (!pinned) return;
    const rect = timeline.getBoundingClientRect();
    const scrollable = timeline.offsetHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
    const distance = track.scrollWidth - window.innerWidth;
    track.style.transform = `translateX(${-progress * Math.max(0, distance)}px)`;
    timeline.style.setProperty('--progress', progress.toFixed(3));
    stages.forEach((stage, i) => {
      const threshold = stages.length > 1 ? (i / (stages.length - 1)) * 0.92 : 0;
      stage.classList.toggle('is-lit', progress >= threshold - 0.02);
    });
  };

  const setMode = () => {
    pinned = wide.matches && !prefersReducedMotion;
    timeline.classList.toggle('is-pinned', pinned);
    if (!pinned) {
      track.style.transform = '';
      stages.forEach((s) => { s.classList.add('reveal-x'); revealObserver.observe(s); });
    } else {
      stages.forEach((s) => s.classList.remove('reveal-x', 'is-visible'));
      update();
    }
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { update(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', update);
  wide.addEventListener('change', setMode);
  setMode();
}

// ===== Achievements filter =====
const filterBar = document.querySelector('.filters');

if (filterBar) {
  const chips = filterBar.querySelectorAll('.chip');
  const awards = document.querySelectorAll('.award');
  const countEl = document.getElementById('awardCount');

  const applyFilter = (filter) => {
    let shown = 0;
    awards.forEach((a) => {
      const match =
        filter === 'all' ||
        (filter === 'highlights' && a.hasAttribute('data-highlight')) ||
        a.dataset.cat === filter;
      a.hidden = !match;
      if (match) shown++;
    });
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === filter)));
    if (countEl) countEl.textContent = `Showing ${shown} of ${awards.length}`;
  };

  chips.forEach((chip) => chip.addEventListener('click', () => applyFilter(chip.dataset.filter)));

  // achievements.html#athletics opens with that filter already on
  const fromHash = location.hash.replace('#', '');
  const valid = [...chips].some((c) => c.dataset.filter === fromHash);
  applyFilter(valid ? fromHash : 'highlights');
  if (valid) document.getElementById('awards')?.scrollIntoView();
}

// ===== Images: show a soft placeholder until a real photo is added =====
document.querySelectorAll('.media img, .hero__photo img').forEach((img) => {
  const markEmpty = () => {
    const box = img.parentElement;
    box.classList.add(box.classList.contains('hero__photo') ? 'hero__photo--empty' : 'media--empty');
    img.remove();
  };
  if (img.complete && img.naturalWidth === 0) markEmpty();
  else img.addEventListener('error', markEmpty);
});

// ===== Page transitions: quick fade when moving between pages =====
if (!prefersReducedMotion) {
  document.querySelectorAll('a[href$=".html"], a[href*=".html#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const url = new URL(link.href, location.href);
      const samePage = url.pathname === location.pathname;
      if (samePage || e.metaKey || e.ctrlKey || e.shiftKey || link.target === '_blank') return;
      e.preventDefault();
      document.body.classList.add('is-leaving');
      setTimeout(() => { location.href = link.href; }, 200);
    });
  });
  // coming back with the browser's Back button
  window.addEventListener('pageshow', () => document.body.classList.remove('is-leaving'));
}

// ===== A small hello for anyone who opens the developer tools =====
console.log(
  '%cHi, you found the console 👋%c\nI built this site by hand: HTML, CSS and plain JavaScript.\nIf you like poking around code, we should talk. — Kaknika',
  'font: 700 16px sans-serif; color: #00E39A;',
  'font: 13px sans-serif;'
);
