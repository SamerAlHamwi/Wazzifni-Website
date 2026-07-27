const UserView = {
    controller: null,

    init(controller) {
        this.controller = controller;
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('searchInput')?.addEventListener('input', UtilsService.debounce(() => {
            this.controller.filterCourses();
        }, 300));

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.controller.filterCourses();
            });
        });
    },

    renderCourses(courses) {
        const grid = document.getElementById('userCoursesList');
        if (!grid) return;

        if (courses.length === 0) {
            grid.innerHTML = '<div class="empty-state"><h3>لا توجد دورات تطابق بحثك</h3></div>';
            return;
        }

        grid.innerHTML = courses.map(c => this.renderCourseCard(c)).join('');
    },

    renderCourseCard(course) {
        const teacherImg = course.teacherImg || UtilsService.generateAvatar(course.teacherName);
        const isCompleted = course.status === 'completed';

        return `
            <div class="course-card ${isCompleted ? 'full' : ''}" data-action="detail" data-course-id="${course.id}">
                <div class="card-header">
                    ${course.getCourseTypeBadge()}
                    ${course.getStatusBadge()}
                </div>
                <div class="card-body">
                    <div class="teacher-info">
                        <img src="${teacherImg}" alt="${course.teacherName}">
                        <div class="name">${course.teacherName}</div>
                    </div>
                    <h3 class="course-title">${course.name}</h3>
                    <div class="course-meta">
                        <span>📅 ${UtilsService.formatDate(course.startDate)}</span>
                        <span>👥 ${course.totalSeats} مقعد</span>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary" data-action="detail" data-course-id="${course.id}">التفاصيل</button>
                    ${isCompleted ?
                        '<button class="btn btn-disabled" disabled>انتهت</button>' :
                        `<button class="btn btn-success" data-action="register" data-course-id="${course.id}">سجل الآن</button>`
                    }
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

        let html = `<button class="page-btn" ${pagination.page === 1 ? 'disabled' : ''} data-page="${pagination.page - 1}">السابق</button>`;

        for (let i = 1; i <= pagination.pages; i++) {
            html += `<button class="page-btn ${pagination.page === i ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        html += `<button class="page-btn" ${pagination.page === pagination.pages ? 'disabled' : ''} data-page="${pagination.page + 1}">التالي</button>`;

        container.innerHTML = html;

        container.querySelectorAll('.page-btn:not(:disabled)').forEach(btn => {
            btn.addEventListener('click', () => {
                this.controller.goToPage(parseInt(btn.dataset.page));
            });
        });
    },

    renderStats(stats) {
        const statsEl = document.getElementById('userStats');
        if (!statsEl) return;

        statsEl.innerHTML = `
            <div class="stat-item"><span class="num">${stats.total}</span><span class="label">إجمالي الدورات</span></div>
            <div class="stat-item"><span class="num">${stats.open}</span><span class="label">متاحة للتسجيل</span></div>
            <div class="stat-item"><span class="num">${stats.free}</span><span class="label">دورات مجانية</span></div>
        `;
    },

    getSearchTerm() {
        return document.getElementById('searchInput')?.value || '';
    },

    getCurrentFilter() {
        return document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    }
};