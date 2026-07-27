// Entry point for the IT Land Iraq company page.
//
// Everything below is chrome that must exist before first paint. The project
// gallery pulls its own data in asynchronously (see components/projects.js), so
// this module stays small.
import { Navigation } from './components/navigation.js';
import { ScrollEffects } from './components/scroll-effects.js';
import { ProjectsGallery } from './components/projects.js';
import { initObservers } from './utils/observers.js';
import { showToast } from './utils/toast.js';

const navigation = new Navigation();
const scrollEffects = new ScrollEffects();
const projects = new ProjectsGallery();

initObservers();

// The inquiry form is the only part of the page a visitor may never reach, and
// it carries its own validation rules, so it is fetched on demand.
if (document.getElementById('inquiry-form')) {
  import('./components/contact-form.js')
    .then(({ ContactForm }) => {
      window.contactForm = new ContactForm();
    })
    .catch((error) => console.error('Failed to load the inquiry form:', error));
}

// Exposed for debugging and for any markup rendered outside these modules.
Object.assign(window, { navigation, scrollEffects, projects });

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') navigation.close();
});

window.addEventListener('online', () => {
  document.body.classList.remove('offline');
  showToast('تم استعادة الاتصال بالإنترنت', 'success');
});

window.addEventListener('offline', () => {
  document.body.classList.add('offline');
  showToast('لا يوجد اتصال بالإنترنت', 'error');
});
