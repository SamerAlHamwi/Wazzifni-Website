const RegistrationService = {
    async getAllRegistrations(params = {}) {
        try {
            const response = await ApiService.get('/registrations', params);
            return {
                registrations: response.data.registrations.map(r => ({
                    id: r._id,
                    _id: r._id, // Keep both for compatibility
                    name: r.studentName,
                    studentName: r.studentName,
                    phone: r.studentPhone,
                    studentPhone: r.studentPhone,
                    email: r.studentEmail,
                    studentEmail: r.studentEmail,
                    courseId: r.course,
                    course: r.course,
                    courseName: r.courseName,
                    courseType: r.courseType,
                    coursePrice: r.price,
                    status: r.status,
                    paymentStatus: r.paymentStatus,
                    date: r.registeredAt,
                    registeredAt: r.registeredAt,
                    governorate: r.governorate,
                    educationLevel: r.educationLevel,
                    currentJob: r.currentJob
                })),
                pagination: response.data.pagination
            };
        } catch (error) {
            console.error('RegistrationService.getAllRegistrations error:', error);
            throw error;
        }
    },

    async getStats(courseId = null, period = '30d') {
        try {
            const params = { period };
            if (courseId) params.courseId = courseId;
            const response = await ApiService.get('/registrations/stats', params);
            return response.data;
        } catch (error) {
            console.error('RegistrationService.getStats error:', error);
            throw error;
        }
    },

    async updateStatus(id, status) {
        try {
            const response = await ApiService.patch(`/registrations/${id}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('RegistrationService.updateStatus error:', error);
            throw error;
        }
    },

    async deleteRegistration(id) {
        try {
            // Truly delete the record from the database
            await ApiService.delete(`/registrations/${id}`);
            return true;
        } catch (error) {
            console.error('RegistrationService.deleteRegistration error:', error);
            throw error;
        }
    }
};