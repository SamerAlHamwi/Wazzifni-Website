const StorageService = {
    STORAGE_KEY: 'academy_courses_v2',

    save(courses) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(courses));
            return true;
        } catch (e) {
            console.error('Storage save failed:', e);
            return false;
        }
    },

    load() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                const courses = JSON.parse(data);
                return courses.map(c => new Course(c));
            }
        } catch (e) {
            console.error('Storage load failed:', e);
        }
        return [];
    },

    clear() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (e) {
            console.error('Storage clear failed:', e);
            return false;
        }
    }
};