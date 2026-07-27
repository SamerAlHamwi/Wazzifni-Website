// Navigation: mobile drawer + active-section highlighting.
//
// The drawer half mirrors the main landing page so the two behave identically.
// The scroll-spy half is specific to this page: it is a single-page document
// with in-page sections, so the nav needs to say where the visitor is.
import { lockScroll, unlockScroll } from '../utils/scroll-lock.js';

export class Navigation {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.toggle = document.getElementById('nav-toggle');
    this.menu = document.getElementById('nav-menu');
    this.scrim = document.getElementById('nav-scrim');
    this.desktop = window.matchMedia('(min-width: 900px)');
    this.open = false;

    /** @type {Map<string, HTMLAnchorElement>} section id -> nav link */
    this.links = new Map();
    this.spy = null;

    this.init();
  }

  init() {
    this.initDrawer();
    this.initScrollSpy();
  }

  initDrawer() {
    if (!this.toggle || !this.menu) return;

    this.toggle.addEventListener('click', () => this.setOpen(!this.open));
    this.scrim?.addEventListener('click', () => this.close());

    // Any link inside the drawer navigates, so the drawer should go away.
    this.menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => this.close());
    });

    // Rotating to landscape can cross into the desktop layout while the drawer
    // is open, which would leave the burger stuck in its "expanded" state and
    // the body scroll-locked.
    this.desktop.addEventListener('change', (event) => {
      if (event.matches) this.close();
    });
  }

  /**
   * Marks the nav link of whichever section currently owns the viewport.
   * aria-current="true" carries the state for screen readers; the .is-active
   * class is only there for the underline.
   */
  initScrollSpy() {
    if (!this.menu || !('IntersectionObserver' in window)) return;

    /** Section ids currently crossing the band, in document order. */
    const inBand = new Set();
    const sections = [];

    this.menu.querySelectorAll('a[href^="#"]').forEach((link) => {
      const id = link.getAttribute('href').slice(1);
      const section = id && document.getElementById(id);
      if (!section) return;

      this.links.set(id, link);
      sections.push(section);
    });

    if (!sections.length) return;

    // A band across the middle of the viewport: whichever section crosses it is
    // the one being read, which is far steadier than "topmost visible".
    //
    // Membership is tracked rather than just reacting to the last entry, so
    // scrolling back up into the hero — which has no nav link — clears the
    // highlight instead of leaving the previous section marked.
    this.spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) inBand.add(entry.target.id);
          else inBand.delete(entry.target.id);
        });

        const current = [...this.links.keys()].find((id) => inBand.has(id));
        this.setActive(current ?? null);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );

    sections.forEach((section) => this.spy.observe(section));
  }

  setActive(id) {
    this.links.forEach((link, sectionId) => {
      const active = sectionId === id;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  setOpen(next) {
    if (next === this.open) return;
    this.open = next;

    this.menu.classList.toggle('show', next);
    this.scrim?.classList.toggle('show', next);
    this.toggle.setAttribute('aria-expanded', String(next));
    this.toggle.setAttribute('aria-label', next ? 'إغلاق القائمة' : 'فتح القائمة');

    if (next) {
      lockScroll();
    } else {
      unlockScroll();
    }
  }

  close() {
    this.setOpen(false);
  }

  isOpen() {
    return this.open;
  }
}
