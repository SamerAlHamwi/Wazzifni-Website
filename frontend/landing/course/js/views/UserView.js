const UserView = {
    currentFilter: 'all',

    init(controller) {
        this.controller = controller;
        this.bindEvents();
    },

    bindEvents() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input',
                UtilsService.debounce(() => this.controller.filterCourses(), 300)
            );
        }

        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-filter]').forEach(b => {
                    b.classList.toggle('active', b === btn);
                    b.setAttribute('aria-selected', String(b === btn));
                });
                this.currentFilter = btn.dataset.filter;
                this.controller.filterCourses();
            });
        });

        // Whole card opens the course; buttons inside it handle their own action
        const list = document.getElementById('userCoursesList');
        if (list) {
            list.addEventListener('click', (e) => {
                if (e.target.closest('[data-action]')) return;
                const card = e.target.closest('.course-card[data-course-id]');
                if (card) this.controller.openCourseDetail(card.dataset.courseId);
            });
            list.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                const card = e.target.closest('.course-card[data-course-id]');
                if (card && e.target === card) {
                    e.preventDefault();
                    this.controller.openCourseDetail(card.dataset.courseId);
                }
            });
        }
    },

    renderStats(stats) {
        const statsEl = document.getElementById('userStats');
        if (!statsEl) return;

        const stat = (value, label, dot) => `
            <div class="stat"><span class="stat-value">${value}</span><span class="stat-label"><i class="dot dot--${dot}"></i>${label}</span></div>`;
        statsEl.innerHTML =
            stat(stats.total, 'إجمالي الدورات', 'blue') +
            stat(stats.open, 'دورات متاحة', 'green') +
            stat(stats.free, 'دورات مجانية', 'green') +
            stat(stats.full, 'دورات مكتملة', 'red');
    },

    renderResultCount(total) {
        const el = document.getElementById('resultCount');
        if (!el) return;
        el.textContent = total === 1 ? 'دورة واحدة' : total === 2 ? 'دورتان' : `${total} دورات`;
    },

    renderSkeletons() {
        const container = document.getElementById('userCoursesList');
        if (!container) return;
        container.innerHTML = Array.from({ length: 6 }, () => `
            <div class="course-card course-card--skeleton" aria-hidden="true">
                <div class="card-header"><div class="sk sk-avatar"></div><div class="sk sk-line"></div></div>
                <div class="card-body">
                    <div class="sk sk-line sk-line--lg"></div>
                    <div class="sk sk-line"></div>
                    <div class="sk sk-bar"></div>
                </div>
            </div>`).join('');
    },

    renderError(message) {
        const container = document.getElementById('userCoursesList');
        if (!container) return;
        container.innerHTML = `
            <div class="empty-state">
                <span class="state-icon"><svg class="icon"><use href="#i-alert"/></svg></span>
                <h3>تعذّر تحميل الدورات</h3>
                <p>تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى.</p>
                <div class="state-actions">
                    <button class="btn btn-primary" type="button" data-action="retry">
                        <svg class="icon"><use href="#i-refresh"/></svg>إعادة المحاولة
                    </button>
                </div>
                ${message ? `<code class="state-detail">${UtilsService.escape(message)}</code>` : ''}
            </div>`;
        const pagination = document.getElementById('userPagination');
        if (pagination) pagination.innerHTML = '';
        this.renderResultCount(0);
    },

    renderCourses(courses) {
        const container = document.getElementById('userCoursesList');
        if (!container) return;

        if (courses.length === 0) {
            const filtered = this.getSearchTerm() || this.currentFilter !== 'all';
            container.innerHTML = `
                <div class="empty-state">
                    <span class="state-icon"><svg class="icon"><use href="#i-inbox"/></svg></span>
                    <h3>${filtered ? 'لا توجد دورات مطابقة' : 'لا توجد دورات حالياً'}</h3>
                    <p>${filtered ? 'جرّب كلمة بحث أخرى أو غيّر الفلتر.' : 'نضيف دورات جديدة باستمرار — عد قريباً.'}</p>
                    ${filtered ? '<div class="state-actions"><button class="btn btn-secondary" type="button" data-action="clear-filters">مسح البحث والفلاتر</button></div>' : ''}
                </div>`;
            return;
        }

        container.innerHTML = courses.map(course => this.renderCourseCard(course)).join('');
    },

    renderCourseCard(course) {
        const esc = UtilsService.escape;
        const pct = course.getSeatsPercentage();
        const progressClass = course.getProgressClass();
        const countClass = course.getSeatsStatusClass();
        const teacherImg = course.teacherImg || UtilsService.generateAvatar(course.teacherName);
        const full = course.isFull();

        return `
            <article class="course-card ${full ? 'full' : ''}" data-course-id="${esc(course.id)}" tabindex="0" aria-label="${esc(course.name)}">
                <div class="card-header">
                    <img src="${esc(teacherImg)}" class="teacher-img" alt="">
                    <span class="card-teacher">${esc(course.teacherName)}</span>
                    ${course.isFree()
                        ? '<span class="badge badge-free">مجانية</span>'
                        : '<span class="badge badge-paid">مدفوعة</span>'}
                </div>
                <div class="card-body">
                    <h3 class="card-title">${esc(course.name)}</h3>
                    <p class="card-desc">${esc(course.desc || 'لا يوجد وصف لهذه الدورة.')}</p>
                    <div class="card-meta">
                        <span class="meta-item"><svg class="icon"><use href="#i-calendar"/></svg>${esc(UtilsService.formatDate(course.startDate))}</span>
                        <span class="meta-item"><svg class="icon"><use href="#i-seat"/></svg>${course.totalSeats} مقعد</span>
                    </div>
                    <div class="seats-bar">
                        <div class="seats-label">
                            <span>${full ? 'اكتمل العدد' : 'المقاعد المتبقية'}</span>
                            <span class="count ${countClass}">${course.seatsLeft} / ${course.totalSeats}</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-fill ${progressClass}" style="width:${pct}%"></div>
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="price-tag ${course.isFree() ? 'free' : 'paid'}">
                        ${course.isFree() ? 'مجاني' : esc(UtilsService.formatPrice(course.price))}
                    </div>
                    ${full
                        ? '<span class="full-label">مكتملة</span>'
                        : `<button class="btn btn-primary btn-sm" type="button" data-action="register" data-course-id="${esc(course.id)}">سجّل الآن<svg class="icon"><use href="#i-arrow"/></svg></button>`}
                </div>
            </article>`;
    },

    renderPagination(pagination) {
        const container = document.getElementById('userPagination');
        if (!container) return;

        if (!pagination || !(pagination.pages > 1)) {
            container.innerHTML = '';
            return;
        }

        let html = `
            <button class="page-btn" type="button" ${pagination.page === 1 ? 'disabled' : ''} data-page="${pagination.page - 1}" aria-label="الصفحة السابقة">
                <svg class="icon icon--flip"><use href="#i-arrow"/></svg>
            </button>`;

        for (let i = 1; i <= pagination.pages; i++) {
            html += `<button class="page-btn ${pagination.page === i ? 'active' : ''}" type="button" data-page="${i}" ${pagination.page === i ? 'aria-current="page"' : ''}>${i}</button>`;
        }

        html += `
            <button class="page-btn" type="button" ${pagination.page === pagination.pages ? 'disabled' : ''} data-page="${pagination.page + 1}" aria-label="الصفحة التالية">
                <svg class="icon"><use href="#i-arrow"/></svg>
            </button>`;

        container.innerHTML = html;

        container.querySelectorAll('.page-btn:not(:disabled)').forEach(btn => {
            btn.addEventListener('click', () => {
                this.controller.goToPage(parseInt(btn.dataset.page));
            });
        });
    },

    clearFilters() {
        const input = document.getElementById('searchInput');
        if (input) input.value = '';
        const all = document.querySelector('[data-filter="all"]');
        if (all) all.click();
        else this.controller.filterCourses();
    },

    getSearchTerm() {
        return document.getElementById('searchInput')?.value || '';
    },

    getCurrentFilter() {
        return this.currentFilter;
    }
};
