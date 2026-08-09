const UtilsService = {
    formatDate(d) {
        if (!d) return '—';
        const date = new Date(d);
        return date.toLocaleDateString('ar-IQ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    formatDateTime(d) {
        if (!d) return '—';
        const date = new Date(d);
        return date.toLocaleDateString('ar-IQ', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }) + ' ' + date.toLocaleTimeString('ar-IQ', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatPrice(p) {
        if (!p) return '—';
        return p.toLocaleString('ar-IQ') + ' د.ع';
    },

    generateAvatar(name) {
        const initial = (name || '?').charAt(0);
        const colors = ['#0087C6', '#F68A29', '#00c896', '#00B6E7', '#FFB43C', '#002F58'];
        const color = colors[name?.charCodeAt(0) % colors.length] || '#0087C6';
        return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' rx='50' fill='${encodeURIComponent(color)}'/><text x='50' y='62' text-anchor='middle' font-size='40' font-family='Cairo,sans-serif' fill='white'>${encodeURIComponent(initial)}</text></svg>`;
    },

    showToast(msg, type = 'info', container) {
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    },

    /**
     * Escapes text before it goes into an innerHTML template.
     *
     * Required for anything typed by the public (landing-page inquiries): those
     * rows are not written by a logged-in admin, so their text must never be
     * able to bring markup into the dashboard with it.
     */
    escapeHtml(value) {
        if (value === null || value === undefined) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
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

    translate(key) {
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

            // Jobs
            'Student': 'طالب',
            'Employee': 'موظف',
            'Unemployed': 'عاطل',

            // Roles
            'admin': 'مدير',
            'editor': 'محرر',
            'viewer': 'مشاهد'
        };
        return dictionary[key] || key;
    }
};