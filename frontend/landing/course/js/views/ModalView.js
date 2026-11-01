// Course drawer — one panel that walks through details → registration form → confirmation
const ModalView = {
    step: 'details',
    course: null,
    returnFocus: null,

    init(controller) {
        this.controller = controller;
        this.drawer = document.getElementById('courseDrawer');
        this.backdrop = document.getElementById('drawerBackdrop');
        this.form = document.getElementById('registerForm');
        this.backBtn = document.getElementById('drawerBack');
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('drawerClose').addEventListener('click', () => this.close());
        this.backdrop.addEventListener('click', () => this.close());
        this.backBtn.addEventListener('click', () => this.showStep('details'));
        document.getElementById('doneBrowse').addEventListener('click', () => this.close());

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.controller.confirmRegister();
        });

        // Clear a field's error as soon as the user fixes it
        this.form.addEventListener('input', (e) => {
            const group = e.target.closest('.form-group');
            if (group && group.classList.contains('has-error')) {
                const id = e.target.id || e.target.closest('[id]')?.id;
                this.setError(group.querySelector('[data-error-for]')?.dataset.errorFor || id, '');
            }
        });

        this.drawer.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="to-form"]')) this.showStep('form');
        });

        document.addEventListener('keydown', (e) => {
            if (this.drawer.hidden) return;
            if (e.key === 'Escape') this.close();
            if (e.key === 'Tab') this.trapTab(e);
        });
    },

    trapTab(e) {
        const items = [...this.drawer.querySelectorAll('a[href], button:not([disabled]), input, select')]
            .filter(n => n.offsetParent !== null);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    },

    open(course, step = 'details') {
        this.course = course;
        this.returnFocus = document.activeElement;
        this.fillDetails(course);
        this.fillSummary(course);
        this.resetForm();
        this.showStep(step);

        this.drawer.hidden = false;
        this.backdrop.hidden = false;
        requestAnimationFrame(() => {
            this.drawer.classList.add('is-open');
            this.backdrop.classList.add('is-open');
        });
        document.documentElement.classList.add('is-locked');
    },

    close() {
        this.drawer.classList.remove('is-open');
        this.backdrop.classList.remove('is-open');
        document.documentElement.classList.remove('is-locked');
        setTimeout(() => {
            this.drawer.hidden = true;
            this.backdrop.hidden = true;
        }, 250);
        if (this.returnFocus && document.contains(this.returnFocus)) this.returnFocus.focus({ preventScroll: true });
    },

    showStep(step) {
        this.step = step;
        this.drawer.querySelectorAll('[data-step]').forEach(el => { el.hidden = el.dataset.step !== step; });

        const order = ['details', 'form', 'done'];
        const index = order.indexOf(step);
        this.drawer.querySelectorAll('[data-step-dot]').forEach(dot => {
            const i = order.indexOf(dot.dataset.stepDot);
            dot.classList.toggle('is-done', i < index);
            dot.classList.toggle('is-current', i === index);
        });

        this.backBtn.hidden = step !== 'form';
        const body = this.drawer.querySelector(`[data-step="${step}"] .drawer-body`);
        if (body) body.scrollTop = 0;

        const focusTarget = step === 'form' ? document.getElementById('regName')
            : step === 'done' ? document.getElementById('doneBrowse')
            : document.getElementById('drawerClose');
        setTimeout(() => focusTarget?.focus({ preventScroll: true }), 60);
    },

    fillDetails(course) {
        const esc = UtilsService.escape;
        document.getElementById('drawerCourseName').textContent = course.name;
        document.getElementById('cdmTeacherName').textContent = course.teacherName || '—';
        document.getElementById('cdmTeacherImg').src = course.teacherImg || UtilsService.generateAvatar(course.teacherName);
        document.getElementById('cdmDesc').textContent = course.desc || 'لا يوجد وصف لهذه الدورة.';

        document.getElementById('cdmBadges').innerHTML =
            (course.isFree() ? '<span class="badge badge-free">مجانية</span>' : '<span class="badge badge-paid">مدفوعة</span>') +
            (course.isFull() ? '<span class="badge badge-full">مكتملة</span>' : '<span class="badge badge-open">التسجيل مفتوح</span>');

        const stat = (icon, label, value) => `
            <div class="cd-stat">
                <svg class="icon"><use href="#${icon}"/></svg>
                <span class="cd-stat-label">${label}</span>
                <span class="cd-stat-value">${esc(value)}</span>
            </div>`;
        document.getElementById('cdmStats').innerHTML =
            stat('i-calendar', 'تاريخ البدء', UtilsService.formatDate(course.startDate)) +
            stat('i-seat', 'المقاعد المتبقية', `${course.seatsLeft} من ${course.totalSeats}`) +
            stat('i-wallet', 'السعر', course.isFree() ? 'مجاني' : UtilsService.formatPrice(course.price));

        const pct = course.getSeatsPercentage();
        document.getElementById('cdmSeats').innerHTML = `
            <div class="seats-label">
                <span>نسبة الحجز</span>
                <span class="count ${course.getSeatsStatusClass()}">${pct}%</span>
            </div>
            <div class="progress-track"><div class="progress-fill ${course.getProgressClass()}" style="width:${pct}%"></div></div>
            ${!course.isFull() && course.seatsLeft <= 3 ? `<p class="seats-warn">تبقّى ${course.seatsLeft} ${course.seatsLeft === 1 ? 'مقعد' : 'مقاعد'} فقط — سجّل الآن</p>` : ''}`;

        document.getElementById('cdmFooterBtns').innerHTML = course.isFull()
            ? '<button class="btn btn-ghost btn-block btn-lg" type="button" disabled>الدورة مكتملة</button>'
            : `<button class="btn btn-primary btn-block btn-lg" type="button" data-action="to-form">
                   سجّل في الدورة<svg class="icon"><use href="#i-arrow"/></svg>
               </button>`;
    },

    fillSummary(course) {
        const esc = UtilsService.escape;
        document.getElementById('modalCourseInfo').innerHTML = `
            <img src="${esc(course.teacherImg || UtilsService.generateAvatar(course.teacherName))}" class="teacher-img" alt="">
            <div>
                <div class="course-name">${esc(course.name)}</div>
                <div class="course-detail">${esc(UtilsService.formatDate(course.startDate))} · ${course.isFree() ? 'مجانية' : esc(UtilsService.formatPrice(course.price))}</div>
            </div>`;
    },

    resetForm() {
        this.form.reset();
        this.form.querySelectorAll('[data-error-for]').forEach(el => this.setError(el.dataset.errorFor, ''));
        this.setSubmitting(false);
    },

    setError(fieldId, message) {
        const slot = this.form.querySelector(`[data-error-for="${fieldId}"]`);
        if (!slot) return;
        slot.textContent = message;
        const group = slot.closest('.form-group');
        group.classList.toggle('has-error', Boolean(message));
        const field = document.getElementById(fieldId);
        if (field && field.matches('input, select')) field.setAttribute('aria-invalid', String(Boolean(message)));
    },

    // Returns true when valid; shows inline messages and focuses the first problem otherwise
    validate(data) {
        const errors = {};
        if (data.studentName.length < 3) errors.regName = 'أدخل اسمك الكامل';
        if (!/^(\+?964|0)?7\d{9}$/.test(data.studentPhone)) errors.regPhone = 'أدخل رقم هاتف عراقي صحيح، مثل 07XXXXXXXXX';
        if (data.studentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.studentEmail)) errors.regEmail = 'صيغة البريد الإلكتروني غير صحيحة';
        if (!data.governorate) errors.regGovernorate = 'اختر المحافظة';
        if (!data.educationLevel) errors.regEducationLevel = 'اختر التحصيل الدراسي';
        if (!data.currentJob) errors.regCurrentJob = 'اختر وضعك الحالي';

        ['regName', 'regPhone', 'regEmail', 'regGovernorate', 'regEducationLevel', 'regCurrentJob']
            .forEach(id => this.setError(id, errors[id] || ''));

        const first = Object.keys(errors)[0];
        if (first) {
            const el = document.getElementById(first);
            (el.matches('input, select') ? el : el.querySelector('input'))?.focus();
        }
        return !first;
    },

    setSubmitting(on) {
        const btn = document.getElementById('confirmRegisterBtn');
        btn.disabled = on;
        btn.classList.toggle('is-loading', on);
        btn.textContent = on ? 'جارٍ التسجيل…' : 'تأكيد التسجيل';
    },

    showDone(data) {
        document.getElementById('doneText').textContent =
            `سجّلناك في «${this.course.name}». سيتواصل معك فريق وظّفني قريباً على الرقم ${data.studentPhone}.`;
        this.showStep('done');
    },

    getRegisterData() {
        const phone = UtilsService.toLatinDigits(document.getElementById('regPhone')?.value || '').replace(/[\s-]/g, '');
        return {
            studentName: document.getElementById('regName')?.value.trim() || '',
            studentPhone: phone,
            studentEmail: document.getElementById('regEmail')?.value.trim() || '',
            governorate: document.getElementById('regGovernorate')?.value || '',
            educationLevel: document.getElementById('regEducationLevel')?.value || '',
            currentJob: this.form.querySelector('input[name="currentJob"]:checked')?.value || ''
        };
    }
};
