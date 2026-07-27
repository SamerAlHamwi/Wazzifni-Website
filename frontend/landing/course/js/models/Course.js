class Course {
    constructor(data = {}) {
        this.id = data._id || data.id || 'c' + Date.now();
        this.name = data.name || '';
        this.teacherName = data.instructorName || data.teacherName || '';
        this.startDate = data.startDate || '';
        this.totalSeats = data.totalSeats || 0;
        this.type = data.type || 'free';
        this.price = data.price || 0;
        this.desc = data.description || data.desc || '';
        this.teacherImg = data.instructorImage || data.teacherImg || '';
        this.registrations = data.registrations || [];
        this.slug = data.slug || '';
        this.status = data.status || 'open'; // open, completed
    }

    static fromJSON(json) {
        return new Course(json);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            instructorName: this.teacherName,
            startDate: this.startDate,
            totalSeats: this.totalSeats,
            type: this.type,
            price: this.price,
            description: this.desc,
            instructorImage: this.teacherImg,
            registrations: this.registrations,
            slug: this.slug,
            status: this.status
        };
    }

    getRegistrationCount() {
        return this.registrations ? this.registrations.length : 0;
    }

    getAvailableSeats() {
        return Math.max(0, this.totalSeats - this.getRegistrationCount());
    }

    isCompleted() {
        return this.status === 'completed';
    }

    isFree() {
        return this.type === 'free';
    }

    getSeatsPercentage() {
        if (this.totalSeats === 0) return 0;
        const count = this.getRegistrationCount();
        return Math.min(100, Math.round((count / this.totalSeats) * 100));
    }

    getSeatsStatusClass() {
        if (this.isCompleted()) return 'completed';
        const available = this.getAvailableSeats();
        if (available === 0) return 'danger';
        if (available <= 3) return 'warn';
        return 'ok';
    }

    getProgressClass() {
        if (this.isCompleted()) return 'completed';
        const available = this.getAvailableSeats();
        if (available === 0) return 'full';
        if (available <= 3) return 'warn';
        return 'ok';
    }

    getCourseTypeBadge() {
        if (this.type === 'free') {
            return '<span class="badge badge-free">مجانية</span>';
        }
        return `<span class="badge badge-paid">${UtilsService.formatPrice(this.price)}</span>`;
    }

    getStatusBadge() {
        if (this.isCompleted()) {
            return '<span class="badge badge-completed">🏁 منتهية</span>';
        }
        return '<span class="badge badge-open">🟢 متاحة</span>';
    }
}