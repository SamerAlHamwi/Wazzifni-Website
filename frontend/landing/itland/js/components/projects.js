// Projects gallery: loads the portfolio records, renders the cards, and owns
// the filter/sort toolbar.
//
// The data module is pulled in with a dynamic import() rather than a static one
// so the gallery has a real asynchronous life cycle — skeleton, then content or
// an error state with a retry. That keeps the initial script payload to the
// chrome only, and means the section degrades honestly if the chunk ever fails
// to load instead of leaving an empty hole in the page.
import { observeReveal } from '../utils/observers.js';
import { escapeHtml, safeUrl } from '../utils/dom.js';

const SKELETON_COUNT = 6;

const i18n = window.i18n ?? { lang: 'ar', t: (key) => key, onChange: () => {} };

const STORE_ICONS = {
  play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.18 23.76a2 2 0 0 0 2.07-.22l12.1-6.93-2.84-2.85zM.5 1.1A2 2 0 0 0 0 2.5v19a2 2 0 0 0 .5 1.4L.6 23l10.63-10.63v-.26L.6 1.1zM20.34 10.22l-2.91-1.67-3.17 3.17 3.17 3.17 2.94-1.68a2.02 2.02 0 0 0 0-3.5zM5.25.46 17.43 7.4l-2.84 2.84z"/></svg>',
  ios: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.15 1.26-2.13 3.75.03 2.99 2.62 3.99 2.65 4l.03.01zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>',
  git: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.5 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.26 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z"/></svg>',
};

export class ProjectsGallery {
  constructor(root = document.getElementById('projects')) {
    this.root = root;
    if (!this.root) return;

    this.grid = this.root.querySelector('[data-projects-grid]');
    this.toolbar = this.root.querySelector('[data-projects-toolbar]');
    this.filterList = this.root.querySelector('[data-projects-filters]');
    this.sortSelect = this.root.querySelector('[data-projects-sort]');
    this.status = this.root.querySelector('[data-projects-status]');

    /** Normalised for the current language. */
    this.projects = [];
    /** The untouched records, kept so a language change can re-derive the
        localised copy without re-fetching the data module. */
    this.raw = [];
    this.filter = 'all';
    this.sort = 'featured';
    /** Lazily filled by load(); kept so retry can reuse them. */
    this.api = null;
    this.attempt = 0;

    this.onImageError = this.onImageError.bind(this);
    this.grid?.addEventListener('error', this.onImageError, true);

    // Every string on a card comes from either the dictionary or the record's
    // per-language copy, so a language change means a full re-render.
    i18n.onChange(() => this.relocalize());

    this.load();
  }

  /** Rebuilds the cards and the toolbar in the language now in force. */
  relocalize() {
    if (!this.api || !this.raw.length) return;

    this.projects = this.api.normalizeProjects(this.raw);
    this.renderToolbar();
    this.render();
  }

  // ------------------------------------------------------------------ data --

  async load() {
    this.renderSkeletons();
    this.setToolbarEnabled(false);

    try {
      // A module that failed to fetch is remembered as failed in the module
      // map, so re-importing the same specifier would fail again without ever
      // hitting the network. The retry counter gives each attempt a fresh URL.
      const bust = this.attempt++ ? `?retry=${this.attempt}` : '';

      const [{ projects }, transform] = await Promise.all([
        import(`../data/projects.js${bust}`),
        import(`../data/transform.js${bust}`),
      ]);

      this.api = transform;
      this.raw = projects;
      this.projects = transform.normalizeProjects(projects);

      if (!this.projects.length) {
        this.renderEmpty(i18n.t('projects.emptyTitle'), i18n.t('projects.emptyText'));
        return;
      }

      this.renderToolbar();
      this.setToolbarEnabled(true);
      this.render();
    } catch (error) {
      console.error('Failed to load projects:', error);
      this.renderError();
    }
  }

  // ----------------------------------------------------------------- states --

