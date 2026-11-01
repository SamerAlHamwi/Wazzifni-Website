// Small status toasts (e.g. connection lost / restored)
export function toast(message, type = 'info') {
  const region = document.querySelector('[data-toasts]');
  if (!region) return;
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.textContent = message;
  region.appendChild(el);
  requestAnimationFrame(() => el.classList.add('is-open'));
  setTimeout(() => {
    el.classList.remove('is-open');
    setTimeout(() => el.remove(), 250);
  }, 3200);
}
