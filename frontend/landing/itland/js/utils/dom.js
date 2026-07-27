// Small DOM helpers shared by the rendering components.

/**
 * Escapes a value before it goes anywhere near innerHTML. Project names, tags
 * and descriptions are data, so they are always escaped even though they are
 * currently authored in-repo — the moment the data moves to an API this is the
 * only thing standing between it and injected markup.
 */
export const escapeHtml = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[char],
  );

/** Escapes a value for use inside an href/src attribute, blocking javascript:. */
export const safeUrl = (value) => {
  const url = String(value ?? '').trim();
  if (!url) return '';
  if (/^(?:javascript|data|vbscript):/i.test(url) && !url.startsWith('data:image/svg+xml')) {
    return '';
  }
  return escapeHtml(url);
};

/** True when the visitor asked the OS to reduce motion. */
export const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
