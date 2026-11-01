// Download dialog — the copy explains why it opened (apply, post a job, see all jobs)
import { createOverlay } from './overlay.js';

const CONTEXTS = {
  default: {
    title: 'حمّل تطبيق وظّفني',
    text: 'للاطلاع على الوظائف والتقديم عليها، حمّل التطبيق مجاناً.',
    points: ['بحث ذكي وسريع', 'تقديم بضغطة واحدة', 'إشعارات فورية بالوظائف الجديدة'],
  },
  employer: {
    title: 'انشر وظيفتك من التطبيق',
    text: 'حمّل التطبيق وانشر وظيفتك في دقيقة — يصل إعلانك لآلاف الباحثين عن عمل.',
    points: ['مرشحون مناسبون فقط عبر الفلاتر الذكية', 'تواصل مباشر بدون وسيط', 'متوسط 48 ساعة للعثور على مرشح'],
  },
  'all-jobs': {
    title: 'كل الوظائف في التطبيق',
    text: 'تصفح جميع الوظائف وقدّم عليها مباشرة من التطبيق.',
    points: ['بحث بالمدينة أو التخصص أو الراتب', 'تقديم بضغطة واحدة', 'متابعة حالة طلبك'],
  },
};

export class Modal {
  constructor() {
    this.el = document.getElementById('modal');
    this.title = this.el.querySelector('[data-modal-title]');
    this.text = this.el.querySelector('[data-modal-text]');
    this.points = this.el.querySelector('[data-modal-points]');
    this.layer = createOverlay(this.el);

    this.el.addEventListener('click', (e) => {
      if (e.target === this.el || e.target.closest('[data-close-modal]')) this.hide();
    });

    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-download]');
      if (!trigger) return;
      e.preventDefault();
      this.show(trigger.dataset.download);
    });
  }

  show(context = 'default') {
    const copy = CONTEXTS[context] || CONTEXTS.default;
    this.title.textContent = copy.title;
    this.text.textContent = copy.text;
    this.points.innerHTML = copy.points
      .map(p => `<li><svg class="icon"><use href="#i-check"/></svg>${p}</li>`)
      .join('');
    this.layer.open();
  }

  hide() {
    this.layer.close();
  }

  isVisible() {
    return this.layer.isOpen();
  }
}

// Put the visitor's own store first and mark it as the primary button
export function prioritiseStore() {
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const platform = isIOS ? 'ios' : isAndroid ? 'android' : null;
  if (!platform) return;
  document.querySelectorAll('.store-buttons').forEach(group => {
    group.classList.add('has-primary');
    group.querySelectorAll('[data-store]').forEach(btn => {
      btn.classList.toggle('is-primary', btn.dataset.store === platform);
    });
  });
}
