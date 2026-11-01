// Light scroll effects: reveal-on-scroll, stat counters, back-to-top
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const REVEAL = '.section-head, .step, .bento-card, .path-card, .quote, .faq, .cta-panel, .stats-strip, .band-copy, .band-stat';

export function setupReveal() {
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll(REVEAL).forEach((el) => {
    // Stagger siblings slightly so grids cascade in
    const index = [...el.parentElement.children].indexOf(el);
    el.style.transitionDelay = `${Math.min(index, 5) * 60}ms`;
    el.classList.add('rv');
    observer.observe(el);
  });
}

export function setupCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (reduceMotion || !counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.counter);
      const decimals = (el.dataset.counter.split('.')[1] || '').length;
      const suffix = el.dataset.suffix || '';
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / 1400, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.6 });

  counters.forEach(c => observer.observe(c));
}

export function setupBackToTop() {
  const btn = document.querySelector('[data-back-to-top]');
  if (!btn) return;
  const update = () => { btn.hidden = window.scrollY < 900; };
  window.addEventListener('scroll', update, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  update();
}
