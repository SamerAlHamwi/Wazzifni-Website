// Scroll-driven chrome: navbar shadow, progress bar, back-to-top button.
//
// One passive listener for all three, with the DOM writes batched into a single
// rAF frame so scrolling never triggers a layout per event.
export class ScrollEffects {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.progress = document.getElementById('scroll-progress');
    this.backToTop = document.getElementById('back-to-top');
    this.ticking = false;

    this.onScroll = this.onScroll.bind(this);
    this.init();
  }

  init() {
    this.backToTop?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll, { passive: true });
    this.update();
  }

  onScroll() {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      this.update();
      this.ticking = false;
    });
  }

  update() {
    const y = window.scrollY;
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;

    this.navbar?.classList.toggle('scrolled', y > 10);
    this.backToTop?.classList.toggle('visible', y > 400);

    if (this.progress) {
      const ratio = scrollable > 0 ? Math.min(y / scrollable, 1) : 0;
      // scaleX instead of width: composited, so it never triggers layout.
      this.progress.style.transform = `scaleX(${ratio})`;
    }
  }
}
