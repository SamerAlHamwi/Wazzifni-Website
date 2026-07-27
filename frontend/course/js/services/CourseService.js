const CourseService = {
    async getAllCourses(params) {
        const response = await ApiService.get('/courses', params);
        return response.data;
    },

    async getCourseBySlug(slug) {
        const response = await ApiService.get(`/courses/${slug}`);
        return response.data;
    },

    async createCourse(courseData) {
        const response = await ApiService.post('/courses', courseData);
        return response.data;
    },

    async updateCourse(id, courseData) {
        const response = await ApiService.patch(`/courses/${id}`, courseData);
        return response.data;
    },

    async deleteCourse(id) {
        return await ApiService.delete(`/courses/${id}`);
    },

    async markAsCompleted(id) {
        const response = await ApiService.patch(`/courses/${id}/complete`);
        return response.data;
    },

    async uploadCoverImage(id, formData) {
        // Need to use custom request for FormData
        const token = localStorage.getItem('token');
        const options = {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const response = await fetch(`${ApiService.BASE_URL}/courses/${id}/cover-image`, options);
        return await response.json();
    },

    async registerToCourse(courseId, registrationData) {
        const data = { ...registrationData, courseId };
        const response = await ApiService.post('/registrations/register', data);
        return response.data;
    }
};