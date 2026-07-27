const UserService = {
    async getAllUsers(params = {}) {
        const response = await ApiService.get('/users', params);
        return response.data.users;
    },

    async getUser(id) {
        const response = await ApiService.get(`/users/${id}`);
        return response.data.user;
    },

    async createUser(data) {
        const response = await ApiService.post('/users', data);
        return response.data.user;
    },

    async updateUser(id, data) {
        const response = await ApiService.patch(`/users/${id}`, data);
        return response.data.user;
    },

    async deleteUser(id) {
        await ApiService.delete(`/users/${id}`);
    }
};