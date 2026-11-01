// Header: scrolled state, scroll-spy highlighting, and the mobile navigation sheet
import { createOverlay } from './overlay.js';

export class Navigation {
  constructor() {
    this.header = document.getElementById('siteHeader');
    this.toggle = this.header.querySelector('.menu-toggle');
    this.sheet = document.getElementById('mobileNav');
    this.backdrop = document.querySelector('[data-close-mobile-nav].sheet-backdrop');

    this.layer = createOverlay(this.sheet, {
      backdrop: this.backdrop,
      onClose: () => this.toggle.setAttribute('aria-expanded', 'false'),
    });

    this.toggle.addEventListener('click', () => {
      this.layer.open();
      this.toggle.setAttribute('aria-expanded', 'true');
    });

    this.sheet.addEventListener('click', (e) => {
      if (e.target.closest('[data-close-mobile-nav]') || e.target.closest('a')) this.layer.close();
    });

    this.onScroll = this.onScroll.bind(this);
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.onScroll();
    this.setupScrollSpy();
  }

  onScroll() {
    this.header.classList.toggle('is-scrolled', window.scrollY > 8);
  }

  setupScrollSpy() {
    const links = [...this.header.querySelectorAll('[data-spy]')];
    const sections = links.map(l => document.getElementById(l.dataset.spy)).filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(l => {
          if (l.dataset.spy === entry.target.id) l.setAttribute('aria-current', 'true');
          else l.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(s => observer.observe(s));

    // Clear the highlight when back at the hero
    const hero = document.getElementById('top');
    if (hero) {
      new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) links.forEach(l => l.removeAttribute('aria-current'));
      }, { rootMargin: '-45% 0px -50% 0px' }).observe(hero);
    }
  }
}
