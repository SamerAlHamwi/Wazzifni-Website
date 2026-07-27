// api.js - API client for backend communication

const API_BASE = '/api/hr'; // Updated for merged system

const api = {
    async request(endpoint, options = {}) {
        const loader = document.getElementById('globalLoader');
        if (loader) loader.classList.add('show');

        try {
            const token = localStorage.getItem('wz_token');
            const headers = {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            };

            let url = `${API_BASE}${endpoint}`;
            if (options.params) {
                const params = new URLSearchParams();
                Object.keys(options.params).forEach(key => {
                    if (options.params[key] !== undefined && options.params[key] !== null) {
                        params.append(key, options.params[key]);
                    }
                });
                const queryString = params.toString();
                if (queryString) url += (url.includes('?') ? '&' : '?') + queryString;
            }

            const fetchOptions = {
                method: options.method || 'GET',
                headers,
                body: options.body ? JSON.stringify(options.body) : undefined
            };

            const response = await fetch(url, fetchOptions);

            if (response.status === 204) return null;

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'حدث خطأ ما');
            }

            // Map _id to id for frontend compatibility
            if (result.data) {
                const mapId = (obj) => {
                    if (obj && typeof obj === 'object') {
                        if (obj._id && !obj.id) obj.id = obj._id;
                        Object.values(obj).forEach(val => {
                            if (val && typeof val === 'object') mapId(val);
                        });
                    }
                };
                mapId(result.data);
            }

            return result;
        } catch (err) {
            console.error(`API Error [${endpoint}]:`, err);
            throw err;
        } finally {
            if (loader) loader.classList.remove('show');
        }
    },

    auth: {
        async login(username, password) {
            const res = await api.request('/auth/login', {
                method: 'POST',
                body: { username, password }
            });
            localStorage.setItem('wz_token', res.token);
            return res.data.user;
        },
        logout() {
            localStorage.removeItem('wz_token');
            sessionStorage.removeItem('wz2_cu');
        }
    },

    dashboard: {
        async get() {
            return await api.request('/dashboard');
        }
    },

    applicants: {
        async getAll(params = {}) {
            return await api.request('/applicants', { params });
        },
        async create(data) {
            const res = await api.request('/applicants', {
                method: 'POST',
                body: data
            });
            return res.data.applicant;
        },
        async update(id, data) {
            const res = await api.request(`/applicants/${id}`, {
                method: 'PATCH',
                body: data
            });
            return res.data.applicant;
        },
        async delete(id) {
            await api.request(`/applicants/${id}`, {
                method: 'DELETE'
            });
        }
    },

    companies: {
        async getAll(params = {}) {
            return await api.request('/companies', { params });
        },
        async create(data) {
            const res = await api.request('/companies', {
                method: 'POST',
                body: data
            });
            return res.data.company;
        },
        async update(id, data) {
            const res = await api.request(`/companies/${id}`, {
                method: 'PATCH',
                body: data
            });
            return res.data.company;
        },
        async delete(id) {
            await api.request(`/companies/${id}`, {
                method: 'DELETE'
            });
        }
    },

    payments: {
        async getAll(params = {}) {
            return await api.request('/payments', { params });
        },
        async create(data) {
            const res = await api.request('/payments', {
                method: 'POST',
                body: data
            });
            return res.data.payment;
        },
        async update(id, data) {
            const res = await api.request(`/payments/${id}`, {
                method: 'PATCH',
                body: data
            });
            return res.data.payment;
        },
        async delete(id) {
            await api.request(`/payments/${id}`, {
                method: 'DELETE'
            });
        }
    },

    users: {
        async getAll(params = {}) {
            return await api.request('/users', { params });
        },
        async create(data) {
            const res = await api.request('/users', {
                method: 'POST',
                body: data
            });
            return res.data.user;
        },
        async update(id, data) {
            const res = await api.request(`/users/${id}`, {
                method: 'PATCH',
                body: data
            });
            return res.data.user;
        },
        async delete(id) {
            await api.request(`/users/${id}`, {
                method: 'DELETE'
            });
        }
    },

    sms: {
        async send(recipient, message, apiKey) {
            return await api.request('/sms/send', {
                method: 'POST',
                body: { recipient, message, apiKey }
            });
        }
    }
};
