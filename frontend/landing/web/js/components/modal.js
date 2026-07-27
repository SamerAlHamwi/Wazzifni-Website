// "Download the app" modal.
import { lockScroll, unlockScroll } from '../utils/scroll-lock.js';
import { trapFocus } from '../utils/focus-trap.js';

export class Modal {
  constructor() {
    this.modal = document.getElementById('modal');
    this.card = this.modal?.querySelector('.modal-card');
    this.release = null;

    // Backdrop click closes; clicks inside the card must not bubble out to it.
    this.modal?.addEventListener('click', (event) => {
      if (event.target === this.modal) this.hide();
    });
  }

  show() {
    if (!this.modal || this.isVisible()) return;

    this.modal.classList.add('on');
    lockScroll();
    this.release = trapFocus(this.card || this.modal);
  }

  hide() {
    if (!this.modal || !this.isVisible()) return;

    this.modal.classList.remove('on');
    unlockScroll();
    this.release?.();
    this.release = null;
  }

  isVisible() {
    return Boolean(this.modal?.classList.contains('on'));
  }
}
