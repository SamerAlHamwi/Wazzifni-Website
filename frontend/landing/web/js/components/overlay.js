// Overlay manager — shared open/close behaviour for the drawer, modal, mobile nav and legal pages:
// scroll lock, focus trap, focus restore, Escape to close the top-most layer.
const stack = [];
const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

function syncLock() {
  document.documentElement.classList.toggle('is-locked', stack.length > 0);
}

function trapTab(e, el) {
  const items = [...el.querySelectorAll(FOCUSABLE)].filter(n => n.offsetParent !== null);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

document.addEventListener('keydown', (e) => {
  const top = stack[stack.length - 1];
  if (!top) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    top.close();
  } else if (e.key === 'Tab') {
    trapTab(e, top.el);
  }
});

export function createOverlay(el, { backdrop = null, onClose = null } = {}) {
  let returnFocus = null;

  const layer = {
    el,
    isOpen: () => stack.includes(layer),
    open() {
      if (layer.isOpen()) return;
      returnFocus = document.activeElement;
      el.hidden = false;
      if (backdrop) backdrop.hidden = false;
      // Next frame so the CSS transition runs from the closed state
      requestAnimationFrame(() => {
        el.classList.add('is-open');
        if (backdrop) backdrop.classList.add('is-open');
      });
      stack.push(layer);
      syncLock();
      const target = el.querySelector('[autofocus]') || el.querySelector(FOCUSABLE);
      if (target) setTimeout(() => target.focus({ preventScroll: true }), 50);
    },
    close() {
      if (!layer.isOpen()) return;
      stack.splice(stack.indexOf(layer), 1);
      el.classList.remove('is-open');
      if (backdrop) backdrop.classList.remove('is-open');
      const done = () => {
        if (!layer.isOpen()) {
          el.hidden = true;
          if (backdrop) backdrop.hidden = true;
        }
      };
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      reduce ? done() : setTimeout(done, 220);
      syncLock();
      if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
      if (onClose) onClose();
    },
  };

  if (backdrop) backdrop.addEventListener('click', () => layer.close());
  return layer;
}
