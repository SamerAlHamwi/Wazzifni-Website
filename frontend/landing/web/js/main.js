// Entry point: wires the components together and owns global interactions.
import { Modal } from './components/modal.js';
import { Legal } from './components/legal.js';
import { Navigation } from './components/navigation.js';
import { ScrollEffects } from './components/scroll-effects.js';
import { Jobs } from './components/jobs.js';
import { initObservers } from './utils/observers.js';
import { showToast } from './utils/toast.js';

const ANDROID_URL = 'https://play.google.com/store/apps/details?id=com.wazzifni.iraq';
const IOS_URL = 'https://apps.apple.com/app/id6743117085';

const modal = new Modal();
const legal = new Legal();
const navigation = new Navigation();
const scrollEffects = new ScrollEffects();
const jobs = new Jobs();

initObservers();

/**
 * Sends phones straight to their store and everyone else to the modal.
 */
function downloadApp() {
  const ua = navigator.userAgent || navigator.vendor || '';

  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
    window.location.href = IOS_URL;
    return;
  }

  if (/android/i.test(ua)) {
    window.location.href = ANDROID_URL;
    return;
  }

  modal.show();
}

// Exposed because markup rendered elsewhere still calls it by name.
window.downloadApp = downloadApp;
window.modal = modal;
window.legal = legal;
window.navigation = navigation;
window.scrollEffects = scrollEffects;
window.jobs = jobs;

// ---------------------------------------------------------------------------
// One delegated click handler replaces the inline onclick attributes that used
// to be spread across the markup — including cards injected later by jobs.js.
// ---------------------------------------------------------------------------
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-action]');
  if (!trigger) return;

  const { action, legal: legalId } = trigger.dataset;

  switch (action) {
    case 'download':
      event.preventDefault();
      downloadApp();
      break;
    case 'modal-close':
      event.preventDefault();
      modal.hide();
      break;
    case 'legal-open':
      event.preventDefault();
      legal.open(legalId);
      break;
    case 'legal-close':
      event.preventDefault();
      legal.close(legalId);
      break;
    default:
      break;
  }
});

// Cards use role="button" (a real <button> may not contain headings), so the
// keyboard activation a native button gives for free has to be re-added.
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;

  const card = event.target.closest?.('[role="button"][data-action]');
  if (!card) return;

  event.preventDefault();
  card.click();
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;

  if (modal.isVisible()) modal.hide();
  else if (legal.isVisible()) legal.closeAll();
  else navigation.close();
});

// Anchor scrolling is handled natively by scroll-behavior + scroll-padding-top
// in main.css, so no JS is involved.

const i18n = window.i18n ?? { t: (key) => key };

window.addEventListener('online', () => {
  document.body.classList.remove('offline');
  showToast(i18n.t('net.online'), 'success');
});

window.addEventListener('offline', () => {
  document.body.classList.add('offline');
  showToast(i18n.t('net.offline'), 'error');
});

// Form validation is a sizeable module and this page has no forms, so it is
// only fetched if one is ever added to the markup.
if (document.querySelector('form')) {
  import('./components/forms.js').then(({ Forms }) => {
    window.forms = new Forms();
  });
}
