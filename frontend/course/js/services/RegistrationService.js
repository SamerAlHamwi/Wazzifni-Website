const RegistrationService = {
    async getAllRegistrations(params) {
        const response = await ApiService.get('/registrations', params);
        return response.data;
    },

    async updateStatus(id, statusData) {
        const response = await ApiService.patch(`/registrations/${id}/status`, statusData);
        return response.data;
    },

    async deleteRegistration(id) {
        return await ApiService.delete(`/registrations/${id}`);
    },

    async getStats(courseId = null, days = 30) {
        const params = { days };
        if (courseId) params.courseId = courseId;
        const response = await ApiService.get('/registrations/stats', params);
        return response.data;
    }
};