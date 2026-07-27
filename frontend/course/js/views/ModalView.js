const ModalView = {
    controller: null,

    init(controller) {
        this.controller = controller;
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('closeModalBtn')?.addEventListener('click', () => this.closeRegisterModal());
        document.getElementById('confirmRegisterBtn')?.addEventListener('click', () => this.controller.confirmRegister());

        document.getElementById('closeDetailBtn')?.addEventListener('click', () => this.closeCourseDetail());

        // Close on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeRegisterModal();
                    this.closeCourseDetail();
                }
            });
        });
    },

    openRegisterModal(course) {
        const modal = document.getElementById('registerModal');
        const info = document.getElementById('modalCourseInfo');
        if (!modal || !info) return;

        info.innerHTML = `
            <div class="modal-teacher-info">
                <img src="${course.teacherImg || UtilsService.generateAvatar(course.teacherName)}" alt="${course.teacherName}">
                <div>
                    <div class="name">${course.teacherName}</div>
                    <div class="course">${course.name}</div>
                </div>
            </div>
            <div class="modal-course-meta">
                <span>📅 ${UtilsService.formatDate(course.startDate)}</span>
                <span>💰 ${course.type === 'free' ? 'مجانية' : UtilsService.formatPrice(course.price)}</span>
            </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeRegisterModal() {
        const modal = document.getElementById('registerModal');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
        this.resetRegisterForm();
    },

    resetRegisterForm() {
        ['regName', 'regPhone', 'regEmail', 'regGender', 'regGovernorate', 'regEducationLevel', 'regStudyDescription', 'regCurrentJob'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    },

    getRegisterData() {
        return {
            studentName: document.getElementById('regName')?.value.trim(),
            studentPhone: document.getElementById('regPhone')?.value.trim(),
            studentEmail: document.getElementById('regEmail')?.value.trim(),
            gender: document.getElementById('regGender')?.value,
            governorate: document.getElementById('regGovernorate')?.value,
            educationLevel: document.getElementById('regEducationLevel')?.value,
            studyDescription: document.getElementById('regStudyDescription')?.value.trim(),
            currentJob: document.getElementById('regCurrentJob')?.value
        };
    },

    openCourseDetail(course, isAdmin = false) {
        const modal = document.getElementById('courseDetailModal');
        if (!modal) return;

        const teacherImg = course.teacherImg || UtilsService.generateAvatar(course.teacherName);
        document.getElementById('cdmTeacherImg').src = teacherImg;
        document.getElementById('cdmCourseName').textContent = course.name;
        document.getElementById('cdmTeacherName').textContent = 'الأستاذ: ' + course.teacherName;

        const stats = document.getElementById('cdmStats');
        stats.innerHTML = `
            <div class="stat-box">📅 ${UtilsService.formatDate(course.startDate)}</div>
            <div class="stat-box">💰 ${course.type === 'free' ? 'مجانية' : UtilsService.formatPrice(course.price)}</div>
            <div class="stat-box">👥 ${course.totalSeats} مقعد</div>
        `;

        document.getElementById('cdmDesc').textContent = course.desc || 'لا يوجد وصف متاح لهذه الدورة.';

        const footer = document.getElementById('cdmFooterBtns');
        const isCompleted = course.status === 'completed';

        if (isAdmin) {
            footer.innerHTML = `<button class="btn btn-primary" data-action="admin-detail" data-course-id="${course.id}">📊 عرض الإحصائيات والتسجيلات</button>`;
        } else {
            footer.innerHTML = isCompleted ?
                '<button class="btn btn-disabled" disabled>عذراً الدورة مكتملة</button>' :
                `<button class="btn btn-success" data-action="register-from-detail" data-course-id="${course.id}">✅ اشترك الآن في الدورة</button>`;
        }

        // Hide registrants list in user view
        document.getElementById('cdmRegistrantsWrap').style.display = 'none';

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeCourseDetail() {
        const modal = document.getElementById('courseDetailModal');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};