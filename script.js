// ===== Theme toggle =====
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  html.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
});

// ===== Cursor-reactive hero words =====
const heroWords = document.querySelectorAll('[data-word]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion && heroWords.length) {
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
    heroWords.forEach((word) => {
      const rect = word.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(mouseX - cx, mouseY - cy);
      const maxDist = 180;
      // steeper falloff = snaps to full effect sooner, feels more "defined" than gradual
      const proximity = Math.max(0, Math.min(1, 1 - dist / maxDist));
      const eased = proximity * proximity; // ease-in, sharper response near the word

      const green = getComputedStyle(html).getPropertyValue('--green').trim();
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

// ===== Count-up stats on scroll into view =====
const statNumbers = document.querySelectorAll('.stat__number');

const countUp = (el) => {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1200;
  const start = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(eased * target);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target;
    }
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

// ===== Scroll reveal: fade + slide up as sections enter view =====
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach((el) => revealObserver.observe(el));