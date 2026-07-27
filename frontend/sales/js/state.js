const POINT_VALUE = 500;
const API_URL = '/api/sales'; // Updated for merged system

let state = {
  reps: [],
  actions: [],
  reports: [],
  admins: [],
  currentAdmin: null
};

function getAuthHeaders() {
    let token = '';
    const storedAdmin = sessionStorage.getItem('adminUser');
    const storedRep = sessionStorage.getItem('repData');
    if (storedAdmin) {
        token = JSON.parse(storedAdmin).token;
    } else if (storedRep) {
        token = JSON.parse(storedRep).token;
    }

    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}

async function apiFetch(endpoint, options = {}) {
    options.headers = getAuthHeaders();
    const res = await fetch(`${API_URL}${endpoint}`, options);
    if (res.status === 401 || res.status === 403) {
        sessionStorage.removeItem('adminUser');
        sessionStorage.removeItem('isAdminLoggedIn');
        sessionStorage.removeItem('repData');
        window.location.reload();
    }
    return res;
}

async function loadState() {
  try {
    const fetchPromises = [];

    const storedAdmin = sessionStorage.getItem('adminUser');
    const storedRep = sessionStorage.getItem('repData');

    if (storedAdmin) {
        state.currentAdmin = JSON.parse(storedAdmin);
        fetchPromises.push(apiFetch(`/reps`));
        fetchPromises.push(apiFetch(`/actions`));
        fetchPromises.push(apiFetch(`/reports`));
        if (state.currentAdmin.isSuperAdmin) {
            fetchPromises.push(apiFetch(`/admins`));
        }
    } else if (storedRep) {
        fetchPromises.push(apiFetch(`/actions`));
        fetchPromises.push(apiFetch(`/reports`));
    } else {
        return false;
    }

    const responses = await Promise.all(fetchPromises);

    if (storedAdmin) {
        state.reps = await responses[0].json();
        state.actions = await responses[1].json();
        state.reports = await responses[2].json();
        if (state.currentAdmin.isSuperAdmin && responses[3]) {
            state.admins = await responses[3].json();
        }
    } else if (storedRep) {
        state.actions = await responses[0].json();
        state.reports = await responses[1].json();
    }

    return true;
  } catch (err) {
    console.error('Error loading state:', err);
    return false;
  }
}

// Keeping save for compatibility but it should be replaced by specific API calls
function save() {
  console.warn('save() is deprecated. Use specific API calls instead.');
}
