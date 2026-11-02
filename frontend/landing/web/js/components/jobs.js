// Jobs — loads the latest posts, filters them by category / search, and shows details in a drawer
import { createOverlay } from './overlay.js';

const ENDPOINTS = [
  '/wazzifni-proxy/services/app/Job/GetAll?JobStatus=2&Status=2&MaxResultCount=20',
  'https://wazzifni.net/wazzifni-proxy/services/app/Job/GetAll?JobStatus=2&Status=2&MaxResultCount=20',
  'https://api.wazzifni.net/api/services/app/Job/GetAll?JobStatus=2&Status=2&MaxResultCount=20'
];
const PAGE_SIZE = 9;

// JobStatus enum matching C# backend
export const JOB_STATUS = {
  Pending: 1,
  Approved: 2,
  Rejected: 3,
  Hired: 4,
  Closed: 5,
};

function isApprovedJob(job) {
  const status = job.jobStatus ?? job.status ?? job.jobStatusId ?? job.statusId;
  if (status !== undefined && status !== null) {
    const num = Number(status);
    if (!isNaN(num)) return num === JOB_STATUS.Approved;
    return String(status).toLowerCase() === 'approved';
  }
  return true;
}

// Enums matching backend Wazzifni.Enums.Enum
const JOB_TYPE = {
  1: 'دوام كامل',
  2: 'دوام جزئي',
  3: 'عقد',
  4: 'أعمال حرة',
  5: 'شراكة',
  6: 'تدريب',
  7: 'عمل تطوعي',
  0: 'دوام كامل', // fallback
};

const WORK_PLACE = {
  1: 'في مقر العمل',
  2: 'عن بعد',
  3: 'هجين (مقر العمل + عن بُعد)',
  0: 'في مقر العمل', // fallback
};

const EXPERIENCE_LEVEL = {
  1: 'حديث التخرج / مبتدئ (0-1 سنة)',
  2: 'خبرة متوسطة (2-5 سنوات)',
  3: 'خبير (6-10 سنوات)',
  4: 'خبير متقدم (11-15 سنة)',
  5: 'قائد فريق / رئيس قسم',
  6: 'مستشار / خبير',
  0: 'متدرب', // fallback
};

const SALARY_TYPE = {
  1: 'يومياً',
  2: 'أسبوعياً',
  3: 'شهرياً',
};

const EDUCATION_LEVEL = {
  1: 'بكالوريوس',
  2: 'ماجستير',
  3: 'دكتوراه',
  4: 'إعدادية / ثانوية',
  5: 'دبلوم',
  6: 'غير محدد',
};

const GENDER = {
  1: 'ذكور',
  2: 'إناث',
};

