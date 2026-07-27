// Inquiry form.
//
// There is no inbox endpoint for IT Land Iraq yet, so instead of posting into
// the void the form composes the message and hands it to a channel the company
// actually reads: WhatsApp by default, email as the alternative. Validation is
// done here rather than left to the browser so the messages are in Arabic and
// announced to assistive tech in the same way across browsers.
import { company } from '../data/company.js';
import { showToast } from '../utils/toast.js';

const FIELDS = {
  name: {
    label: 'الاسم',
    validate: (value) => (value.trim().length >= 3 ? '' : 'الرجاء إدخال الاسم الكامل (3 أحرف على الأقل).'),
  },
  contact: {
    label: 'وسيلة التواصل',
    validate: (value) => {
      const trimmed = value.trim();
      if (!trimmed) return 'الرجاء إدخال رقم هاتف أو بريد إلكتروني.';

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
      // Iraqi and international forms, with or without separators.
      const isPhone = /^[+\d][\d\s()-]{7,}$/.test(trimmed);

      return isEmail || isPhone ? '' : 'أدخل بريداً إلكترونياً صحيحاً أو رقم هاتف صحيحاً.';
    },
  },
  message: {
    label: 'تفاصيل المشروع',
    validate: (value) =>
      value.trim().length >= 10 ? '' : 'اكتب وصفاً مختصراً لمشروعك (10 أحرف على الأقل).',
  },
};

export class ContactForm {
  constructor(form = document.getElementById('inquiry-form')) {
    this.form = form;
    if (!this.form) return;

    this.init();
  }

  init() {
    // The browser's own bubbles would be English and inconsistently styled.
    this.form.setAttribute('novalidate', '');

    // Submit ships as disabled so a no-JS visitor is not offered a button that
    // cannot do anything; reaching this line means the handler exists.
    const submit = this.form.querySelector('[type="submit"]');
    if (submit) submit.disabled = false;

    Object.keys(FIELDS).forEach((name) => {
      const field = this.form.elements[name];
      // Validate on blur, then live once the visitor has been told about a
      // problem — nagging while someone is still typing their first character
      // is worse than saying nothing.
      field?.addEventListener('blur', () => this.validateField(name));
      field?.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') this.validateField(name);
      });
    });

    this.form.addEventListener('submit', (event) => this.onSubmit(event));
  }

  validateField(name) {
    const field = this.form.elements[name];
    const error = this.form.querySelector(`[data-error-for="${name}"]`);
    if (!field) return true;

    const message = FIELDS[name].validate(field.value ?? '');
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (error) error.textContent = message;

    return !message;
  }

  values() {
    const read = (name) => (this.form.elements[name]?.value ?? '').trim();
    return {
      name: read('name'),
      contact: read('contact'),
      company: read('company'),
      service: read('service'),
      message: read('message'),
    };
  }

  /** Plain-text body shared by both channels. */
  composeMessage(values) {
    return [
      `طلب تواصل جديد — ${company.name}`,
      '',
      `الاسم: ${values.name}`,
      `وسيلة التواصل: ${values.contact}`,
      values.company ? `الجهة: ${values.company}` : '',
      values.service ? `نوع الخدمة: ${values.service}` : '',
      '',
      'التفاصيل:',
      values.message,
    ]
      .filter((line) => line !== '')
      .join('\n');
  }

  onSubmit(event) {
    event.preventDefault();

    // Validate every field, then move focus to the first problem.
    const invalid = Object.keys(FIELDS).filter((name) => !this.validateField(name));
    if (invalid.length) {
      this.form.elements[invalid[0]]?.focus();
      showToast('الرجاء تصحيح الحقول المعلّمة قبل الإرسال', 'error');
      return;
    }

    const values = this.values();
    const body = this.composeMessage(values);
    const channel = this.form.elements.channel?.value === 'email' ? 'email' : 'whatsapp';

    const target =
      channel === 'email'
        ? `mailto:${company.email}?subject=${encodeURIComponent(`طلب تواصل — ${values.name}`)}&body=${encodeURIComponent(body)}`
        : `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(body)}`;

    // A new tab keeps the filled-in form available if the handover fails or the
    // visitor changes their mind.
    window.open(target, '_blank', 'noopener');
    showToast('تم تجهيز رسالتك — أكمل الإرسال من النافذة الجديدة', 'success');
  }
}
