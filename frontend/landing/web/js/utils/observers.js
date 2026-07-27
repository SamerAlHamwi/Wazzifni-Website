// Reveal-on-scroll. Elements marked .rv fade up once they enter the viewport.
//
// Containers marked [data-rv-group] (the horizontal card rails) are observed as
// a unit: their cards sit off-screen sideways, so observing each card would
// leave them invisible until swiped.
let observer = null;

const reveal = (el, index = 0) => {
  // Cap the stagger — a 10-card grid should not take 700ms to finish.
  setTimeout(() => el.classList.add('show'), Math.min(index, 6) * 70);
};

function getObserver() {
  if (observer) return observer;
  if (!('IntersectionObserver' in window)) return null;

  observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry, index) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);

        if (entry.target.hasAttribute('data-rv-group')) {
          entry.target.querySelectorAll('.rv').forEach(reveal);
        } else {
          reveal(entry.target, index);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  return observer;
}

/** Observe .rv elements, or reveal them outright when IO is unavailable. */
export function observeReveal(nodes) {
  const list = [...nodes];
  const obs = getObserver();

  if (!obs) {
    list.forEach((el) => el.classList.add('show'));
    return;
  }

  list.forEach((el) => obs.observe(el));
}

export function initObservers() {
  const groups = [...document.querySelectorAll('[data-rv-group]')];
  const loose = [...document.querySelectorAll('.rv')]
    .filter((el) => !groups.some((group) => group.contains(el)));

  observeReveal([...groups, ...loose]);
}
