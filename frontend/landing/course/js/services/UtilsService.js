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
    },

    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                textArea.remove();
                if (!successful) throw new Error('Copy failed');
                return true;
            }
        } catch (err) {
            console.error('Copy to clipboard failed:', err);
            throw err;
        }
    }
};