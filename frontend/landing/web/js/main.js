// Landing page entry point
import { Modal, prioritiseStore } from './components/modal.js';
import { Legal } from './components/legal.js';
import { Navigation } from './components/navigation.js';
import { Audience } from './components/audience.js';
import { Jobs } from './components/jobs.js';
import { HeroMap } from './components/hero-map.js';
import { playBrandIntro } from './components/brand-intro.js';
import { setupReveal, setupCounters, setupBackToTop } from './components/effects.js';
import { setupAmbientTone, setupHeroScroll } from './components/scroll-story.js';
import { setupMarquee, setupSearchMock, setupTimelineMock, introHeroCopy } from './components/motion.js';
import { toast } from './utils/toast.js';

// Remember the scroll position across refreshes ourselves, so a visitor returning part-way down
// skips the intros and lands with the map already in its background state
const SCROLL_KEY = 'wz_scroll_y';
let savedY = 0;
try { savedY = Number(sessionStorage.getItem(SCROLL_KEY)) || 0; } catch (e) { /* storage unavailable */ }
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('pagehide', () => {
  try { sessionStorage.setItem(SCROLL_KEY, String(Math.round(window.scrollY))); } catch (e) { /* ignore */ }
});

// Where a #hash link (e.g. /#jobs from the CV builder) points, as a scroll position; 0 if it is not a section
function hashY() {
  let target = null;
  try { target = location.hash && document.querySelector(location.hash); } catch (e) { /* not a selector */ }
  if (!target || !target.offsetParent) return 0;
  const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  return Math.max(0, target.getBoundingClientRect().top + window.scrollY - pad);
}

function init() {
  // A #hash link decides its own position; otherwise resume where the visitor was. Landing part-way down
  // either way skips the intros, so the hero is set up in its scrolled state and comes back on scrolling up.
  const resumeY = location.hash ? hashY() : savedY;
  const resumeDeep = resumeY > window.innerHeight * 0.5;
  if (resumeY > 0) window.scrollTo(0, resumeY);

  // Phones open on the map alone (it is the page background there) instead of the logo reveal
  const animate = Boolean(window.gsap) && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mapFirst = !resumeDeep && animate && window.matchMedia('(max-width: 900px)').matches;
  document.documentElement.classList.toggle('map-boot', mapFirst);
  if (mapFirst) document.documentElement.classList.add('is-locked');
  const brandDone = resumeDeep || mapFirst ? Promise.resolve() : playBrandIntro();

  window.modal = new Modal();
  window.legal = new Legal();
  window.navigation = new Navigation();
  window.audience = new Audience();
  window.jobs = new Jobs();
  window.heroMap = new HeroMap(document.querySelector('[data-hero-map]'), { startAfter: brandDone, skipIntro: resumeDeep, drawTime: mapFirst ? 1.5 : 0 });

  prioritiseStore();
  setupMarquee();
  setupReveal();
  setupCounters();
  setupBackToTop();
  setupSearchMock();
  setupTimelineMock();
  setupAmbientTone();
  setupHeroScroll();
  if (mapFirst) mapBoot();
  else if (!resumeDeep) brandDone.then(introHeroCopy);
}

// The map draws in at full strength, then fades back behind the page as the text arrives.
// A tap or key press skips ahead.
function mapBoot() {
  const root = document.documentElement;
  const layer = document.querySelector('.map-layer--mobile');
  if (layer) window.gsap.set(layer, { opacity: 1 });
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', done);
      window.removeEventListener('keydown', done);
      root.classList.remove('map-boot', 'is-locked');
      // Everything arrives together as one fade
      window.gsap.from('.site-header, .hero-copy, .hero ~ *, .fab-stack', { opacity: 0, duration: 1, ease: 'power1.inOut', clearProps: 'opacity' });
      if (layer) window.gsap.to(layer, { opacity: 0.32, duration: 1, ease: 'power1.inOut', clearProps: 'opacity' });
      resolve();
    };
    // Starts while the map is still finishing its draw-in (1.5s), so the two overlap
    const timer = setTimeout(done, 1000);
    window.addEventListener('pointerdown', done);
    window.addEventListener('keydown', done);
  });
}

// Modules run after parsing, so the DOM may already be ready
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

window.addEventListener('online', () => toast('تم استعادة الاتصال بالإنترنت', 'success'));
window.addEventListener('offline', () => toast('لا يوجد اتصال بالإنترنت', 'error'));
