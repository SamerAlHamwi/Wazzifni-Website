class MainController {
    constructor() {
        this.courses = [];
        this.applicants = [];
        this.users = [];
        this.inquiries = [];
        this.filteredApplicants = [];
        this.filteredInquiries = [];
        this.pagination = {
            page: 1,
            limit: 10,
            total: 0,
            pages: 0
        };
        this.currentView = 'user';
        this.currentAdminSubView = 'dashboard';
        this.registeringCourseId = null;
        this.currentAdminCourseId = null;
        this.isLoading = false;
        this.filters = {
            search: '',
            category: '',
            level: '',
            type: '',
            sort: '-createdAt'
        };
        this.adminView = null;
    }

    async init() {
        // Initialize views
        UserView.init(this);
        this.adminView = new AdminView(this);
        this.adminView.init();
        ModalView.init(this);

        // Bind global events
        this.bindEvents();

        // Initial load
        await this.loadCourses();
        if (this.currentView === 'admin') {
            await this.onAdminSubViewChange(this.currentAdminSubView);
        } else {
            this.renderStats();
        }
    }

    bindEvents() {
        // Navigation (Main tabs)
        document.querySelector('.nav-tabs')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.nav-tab');
            if (!btn) return;
            const view = btn.dataset.view;
            if (view) this.switchView(view);
        });

        // Global click handler for action buttons
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const courseId = target.dataset.courseId;
            const phone = target.dataset.phone;
            const regId = target.dataset.registrationId;
            const inquiryId = target.dataset.inquiryId;

            switch(action) {
                case 'edit':
                    this.editCourse(courseId);
                    break;
                case 'delete':
                    this.deleteCourse(courseId);
                    break;
                case 'detail':
                    this.openCourseDetail(courseId);
                    break;
                case 'admin-detail':
                    this.openAdminCourseDetail(courseId);
                    break;
                case 'register':
                    this.openRegister(courseId);
                    break;
                case 'register-from-detail':
                    ModalView.closeCourseDetail();
                    this.openRegister(courseId);
                    break;
                case 'remove-applicant':
                    this.removeApplicant(regId || { courseId, phone });
                    break;
                case 'accept-applicant':
                    this.updateApplicantStatus(regId, 'Accepted');
                    break;
                case 'reject-applicant':
                    this.updateApplicantStatus(regId, 'Rejected');
                    break;
                case 'complete-course':
                    this.markCourseCompleted(courseId);
                    break;
                case 'view-inquiry':
                    this.openInquiry(inquiryId);
                    break;
                case 'delete-inquiry':
                    this.deleteInquiry(inquiryId);
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
            // Map POJO to Course model
            this.courses = result.courses.map(c => new Course(c));
            this.pagination = result.pagination;

            this.renderAll();
            if (this.currentView === 'admin') {
                this.adminView.updateCourseFilter(this.courses);
            }
        } catch (error) {
            this.showToast('❌ فشل تحميل الدورات: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async loadApplicants() {
        this.setLoading(true);
        try {
            const result = await RegistrationService.getAllRegistrations();
            // result is { registrations } because RegistrationService returns response.data
            this.applicants = result.registrations || [];
            this.filterApplicants();
            this.renderApplicantsStats();
        } catch (error) {
            console.error('loadApplicants error:', error);
            this.showToast('❌ فشل تحميل المتقدمين: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    // ---------- Project Inquiries (IT Land landing form) ----------
    async loadInquiries() {
        this.setLoading(true);
        try {
            const result = await InquiryService.getAllInquiries();
            this.inquiries = result.inquiries || [];
            this.filterInquiries();
        } catch (error) {
            console.error('loadInquiries error:', error);
            this.showToast('❌ فشل تحميل طلبات المشاريع: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    // Filtering is done client-side, the same way the applicants list works:
    // the whole list is already loaded, so a filter change needs no round trip.
    filterInquiries() {
        if (!this.adminView) return;

        const filters = this.adminView.getInquiryFilters();
        let filtered = [...this.inquiries];

        if (filters.search) {
            const s = filters.search.toLowerCase();
            filtered = filtered.filter(i =>
                (i.name || '').toLowerCase().includes(s) ||
                (i.contact || '').toLowerCase().includes(s) ||
                (i.companyName || '').toLowerCase().includes(s) ||
                (i.message || '').toLowerCase().includes(s)
            );
        }

        if (filters.status !== 'all') {
            filtered = filtered.filter(i => (i.status || 'new') === filters.status);
        }

        if (filters.service !== 'all') {
            filtered = filtered.filter(i => i.service === filters.service);
        }

        if (filters.channel !== 'all') {
            filtered = filtered.filter(i => i.channel === filters.channel);
        }

        switch (filters.sort) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
                break;
            case 'name':
                filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
        }

        this.filteredInquiries = filtered;
        this.adminView.renderInquiries(filtered);
        this.renderInquiriesStats();
    }

    renderInquiriesStats() {
        if (!this.adminView) return;

        const today = new Date();
        const stats = {
            total: this.inquiries.length,
            newCount: this.inquiries.filter(i => (i.status || 'new') === 'new').length,
            todayCount: this.inquiries.filter(i => {
                const d = new Date(i.createdAt);
                return d.getDate() === today.getDate() &&
                       d.getMonth() === today.getMonth() &&
                       d.getFullYear() === today.getFullYear();
            }).length,
            filtered: this.filteredInquiries.length
        };

        this.adminView.renderInquiriesStats(stats);
    }

    openInquiry(id) {
        const inquiry = this.inquiries.find(i => (i._id || i.id) === id);
        if (!inquiry) return;
        this.adminView.openInquiryModal(inquiry);
    }

    async saveInquiry() {
        const data = this.adminView.getInquiryFormData();
        if (!data.id) return;

        this.setLoading(true);
        try {
            await InquiryService.updateStatus(data.id, { status: data.status, notes: data.notes });
            this.showToast('✅ تم تحديث الطلب', 'success');
            this.adminView.closeInquiryModal();
            await this.loadInquiries();
        } catch (error) {
            this.showToast('❌ فشل تحديث الطلب: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async deleteInquiry(id) {
        if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;

        this.setLoading(true);
        try {
            await InquiryService.deleteInquiry(id);
            this.showToast('🗑️ تم حذف الطلب', 'info');
            await this.loadInquiries();
        } catch (error) {
            this.showToast('❌ فشل الحذف: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async exportInquiries() {
        try {
            await InquiryService.exportCsv();
        } catch (error) {
            this.showToast('❌ فشل التصدير: ' + error.message, 'error');
        }
    }

    async loadUsers() {
        this.setLoading(true);
        try {
            // Only load admin users for the "User Management" tab
            this.users = await UserService.getAllUsers({ role: 'admin' });
            this.adminView.renderUsersTable(this.users);
        } catch (error) {
            this.showToast('❌ فشل تحميل المستخدمين: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async loadDashboardData(period = '30d') {
        this.setLoading(true);
        try {
            // Get stats from backend
            const statsResponse = await RegistrationService.getStats(null, period);
            const latestResponse = await RegistrationService.getAllRegistrations({ limit: 5 });

            // Render stats bar
            this.renderStats();

            // Render specific dashboard sections
            if (statsResponse && statsResponse.daily) {
                this.adminView.renderRegistrationGrowth(statsResponse.daily);
            }

            if (latestResponse && latestResponse.registrations) {
                this.adminView.renderLatestApplicants(latestResponse.registrations);
            }

        } catch (error) {
            console.error('Dashboard error:', error);
            this.showToast('❌ فشل تحميل بيانات لوحة الإحصائيات', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    filterApplicants() {
        if (!this.adminView) return;

        const filters = this.adminView.getApplicantFilters();
        let filtered = [...this.applicants];

        // 1. Search Filter
        if (filters.search) {
            const s = filters.search.toLowerCase();
            filtered = filtered.filter(a =>
                (a.studentName || a.name || '').toLowerCase().includes(s) ||
                (a.studentPhone || a.phone || '').includes(s) ||
                ((a.studentEmail || a.email) && (a.studentEmail || a.email).toLowerCase().includes(s))
            );
        }

        // 2. Course Filter
        if (filters.course && filters.course !== 'all') {
            filtered = filtered.filter(a => {
                const cId = a.course?._id || a.courseId || (typeof a.course === 'string' ? a.course : null);
                return cId === filters.course;
            });
        }

        // 3. Type Filter
        if (filters.type && filters.type !== 'all') {
            filtered = filtered.filter(a => a.courseType === filters.type);
        }

        // 4. Status Filter (Handles null/undefined/missing)
        if (filters.status && filters.status !== 'all') {
            const statusMap = {
                'pending': ['pending', '⏳ قيد الانتظار', '', null, undefined],
                'approved': ['accepted', 'confirmed', 'approved', '✅ مقبول'],
                'rejected': ['rejected', 'cancelled', '❌ مرفوض'],
                'contacted': ['contacted', '📞 تم التواصل']
            };
            const targetValues = statusMap[filters.status];
            if (targetValues) {
                filtered = filtered.filter(a => {
                    const s = a.status ? a.status.toString().toLowerCase() : '';
                    return targetValues.some(tv => {
                        if (tv === null || tv === undefined || tv === '') return s === '';
                        return s === tv.toLowerCase();
                    });
                });
            }
        }

        // 5. Gender Filter (Handles null/undefined/missing)
        if (filters.gender && filters.gender !== 'all') {
            filtered = filtered.filter(a => {
                const g = a.gender ? a.gender.toString().toLowerCase() : '';
                if (filters.gender === 'male') return g === 'male' || g === 'ذكر';
                if (filters.gender === 'female') return g === 'female' || g === 'أنثى';
                return g === filters.gender.toLowerCase();
            });
        }

        // 6. Sort
        switch(filters.sort) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.registeredAt || b.date || 0) - new Date(a.registeredAt || a.date || 0));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.registeredAt || a.date || 0) - new Date(b.registeredAt || b.date || 0));
                break;
            case 'name':
                filtered.sort((a, b) => (a.studentName || a.name || '').localeCompare(b.studentName || b.name || ''));
                break;
        }

        this.filteredApplicants = filtered;
        this.adminView.renderApplicants(filtered);
        this.renderApplicantsStats();
    }

    renderApplicantsStats() {
        if (!this.adminView) return;
        const stats = {
            total: this.applicants.length,
            uniqueCourses: new Set(this.applicants.map(a => a.course?._id || a.courseId || a.course)).size,
            todayApps: this.applicants.filter(a => {
                const d = new Date(a.registeredAt || a.date);
                const today = new Date();
                return d.getDate() === today.getDate() &&
                       d.getMonth() === today.getMonth() &&
                       d.getFullYear() === today.getFullYear();
            }).length,
            filtered: this.filteredApplicants.length
        };
        this.adminView.renderApplicantsStats(stats);
    }

    async removeApplicant(idOrParams) {
        let id;
        if (typeof idOrParams === 'string') {
            id = idOrParams;
        } else {
            const { courseId, phone } = idOrParams;
            const app = this.applicants.find(a => (a.course?._id || a.courseId) === courseId && (a.studentPhone || a.phone) === phone);
            if (!app) return;
            id = app._id || app.id;
        }

        if (!confirm('هل أنت متأكد من حذف هذا المتقدم؟')) return;

        this.setLoading(true);
        try {
            await RegistrationService.deleteRegistration(id);
            this.showToast('🗑️ تم حذف المتقدم', 'info');
            await this.loadApplicants();
            await this.loadCourses(); // Refresh
        } catch (error) {
            this.showToast('❌ فشل الحذف: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async updateApplicantStatus(id, status) {
        this.setLoading(true);
        try {
            await RegistrationService.updateStatus(id, { status });
            this.showToast(`✅ تم تحديث حالة المتقدم إلى ${status === 'Accepted' ? 'مقبول' : 'مرفوض'}`, 'success');

            // Refresh data
            if (this.currentAdminSubView === 'applicants') {
                await this.loadApplicants();
            } else if (this.currentAdminSubView === 'courseDetail' && this.currentAdminCourseId) {
                await this.openAdminCourseDetail(this.currentAdminCourseId);
            }

            if (status === 'Rejected' || status === 'Accepted') {
                await this.loadCourses();
            }
        } catch (error) {
            this.showToast('❌ فشل تحديث الحالة: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async exportApplicants() {
        window.open(`${ApiService.BASE_URL}/registrations/export`, '_blank');
    }

    async onAdminSubViewChange(subView) {
        this.currentAdminSubView = subView;
        if (subView === 'applicants') {
            await this.loadApplicants();
        } else if (subView === 'courses') {
            await this.loadCourses();
        } else if (subView === 'dashboard') {
            await this.loadDashboardData();
        } else if (subView === 'users') {
            await this.loadUsers();
        } else if (subView === 'inquiries') {
            await this.loadInquiries();
        }
    }

    async goToPage(page) {
        this.pagination.page = page;
        await this.loadCourses();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async switchView(view) {
        this.currentView = view;
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

        const targetView = document.getElementById(view + 'View');
        if (targetView) targetView.classList.add('active');

        const targetTab = document.querySelector(`.nav-tab[data-view="${view}"]`);
        if (targetTab) targetTab.classList.add('active');

        // Handle body class for admin mode
        if (view === 'admin') {
            document.body.classList.add('admin-mode');
            this.checkAdminAuth();
            // Ensure the subview is correctly shown when switching to admin view
            this.adminView.switchSubView(this.currentAdminSubView);
        } else {
            document.body.classList.remove('admin-mode');
            this.adminView.hideLogin();
        }

        await this.loadCourses();
        if (view === 'admin') {
            await this.onAdminSubViewChange(this.currentAdminSubView);
        }
    }

    checkAdminAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            this.adminView.showLogin();
        } else {
            this.adminView.hideLogin();
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) this.adminView.renderUserProfile(user);
        }
    }

    async handleLogin() {
        const data = this.adminView.getLoginData();
        if (!data.email || !data.password) {
            this.adminView.setLoginError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
            return;
        }

        this.setLoading(true);
        try {
            const loginPayload = {
                email: data.email,
                password: data.password
            };

            const response = await ApiService.post('/auth/login', loginPayload);

            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                this.showToast('✅ تم تسجيل الدخول بنجاح', 'success');
                this.adminView.hideLogin();
                this.adminView.renderUserProfile(response.data.user);

                await this.loadCourses();
                this.adminView.switchSubView(this.currentAdminSubView);
                await this.onAdminSubViewChange(this.currentAdminSubView);
            }
        } catch (error) {
            this.adminView.setLoginError('فشل الدخول: ' + error.message);
        } finally {
            this.setLoading(false);
        }
    }

    async handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.showToast('👋 تم تسجيل الخروج', 'info');
        this.adminView.showLogin();
    }

    renderAll() {
        if (this.currentView === 'user') {
            UserView.renderCourses(this.courses);
            UserView.renderPagination(this.pagination);
        } else {
            this.adminView.renderCoursesTable(this.courses);
            this.adminView.renderPagination(this.pagination);
        }
    }

    renderStats() {
        const stats = {
            total: this.pagination.total || this.courses.length,
            open: this.courses.filter(c => c.status === 'active').length,
            full: this.courses.filter(c => c.status === 'completed').length,
            free: this.courses.filter(c => c.type === 'free').length
        };

        UserView.renderStats(stats);
        if (this.adminView) this.adminView.renderStats(stats);
    }

    async filterCourses() {
        this.filters.search = UserView.getSearchTerm();
        this.filters.type = UserView.getCurrentFilter();
        this.pagination.page = 1; // Reset to page 1 on search/filter
        await this.loadCourses();
    }

    async saveCourse() {
        const data = this.adminView.getFormData();

        if (!data.name || !data.teacherName || !data.startDate || !data.seats) {
            this.showToast('⚠️ يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        this.setLoading(true);
        try {
            const courseData = {
                name: data.name,
                instructorName: data.teacherName,
                startDate: data.startDate,
                totalSeats: data.seats,
                type: data.type,
                price: data.price,
                description: data.desc,
                instructorImage: data.teacherImg,
                isPublished: true
            };

            if (data.id) {
                await CourseService.updateCourse(data.id, courseData);
                this.showToast('✅ تم تحديث الدورة بنجاح', 'success');
            } else {
                await CourseService.createCourse(courseData);
                this.showToast('🎉 تم إضافة الدورة بنجاح', 'success');
            }

            this.adminView.toggleForm(false);
            await this.loadCourses();
        } catch (error) {
            this.showToast('❌ فشل حفظ الدورة: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    editCourse(id) {
        const course = this.courses.find(c => c.id === id);
        if (!course) return;
        this.adminView.populateCourseForm(course);
    }

    async deleteCourse(id) {
        if (!confirm('هل أنت متأكد من حذف هذه الدورة؟')) return;

        this.setLoading(true);
        try {
            await CourseService.deleteCourse(id);
            this.showToast('🗑️ تم حذف الدورة', 'info');
            await this.loadCourses();
        } catch (error) {
            this.showToast('❌ فشل حذف الدورة: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async markCourseCompleted(id) {
        if (!confirm('هل أنت متأكد من وسم هذه الدورة كمنتهية؟ سيتم إيقاف التسجيل فيها.')) return;

        this.setLoading(true);
        try {
            await CourseService.markAsCompleted(id);
            this.showToast('🏁 تم وسم الدورة كمنتهية', 'success');
            await this.loadCourses();
            if (this.currentAdminSubView === 'courseDetail') {
                await this.openAdminCourseDetail(id);
            }
        } catch (error) {
            this.showToast('❌ فشل تحديث حالة الدورة: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    // ---------- User Management Handlers ----------
    async saveUser() {
        const data = this.adminView.getUserFormData();
        // Validation: email, name, and phone are required. Password required for new users.
        if (!data.name || !data.email || !data.phone || (!data.id && !data.password)) {
            this.showToast('⚠️ يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        this.setLoading(true);
        try {
            if (data.id) {
                await UserService.updateUser(data.id, data);
                this.showToast('✅ تم تحديث بيانات المدير بنجاح', 'success');
            } else {
                await UserService.createUser(data);
                this.showToast('🎉 تم إضافة المدير بنجاح', 'success');
            }
            this.adminView.closeUserModal();
            await this.loadUsers();
        } catch (error) {
            this.showToast('❌ فشل حفظ المدير: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    editUser(id) {
        const user = this.users.find(u => (u._id || u.id) === id);
        if (!user) return;
        this.adminView.openUserModal(user);
    }

    async deleteUser(id) {
        if (!confirm('هل أنت متأكد من حذف هذا المدير؟')) return;
        this.setLoading(true);
        try {
            await UserService.deleteUser(id);
            this.showToast('🗑️ تم حذف المدير', 'info');
            await this.loadUsers();
        } catch (error) {
            this.showToast('❌ فشل حذف المدير: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    openCourseDetail(id) {
        const course = this.courses.find(c => c.id === id);
        if (!course) return;
        ModalView.openCourseDetail(course, this.currentView === 'admin');
    }

    async openAdminCourseDetail(id) {
        this.setLoading(true);
        try {
            const course = this.courses.find(c => c.id === id);
            if (!course) return;

            // Fetch registrations for this specific course
            const result = await RegistrationService.getAllRegistrations({ course: id });
            course.registrations = result.registrations;

            this.currentAdminCourseId = id;
            this.adminView.renderCourseDetail(course);
        } catch (error) {
            this.showToast('❌ فشل تحميل تفاصيل الدورة: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    openRegister(courseId) {
        if (this.currentView === 'admin') {
            this.showToast('⚠️ لا يمكن التسجيل من لوحة الإدارة', 'info');
            return;
        }
        const course = this.courses.find(c => c.id === courseId);
        if (!course || course.status === 'completed') {
            this.showToast('⚠️ هذه الدورة منتهية ولا تقبل المزيد من المسجلين', 'error');
            return;
        }
        this.registeringCourseId = courseId;
        ModalView.openRegisterModal(course);
    }

    async confirmRegister() {
        const data = ModalView.getRegisterData();
        if (!data.studentName || !data.studentPhone || !data.governorate || !data.educationLevel || !data.currentJob) {
            this.showToast('⚠️ يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        this.setLoading(true);
        try {
            await CourseService.registerToCourse(this.registeringCourseId, data);

            ModalView.closeRegisterModal();
            this.showToast('✅ تم التسجيل بنجاح سيتم التواصل معك قريباً', 'success');
            await this.loadCourses();
        } catch (error) {
            this.showToast('❌ فشل التسجيل: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    showToast(msg, type = 'info') {
        UtilsService.showToast(msg, type, document.getElementById('toastContainer'));
    }
}