  renderSkeletons() {
    if (!this.grid) return;

    this.grid.setAttribute('aria-busy', 'true');
    this.grid.innerHTML = `
      <div class="project-skeleton" aria-hidden="true">
        <div class="skeleton-media"></div>
        <div class="skeleton-body">
          <span class="skeleton-line skeleton-line--title"></span>
          <span class="skeleton-line"></span>
          <span class="skeleton-line skeleton-line--short"></span>
          <div class="skeleton-chips">
            <span class="skeleton-chip"></span>
            <span class="skeleton-chip"></span>
            <span class="skeleton-chip"></span>
          </div>
        </div>
      </div>
    `.repeat(SKELETON_COUNT);

    this.announce(i18n.t('projects.loading'));
  }

  renderError() {
    if (!this.grid) return;

    this.grid.removeAttribute('aria-busy');
    this.grid.innerHTML = `
      <div class="projects-state projects-state--error">
        <span class="projects-state-icon" aria-hidden="true">⚠️</span>
        <h3 class="projects-state-title">${escapeHtml(i18n.t('projects.errorTitle'))}</h3>
        <p class="projects-state-text">${escapeHtml(i18n.t('projects.errorText'))}</p>
        <button class="btn btn-primary" type="button" data-projects-retry>${escapeHtml(i18n.t('projects.retry'))}</button>
      </div>
    `;

    this.grid.querySelector('[data-projects-retry]')?.addEventListener('click', () => this.load());
    this.announce(i18n.t('projects.errorAnnounce'));
  }

  renderEmpty(title, text) {
    if (!this.grid) return;

    this.grid.removeAttribute('aria-busy');
    this.grid.innerHTML = `
      <div class="projects-state">
        <span class="projects-state-icon" aria-hidden="true">📂</span>
        <h3 class="projects-state-title">${escapeHtml(title)}</h3>
        <p class="projects-state-text">${escapeHtml(text)}</p>
      </div>
    `;
  }

  // ---------------------------------------------------------------- toolbar --

