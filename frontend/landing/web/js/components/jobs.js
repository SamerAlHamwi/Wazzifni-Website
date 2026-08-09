import { observeReveal } from '../utils/observers.js';

const i18n = window.i18n ?? { lang: 'ar', t: (key) => key, onChange: () => {} };

// Enums from the Wazzifni API. All of these are 1-based; the previous JobPost
// feed used 0-based enums with a different ordering, so the values are not
// interchangeable. Only the numeric code is stored here — the label for it comes
// out of the dictionary at render time, so the same feed renders in either
// language without being re-fetched.
//
// ExperienceLevel only defines 1-3, but older records carry values outside that
// range, so anything unknown falls back to a neutral label.
const label = (namespace, code, fallbackKey) => {
  const key = `${namespace}.${code}`;
  return i18n.has?.(key) ? i18n.t(key) : i18n.t(fallbackKey);
};

const CATEGORY_ICONS = {
  'Healthcare and Medical Care': '🏥',
  'Restaurants & Cafes': '☕',
  'Sales & Representatives': '📊',
  'Education & Teaching': '📚',
  'Marketing & Social Media': '📣',
  'Administration & Secretarial': '🗂️',
  'Skilled Trades & Maintenance': '🔧',
};

// Job titles and company names come straight from the API, so they are escaped
// before going anywhere near innerHTML.
const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);

export class Jobs {
  constructor() {
    this.container = document.querySelector('.jobs-grid');
    /** The last successful feed, kept so a language change can re-render the
        cards without spending another request on the same six jobs. */
    this.jobs = null;
    /** Set when the feed could not be loaded, so the failure message follows the
        language too rather than being frozen in whichever one it was written in. */
    this.failed = false;

    if (!this.container) return;

    i18n.onChange(() => {
      if (this.failed) this.renderError();
      else if (this.jobs) this.render(this.jobs);
    });

    this.init();
  }

  async init() {
    this.renderShimmers();

    try {
      this.jobs = await this.fetchJobs();
      this.failed = false;
      this.render(this.jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      this.failed = true;
      this.renderError();
    }
  }

  renderError() {
    this.container.innerHTML = `<p class="jobs-empty">${escapeHtml(i18n.t('jobs.loadError'))}</p>`;
  }

  renderShimmers() {
    // Six placeholders, matching MaxResultCount in fetchJobs().
    this.container.innerHTML = `
      <div class="shimmer-card">
        <div class="shimmer-wrapper">
          <div class="shimmer-line title"></div>
          <div class="shimmer-line company"></div>
          <div class="shimmer-line level"></div>
          <div class="shimmer-row">
            <div class="shimmer-line"></div>
            <div class="shimmer-line"></div>
          </div>
        </div>
      </div>
    `.repeat(6);
  }

  async fetchJobs() {
    // Goes through the /wazzifni-proxy/ location in nginx.conf, which forwards
    // to https://api.wazzifni.net/api/..., so the request stays same-origin and
    // does not depend on CORS headers from the API. The endpoint returns
    // newest-first and totals ~159 records.
    const response = await fetch('/wazzifni-proxy/services/app/Job/GetAll?MaxResultCount=6', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) throw new Error(`Job feed responded ${response.status}`);

    const data = await response.json();
    if (data?.success && data.result?.items) return data.result.items;

    throw new Error('Invalid data format');
  }

  formatSalary(from, to, salaryType) {
    if (!from && !to) return i18n.t('jobs.salaryOnInterview');

    const currency = i18n.t('jobs.currency');
    const period = i18n.has?.(`period.${salaryType}`) ? i18n.t(`period.${salaryType}`) : '';
    const unit = period ? `${currency} ${period}` : currency;

    // Grouping separators follow the reading language, the same way the labels do.
    const amount = (value) => value.toLocaleString(i18n.lang === 'ar' ? 'ar-IQ' : 'en-US');

    if (from && !to) return `${amount(from)} ${unit}`;
    if (!from && to) return i18n.t('jobs.salaryUpTo', { amount: amount(to), unit });
    if (from === to) return `${amount(from)} ${unit}`;
    return `${amount(from)} - ${amount(to)} ${unit}`;
  }

  getTimeAgo(dateString) {
    if (!dateString) return '';

    // createDate arrives without a timezone designator (e.g.
    // "2026-07-23T00:22:49.438275"). Browsers parse that form as local time,
    // which puts UTC-stored timestamps in the future and collapses every recent
    // job to "الآن", so it is read as UTC explicitly.
    const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(dateString);
    const date = new Date(hasTimezone ? dateString : `${dateString}Z`);
    if (Number.isNaN(date.getTime())) return '';

    const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
    if (seconds < 60) return i18n.t('ago.now');

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return i18n.t('ago.minutes', { n: minutes });

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return i18n.t('ago.hours', { n: hours });

    // Arabic splits the plural three ways (one / two / 3-10 / more), which is
    // why this is a ladder rather than a single "{n} days ago".
    const days = Math.floor(hours / 24);
    if (days === 1) return i18n.t('ago.day');
    if (days === 2) return i18n.t('ago.twoDays');
    if (days <= 10) return i18n.t('ago.days', { n: days });
    return i18n.t('ago.manyDays', { n: days });
  }

  getIcon(job) {
    const title = job.subject || '';
    if (/طبي|عيادة|مستشفى|صيدلية|ممرض/.test(title)) return '🏥';
    if (/كافيه|مطعم|ويتر|باريستا/.test(title)) return '☕';
    if (/مبيعات|مروج|تسويق/.test(title)) return '📊';
    if (/تعليم|مدرسة|معلم|مدرس/.test(title)) return '📚';
    if (/سيارة|سائق|توصيل/.test(title)) return '🚗';
    if (/تصميم|مبرمج|برمجة|مطور/.test(title)) return '💻';
    // Fall back to the category the API already classified the job under.
    return CATEGORY_ICONS[job.categoryName] || '🏢';
  }

  card(job) {
    const engagement = label('jobType', job.jobType, 'jobType.1');
    const workplace = label('workPlace', job.workPlace, 'workPlace.1');
    const level = label('level', job.experienceLevel, 'level.unknown');

    return `
      <div class="job-card rv" role="button" tabindex="0" data-action="download">
        <div class="job-header">
          <h3 class="job-title">${escapeHtml(job.subject || i18n.t('jobs.untitled'))}</h3>
          <span class="job-badge">${escapeHtml(engagement)}</span>
        </div>
        <div class="job-company">${this.getIcon(job)} ${escapeHtml(job.companyName || i18n.t('jobs.unknownCompany'))}</div>
        <div class="job-level">⭐ ${escapeHtml(level)}</div>
        <div class="job-footer">
          <span class="job-location">📍 ${escapeHtml(workplace)}</span>
          <span class="job-salary">${escapeHtml(this.formatSalary(job.salaryFrom, job.salaryTo, job.salaryType))}</span>
          <span class="job-date">${escapeHtml(this.getTimeAgo(job.createDate))}</span>
        </div>
      </div>
    `;
  }

  render(jobs) {
    if (!jobs.length) {
      this.container.innerHTML = `<p class="jobs-empty">${escapeHtml(i18n.t('jobs.empty'))}</p>`;
      return;
    }

    this.container.innerHTML = jobs.map((job) => this.card(job)).join('');

    // The container carries data-rv-group, so observing it reveals the whole
    // rail at once — cards parked off-screen sideways would otherwise stay
    // invisible until swiped into view.
    observeReveal([this.container]);
  }
}
