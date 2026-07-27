// Mobile navigation drawer.
//
// Previously both this class and a setupMobileMenu() helper in main.js bound a
// click handler to the same burger, so every tap toggled the menu twice and it
// never opened. This is now the only owner of that button.
import { lockScroll, unlockScroll } from '../utils/scroll-lock.js';

export class Navigation {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.toggle = document.getElementById('nav-toggle');
    this.menu = document.getElementById('nav-menu');
    this.scrim = document.getElementById('nav-scrim');
    this.desktop = window.matchMedia('(min-width: 900px)');
    this.open = false;

    this.init();
  }

  init() {
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
