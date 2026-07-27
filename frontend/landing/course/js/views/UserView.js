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
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.controller.filterCourses();
            });
        });
    },

    renderStats(stats) {
        const statsEl = document.getElementById('userStats');
        if (!statsEl) return;

        statsEl.innerHTML = `
            <div class="stat-card gold"><div class="num">${stats.total}</div><div class="label">إجمالي الدورات</div></div>
            <div class="stat-card green"><div class="num">${stats.open}</div><div class="label">دورات متاحة</div></div>
            <div class="stat-card red"><div class="num">${stats.completed}</div><div class="label">دورات مكتملة</div></div>
            <div class="stat-card blue"><div class="num">${stats.free}</div><div class="label">دورات مجانية</div></div>
        `;
    },

    renderCourses(courses) {
        const container = document.getElementById('userCoursesList');
        if (!container) return;

        if (courses.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1">
                    <div class="icon">🔍</div>
                    <h3>لا توجد دورات مطابقة</h3>
                    <p>جرب تغيير معايير البحث أو الفلتر</p>
                </div>`;
            return;
        }

        container.innerHTML = courses.map(course => this.renderCourseCard(course)).join('');
    },

    renderCourseCard(course) {
        const teacherImg = course.teacherImg || UtilsService.generateAvatar(course.teacherName);

        let actionHtml = '';
        if (course.isCompleted()) {
            actionHtml = '<div class="full-label" style="color:var(--muted)">🏁 منتهية</div>';
        } else {
            actionHtml = `<button class="btn btn-success btn-sm" data-action="register" data-course-id="${course.id}">📝 سجّل الآن</button>`;
        }

        return `
            <div class="course-card ${course.isCompleted() ? 'completed' : ''}" data-course-id="${course.id}">
                <div class="card-header">
                    <img src="${teacherImg}" class="teacher-img" alt="">
                    <div class="card-title-block">
                        <div class="card-title">${course.name}</div>
                        <div class="card-teacher">👨‍🏫 ${course.teacherName}</div>
                    </div>
                    ${course.isFree()
                        ? '<span class="badge badge-free" style="flex-shrink:0">مجانية</span>'
                        : '<span class="badge badge-paid" style="flex-shrink:0">مدفوعة</span>'}
                </div>
                <div class="card-body">
                    <p class="card-desc">${course.desc || 'لا يوجد وصف لهذه الدورة.'}</p>
                    <div class="card-meta">
                        <span class="meta-item"><span class="icon">📅</span>${UtilsService.formatDate(course.startDate)}</span>
                        <span class="meta-item"><span class="icon">🪑</span>${course.totalSeats} مقعد إجمالي</span>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="price-tag ${course.isFree() ? 'free' : 'paid'}">
                        ${course.isFree() ? '🆓 مجاني' : UtilsService.formatPrice(course.price)}
                    </div>
                    <div style="display:flex;gap:0.5rem;align-items:center;">
                        <button class="btn btn-detail btn-sm" data-action="detail" data-course-id="${course.id}">👁️ تفاصيل</button>
                        ${actionHtml}
                        <button class="btn btn-share btn-sm" data-action="share" data-course-id="${course.id}" title="مشاركة الرابط">🔗</button>
                    </div>
                </div>
            </div>`;
    },

    renderPagination(pagination) {
        const container = document.getElementById('userPagination');
        if (!container) return;

        if (pagination.pages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = `
            <button class="page-btn" ${pagination.page === 1 ? 'disabled' : ''} data-page="${pagination.page - 1}">السابق</button>
        `;

        for (let i = 1; i <= pagination.pages; i++) {
            html += `<button class="page-btn ${pagination.page === i ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        html += `
            <button class="page-btn" ${pagination.page === pagination.pages ? 'disabled' : ''} data-page="${pagination.page + 1}">التالي</button>
        `;

        container.innerHTML = html;

        // Bind events
        container.querySelectorAll('.page-btn:not(:disabled)').forEach(btn => {
            btn.addEventListener('click', () => {
                this.controller.goToPage(parseInt(btn.dataset.page));
            });
        });
    },

    getSearchTerm() {
        return document.getElementById('searchInput')?.value || '';
    },

    getCurrentFilter() {
        return this.currentFilter;
    }
};