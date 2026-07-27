// Body scroll lock for overlays.
//
// `overflow: hidden` on <body> is not enough on iOS Safari — the page keeps
// rubber-banding behind the overlay and loses the reading position. Pinning the
// body with position:fixed and restoring scrollY on release is the reliable
// version. Reference counted so nested overlays (drawer -> modal) behave.
let depth = 0;
let savedY = 0;

export function lockScroll() {
  if (depth++ > 0) return;

  savedY = window.scrollY;
  const { style } = document.body;
  style.position = 'fixed';
  style.top = `-${savedY}px`;
  style.left = '0';
  style.right = '0';
  style.width = '100%';
}

export function unlockScroll() {
  if (depth === 0 || --depth > 0) return;

  const { style } = document.body;
  style.position = '';
  style.top = '';
  style.left = '';
  style.right = '';
  style.width = '';

  // Jump, don't animate: html has scroll-behavior:smooth for anchor links.
  const html = document.documentElement;
  const previous = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';
  window.scrollTo(0, savedY);
  html.style.scrollBehavior = previous;
}
