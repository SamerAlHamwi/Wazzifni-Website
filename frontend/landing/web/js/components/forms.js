// Form validation. The landing page ships no forms today, so main.js only
// imports this module when one is present in the markup.
import { showToast } from '../utils/toast.js';

const i18n = window.i18n ?? { t: (key) => key };

export class Forms {
  constructor() {
    this.forms = document.querySelectorAll('form');
    this.init();
  }

  init() {
    this.forms.forEach((form) => {
      form.querySelectorAll('input, textarea, select').forEach((field) => {
        field.addEventListener('blur', () => this.validateField(field));
        field.addEventListener('input', () => this.clearFieldError(field));
      });

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (this.validateForm(form)) this.submitForm(form);
      });
    });
  }

  validateField(field) {
    const value = field.value.trim();
    let error = '';

    if (field.hasAttribute('required') && !value) {
      error = i18n.t('form.required');
    } else if (field.type === 'email' && value && !formValidators.isEmail(value)) {
      error = i18n.t('form.emailInvalid');
    } else if (field.name === 'phone' && value && !formValidators.isIraqiPhone(value)) {
      error = i18n.t('form.phoneInvalid');
    } else if (field.type === 'password' && value && value.length < 6) {
      error = i18n.t('form.passwordShort');
    }

    if (error) {
      this.showFieldError(field, error);
      return false;
    }

    return true;
  }

  showFieldError(field, message) {
    this.clearFieldError(field);
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');

    const el = document.createElement('span');
    el.className = 'field-error';
    el.textContent = message;
    el.style.cssText = 'color:#dc3545;font-size:0.8rem;margin-top:0.25rem;display:block';
    field.parentNode.appendChild(el);
  }

  clearFieldError(field) {
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
    field.parentNode.querySelector('.field-error')?.remove();
  }

  validateForm(form) {
    // forEach rather than every(): every field should surface its own error,
    // not just the first one.
    let valid = true;
    form.querySelectorAll('input, textarea, select').forEach((field) => {
      if (!this.validateField(field)) valid = false;
    });
    return valid;
  }

  async submitForm(form) {
    const button = form.querySelector('button[type="submit"]');
    const label = button?.textContent;

    if (button) {
      button.disabled = true;
      button.textContent = i18n.t('form.sending');
    }

    try {
      const data = Object.fromEntries(new FormData(form).entries());
      await this.simulateApiCall(data);
      showToast(i18n.t('form.sentOk'), 'success');
      form.reset();
    } catch (error) {
      console.error('Form submission error:', error);
      showToast(i18n.t('form.sendError'), 'error');
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = label;
      }
    }
  }

  // Placeholder until a real endpoint exists.
  simulateApiCall(data) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true, data }), 1500);
    });
  }

  showNotification(message, type = 'info') {
    showToast(message, type);
  }
}

export const formValidators = {
  isEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  isIraqiPhone: (phone) => /^(077|078|079|075)\d{8}$/.test(phone.replace(/\s/g, '')),
  isRequired: (value) => value.trim().length > 0,
  minLength: (value, min) => value.length >= min,
  maxLength: (value, max) => value.length <= max,
  isNumber: (value) => !Number.isNaN(Number(value)) && value !== '',
};
