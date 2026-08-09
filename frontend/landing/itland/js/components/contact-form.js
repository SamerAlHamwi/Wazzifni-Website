// Inquiry form.
//
// A submission does two things: it is recorded in the dashboard inbox
// (POST /api/course/inquiries, visible under "طلبات المشاريع" in the course
// admin panel) and it is then handed to the channel the company actually
// watches — WhatsApp by default, email as the alternative. The handover happens
// even if the POST fails, because losing the lead is worse than losing the
// record. Validation is done here rather than left to the browser so the
// messages follow the page's language and are announced to assistive tech in
// the same way across browsers.
//
// Every message is looked up at call time, so a visitor who switches language
// mid-form sees the next error in the language now on screen.
import { company } from '../data/company.js';
import { showToast } from '../utils/toast.js';

const i18n = window.i18n ?? { t: (key) => key, onChange: () => {} };

// Dashboard inbox. This page is served from two hosts (web.wazzifni.net/itland/
// and ad.wazzifni.net/itland/), so the path has to be one that resolves on both
// — see the /api/ locations for each server block in nginx.conf.
const INQUIRY_ENDPOINT = '/api/course/inquiries';

const FIELDS = {
  name: {
    validate: (value) => (value.trim().length >= 3 ? '' : i18n.t('form.errName')),
  },
  contact: {
    validate: (value) => {
      const trimmed = value.trim();
      if (!trimmed) return i18n.t('form.errContactEmpty');

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
      // Iraqi and international forms, with or without separators.
      const isPhone = /^[+\d][\d\s()-]{7,}$/.test(trimmed);

      return isEmail || isPhone ? '' : i18n.t('form.errContactInvalid');
    },
  },
  message: {
    validate: (value) => (value.trim().length >= 10 ? '' : i18n.t('form.errMessage')),
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

    // Errors already on screen were written in the old language; re-running the
    // validators rewrites only the fields that are still invalid.
    i18n.onChange(() => {
      Object.keys(FIELDS).forEach((name) => {
        if (this.form.elements[name]?.getAttribute('aria-invalid') === 'true') {
          this.validateField(name);
        }
      });
    });
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

    // The service <select> carries language-neutral values so the option list can
    // be relabelled without invalidating a selection; the message needs the label
    // the visitor actually saw, which is the selected option's own text.
    const service = this.form.elements.service;
    const serviceLabel = service?.selectedIndex >= 0 ? service.options[service.selectedIndex].textContent.trim() : '';

    return {
      name: read('name'),
      contact: read('contact'),
      company: read('company'),
      // Key for the record, label for the message the human will read.
      serviceKey: service?.value ?? 'other',
      service: serviceLabel,
      message: read('message'),
    };
  }

  /**
   * Files the inquiry in the dashboard inbox.
   *
   * Resolves to false rather than throwing: a failed save must not stop the
   * WhatsApp/mail handover, which is the part the visitor is waiting for.
   */
  async save(values, channel) {
    try {
      const response = await fetch(INQUIRY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          contact: values.contact,
          companyName: values.company,
          service: values.serviceKey,
          serviceLabel: values.service,
          message: values.message,
          channel,
          source: 'itland',
          lang: i18n.lang ?? 'ar',
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Inquiry could not be saved:', error);
      return false;
    }
  }

  /** Plain-text body shared by both channels. */
  composeMessage(values) {
    return [
      i18n.t('form.bodyHeading', { company: company.name }),
      '',
      `${i18n.t('form.bodyName')}: ${values.name}`,
      `${i18n.t('form.bodyContact')}: ${values.contact}`,
      values.company ? `${i18n.t('form.bodyCompany')}: ${values.company}` : '',
      values.service ? `${i18n.t('form.bodyService')}: ${values.service}` : '',
      '',
      i18n.t('form.bodyDetails'),
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
      showToast(i18n.t('form.errToast'), 'error');
      return;
    }

    const values = this.values();
    const body = this.composeMessage(values);
    const channel = this.form.elements.channel?.value === 'email' ? 'email' : 'whatsapp';

    const subject = i18n.t('form.mailSubject', { name: values.name });
    const target =
      channel === 'email'
        ? `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        : `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(body)}`;

    // A new tab keeps the filled-in form available if the handover fails or the
    // visitor changes their mind. It is opened before anything is awaited: a
    // window.open() that is not a direct result of the click is treated as a
    // popup and blocked.
    window.open(target, '_blank', 'noopener');
    showToast(i18n.t('form.sentToast'), 'success');

    // Filing the record is a background concern — by now the visitor is already
    // looking at their WhatsApp or mail client.
    this.save(values, channel);
  }
}
