// Site-wide motion: category marquee, animated feature mocks, hero copy intro.
// Everything here is decoration — the page works the same without it.
import { CATEGORIES } from './jobs.js';

const gsap = window.gsap;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canAnimate = Boolean(gsap) && !reduceMotion;

// Endless strip of job categories; clicking one filters the jobs list
export function setupMarquee() {
  const track = document.querySelector('[data-marquee-track]');
  if (!track) return;
  const items = CATEGORIES.map(c => `
    <button type="button" class="marquee-item" data-quick-category="${c.id}" style="--tone:${c.tone}">
      <svg class="icon"><use href="#${c.icon}"/></svg>${c.label}
    </button>`).join('');
  // Two copies so the loop is seamless; the second is hidden from assistive tech
  track.innerHTML = `<div class="marquee-group">${items}</div><div class="marquee-group" aria-hidden="true">${items}</div>`;
  track.querySelectorAll('[aria-hidden="true"] button').forEach(b => { b.tabIndex = -1; });
}

// Run a callback the first time an element scrolls into view
function whenVisible(node, fn) {
  if (!node) return;
  new IntersectionObserver(([entry], obs) => {
    if (!entry.isIntersecting) return;
    obs.disconnect();
    fn();
  }, { threshold: 0.35 }).observe(node);
}

// Search mock types a query, then the results refresh
export function setupSearchMock() {
  const mock = document.querySelector('.mock-search');
  if (!mock || !canAnimate) return;

  const input = mock.querySelector('.mock-input');
  const icon = input.querySelector('svg');
  input.textContent = '';
  input.appendChild(icon);
  const text = document.createElement('span');
  text.className = 'mock-text';
  const caret = document.createElement('i');
  caret.className = 'mock-caret';
  input.append(text, caret);

  const rows = [...mock.querySelectorAll('.mock-row')];
  // Typed letter by letter, so each language has its own words rather than a translation pass
  const queries = window.WZ_LANG === 'en' ? [
    { q: 'Accountant', tags: ['Baghdad', 'Najaf', 'Remote'] },
    { q: 'Engineer', tags: ['Basra', 'Erbil', 'Kirkuk'] },
    { q: 'Teacher', tags: ['Mosul', 'Karbala', 'Hillah'] },
  ] : [
    { q: 'محاسب', tags: ['بغداد', 'النجف', 'عن بُعد'] },
    { q: 'مهندس', tags: ['البصرة', 'أربيل', 'كركوك'] },
    { q: 'معلم', tags: ['الموصل', 'كربلاء', 'الحلة'] },
  ];
  let i = 0;

  const cycle = () => {
    const { q, tags } = queries[i % queries.length];
    i += 1;
    const tl = gsap.timeline({ onComplete: () => gsap.delayedCall(2.2, cycle) });

    // Erase the previous query
    const current = text.textContent;
    for (let k = current.length; k > 0; k -= 1) {
      tl.call(() => { text.textContent = current.slice(0, k - 1); }, null, `+=0.04`);
    }
    tl.to(rows, { opacity: 0, y: 4, duration: 0.2, stagger: 0.04 }, '<');

    // Type the new one
    [...q].forEach((_, k) => {
      tl.call(() => { text.textContent = q.slice(0, k + 1); }, null, `+=0.09`);
    });

    // Results come back
    tl.call(() => {
      rows.forEach((row, n) => {
        row.querySelector('.mock-tag').textContent = tags[n];
        row.querySelector('.mock-line').style.maxWidth = `${gsap.utils.random(35, 72)}%`;
      });
    }, null, '+=0.25')
      .to(rows, { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, ease: 'power2.out' });
  };

  whenVisible(mock, cycle);
}

// Application timeline steps forward on its own
export function setupTimelineMock() {
  const list = document.querySelector('.mock-timeline');
  if (!list || !canAnimate) return;
  const steps = [...list.querySelectorAll('li')];
  let current = 0;

  const render = () => {
    steps.forEach((li, n) => {
      li.classList.toggle('done', n < current);
      li.classList.toggle('current', n === current);
    });
    const dot = steps[current]?.querySelector('span');
    if (dot) gsap.fromTo(dot, { scale: 0.6 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
  };

  const tick = () => {
    current = (current + 1) % (steps.length + 1);
    if (current === steps.length) {
      // Hold on the finished state, then start over
      steps.forEach(li => { li.classList.add('done'); li.classList.remove('current'); });
      gsap.delayedCall(2.2, () => { current = 0; render(); gsap.delayedCall(1.4, tick); });
      return;
    }
    render();
    gsap.delayedCall(1.4, tick);
  };

  whenVisible(list, () => { current = 0; render(); gsap.delayedCall(1.4, tick); });
}

// Hero copy settles in on load
export function introHeroCopy() {
  if (!canAnimate) return;
  const parts = document.querySelectorAll('.hero-logo, .audience-switch, .hero-panel:not([hidden]) > *');
  gsap.from(parts, { opacity: 0, y: 14, duration: 0.7, ease: 'power3.out', stagger: 0.08, delay: 0.1, clearProps: 'all' });
}
