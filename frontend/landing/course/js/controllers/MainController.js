class MainController {
    constructor() {
        this.courses = [];
        this.pagination = {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
        };
        this.currentView = 'user';
        this.registeringCourseId = null;
        this.isLoading = false;
        this.filters = {
            search: '',
            category: '',
            level: '',
            type: '',
            sort: '-createdAt'
        };
    }

    async init() {
        // Initialize views
        UserView.init(this);
        ModalView.init(this);

        // Bind global events
        this.bindEvents();

        // Initial load
        await this.loadCourses();
        this.renderStats();

        // Check for course id in URL (e.g., ?id=... or path)
        const urlParams = new URLSearchParams(window.location.search);
        let courseId = urlParams.get('id');

        // Fallback: check pathname if using pretty URLs like /course/ID
        if (!courseId) {
            const pathParts = window.location.pathname.split('/');
            // If path is /course/123, parts might be ["", "course", "123"]
            const lastPart = pathParts[pathParts.length - 1];
            if (lastPart && lastPart !== 'index.html' && lastPart !== 'course' && lastPart !== '') {
                courseId = lastPart;
            }
        }

        if (courseId) {
            this.openCourseDetail(courseId);
        }
    }

    bindEvents() {
        // Global click handler for action buttons
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            // Get courseId from the target or its closest parent with data-course-id
            const courseId = target.dataset.courseId || target.closest('[data-course-id]')?.dataset.courseId;

            if (!courseId && (action === 'detail' || action === 'register' || action === 'register-from-detail' || action === 'share')) {
                console.warn('Action triggered but courseId is missing', action);
                return;
            }

            switch(action) {
                case 'detail':
                    this.openCourseDetail(courseId);
                    break;
                case 'register':
                    this.openRegister(courseId);
                    break;
                case 'register-from-detail':
                    ModalView.closeCourseDetail();
                    this.openRegister(courseId);
                    break;
                case 'share':
                    this.shareCourseLink(courseId);
                    break;
            }
        });
    }

    setLoading(loading) {
        this.isLoading = loading;
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = loading ? 'flex' : 'none';
    }

    async loadCourses() {
        this.setLoading(true);
        try {
            const params = {
                page: this.pagination.page,
                limit: this.pagination.limit,
                search: this.filters.search,
                type: this.filters.type !== 'all' ? this.filters.type : '',
                sort: this.filters.sort
            };

            const result = await CourseService.getAllCourses(params);
            this.courses = result.courses.map(c => new Course(c));
            this.pagination = result.pagination;

            this.renderAll();
        } catch (error) {
            this.showToast('❌ فشل تحميل الدورات: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async goToPage(page) {
        this.pagination.page = page;
        await this.loadCourses();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    renderAll() {
        UserView.renderCourses(this.courses);
        UserView.renderPagination(this.pagination);
    }

    renderStats() {
        const stats = {
            total: this.pagination.total || this.courses.length,
            open: this.courses.filter(c => !c.isCompleted()).length,
            completed: this.courses.filter(c => c.isCompleted()).length,
            free: this.courses.filter(c => c.type === 'free').length
        };

        UserView.renderStats(stats);
    }

    async filterCourses() {
        this.filters.search = UserView.getSearchTerm();
        this.filters.type = UserView.getCurrentFilter();
        this.pagination.page = 1; // Reset to page 1 on search/filter
        await this.loadCourses();
    }

    async openCourseDetail(id) {
        let course = this.courses.find(c => c.id === id || c.slug === id);

        if (!course) {
            try {
                this.setLoading(true);
                // Try to fetch by ID or slug
                course = await CourseService.getCourse(id);
                if (course) {
                    this.courses.push(course);
                }
            } catch (error) {
                console.error('Could not find course:', id);
                return;
            } finally {
                this.setLoading(false);
            }
        }

        if (course) {
            ModalView.openCourseDetail(course, false);
        }
    }

    openRegister(courseId) {
        // Find the course in the list to pass its info to the apply page
        // Check for both id and slug as the parameter might be either
        const course = this.courses.find(c => c.id === courseId || c.slug === courseId);
        if (course) {
            localStorage.setItem('selectedCourse', JSON.stringify(course));
        }

        // Use relative path to be more robust across different environments
        window.location.href = `apply.html?id=${courseId}`;
    }

    async confirmRegister() {
        // Handled in ApplyController.js
    }

    shareCourseLink(courseId) {
        const shareUrl = `${window.location.origin}/course/?id=${courseId}`;
        UtilsService.copyToClipboard(shareUrl)
            .then(() => {
                this.showToast('✅ تم نسخ رابط الدورة إلى الحافظة', 'success');
            })
            .catch(() => {
                this.showToast('❌ فشل نسخ الرابط', 'error');
            });
    }

    showToast(msg, type = 'info') {
        UtilsService.showToast(msg, type, document.getElementById('toastContainer'));
    }
}
