const CourseService = {
    async getAllCourses(params = {}) {
        try {
            const response = await ApiService.get('/courses', params);
            return {
                courses: response.data.courses.map(c => new Course(c)),
                pagination: response.data.pagination
            };
        } catch (error) {
            console.error('CourseService.getAllCourses error:', error);
            throw error;
        }
    },

    async getCourse(slug) {
        try {
            const response = await ApiService.get(`/courses/${slug}`);
            return new Course(response.data.course);
        } catch (error) {
            console.error('CourseService.getCourse error:', error);
            throw error;
        }
    },

    async createCourse(courseData) {
        try {
            const response = await ApiService.post('/courses', courseData);
            return new Course(response.data.course);
        } catch (error) {
            console.error('CourseService.createCourse error:', error);
            throw error;
        }
    },

    async updateCourse(id, courseData) {
        try {
            const response = await ApiService.put(`/courses/${id}`, courseData);
            return new Course(response.data.course);
        } catch (error) {
            console.error('CourseService.updateCourse error:', error);
            throw error;
        }
    },

    async deleteCourse(id) {
        try {
            await ApiService.delete(`/courses/${id}`);
            return true;
        } catch (error) {
            console.error('CourseService.deleteCourse error:', error);
            throw error;
        }
    },

    async registerToCourse(courseId, registrationData) {
        try {
            // Note: Registration endpoint path should match backend: /api/v1/registrations
            const response = await ApiService.post('/registrations', {
                courseId: courseId,
                ...registrationData
            });
            return response.data;
        } catch (error) {
            console.error('CourseService.registerToCourse error:', error);
            throw error;
        }
    }
};