const ApiService = {
    // Use the proxy defined in nginx.conf to avoid CORS issues
    BASE_URL: '/api-proxy/course',

    async request(endpoint, options = {}) {
        const url = `${this.BASE_URL}${endpoint}`;

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const token = localStorage.getItem('token');
        if (token) {
            defaultOptions.headers['Authorization'] = `Bearer ${token}`;
        }

        const mergedOptions = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, mergedOptions);

            // Handle 204 No Content
            if (response.status === 204) {
                return null;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error(`API Request Error [${endpoint}]:`, error);
            throw error;
        }
    },

    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    },

    async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    async patch(endpoint, body) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    },

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};
