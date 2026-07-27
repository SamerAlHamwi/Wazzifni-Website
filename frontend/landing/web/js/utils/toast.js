// Single transient message pinned under the navbar. Styling lives in main.css.
let current = null;

export function showToast(message, type = 'info') {
  if (current) current.remove();

  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  el.textContent = message;
  document.body.appendChild(el);
  current = el;

  setTimeout(() => {
    el.classList.add('toast--leaving');
    setTimeout(() => {
      el.remove();
      if (current === el) current = null;
    }, 250);
  }, 3000);
}
