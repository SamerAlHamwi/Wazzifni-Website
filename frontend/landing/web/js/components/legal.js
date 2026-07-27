// Terms / privacy full-screen readers.
import { lockScroll, unlockScroll } from '../utils/scroll-lock.js';
import { trapFocus } from '../utils/focus-trap.js';

export class Legal {
  constructor() {
    this.pages = {
      terms: document.getElementById('terms'),
      privacy: document.getElementById('privacy'),
    };
    this.release = null;
    this.openId = null;

    // Supports deep links and the browser back button: /#terms opens the page,
    // going back closes it.
    window.addEventListener('hashchange', () => this.syncWithHash());
    this.syncWithHash();
  }

  syncWithHash() {
    const id = window.location.hash.replace('#', '');
    if (this.pages[id]) {
      this.open(id, { updateHash: false });
    } else if (this.openId) {
      this.closeAll({ updateHash: false });
    }
  }

  open(pageId, { updateHash = true } = {}) {
    const page = this.pages[pageId];
    if (!page || this.openId === pageId) return;

    this.closeAll({ updateHash: false });
    page.classList.add('on');
    page.scrollTop = 0;
    this.openId = pageId;

    lockScroll();
    this.release = trapFocus(page);

    if (updateHash) window.history.pushState(null, '', `#${pageId}`);
  }

  close(pageId, options) {
    if (pageId && this.openId !== pageId) return;
    this.closeAll(options);
  }

  closeAll({ updateHash = true } = {}) {
    if (!this.openId) return;

    Object.values(this.pages).forEach((page) => page?.classList.remove('on'));
    this.openId = null;

    unlockScroll();
    this.release?.();
    this.release = null;

    // replaceState, not pushState: it drops the "#terms" entry instead of
    // stacking a second one that the back button would reopen.
    if (updateHash && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  isVisible() {
    return this.openId !== null;
  }
}