  renderToolbar() {
    if (!this.filterList || !this.api) return;

    const filters = this.api.buildFilters(this.projects);

    // A single filter chip alongside "All" tells the visitor nothing, so the
    // toolbar only appears once there is a real choice to make.
    if (filters.length < 3) {
      this.toolbar?.setAttribute('hidden', '');
      return;
    }

    this.toolbar?.removeAttribute('hidden');
    this.filterList.innerHTML = filters
      .map(
        (filter) => `
          <li>
            <button class="filter-chip${filter.id === this.filter ? ' is-active' : ''}"
                    type="button" data-filter="${escapeHtml(filter.id)}"
                    aria-pressed="${filter.id === this.filter}"
                    aria-label="${escapeHtml(i18n.t('projects.filterAria', { label: filter.label, count: filter.count }))}">
              ${escapeHtml(filter.label)}
              <span class="filter-count" aria-hidden="true">${filter.count}</span>
            </button>
          </li>`,
      )
      .join('');

    // Rebuilt on every call, not just the first: a language change re-runs
    // renderToolbar() and the option labels have to follow it.
    if (this.sortSelect) {
      this.sortSelect.innerHTML = Object.entries(this.api.SORTS)
        .map(
          ([id, sort]) =>
            `<option value="${escapeHtml(id)}"${id === this.sort ? ' selected' : ''}>${escapeHtml(sort.label)}</option>`,
        )
        .join('');
    }

    // A retry after a failed load runs renderToolbar() again, so the handlers
    // are bound once and left to survive the markup being replaced.
    if (this.toolbarBound) return;
    this.toolbarBound = true;

    this.filterList.addEventListener('click', (event) => {
      const chip = event.target.closest('[data-filter]');
      if (!chip) return;
      this.setFilter(chip.dataset.filter);
    });

    // Arrow keys move between chips, as a tablist is expected to.
    this.filterList.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;

      const chips = [...this.filterList.querySelectorAll('[data-filter]')];
      const current = chips.indexOf(document.activeElement);
      if (current === -1) return;

      event.preventDefault();
      // "Next chip" is whichever arrow points along the reading direction, so
      // ArrowLeft advances in Arabic and ArrowRight advances in English.
      const forward = document.documentElement.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
      const step = event.key === forward ? 1 : event.key.startsWith('Arrow') ? -1 : 0;
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? chips.length - 1
            : (current + step + chips.length) % chips.length;

      chips[next].focus();
    });

    this.sortSelect?.addEventListener('change', () => {
      this.sort = this.sortSelect.value;
      this.render();
    });
  }

  setToolbarEnabled(enabled) {
    this.toolbar?.classList.toggle('is-disabled', !enabled);
    this.toolbar
      ?.querySelectorAll('button, select')
      .forEach((control) => control.toggleAttribute('disabled', !enabled));
  }

  setFilter(id) {
    if (!id || id === this.filter) return;
    this.filter = id;

    this.filterList?.querySelectorAll('[data-filter]').forEach((chip) => {
      const active = chip.dataset.filter === id;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', String(active));
    });

    this.render();
  }

  // ----------------------------------------------------------------- cards --

  card(project) {
    const stores = project.links
      .map(
        (link) => `
          <a class="project-store" href="${safeUrl(link.url)}" target="_blank" rel="noopener"
             aria-label="${escapeHtml(i18n.t('projects.storeAria', { name: project.name, store: link.label }))}"
             title="${escapeHtml(link.label)}">
            ${STORE_ICONS[link.kind] ?? ''}<span>${escapeHtml(link.label)}</span>
          </a>`,
      )
      .join('');

    const cta = project.primaryUrl
      ? `<a class="project-cta" href="${safeUrl(project.primaryUrl)}" target="_blank" rel="noopener">
           ${escapeHtml(i18n.t('projects.view'))}<span class="sr-only"> — ${escapeHtml(project.name)}</span>
           <span aria-hidden="true">↖</span>
         </a>`
      : `<span class="project-cta project-cta--soon">${escapeHtml(i18n.t('projects.soon'))}</span>`;

    return `
      <article class="project-card rv" aria-labelledby="p-${escapeHtml(project.id)}">
        <div class="project-media">
          <img src="${safeUrl(project.image)}"
               alt="${escapeHtml(i18n.t('projects.logoAlt', { name: project.name }))}"
               width="160" height="160" loading="lazy" decoding="async"
               data-fallback="${safeUrl(project.fallbackImage)}">
          <span class="project-type">${escapeHtml(project.type)}</span>
        </div>
        <div class="project-body">
          <h3 class="project-title" id="p-${escapeHtml(project.id)}">${escapeHtml(project.name)}</h3>
          <p class="project-desc">${escapeHtml(project.description)}</p>
          <ul class="project-tags" aria-label="${escapeHtml(i18n.t('projects.techAria', { name: project.name }))}">
            ${project.tags.map((tag) => `<li class="project-tag">${escapeHtml(tag)}</li>`).join('')}
          </ul>
          <div class="project-actions">
            ${cta}
            <div class="project-stores">${stores}</div>
          </div>
        </div>
      </article>
    `;
  }

  render() {
    if (!this.grid || !this.api) return;

    const visible = this.api.selectProjects(this.projects, this.filter, this.sort);
    this.grid.removeAttribute('aria-busy');

    if (!visible.length) {
      this.renderEmpty(i18n.t('projects.noMatchTitle'), i18n.t('projects.noMatchText'));
      this.announce(i18n.t('projects.noMatchAnnounce'));
      return;
    }

    this.grid.innerHTML = visible.map((project) => this.card(project)).join('');
    observeReveal(this.grid.querySelectorAll('.rv'));
    this.announce(
      i18n.t('projects.shownAnnounce', { visible: visible.length, total: this.projects.length }),
    );
  }

  /** Swaps a broken project image for the inline placeholder, once. */
  onImageError(event) {
    const img = event.target;
    if (img.tagName !== 'IMG' || img.dataset.failed) return;

    img.dataset.failed = 'true';
    img.src = img.dataset.fallback || '';
    img.classList.add('is-fallback');
  }

  /** Result counts go to a polite live region, not to a toast. */
  announce(message) {
    if (this.status) this.status.textContent = message;
  }
}
