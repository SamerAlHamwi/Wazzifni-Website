class Course {
    constructor(data) {
        this.id = data._id || data.id;
        this.name = data.name;
        this.desc = data.description || data.desc;
        this.teacherName = data.instructorName || data.teacherName;
        this.teacherImg = data.instructorImage || data.teacherImg;
        this.startDate = data.startDate;
        this.totalSeats = data.totalSeats || data.seats;
        this.status = data.status || 'active';
        this.type = data.type || 'free';
        this.price = data.price || 0;
        this.isPublished = data.isPublished;
        this.isFeatured = data.isFeatured;
        this.registrationsCount = data.registrationsCount || 0;
        this.rating = data.rating || 0;
        this.views = data.views || 0;
    }

    getStatusBadge() {
        if (this.status === 'completed') return '<span class="badge red">منتهية 🏁</span>';
        if (this.status === 'draft') return '<span class="badge gray">مسودة 📝</span>';
        return '<span class="badge green">متاحة ✅</span>';
    }

    getCourseTypeBadge() {
        if (this.type === 'free') return '<span class="badge-type free">مجانية 🟢</span>';
        return `<span class="badge-type paid">مدفوعة 💰 (${this.price} د.ع)</span>`;
    }
}
