// Legal pages — opened by #terms / #privacy so they can be linked to and the back button closes them
import { createOverlay } from './overlay.js';

const IDS = ['terms', 'privacy'];

export class Legal {
  constructor() {
    this.layers = {};
    this.openedFromPage = false;

    IDS.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      this.layers[id] = createOverlay(el, { onClose: () => this.clearHash(id) });
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-close-legal]')) this.layers[id].close();
      });
    });

    window.addEventListener('hashchange', () => {
      this.openedFromPage = true;
      this.sync();
    });
    this.sync();
  }

  sync() {
    const id = location.hash.slice(1);
    IDS.forEach(key => {
      const layer = this.layers[key];
      if (!layer) return;
      if (key === id) {
        layer.open();
        layer.el.scrollTop = 0;
      } else if (layer.isOpen()) {
        layer.close();
      }
    });
  }

  clearHash(id) {
    if (location.hash !== `#${id}`) return;
    // Arrived by clicking a link: step back. Arrived on the URL directly: just drop the hash.
    if (this.openedFromPage) history.back();
    else history.replaceState(null, '', location.pathname + location.search);
  }

  open(id) {
    location.hash = id;
  }

  isVisible() {
    return Object.values(this.layers).some(l => l.isOpen());
  }
}
