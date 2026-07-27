// Keeps Tab focus inside an open overlay and restores it on close.
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function focusable(container) {
  return [...container.querySelectorAll(FOCUSABLE)]
    .filter((el) => el.offsetParent !== null || el === document.activeElement);
}

/**
 * @param {HTMLElement} container element to trap focus within
 * @returns {() => void} release function that also restores the previous focus
 */
export function trapFocus(container) {
  const previous = document.activeElement;

  const onKeydown = (event) => {
    if (event.key !== 'Tab') return;

    const items = focusable(container);
    if (items.length === 0) {
      event.preventDefault();
      return;
    }

    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || !container.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  document.addEventListener('keydown', onKeydown);
  (focusable(container)[0] || container).focus({ preventScroll: true });

  return () => {
    document.removeEventListener('keydown', onKeydown);
    if (previous instanceof HTMLElement) previous.focus({ preventScroll: true });
  };
}
