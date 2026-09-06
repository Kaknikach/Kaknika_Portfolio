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
      const maxDist = 260;
      const proximity = Math.max(0, 1 - dist / maxDist);

      const green = getComputedStyle(html).getPropertyValue('--green').trim();
      word.style.textShadow = proximity > 0
        ? `0 0 ${18 * proximity}px ${green}`
        : 'none';
      word.style.color = proximity > 0
        ? `color-mix(in srgb, ${green} ${proximity * 70}%, var(--text))`
        : 'var(--text)';
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