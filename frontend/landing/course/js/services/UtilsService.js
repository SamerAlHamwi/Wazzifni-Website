const UtilsService = {
    /** Dates, numbers and currency all follow the language currently on screen,
        so a page rendered in English does not mix Latin copy with Arabic-Indic
        digits. window.i18n is installed by js/i18n.js, the first script on the
        page; the fallback keeps this service usable on its own. */
    i18n() {
        return window.i18n || { locale: 'ar-IQ', t: (key) => key, value: (raw) => raw };
    },

    formatDate(d) {
        if (!d) return '—';
        const date = new Date(d);
        return date.toLocaleDateString(this.i18n().locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    formatDateTime(d) {
        if (!d) return '—';
        const date = new Date(d);
        const locale = this.i18n().locale;
        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }) + ' ' + date.toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatPrice(p) {
        if (!p) return '—';
        return p.toLocaleString(this.i18n().locale) + ' ' + this.i18n().t('currency.iqd');
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

    /**
     * Localises one of the English enum values the API stores (governorate,
     * education level, occupation). The mapping now lives in js/i18n.js so both
     * languages come from one table; unknown values pass through unchanged.
     */
    translate(value) {
        return this.i18n().value(value);
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