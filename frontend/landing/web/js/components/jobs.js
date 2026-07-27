import { observeReveal } from '../utils/observers.js';

// Enums from the Wazzifni API. All of these are 1-based; the previous JobPost
// feed used 0-based enums with a different ordering, so the values are not
// interchangeable.
const JOB_TYPE_LABELS = {
  1: 'دوام كامل',
  2: 'دوام جزئي',
  3: 'حسب الإتفاق',
  4: 'أعمال حرة',
  5: 'شراكة استراتيجية',
  6: 'تدريب',
  7: 'عمل تطوعي',
};

const WORK_PLACE_LABELS = {
  1: 'في مقر العمل',
  2: 'عن بعد',
  3: 'هجين (مقر العمل + عن بُعد)',
};

// ExperienceLevel only defines 1-3, but older records carry values outside that
// range, so anything unknown falls back to a neutral label.
const EXPERIENCE_LEVEL_LABELS = {
  1: 'مستوى مبتدئ',
  2: 'مستوى متوسط',
  3: 'مستوى خبير',
};

const SALARY_PERIOD_LABELS = {
  1: 'يومياً',
  2: 'أسبوعياً',
  3: 'شهرياً',
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
    if (this.container) this.init();
  }

  async init() {
    this.renderShimmers();

    try {
      this.render(await this.fetchJobs());
    } catch (error) {
      console.error('Error fetching jobs:', error);
      this.container.innerHTML =
        '<p class="jobs-empty">تعذر تحميل الوظائف، يرجى المحاولة لاحقاً.</p>';
    }
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
    if (!from && !to) return 'الراتب يحدد في المقابلة';

    const period = SALARY_PERIOD_LABELS[salaryType];
    const unit = period ? `د.ع ${period}` : 'د.ع';

    if (from && !to) return `${from.toLocaleString()} ${unit}`;
    if (!from && to) return `حتى ${to.toLocaleString()} ${unit}`;
    if (from === to) return `${from.toLocaleString()} ${unit}`;
    return `${from.toLocaleString()} - ${to.toLocaleString()} ${unit}`;
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
    if (seconds < 60) return 'الآن';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `منذ ${minutes} دقيقة`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;

    const days = Math.floor(hours / 24);
    if (days === 1) return 'منذ يوم';
    if (days === 2) return 'منذ يومين';
    if (days <= 10) return `منذ ${days} أيام`;
    return `منذ ${days} يوم`;
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
    const engagement = JOB_TYPE_LABELS[job.jobType] || 'دوام كامل';
    const workplace = WORK_PLACE_LABELS[job.workPlace] || 'في مقر العمل';
    const level = EXPERIENCE_LEVEL_LABELS[job.experienceLevel] || 'مستوى غير محدد';

    return `
      <div class="job-card rv" role="button" tabindex="0" data-action="download">
        <div class="job-header">
          <h3 class="job-title">${escapeHtml(job.subject || 'وظيفة')}</h3>
          <span class="job-badge">${engagement}</span>
        </div>
        <div class="job-company">${this.getIcon(job)} ${escapeHtml(job.companyName || 'شركة غير معلنة')}</div>
        <div class="job-level">⭐ ${level}</div>
        <div class="job-footer">
          <span class="job-location">📍 ${workplace}</span>
          <span class="job-salary">${this.formatSalary(job.salaryFrom, job.salaryTo, job.salaryType)}</span>
          <span class="job-date">${this.getTimeAgo(job.createDate)}</span>
        </div>
      </div>
    `;
  }

  render(jobs) {
    if (!jobs.length) {
      this.container.innerHTML = '<p class="jobs-empty">لا توجد وظائف متاحة حالياً.</p>';
      return;
    }

    this.container.innerHTML = jobs.map((job) => this.card(job)).join('');

    // The container carries data-rv-group, so observing it reveals the whole
    // rail at once — cards parked off-screen sideways would otherwise stay
    // invisible until swiped into view.
    observeReveal([this.container]);
  }
}