export const CATEGORIES = [
  { id: 'admin', tone: '#3AA6DE', label: 'إدارية', icon: 'i-building', words: ['اداري', 'إداري', 'محاسب', 'سكرتير', 'مكتب', 'موارد بشرية'] },
  { id: 'medical', tone: '#00B6E7', label: 'طبية', icon: 'i-health', words: ['طبي', 'عيادة', 'مستشفى', 'صيدل', 'ممرض', 'طبيب'] },
  { id: 'engineering', tone: '#FFB43C', label: 'هندسية', icon: 'i-wrench', words: ['مهندس', 'هندس', 'فني', 'صيانة'] },
  { id: 'sales', tone: '#F68A29', label: 'مبيعات', icon: 'i-trend', words: ['مبيعات', 'مروج', 'تسويق', 'بائع', 'مندوب', 'تجهيز', 'مجهزة'] },
  { id: 'education', tone: '#7FD6F2', label: 'تعليم', icon: 'i-book', words: ['معلم', 'مدرس', 'تعليم', 'مدرسة', 'أستاذ'] },
  { id: 'hospitality', tone: '#FF6700', label: 'مطاعم وكافيهات', icon: 'i-coffee', words: ['كافيه', 'مطعم', 'ويتر', 'باريستا', 'طباخ', 'شيف'] },
  { id: 'transport', tone: '#3AA6DE', label: 'سائقون ونقل', icon: 'i-truck', words: ['سائق', 'سيارة', 'توصيل', 'نقل', 'كية'] },
  { id: 'tech', tone: '#00B6E7', label: 'تقنية', icon: 'i-code', words: ['مبرمج', 'برمج', 'تقني', 'مطور', 'تصميم', 'مصمم'] },
  { id: 'support', tone: '#FFB43C', label: 'خدمة الزبائن', icon: 'i-headset', words: ['خدمة', 'زبائن', 'استقبال', 'دعم'] },
  { id: 'freelance', tone: '#F68A29', label: 'فريلانسر', icon: 'i-laptop', words: [], jobType: 4 },
];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function categoriesOf(job) {
  const title = (job.subject || job.title || '').toLowerCase();
  const catName = (job.categoryName || '').toLowerCase();
  const jobType = job.jobType ?? job.workEngagement;

  return CATEGORIES
    .filter(c => {
      if (c.jobType !== undefined && (jobType === c.jobType || jobType === (c.jobType - 1))) return true;
      if (c.words.some(w => title.includes(w))) return true;
      if (catName) {
        if (c.id === 'education' && (catName.includes('education') || catName.includes('teach') || catName.includes('تعليم'))) return true;
        if (c.id === 'admin' && (catName.includes('admin') || catName.includes('manage') || catName.includes('إدار'))) return true;
        if (c.id === 'medical' && (catName.includes('medic') || catName.includes('health') || catName.includes('طب'))) return true;
        if (c.id === 'engineering' && (catName.includes('engine') || catName.includes('هندس'))) return true;
        if (c.id === 'sales' && (catName.includes('sale') || catName.includes('market') || catName.includes('مبيع'))) return true;
        if (c.id === 'hospitality' && (catName.includes('hospit') || catName.includes('restaur') || catName.includes('مطاعم'))) return true;
        if (c.id === 'transport' && (catName.includes('transp') || catName.includes('driv') || catName.includes('نقل'))) return true;
        if (c.id === 'tech' && (catName.includes('tech') || catName.includes('software') || catName.includes('it') || catName.includes('تقني'))) return true;
        if (c.id === 'support' && (catName.includes('support') || catName.includes('customer') || catName.includes('خدمة'))) return true;
      }
      return false;
    })
    .map(c => c.id);
}

function formatSalary(min, max, salaryType) {
  const n = (v) => Number(v).toLocaleString('en-US');
  const typeText = SALARY_TYPE[salaryType] ? ` / ${SALARY_TYPE[salaryType]}` : '';
  if (!min && !max) return 'الراتب يحدد في المقابلة';
  if (min && (!max || max === 0)) return `${n(min)} د.ع${typeText}`;
  if ((!min || min === 0) && max) return `حتى ${n(max)} د.ع${typeText}`;
  if (min === max) return `${n(min)} د.ع${typeText}`;
  return `${n(min)} – ${n(max)} د.ع${typeText}`;
}

function timeAgo(dateString) {
  if (!dateString) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(dateString)) / 1000));
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

export class Jobs {
  constructor() {
    this.grid = document.querySelector('[data-jobs-grid]');
    if (!this.grid) return;

    this.chips = document.querySelector('[data-category-chips]');
    this.activeQuery = document.querySelector('[data-active-query]');
    this.queryText = document.querySelector('[data-query-text]');
    this.drawerEl = document.getElementById('jobDrawer');
    this.drawerBody = this.drawerEl.querySelector('[data-drawer-body]');
    this.drawer = createOverlay(this.drawerEl, {
      backdrop: document.querySelector('[data-close-drawer].sheet-backdrop'),
    });

    this.jobs = [];
    this.status = 'loading';
    this.filters = { category: '', q: '' };
    this.visible = PAGE_SIZE;
    this.demo = new URLSearchParams(location.search).has('demo');

    this.bindEvents();
    this.load();
  }

