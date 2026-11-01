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
    }

    bindEvents() {
        // Global click handler for action buttons
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const courseId = target.dataset.courseId;

            switch(action) {
                case 'detail':
                    this.openCourseDetail(courseId);
                    break;
                case 'register':
                    this.openRegister(courseId);
                    break;
                case 'retry':
                    this.loadCourses();
                    break;
                case 'clear-filters':
                    UserView.clearFilters();
                    break;
            }
        });
    }

    setLoading(loading) {
        this.isLoading = loading;
        if (loading) UserView.renderSkeletons();
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
            this.courses = result.courses;
            this.pagination = result.pagination;

            this.renderAll();
        } catch (error) {
            UserView.renderError(error.message);
        } finally {
            this.isLoading = false;
        }
    }

    async goToPage(page) {
        this.pagination.page = page;
        await this.loadCourses();
        document.getElementById('userCoursesList')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    renderAll() {
        UserView.renderCourses(this.courses);
        UserView.renderPagination(this.pagination);
        UserView.renderResultCount(this.pagination?.total ?? this.courses.length);
        this.renderStats();
    }

    renderStats() {
        const stats = {
            total: this.pagination.total || this.courses.length,
            open: this.courses.filter(c => c.seatsLeft > 0).length,
            full: this.courses.filter(c => c.seatsLeft === 0).length,
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

    openCourseDetail(id) {
        const course = this.courses.find(c => c.id === id);
        if (!course) return;
        this.registeringCourseId = id;
        ModalView.open(course, 'details');
    }

    openRegister(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (!course || course.seatsLeft === 0) return;
        this.registeringCourseId = courseId;
        ModalView.open(course, 'form');
    }

    async confirmRegister() {
        const data = ModalView.getRegisterData();
        if (!ModalView.validate(data)) return;

        ModalView.setSubmitting(true);
        try {
            await CourseService.registerToCourse(this.registeringCourseId, data);
            ModalView.showDone(data);
            this.loadCourses();
        } catch (error) {
            this.showToast('تعذّر إكمال التسجيل: ' + error.message, 'error');
        } finally {
            ModalView.setSubmitting(false);
        }
    }

    showToast(msg, type = 'info') {
        UtilsService.showToast(msg, type, document.getElementById('toastContainer'));
    }
}
