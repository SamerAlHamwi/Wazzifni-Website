// Project inquiries submitted from the IT Land landing page contact form.
const InquiryService = {
    async getAllInquiries(params) {
        const response = await ApiService.get('/inquiries', params);
        return response.data;
    },

    async updateStatus(id, statusData) {
        const response = await ApiService.patch(`/inquiries/${id}/status`, statusData);
        return response.data;
    },

    async deleteInquiry(id) {
        return await ApiService.delete(`/inquiries/${id}`);
    },

    async getStats(days = 30) {
        const response = await ApiService.get('/inquiries/stats', { days });
        return response.data;
    },

    /**
     * Downloads the CSV export.
     *
     * The endpoint is admin-only, so it cannot be reached with a plain
     * window.open() — the request has to carry the bearer token, which means
     * fetching the file and saving the blob by hand.
     */
    async exportCsv() {
        const response = await fetch(`${ApiService.BASE_URL}/inquiries/export`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) throw new Error('تعذر تصدير الطلبات');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'inquiries.csv';
        link.click();
        URL.revokeObjectURL(url);
    }
};