  bindEvents() {
    this.drawerEl.addEventListener('click', (e) => {
      if (e.target.closest('[data-close-drawer]')) this.drawer.close();
    });

    this.grid.addEventListener('click', (e) => {
      const card = e.target.closest('[data-job-index]');
      if (card) return this.openJob(this.jobs[Number(card.dataset.jobIndex)]);
      if (e.target.closest('[data-retry]')) return this.load();
      if (e.target.closest('[data-show-more]')) {
        this.visible += PAGE_SIZE;
        this.render();
      }
    });

    this.chips.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-category]');
      if (chip) this.setFilters({ category: chip.dataset.category }, { scroll: false });
    });

    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-clear-filters]')) this.setFilters({ category: '', q: '' }, { scroll: false });
      const quick = e.target.closest('[data-quick-category]');
      if (quick) this.setFilters({ category: quick.dataset.quickCategory, q: '' });
    });
  }

  async load() {
    this.status = 'loading';
    this.render();
    try {
      this.jobs = this.demo ? (await import('../data/sample-jobs.js')).SAMPLE_JOBS : await this.fetchJobs();
      this.jobs = this.jobs.filter(isApprovedJob);
      this.jobs.forEach(job => { job._categories = categoriesOf(job); });
      this.status = 'ready';
    } catch (error) {
      console.error('Error fetching jobs:', error);
      this.status = 'error';
    }
    this.render();
  }

  async fetchJobs() {
    let lastError = null;
    for (const url of ENDPOINTS) {
      try {
        const response = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!response.ok) continue;
        const data = await response.json();
        const items = data?.result?.items || data?.result || data?.items;
        if (Array.isArray(items)) return items;
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError || new Error('Invalid data format');
  }

  setFilters(next, { scroll = true } = {}) {
    this.filters = { ...this.filters, ...next };
    this.visible = PAGE_SIZE;
    this.render();
    if (scroll) document.getElementById('jobs').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  filtered() {
    const { category, q } = this.filters;
    const needle = q.toLowerCase();
    return this.jobs
      .filter(isApprovedJob)
      .map((job, index) => ({ job, index }))
      .filter(({ job }) => !category || job._categories.includes(category))
      .filter(({ job }) => {
        if (!needle) return true;
        const title = (job.subject || job.title || '').toLowerCase();
        const company = (job.companyName || job.organization?.name || '').toLowerCase();
        const catName = (job.categoryName || '').toLowerCase();
        const location = (job.location || job.cityName || job.barrioName || '').toLowerCase();
        return title.includes(needle) || company.includes(needle) || catName.includes(needle) || location.includes(needle);
      });
  }

  render() {
    this.renderToolbar();
    if (this.status === 'loading') return this.renderSkeletons();
    if (this.status === 'error') return this.renderState('error');

    const results = this.filtered();
    if (!this.jobs.length) return this.renderState('none');
    if (!results.length) return this.renderState('empty');

    const shown = results.slice(0, this.visible);
    this.grid.innerHTML = shown.map(({ job, index }) => this.cardHTML(job, index)).join('')
      + (results.length > shown.length
        ? `<div class="grid-more"><button class="btn btn-secondary" type="button" data-show-more>عرض المزيد (${results.length - shown.length})</button></div>`
        : '');
  }

  renderToolbar() {
    const ready = this.status === 'ready' && this.jobs.length > 0;
    this.chips.hidden = !ready;
    if (ready) {
      const counts = {};
      this.jobs.forEach(job => job._categories.forEach(id => { counts[id] = (counts[id] || 0) + 1; }));
      const chip = (id, label, count, icon, tone) => `
        <button type="button" class="chip${this.filters.category === id ? ' is-active' : ''}" data-category="${id}" aria-pressed="${this.filters.category === id}"${tone ? ` style="--tone:${tone}"` : ''}>
          ${icon ? `<svg class="icon"><use href="#${icon}"/></svg>` : ''}${label}<span class="chip-count">${count}</span>
        </button>`;
      this.chips.innerHTML = chip('', 'الكل', this.jobs.length)
        + CATEGORIES.filter(c => counts[c.id] || this.filters.category === c.id)
          .map(c => chip(c.id, c.label, counts[c.id] || 0, c.icon, c.tone)).join('')
        + (this.demo ? '<span class="pill pill--muted">بيانات تجريبية</span>' : '');
    }

    this.activeQuery.hidden = !this.filters.q;
    this.queryText.textContent = this.filters.q;
  }

  renderSkeletons() {
    this.grid.innerHTML = Array.from({ length: 6 }, () => `
      <div class="job-card job-card--skeleton" aria-hidden="true">
        <div class="sk sk-avatar"></div>
        <div class="sk sk-line sk-line--lg"></div>
        <div class="sk sk-line"></div>
        <div class="sk-row"><div class="sk sk-pill"></div><div class="sk sk-pill"></div></div>
      </div>`).join('');
  }

  renderState(kind) {
    const states = {
      error: {
        icon: 'i-alert',
        title: 'تعذّر تحميل الوظائف',
        text: 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى، أو تصفح كل الوظائف من التطبيق.',
        actions: `<button class="btn btn-primary" type="button" data-retry><svg class="icon"><use href="#i-refresh"/></svg>إعادة المحاولة</button>
                  <button class="btn btn-ghost" type="button" data-download="all-jobs">تصفح في التطبيق</button>`,
      },
      empty: {
        icon: 'i-inbox',
        title: 'لا توجد وظائف مطابقة',
        text: 'جرّب مجالاً آخر أو امسح البحث. ستجد المزيد من الوظائف في التطبيق.',
        actions: `<button class="btn btn-secondary" type="button" data-clear-filters>مسح الفلاتر</button>
                  <button class="btn btn-ghost" type="button" data-download="all-jobs">ابحث في التطبيق</button>`,
      },
      none: {
        icon: 'i-inbox',
        title: 'لا توجد وظائف متاحة حالياً',
        text: 'فعّل الإشعارات في التطبيق ليصلك تنبيه عند نشر وظيفة جديدة.',
        actions: '<button class="btn btn-primary" type="button" data-download="default">حمّل التطبيق</button>',
      },
    };
    const s = states[kind];
    this.grid.innerHTML = `
      <div class="state">
        <span class="state-icon"><svg class="icon"><use href="#${s.icon}"/></svg></span>
        <h3>${s.title}</h3>
        <p>${s.text}</p>
        <div class="state-actions">${s.actions}</div>
      </div>`;
  }

  cardHTML(job, index) {
    const title = job.subject || job.title || 'وظيفة بدون عنوان';
    const company = job.companyName || job.organization?.name || 'شركة غير معلنة';
    const creationTime = job.createDate || job.creationTime;
    const minSalary = job.salaryFrom ?? job.minSalary;
    const maxSalary = job.salaryTo ?? job.maxSalary;
    const salaryType = job.salaryType;
    const jobType = job.jobType ?? job.workEngagement;
    const workPlace = job.workPlace;
    const location = job.location || job.cityName || job.barrioName || '';
    const category = CATEGORIES.find(c => c.id === job._categories[0]);

    const locationDisplay = location ? location : (WORK_PLACE[workPlace] || 'في مقر العمل');

    return `
      <button type="button" class="job-card" data-job-index="${index}" style="--tone:${category ? category.tone : '#00B6E7'}">
        <div class="job-top">
          <span class="job-logo"><svg class="icon"><use href="#${category ? category.icon : 'i-briefcase'}"/></svg></span>
          <span class="job-company">${esc(company)}</span>
          <span class="job-time">${esc(timeAgo(creationTime))}</span>
        </div>
        <h3 class="job-title">${esc(title)}</h3>
        <div class="job-tags">
          ${job.isSpecial ? '<span class="tag" style="background:rgba(255,180,60,0.15);color:#FFB43C;border-color:rgba(255,180,60,0.3)">مميز</span>' : ''}
          <span class="tag">${esc(JOB_TYPE[jobType] || 'دوام كامل')}</span>
          <span class="tag"><svg class="icon"><use href="#i-pin"/></svg>${esc(locationDisplay)}</span>
        </div>
        <div class="job-bottom">
          <span class="job-salary">${esc(formatSalary(minSalary, maxSalary, salaryType))}</span>
          <span class="job-go" aria-hidden="true"><svg class="icon"><use href="#i-arrow"/></svg></span>
        </div>
      </button>`;
  }

  openJob(job) {
    if (!job) return;
    const title = job.subject || job.title || 'وظيفة بدون عنوان';
    const company = job.companyName || job.organization?.name || 'شركة غير معلنة';
    const creationTime = job.createDate || job.creationTime;
    const minSalary = job.salaryFrom ?? job.minSalary;
    const maxSalary = job.salaryTo ?? job.maxSalary;
    const salaryType = job.salaryType;
    const jobType = job.jobType ?? job.workEngagement;
    const workPlace = job.workPlace;
    const experienceLevel = job.experienceLevel ?? job.workLevel;
    const educationLevel = job.educationLevel;
    const gender = job.requiredGender;
    const location = job.location || (job.cityName ? `${job.cityName}${job.barrioName ? ' - ' + job.barrioName : ''}` : job.barrioName || '');

    const row = (icon, label, value) => `
      <div class="info-row">
        <span class="info-icon"><svg class="icon"><use href="#${icon}"/></svg></span>
        <span class="info-label">${label}</span>
        <span class="info-value">${esc(value)}</span>
      </div>`;

    this.drawerBody.innerHTML = `
      <div class="drawer-company">
        <span class="job-logo job-logo--lg"><svg class="icon"><use href="#i-building"/></svg></span>
        <span>${esc(company)}</span>
        ${job.isSpecial ? '<span class="tag" style="background:rgba(255,180,60,0.15);color:#FFB43C;border-color:rgba(255,180,60,0.3)">وظيفة مميزة</span>' : ''}
      </div>
      <h2 class="drawer-title" id="drawerTitle">${esc(title)}</h2>
      <p class="drawer-salary">${esc(formatSalary(minSalary, maxSalary, salaryType))}</p>
      <div class="info-list">
        ${row('i-clock', 'نوع الدوام', JOB_TYPE[jobType] || 'دوام كامل')}
        ${row('i-pin', 'مكان العمل', WORK_PLACE[workPlace] || 'في مقر العمل')}
        ${location ? row('i-pin', 'الموقع', location) : ''}
        ${job.workSchedule ? row('i-clock', 'أوقات العمل', job.workSchedule) : ''}
        ${experienceLevel ? row('i-level', 'مستوى الخبرة', EXPERIENCE_LEVEL[experienceLevel] || 'غير محدد') : ''}
        ${educationLevel ? row('i-book', 'المؤهل العلمي', EDUCATION_LEVEL[educationLevel] || 'غير محدد') : ''}
        ${gender ? row('i-user', 'الجنس المطلوب', GENDER[gender] || 'الكل') : ''}
        ${job.numberOfRequestedEmployees ? row('i-user', 'العدد المطلوب', `${job.numberOfRequestedEmployees} موظف`) : ''}
        ${job.applicationsCount !== undefined && job.applicationsCount !== null ? row('i-headset', 'المتقدمين', `${job.applicationsCount} متقدم`) : ''}
        ${creationTime ? row('i-bell', 'تاريخ النشر', timeAgo(creationTime)) : ''}
      </div>
      ${job.description ? `<div class="drawer-section"><h3>الوصف الوظيفي</h3><p style="white-space: pre-line;">${esc(job.description)}</p></div>` : ''}
    `;
    this.drawer.open();
  }
}


