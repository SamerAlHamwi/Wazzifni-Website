const ModalView = {
    init(controller) {
        this.controller = controller;
        this.bindEvents();
    },

    bindEvents() {
        // Register modal
        const regModal = document.getElementById('registerModal');
        if (regModal) {
            regModal.addEventListener('click', (e) => {
                if (e.target === regModal) this.closeRegisterModal();
            });
        }

        const confirmBtn = document.getElementById('confirmRegisterBtn');
        if (confirmBtn) confirmBtn.addEventListener('click', () => this.controller.confirmRegister());

        const closeRegBtn = document.getElementById('closeModalBtn');
        if (closeRegBtn) closeRegBtn.addEventListener('click', () => this.closeRegisterModal());

        // Course detail modal
        const detailModal = document.getElementById('courseDetailModal');
        if (detailModal) {
            detailModal.addEventListener('click', (e) => {
                if (e.target === detailModal) this.closeCourseDetail();
            });
        }

        const closeDetailBtn = document.getElementById('closeDetailBtn');
        if (closeDetailBtn) closeDetailBtn.addEventListener('click', () => this.closeCourseDetail());
    },

    openRegisterModal(course) {
        const info = document.getElementById('modalCourseInfo');
        if (info) {
            info.innerHTML = `
                <div class="course-name">${course.name}</div>
                <div class="course-detail">
                    👨‍🏫 ${course.teacherName} &nbsp;|&nbsp;
                    📅 ${UtilsService.formatDate(course.startDate)} &nbsp;|&nbsp;
                    ${course.type === 'free' ? window.i18n.t('detail.freeBadge') : UtilsService.formatPrice(course.price)}
                </div>`;
        }

        ['regName', 'regPhone', 'regGender', 'regEmail', 'regGovernorate', 'regEducationLevel', 'regStudyDescription', 'regCurrentJob'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });

        const modal = document.getElementById('registerModal');
        if (modal) modal.classList.add('active');
    },

    closeRegisterModal() {
        const modal = document.getElementById('registerModal');
        if (modal) modal.classList.remove('active');
    },

    openCourseDetail(course, isAdminView) {
        const fields = {
            'cdmCourseName': course.name,
            'cdmTeacherName': '👨‍🏫 ' + course.teacherName,
            'cdmTeacherImg': course.teacherImg || UtilsService.generateAvatar(course.teacherName),
            'cdmDesc': course.desc || window.i18n.t('card.noDescription')
        };

        Object.entries(fields).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el) {
                if (id === 'cdmTeacherImg') el.src = val;
                else el.textContent = val;
            }
        });

        const regCount = course.getRegistrationCount();
        const pct = course.getSeatsPercentage();
        const statusColor = course.isCompleted() ? 'var(--muted)' :
                           course.getAvailableSeats() <= 3 ? 'var(--gold)' : 'var(--success)';

        const statsEl = document.getElementById('cdmStats');
        if (statsEl) statsEl.innerHTML = this.renderStats(course, regCount, pct, statusColor);

        const registrantsEl = document.getElementById('cdmRegistrants');
        if (registrantsEl) registrantsEl.innerHTML = this.renderRegistrants(course.registrations || []);

        const footerEl = document.getElementById('cdmFooterBtns');
        if (footerEl) footerEl.innerHTML = this.renderFooter(course, isAdminView);

        const registrantsWrap = document.getElementById('cdmRegistrantsWrap');
        if (registrantsWrap) registrantsWrap.style.display = isAdminView ? 'block' : 'none';

        const modal = document.getElementById('courseDetailModal');
        if (modal) modal.classList.add('active');
    },

    closeCourseDetail() {
        const modal = document.getElementById('courseDetailModal');
        if (modal) modal.classList.remove('active');
    },

    renderStats(course, regCount, pct, statusColor) {
        const t = (key, vars) => window.i18n.t(key, vars);

        return `
            <div class="cdm-stat-box">
                <div class="val" style="color:var(--blue)">${course.totalSeats}</div>
                <div class="lbl">${t('detail.totalSeats')}</div>
            </div>
            <div class="cdm-progress-box">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:0.85rem;font-weight:600;">
                    <span style="color:var(--text)">📅 ${UtilsService.formatDate(course.startDate)}</span>
                    <span style="color:${course.type === 'free' ? 'var(--success)' : 'var(--orange)'};">${course.type === 'free' ? t('detail.freeBadge') : UtilsService.formatPrice(course.price)}</span>
                </div>
                <div class="progress-track" style="height:10px;background:var(--border);">
                    <div class="progress-fill" style="width:${pct}%;background:linear-gradient(90deg,var(--sky),var(--blue));"></div>
                </div>
                <div style="font-size:0.75rem;color:var(--muted);margin-top:6px;text-align:center;font-weight:700;">
                    ${course.isCompleted() ? t('detail.finishedNote') : t('detail.seatsBooked', { pct: pct })}
                </div>
            </div>`;
    },

    renderRegistrants(registrations) {
        if (registrations.length === 0) {
            return `
                <div style="text-align:center;padding:2rem;color:var(--muted);font-size:0.9rem;background:var(--bg);border-radius:12px;border:1px dashed var(--border);">
                    ${window.i18n.t('detail.noRegistrants')}
                </div>`;
        }

        return registrations.map(r => `
            <div class="registrant-item">
                <div class="registrant-avatar">${(r.studentName || r.name || '?')[0]}</div>
                <div class="registrant-info">
                    <div class="registrant-name">${r.studentName || r.name}</div>
                    <div class="registrant-contact">${r.studentPhone || r.phone}${ (r.studentEmail || r.email) ? ' • ' + (r.studentEmail || r.email) : ''}</div>
                    <div class="registrant-extra" style="font-size: 0.8rem; color: var(--muted); margin-top: 4px;">
                        📍 ${UtilsService.translate(r.governorate) || window.i18n.t('detail.unspecified')} | 🎓 ${UtilsService.translate(r.educationLevel) || window.i18n.t('detail.unspecified')} | 💼 ${UtilsService.translate(r.currentJob) || window.i18n.t('detail.unspecified')}
                    </div>
                </div>
                <div class="registrant-date">${UtilsService.formatDateTime(r.registeredAt || r.date)}</div>
            </div>
        `).join('');
    },

    renderFooter(course, isAdminView) {
        if (isAdminView) return '';

        if (course.isCompleted()) {
            return `<div style="text-align:center;color:var(--muted);font-weight:800;padding:1rem;background:rgba(0,0,0,0.05);border-radius:12px;border:1px solid var(--border);">${window.i18n.t('detail.finished')}</div>`;
        }

        return `<button class="btn btn-primary" style="width:100%;padding:1rem;font-size:1.1rem;border-radius:12px;"
                    data-action="register-from-detail" data-course-id="${course.id}">${window.i18n.t('detail.registerCta')}</button>`;
    },

    getRegisterData() {
        return {
            studentName: document.getElementById('regName')?.value.trim() || '',
            studentPhone: document.getElementById('regPhone')?.value.trim() || '',
            gender: document.getElementById('regGender')?.value || '',
            studentEmail: document.getElementById('regEmail')?.value || '',
            governorate: document.getElementById('regGovernorate')?.value || '',
            educationLevel: document.getElementById('regEducationLevel')?.value || '',
            studyDescription: document.getElementById('regStudyDescription')?.value.trim() || '',
            currentJob: document.getElementById('regCurrentJob')?.value || ''
        };
    }
};