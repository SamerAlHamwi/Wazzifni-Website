const UtilsService = {
    // Escape text from the API before it goes into innerHTML
    escape(s) {
        return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    },

    // Arabic-Indic / Persian digits → ASCII, so ٠٧٨... is accepted in the phone field
    toLatinDigits(s) {
        return String(s ?? '').replace(/[٠-٩۰-۹]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)] ?? '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]);
    },

    // Dates and numbers follow the site language (js/i18n.js sets WZ_LANG)
    locale() {
        return window.WZ_LANG === 'en' ? 'en-GB' : 'ar-IQ';
    },

    formatDate(d) {
        if (!d) return '—';
        const date = new Date(d);
        return date.toLocaleDateString(UtilsService.locale(), {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    formatDateTime(d) {
        if (!d) return '—';
        const date = new Date(d);
        return date.toLocaleDateString(UtilsService.locale(), {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }) + ' ' + date.toLocaleTimeString(UtilsService.locale(), {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatPrice(p) {
        if (!p) return '—';
        return p.toLocaleString(UtilsService.locale()) + ' د.ع';
    },

    generateAvatar(name) {
        const initial = (name || '?').charAt(0);
        const colors = ['#2A2A2D', '#232431', '#1F2633', '#2A2533'];
        const color = colors[name?.charCodeAt(0) % colors.length] || '#2A2A2D';
        return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' rx='50' fill='${encodeURIComponent(color)}'/><text x='50' y='62' text-anchor='middle' font-size='40' font-family='IBM Plex Sans Arabic,Inter,sans-serif' fill='%23F5F6F8'>${encodeURIComponent(initial)}</text></svg>`;
    },

    showToast(msg, type = 'info', container) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    translate(value) {
        const dictionary = {
            // Governorates
            'Najaf': 'النجف',
            'Baghdad': 'بغداد',
            'Basra': 'البصرة',
            'Nineveh': 'نينوى',
            'Erbil': 'أربيل',
            'Sulaymaniyah': 'السليمانية',
            'Duhok': 'دهوك',
            'Kirkuk': 'كركوك',
            'Anbar': 'الأنبار',
            'Babil': 'بابل',
            'Karbala': 'كربلاء',
            'Qadisiyah': 'القادسية',
            'Wasit': 'واسط',
            'Salah Al-Din': 'صلاح الدين',
            'Diyala': 'ديالى',
            'Maysan': 'ميسان',
            'Muthanna': 'المثنى',
            'Dhi Qar': 'ذي قار',

            // Education Levels
            'No Formal Education': 'بدون شهادة',
            'Primary School': 'ابتدائي',
            'Middle School': 'متوسط',
            'High School': 'إعدادي',
            'Diploma': 'دبلوم',
            'Bachelor’s Degree': 'بكالوريوس',
            'Master’s Degree': 'ماجستير',
            'PhD': 'دكتوراه',

            // Job Status
            'Student': 'طالب',
            'Employee': 'موظف',
            'Unemployed': 'عاطل'
        };

        return dictionary[value] || value;
    }
};