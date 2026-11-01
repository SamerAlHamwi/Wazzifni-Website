class Course {
    constructor(data = {}) {
        this.id = data._id || data.id || 'c' + Date.now();
        this.name = data.name || '';
        this.teacherName = data.instructorName || data.instructor?.name || data.teacherName || '';
        this.startDate = data.startDate || '';
        this.totalSeats = Number(data.totalSeats) || 0;
        this.seatsLeft = data.seatsLeft !== undefined ? data.seatsLeft : this.totalSeats;
        this.type = data.type || 'free';
        this.price = data.price || 0;
        this.desc = data.description || data.desc || data.shortDescription || '';
        this.teacherImg = data.instructorImage || data.instructor?.avatar || data.teacherImg || '';
        this.registrations = data.registrations || [];
        this.slug = data.slug || '';
        this.shortDescription = data.shortDescription || '';
        this.category = data.category || '';
        this.level = data.level || '';
        this.syllabus = data.syllabus || [];
        this.learningOutcomes = data.learningOutcomes || [];
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
            seatsLeft: this.seatsLeft,
            type: this.type,
            price: this.price,
            description: this.desc,
            instructorImage: this.teacherImg,
            registrations: this.registrations,
            slug: this.slug
        };
    }

    isFull() {
        return this.seatsLeft === 0;
    }

    isFree() {
        return this.type === 'free';
    }

    getSeatsPercentage() {
        if (this.totalSeats === 0) return 0;
        return Math.round(((this.totalSeats - this.seatsLeft) / this.totalSeats) * 100);
    }

    getSeatsStatusClass() {
        if (this.seatsLeft === 0) return 'danger';
        if (this.seatsLeft <= 3) return 'warn';
        return 'ok';
    }

    getProgressClass() {
        if (this.seatsLeft === 0) return 'full';
        if (this.seatsLeft <= 3) return 'warn';
        return 'ok';
    }

    getCourseTypeBadge() {
        if (this.type === 'free') {
            return '<span class="badge badge-free">مجانية</span>';
        }
        return `<span class="badge badge-paid">${UtilsService.formatPrice(this.price)}</span>`;
    }

    getStatusBadge() {
        if (this.seatsLeft === 0) {
            return '<span class="badge badge-full">🔴 مكتملة</span>';
        }
        return '<span class="badge badge-open">🟢 متاحة</span>';
    }
}