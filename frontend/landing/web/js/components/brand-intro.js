// Page-load brand reveal: the calligraphic wordmark is written in from right to left over a sky glow,
// the slogan fades in beneath it, then the layer clears and the hero animations begin.
// Resolves when the hero can start. Skipped for reduced motion or if GSAP is missing; a click or key skips it.
export function playBrandIntro() {
  const gsap = window.gsap;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!gsap || reduce) return Promise.resolve();

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'brand-intro';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="bi-glow"></div>
      <div class="bi-mark-wrap"><img class="bi-mark" src="assets/images/wordmark-white.png" alt="" width="1200" height="777"></div>
      <p class="bi-slogan">وظيفة اليوم، مستقبل الغد!</p>`;
    document.body.appendChild(overlay);
    document.documentElement.classList.add('is-locked');

    const mark = overlay.querySelector('.bi-mark');
    const slogan = overlay.querySelector('.bi-slogan');
    const glow = overlay.querySelector('.bi-glow');
    let released = false;

    const release = () => {
      if (released) return;
      released = true;
      document.documentElement.classList.remove('is-locked');
      resolve();
    };

    const tl = gsap.timeline({ onComplete: () => overlay.remove() });
    tl.fromTo(glow, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, 0)
      // Written in from the right edge, the way Arabic is written
      .fromTo(mark, { clipPath: 'inset(0% 0% 0% 100%)', y: 6 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 0.75, ease: 'power2.inOut' }, 0.1)
      .fromTo(slogan, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.6)
      .add(release, 1.15)
      .to([mark, slogan], { opacity: 0, duration: 0.4, ease: 'power2.in' }, 1.15)
      .to(overlay, { opacity: 0, duration: 0.45, ease: 'power1.inOut' }, 1.2);

    const skip = () => {
      if (tl.progress() < 0.85) tl.progress(0.85);
    };
    overlay.addEventListener('click', skip);
    window.addEventListener('keydown', skip, { once: true });
  });
}
