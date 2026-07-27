// js/views/AdminView.js
class AdminView {
    #controller;
    #currentSubView = 'dashboard';
    #growthChart = null;

    constructor(controller) {
        this.#controller = controller;
    }

    init() {
        this.#bindEvents();
        this.#togglePriceField(); // initial state
    }

    // ---------- Event Binding ----------
    #bindEvents() {
        // Login events
        document.getElementById('loginBtn')?.addEventListener('click', () => this.#controller.handleLogin());
        document.getElementById('fillDefaultBtn')?.addEventListener('click', this.#fillDefaultCredentials);

        // Logout
        document.getElementById('adminLogoutBtn')?.addEventListener('click', () => this.#controller.handleLogout());

        // Global navigation delegation (for data-admin-view)
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-admin-view]');
            if (!btn) return;
            const subView = btn.dataset.adminView;
            if (subView) {
                this.switchSubView(subView);
            }
        });

        // Course form toggles
        document.getElementById('toggleAddCourseBtn')?.addEventListener('click', () => this.toggleForm(true));
        document.getElementById('closeFormBtn')?.addEventListener('click', () => this.toggleForm(false));
        document.getElementById('resetFormBtn')?.addEventListener('click', () => this.toggleForm(false));

        // Form handlers
        document.getElementById('courseType')?.addEventListener('change', () => this.#togglePriceField());
        document.getElementById('teacherImgFile')?.addEventListener('change', (e) => this.#handleImageUpload(e));
        document.getElementById('saveCourseBtn')?.addEventListener('click', () => this.#controller.saveCourse());

        // Export
        document.getElementById('exportApplicantsBtn')?.addEventListener('click', () => this.#controller.exportApplicants());

        // Applicants filters (debounced)
        const appSearch = document.getElementById('appSearchInput');
        if (appSearch) {
            appSearch.addEventListener('input', UtilsService.debounce(() => this.#controller.filterApplicants(), 300));
        }
        ['appCourseFilter', 'appTypeFilter', 'appSortFilter', 'appStatusFilter', 'appGenderFilter'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => this.#controller.filterApplicants());
        });

        // Dashboard period filter
        document.getElementById('regGrowthPeriod')?.addEventListener('change', (e) => {
            this.#controller.loadDashboardData(e.target.value);
        });

        // Back button from course detail
        document.getElementById('backToCoursesBtn')?.addEventListener('click', () => this.switchSubView('courses'));

        // User Management events
        document.getElementById('openAddUserBtn')?.addEventListener('click', () => this.openUserModal());
        document.getElementById('closeUserModalBtn')?.addEventListener('click', () => this.closeUserModal());
        document.getElementById('saveUserBtn')?.addEventListener('click', () => this.#controller.saveUser());
    }

    #fillDefaultCredentials = () => {
        const e = document.getElementById('li-e');
        const p = document.getElementById('li-p');
        if (e) e.value = 'admin@wazzifni.com';
        if (p) p.value = 'admin123';
    };

    // ---------- Sub‑view Switching ----------
    switchSubView(subView) {
        this.#currentSubView = subView;

        // Update UI
        document.querySelectorAll('.admin-sub-view').forEach(v => v.classList.remove('active'));
        const targetViewId = 'admin' + subView.charAt(0).toUpperCase() + subView.slice(1);
        const targetView = document.getElementById(targetViewId);
        if (targetView) targetView.classList.add('active');

        document.querySelectorAll('.admin-nav-item').forEach(t => t.classList.remove('active'));
        document.querySelector(`.admin-nav-item[data-admin-view="${subView}"]`)?.classList.add('active');

        // Scroll content to top
        document.querySelector('.admin-main')?.scrollTo(0, 0);

        // Notify controller if needed
        if (this.#controller?.onAdminSubViewChange) {
            this.#controller.onAdminSubViewChange(subView);
        }
    }

    // ---------- Form Management ----------
    toggleForm(show) {
        const container = document.getElementById('courseFormContainer');
        const btn = document.getElementById('toggleAddCourseBtn');
        if (!container || !btn) return;

        if (show) {
            container.style.display = 'block';
            btn.style.display = 'none';
            this.#resetForm();
        } else {
            container.style.display = 'none';
            btn.style.display = 'block';
        }
    }

    #resetForm() {
        const ids = ['courseName', 'teacherName', 'startDate', 'seats', 'price', 'courseDesc', 'editId', 'teacherImg'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });

        document.getElementById('courseType').value = 'free';
        document.getElementById('formTitle').textContent = '➕ إضافة دورة جديدة';
        this.#togglePriceField();

        const previewDiv = document.getElementById('uploadPreview');
        const placeholderDiv = document.getElementById('uploadPlaceholder');
        if (previewDiv) previewDiv.style.display = 'none';
        if (placeholderDiv) placeholderDiv.style.display = 'block';
    }

    #togglePriceField() {
        const typeEl = document.getElementById('courseType');
        const priceField = document.getElementById('priceField');
        if (typeEl && priceField) {
            priceField.style.display = typeEl.value === 'paid' ? 'block' : 'none';
        }
    }

    #handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            document.getElementById('teacherImg').value = ev.target.result;
            const previewImg = document.getElementById('imgPreviewEl');
            if (previewImg) previewImg.src = ev.target.result;
            document.getElementById('uploadPreview').style.display = 'block';
            document.getElementById('uploadPlaceholder').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    // ---------- User Management Methods ----------
    renderUsersTable(users) {
        const tbody = document.getElementById('usersTableBody');
        const emptyEl = document.getElementById('usersEmpty');
        if (!tbody) return;

        if (!users || !users.length) {
            tbody.innerHTML = '';
            emptyEl.style.display = 'block';
            return;
        }

        emptyEl.style.display = 'none';
        tbody.innerHTML = users.map(user => `
            <tr>
                <td><strong>${user.name}</strong></td>
                <td>${user.email}</td>
                <td style="direction: ltr">${user.phone || '—'}</td>
                <td><span class="badge badge-${user.role}">${UtilsService.translate(user.role)}</span></td>
                <td>
                    <span class="status-dot ${user.isActive ? 'active' : 'inactive'}"></span>
                    ${user.isActive ? 'نشط' : 'معطل'}
                </td>
                <td>
                    <div style="display:flex;gap:0.5rem">
                        <button class="btn btn-ghost btn-sm" onclick="app.editUser('${user._id || user.id}')">✏️</button>
                        <button class="btn btn-danger btn-sm" onclick="app.deleteUser('${user._id || user.id}')">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    openUserModal(user = null) {
        const modal = document.getElementById('userModal');
        if (!modal) return;

        const title = document.getElementById('userModalTitle');
        const idField = document.getElementById('userId');
        const nameField = document.getElementById('userName');
        const emailField = document.getElementById('userEmail');
        const phoneField = document.getElementById('userPhone');
        const passwordField = document.getElementById('userPassword');
        const activeField = document.getElementById('userIsActive');

        if (user) {
            title.textContent = '✏️ تعديل مدير';
            idField.value = user._id || user.id;
            nameField.value = user.name;
            emailField.value = user.email;
            phoneField.value = user.phone || '';
            passwordField.value = '';
            passwordField.placeholder = 'اتركه فارغاً للإبقاء على كلمة المرور الحالية';
            activeField.checked = user.isActive;
        } else {
            title.textContent = '👤 إضافة مدير جديد';
            idField.value = '';
            nameField.value = '';
            emailField.value = '';
            phoneField.value = '';
            passwordField.value = '';
            passwordField.placeholder = 'كلمة المرور';
            activeField.checked = true;
        }

        modal.classList.add('active');
    }

    closeUserModal() {
        document.getElementById('userModal')?.classList.remove('active');
    }

    getUserFormData() {
        return {
            id: document.getElementById('userId')?.value,
            name: document.getElementById('userName')?.value.trim(),
            email: document.getElementById('userEmail')?.value.trim(),
            phone: document.getElementById('userPhone')?.value.trim(),
            password: document.getElementById('userPassword')?.value,
            isActive: document.getElementById('userIsActive')?.checked,
            role: 'admin' // Force role to admin as per requirement
        };
    }

    // ---------- Rendering Methods ----------
    renderStats(stats) {
        const statsEl = document.getElementById('adminStats');
        if (!statsEl) return;

        statsEl.innerHTML = `
            <div class="stat-card gold"><div class="num">${stats.total}</div><div class="label">إجمالي الدورات</div></div>
            <div class="stat-card green"><div class="num">${stats.open}</div><div class="label">دورات متاحة</div></div>
            <div class="stat-card blue"><div class="num">${stats.free}</div><div class="label">دورات مجانية</div></div>
        `;
    }

    renderRegistrationGrowth(dailyStats) {
        const ctx = document.getElementById('registrationGrowthChart');
        if (!ctx) return;

        const labels = dailyStats?.length ? dailyStats.map(d => d._id) : ['لا توجد تسجيلات بعد'];
        const counts = dailyStats?.length ? dailyStats.map(d => d.count) : [0];

        if (this.#growthChart) this.#growthChart.destroy();

        this.#growthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'عدد التسجيلات',
                    data: counts,
                    borderColor: '#00B6E7',
                    backgroundColor: 'rgba(0, 182, 231, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#00B6E7',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        rtl: true,
                        titleFont: { family: 'Cairo' },
                        bodyFont: { family: 'Cairo' }
                    }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { precision: 0, stepSize: 1 } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    renderLatestApplicants(applicants) {
        const container = document.getElementById('latestApplicants');
        if (!container) return;

        if (!applicants?.length) {
            container.innerHTML = '<p style="text-align:center; padding:2rem; color:var(--muted)">لا يوجد متقدمون مؤخراً</p>';
            return;
        }

        const latest = applicants.slice(0, 5);
        container.innerHTML = `
            <div class="mini-list" style="display:flex; flex-direction:column; gap:12px;">
                ${latest.map(a => `
                    <div class="mini-item" style="display:flex; align-items:center; gap:12px; padding:8px; background:#f8fafc; border-radius:12px;">
                        <div style="width:36px; height:36px; border-radius:10px; background:#0ea5e9; color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.8rem; flex-shrink:0;">
                            ${(a.studentName || a.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div style="flex:1; min-width:0;">
                            <div style="font-weight:700; font-size:0.9rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#1e293b;">${a.studentName || a.name}</div>
                            <div style="font-size:0.75rem; color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${a.courseName}</div>
                        </div>
                        <div style="text-align:left; flex-shrink:0;">
                            <div style="font-size:0.7rem; color:#94a3b8">${UtilsService.formatDate(a.registeredAt || a.date)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderCoursesTable(courses) {
        const tbody = document.getElementById('adminTableBody');
        const mobileList = document.getElementById('adminMobileList');
        const emptyEl = document.getElementById('adminEmpty');
        if (!tbody) return;

        if (!courses.length) {
            tbody.innerHTML = '';
            mobileList.innerHTML = '';
            emptyEl.style.display = 'block';
            return;
        }

        emptyEl.style.display = 'none';
        tbody.innerHTML = courses.map(c => this.#renderTableRow(c)).join('');
        mobileList.innerHTML = courses.map(c => this.#renderMobileItem(c)).join('');
    }

    #renderTableRow(course) {
        const teacherImg = course.teacherImg || UtilsService.generateAvatar(course.teacherName);

        return `
            <tr data-course-id="${course.id}">
                <td><strong style="cursor:pointer; color:#0ea5e9" data-action="admin-detail" data-course-id="${course.id}">${course.name}</strong></td>
                <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <img src="${teacherImg}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;" alt="">
                        <span>${course.teacherName}</span>
                    </div>
                </td>
                <td style="font-size:0.85rem">${UtilsService.formatDate(course.startDate)}</td>
                <td>
                    <span style="font-weight:700;color:var(--primary)">${course.totalSeats}</span>
                </td>
                <td>${course.getCourseTypeBadge()}</td>
                <td>${course.getStatusBadge()}</td>
                <td>
                    <div style="display:flex;gap:0.5rem">
                        ${course.status !== 'completed' ? `<button class="btn btn-success btn-sm" data-action="complete-course" data-course-id="${course.id}" title="إكمال">🏁</button>` : ''}
                        <button class="btn btn-ghost btn-sm" data-action="edit" data-course-id="${course.id}">✏️</button>
                        <button class="btn btn-danger btn-sm" data-action="delete" data-course-id="${course.id}">🗑️</button>
                    </div>
                </td>
            </tr>`;
    }

    #renderMobileItem(course) {
        return `
            <div class="mobile-course-item" data-course-id="${course.id}" style="background:white; padding:1rem; border-radius:12px; margin-bottom:1rem; border:1px solid #f1f5f9;">
                <div class="info" data-action="admin-detail" data-course-id="${course.id}">
                    <div style="font-weight:700; color:#1e293b; margin-bottom:4px;">${course.name}</div>
                    <div style="font-size:0.85rem; color:#64748b;">${course.teacherName} • ${course.totalSeats} مقعد</div>
                </div>
                <div style="display:flex;gap:0.5rem; margin-top:1rem;">
                    ${course.status !== 'completed' ? `<button class="btn btn-success btn-sm" data-action="complete-course" data-course-id="${course.id}">🏁 إنهاء</button>` : ''}
                    <button class="btn btn-ghost btn-sm" data-action="edit" data-course-id="${course.id}">✏️ تعديل</button>
                    <button class="btn btn-danger btn-sm" data-action="delete" data-course-id="${course.id}">🗑️ حذف</button>
                </div>
            </div>`;
    }

    renderPagination(pagination) {
        const container = document.getElementById('adminPagination');
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
            btn.addEventListener('click', () => this.#controller.goToPage(parseInt(btn.dataset.page)));
        });
    }

    renderApplicantsStats(stats) {
        const statsEl = document.getElementById('applicantsStats');
        if (!statsEl) return;

        statsEl.innerHTML = `
            <div class="stat-card gold"><div class="num">${stats.total}</div><div class="label">إجمالي المتقدمين</div></div>
            <div class="stat-card blue"><div class="num">${stats.uniqueCourses}</div><div class="label">دورات بها تسجيلات</div></div>
            <div class="stat-card green"><div class="num">${stats.todayApps}</div><div class="label">تسجيلات اليوم</div></div>
            <div class="stat-card red"><div class="num">${stats.filtered}</div><div class="label">نتائج الفلتر</div></div>
        `;
    }

    renderApplicants(applicants) {
        const grid = document.getElementById('applicantsCardsGrid');
        const emptyEl = document.getElementById('applicantsEmpty');
        if (!grid) return;

        if (!applicants.length) {
            grid.innerHTML = '';
            emptyEl.style.display = 'block';
            return;
        }

        emptyEl.style.display = 'none';

        const colors = [
            ['#00B6E7', '#0087C6'], ['#F68A29', '#FF6700'], ['#10B981', '#059669'],
            ['#8B5CF6', '#7C3AED'], ['#EF4444', '#DC2626'], ['#3B82F6', '#2563EB']
        ];

        grid.innerHTML = applicants.map((a, i) => this.#renderApplicantCard(a, colors[i % colors.length])).join('');
    }

    #getRegStatusBadge(status) {
        const s = (status || '').toLowerCase();
        if (s === 'accepted' || s === 'confirmed' || s === 'approved') {
            return '<span class="badge green">مقبول ✅</span>';
        } else if (s === 'rejected' || s === 'cancelled') {
            return '<span class="badge red">مرفوض ❌</span>';
        } else if (s === 'contacted') {
            return '<span class="badge orange">تم التواصل 📞</span>';
        } else {
            return '<span class="badge blue">قيد الانتظار ⏳</span>';
        }
    }

    #renderApplicantCard(applicant, colors) {
        const name = applicant.studentName || applicant.name || 'مجهول';
        const phone = applicant.studentPhone || applicant.phone || '';
        const email = applicant.studentEmail || applicant.email || '';
        const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
        const waPhone = phone.replace(/[^0-9]/g, '');
        const waLink = `https://wa.me/${waPhone.startsWith('0') ? '964' + waPhone.slice(1) : waPhone}`;
        const typeLabel = applicant.courseType === 'free' ? '🟢 مجانية' : '🟡 مدفوعة';
        const typeColor = applicant.courseType === 'free' ? '#10b981' : '#f59e0b';
        const courseId = applicant.course?._id || applicant.courseId;
        const regId = applicant._id || applicant.id;

        return `
            <div class="applicant-card" data-course-id="${courseId}" data-phone="${phone}">
                <div class="applicant-card-header">
                    <div class="applicant-avatar" style="background: linear-gradient(135deg, ${colors[0]}, ${colors[1]})">
                        ${initials}
                    </div>
                    <div class="applicant-info-main">
                        <div class="applicant-name">${name}</div>
                        <div class="applicant-date">📅 ${UtilsService.formatDateTime(applicant.registeredAt || applicant.date)}</div>
                    </div>
                    <div class="applicant-status-wrap">
                        ${this.#getRegStatusBadge(applicant.status)}
                    </div>
                </div>
                <div class="applicant-card-body">
                    <div class="applicant-course-box">
                        <div class="course-label">الدورة التدريبية</div>
                        <div class="course-value">
                            <span>📚 ${applicant.courseName}</span>
                            <span style="color: ${typeColor}; font-size: 0.75rem;">${typeLabel}</span>
                        </div>
                    </div>
                    <div class="applicant-extra-info" style="margin-top: 10px; padding: 10px; background: var(--bg); border-radius: 8px; font-size: 0.85rem;">
                         👤 <strong>الجنس:</strong> ${applicant.gender === 'male' || applicant.gender === 'ذكر' ? 'ذكر' : (applicant.gender === 'female' || applicant.gender === 'أنثى' ? 'أنثى' : 'غير محدد')}<br>
                         📍 <strong>المحافظة:</strong> ${UtilsService.translate(applicant.governorate) || 'غير محدد'}<br>
                         🎓 <strong>التحصيل:</strong> ${UtilsService.translate(applicant.educationLevel) || 'غير محدد'}<br>
                         🔬 <strong>التخصص:</strong> ${applicant.studyDescription || 'غير محدد'}<br>
                         💼 <strong>الوظيفة:</strong> ${UtilsService.translate(applicant.currentJob) || 'غير محدد'}
                    </div>
                    <div class="applicant-contact-info" style="margin-top: 10px;">
                        <div class="contact-item"><span class="icon">📞</span><span style="direction: ltr; font-weight: 600;">${phone}</span></div>
                        ${email ? `<div class="contact-item"><span class="icon">✉️</span><span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${email}</span></div>` : ''}
                    </div>
                </div>
                <div class="applicant-card-actions">
                    <div style="display:flex; gap:0.5rem; flex:1;">
                        <button class="action-btn-sm btn-success" data-action="accept-applicant" data-registration-id="${regId}" title="قبول">✅ قبول</button>
                        <button class="action-btn-sm btn-danger" data-action="reject-applicant" data-registration-id="${regId}" title="رفض">❌ رفض</button>
                    </div>
                    <div style="display:flex; gap:0.5rem;">
                        <a href="${waLink}" target="_blank" class="action-btn-sm btn-whatsapp" title="واتساب">💬</a>
                        <a href="tel:${phone}" class="action-btn-sm btn-call" title="اتصال">📞</a>
                        <button class="btn-delete-small" data-action="remove-applicant" data-registration-id="${regId}" title="حذف">🗑️</button>
                    </div>
                </div>
            </div>`;
    }

    renderUserProfile(user) {
        const nameEl = document.getElementById('headerUserName');
        if (nameEl && user) nameEl.textContent = user.name || 'مدير النظام';
    }

    populateCourseForm(course) {
        this.toggleForm(true);
        document.getElementById('editId').value = course.id;
        document.getElementById('courseName').value = course.name;
        document.getElementById('teacherName').value = course.teacherName;
        document.getElementById('startDate').value = course.startDate;
        document.getElementById('seats').value = course.totalSeats;
        document.getElementById('courseType').value = course.type;
        document.getElementById('price').value = course.price || '';
        document.getElementById('courseDesc').value = course.desc;
        document.getElementById('teacherImg').value = course.teacherImg || '';

        document.getElementById('formTitle').textContent = '✏️ تعديل الدورة';

        if (course.teacherImg) {
            document.getElementById('imgPreviewEl').src = course.teacherImg;
            document.getElementById('uploadPreview').style.display = 'block';
            document.getElementById('uploadPlaceholder').style.display = 'none';
        }

        this.#togglePriceField();
        document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth' });
    }

    updateCourseFilter(courses) {
        const select = document.getElementById('appCourseFilter');
        if (!select) return;
        const currentVal = select.value;
        select.innerHTML = '<option value="all">📚 كل الدورات</option>' +
            courses.map(c => `<option value="${c.id}" ${c.id === currentVal ? 'selected' : ''}>${c.name}</option>`).join('');
    }

    getApplicantFilters() {
        return {
            search: document.getElementById('appSearchInput')?.value || '',
            course: document.getElementById('appCourseFilter')?.value || 'all',
            type: document.getElementById('appTypeFilter')?.value || 'all',
            status: document.getElementById('appStatusFilter')?.value || 'all',
            gender: document.getElementById('appGenderFilter')?.value || 'all',
            sort: document.getElementById('appSortFilter')?.value || 'newest'
        };
    }

    getFormData() {
        return {
            id: document.getElementById('editId')?.value || '',
            name: document.getElementById('courseName')?.value.trim() || '',
            teacherName: document.getElementById('teacherName')?.value.trim() || '',
            startDate: document.getElementById('startDate')?.value || '',
            seats: parseInt(document.getElementById('seats')?.value) || 0,
            type: document.getElementById('courseType')?.value || 'free',
            price: parseFloat(document.getElementById('price')?.value) || 0,
            desc: document.getElementById('courseDesc')?.value.trim() || '',
            teacherImg: document.getElementById('teacherImg')?.value || ''
        };
    }

    renderCourseDetail(course) {
        this.switchSubView('courseDetail');
        document.getElementById('adminDetailTitle').textContent = course.name;
        document.getElementById('adminDetailTeacher').textContent = 'الأستاذ: ' + course.teacherName;

        const container = document.getElementById('adminCourseDetailContent');
        if (!container) return;

        const registrations = course.registrations || [];
        const occupancy = course.totalSeats > 0 ? Math.round((registrations.length / course.totalSeats) * 100) : 0;

        container.innerHTML = `
            <div class="stats-bar">
                <div class="stat-card blue"><div class="num">${course.totalSeats}</div><div class="label">إجمالي المقاعد</div></div>
                <div class="stat-card gold"><div class="num">${registrations.length}</div><div class="label">عدد المسجلين</div></div>
                <div class="stat-card red"><div class="num">${occupancy}%</div><div class="label">نسبة الإشغال</div></div>
            </div>
            <div class="table-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem">
                    <h3 style="margin:0">👥 قائمة المسجلين في هذه الدورة</h3>
                    ${course.status !== 'completed' ? `<button class="btn btn-success" data-action="complete-course" data-course-id="${course.id}">🏁 وضع علامة مكتملة</button>` : '<span class="badge red">الدورة منتهية</span>'}
                </div>
                ${registrations.length ? `
                    <div style="overflow-x:auto">
                        <table class="courses-table">
                            <thead><tr><th>الاسم</th><th>الهاتف</th><th>المعلومات</th><th>الحالة</th><th>التاريخ</th><th>إجراءات</th></tr></thead>
                            <tbody>
                                ${registrations.map(r => `
                                    <tr>
                                        <td><strong>${r.studentName || r.name}</strong></td>
                                        <td style="direction:ltr">${r.studentPhone || r.phone}</td>
                                        <td style="font-size: 0.8rem;">
                                            👤 ${r.gender === 'male' || r.gender === 'ذكر' ? 'ذكر' : (r.gender === 'female' || r.gender === 'أنثى' ? 'أنثى' : 'غير محدد')}<br>
                                            📍 ${UtilsService.translate(r.governorate) || '?'}<br>
                                            🎓 ${UtilsService.translate(r.educationLevel) || '?'}<br>
                                            🔬 ${r.studyDescription || '?'}<br>
                                            💼 ${UtilsService.translate(r.currentJob) || '?'}
                                        </td>
                                        <td>${this.#getRegStatusBadge(r.status)}</td>
                                        <td>${UtilsService.formatDateTime(r.registeredAt || r.date)}</td>
                                        <td>
                                            <div style="display:flex; gap:0.4rem;">
                                                <button class="btn btn-success btn-sm" data-action="accept-applicant" data-registration-id="${r._id || r.id}" title="قبول">✅</button>
                                                <button class="btn btn-danger btn-sm" data-action="reject-applicant" data-registration-id="${r._id || r.id}" title="رفض">❌</button>
                                                <button class="btn btn-ghost btn-sm" data-action="remove-applicant" data-registration-id="${r._id || r.id}" title="حذف">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : '<p style="text-align:center; padding:2rem; color:var(--muted)">لا يوجد مسجلين بعد</p>'}
            </div>
        `;
    }

    getLoginData() {
        return {
            email: document.getElementById('li-e')?.value.trim() || '',
            password: document.getElementById('li-p')?.value || ''
        };
    }

    showLogin() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminContainer').classList.remove('logged-in');
        document.body.classList.remove('admin-logged-in');
        document.getElementById('li-p').value = ''; // clear password
    }

    hideLogin() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminContainer').classList.add('logged-in');
        document.body.classList.add('admin-logged-in');
    }

    setLoginError(msg) {
        document.getElementById('li-err').textContent = msg;
    }
}
