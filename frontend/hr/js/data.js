// data.js - Data management and state

// Global state
const G = {
    app: [],
    co: [],
    pay: [],
    usr: [],
    log: [],
    cu: null,
    meta: {
        app: 0,
        co: 0,
        pay: 0,
        usr: 0,
        log: 0
    },
    dashboard: null
};

// Pagination state
const pg = {
    all: 1,
    accepted: 1,
    rejected: 1,
    pending: 1,
    pay: 1,
    co: 1,
    repApp: 1,
    user: 1,
    log: 1,
    smsLog: 1
};

const PS = 10; // Page size

// Edit state
let _eid = null;
let _etype = null;

// Initialize data
async function initData() {
    G.cu = JSON.parse(sessionStorage.getItem('wz2_cu') || 'null');
    G.log = JSON.parse(localStorage.getItem('wz2_log') || '[]');

    if (G.cu) {
        try {
            await loadAllData();
        } catch (e) {
            console.error('Failed to load initial data:', e);
        }
    }
}

// Load current view data from API
async function loadAllData() {
    try {
        // Load Dashboard stats (always needed for badges)
        const dbRes = await api.dashboard.get();
        G.dashboard = dbRes.data;
        updateBadges();

        // Refresh current active view (Avoid calling renderDashboard if already rendering it via nav)
        const activeView = document.querySelector('.view.active')?.id;
        if (activeView && activeView !== 'v-dashboard') {
            const renders = {
                'v-applicants': renderApp,
                'v-accepted': () => renderFlt('accepted'),
                'v-rejected': () => renderFlt('rejected'),
                'v-pending': () => renderFlt('pending'),
                'v-companies': renderCo,
                'v-payments': renderPay,
                'v-admin': renderAdmin,
                'v-reports': renderReports
            };
            if (renders[activeView]) await renders[activeView]();
        } else {
            // If on dashboard, render current stats
            renderDashboard(G.dashboard);
        }

    } catch (e) {
        console.error('API Error in loadAllData:', e);
    }
}

// Save Applicant to API
async function saveA() {
    const data = {
        name: document.getElementById('a-n').value.trim(),
        phone: document.getElementById('a-ph').value.trim(),
        address: document.getElementById('a-ad').value.trim(),
        job: document.getElementById('a-j').value.trim(),
        company: document.getElementById('a-co').value.trim(),
        idate: document.getElementById('a-id').value || null,
        send: document.getElementById('a-s').value,
        status: document.getElementById('a-st').value,
        deduct: Number(document.getElementById('a-d').value) || 0,
        sdate: document.getElementById('a-sd').value || null,
        notes: document.getElementById('a-no').value.trim(),
        scorecard: {
            fit: SC_DATA.fit,
            tech: SC_DATA.tech,
            comm: SC_DATA.comm,
            salary: SC_DATA.salary,
            risk: SC_DATA.risk,
            total: SC_DATA.total,
            decision: SC_DATA.decision,
            recruiterNotes: SC_DATA.notes,
            recruiterName: SC_DATA.recruiterName,
            recruiterDate: SC_DATA.recruiterDate
        }
    };

    if (!data.name) return toast('يرجى إدخال اسم المتقدم', 'err');

    try {
        if (_eid && _etype === 'app') {
            await api.applicants.update(_eid, data);
            toast('✅ تم تحديث بيانات المتقدم', 'ok');
        } else {
            await api.applicants.create(data);
            toast('✅ تم إضافة المتقدم بنجاح', 'ok');
            if (typeof notifyApplicantAdded === 'function') {
                notifyApplicantAdded(data.name, data.job);
            }
        }

        closeModal('aModal');
        await loadAllData();
        _eid = null; _etype = null;
    } catch (e) {
        toast(e.message, 'err');
    }
}

// Save Company to API
async function saveC() {
    const data = {
        name: document.getElementById('c-n').value.trim(),
        sector: document.getElementById('c-s').value.trim(),
        contact: document.getElementById('c-c').value.trim(),
        phone: document.getElementById('c-p').value.trim(),
        addr: document.getElementById('c-a').value.trim(),
        note: document.getElementById('c-no').value.trim()
    };

    if (!data.name) return toast('يرجى إدخال اسم الشركة', 'err');

    try {
        if (_eid && _etype === 'co') {
            await api.companies.update(_eid, data);
            toast('✅ تم تحديث بيانات الشركة', 'ok');
        } else {
            await api.companies.create(data);
            toast('✅ تم إضافة الشركة بنجاح', 'ok');
        }

        closeModal('cModal');
        await loadAllData();
        _eid = null; _etype = null;
    } catch (e) {
        toast(e.message, 'err');
    }
}

// Save Payment to API
async function saveP() {
    const empSelect = document.getElementById('p-e');
    const empId = empSelect.value;

    const data = {
        empId,
        amount: Number(document.getElementById('p-a').value),
        month: document.getElementById('p-m').value,
        pdate: document.getElementById('p-dt').value || null,
        status: document.getElementById('p-st').value,
        note: document.getElementById('p-no').value.trim()
    };

    if (!data.empId || !data.amount) return toast('يرجى إكمال البيانات المطلوبة', 'err');

    try {
        if (_eid && _etype === 'pay') {
            await api.payments.update(_eid, data);
            toast('✅ تم تحديث بيانات الدفعة', 'ok');
        } else {
            await api.payments.create(data);
            toast('✅ تم تسجيل الدفعة بنجاح', 'ok');
            const empName = empSelect.options[empSelect.selectedIndex]?.text;
            if (typeof notifyPaymentAdded === 'function') {
                notifyPaymentAdded(empName, data.amount, data.month);
            }
        }

        closeModal('pModal');
        await loadAllData();
        _eid = null; _etype = null;
    } catch (e) {
        toast(e.message, 'err');
    }
}

// Save User to API
async function saveU() {
    const data = {
        name: document.getElementById('u-n').value.trim(),
        username: document.getElementById('u-u').value.trim(),
        password: document.getElementById('u-p').value,
        title: document.getElementById('u-t').value.trim(),
        active: document.getElementById('u-a').value === 'true',
        perms: {
            add: document.getElementById('p-add').checked,
            edit: document.getElementById('p-edit').checked,
            del: document.getElementById('p-del').checked,
            pay: document.getElementById('p-pay').checked,
            rep: document.getElementById('p-rep').checked,
            adm: document.getElementById('p-adm').checked
        }
    };

    if (!data.name || !data.username) return toast('يرجى إدخال الاسم واسم المستخدم', 'err');
    if (!_eid && !data.password) return toast('يرجى إدخال كلمة المرور للمستخدم الجديد', 'err');

    try {
        if (_eid && _etype === 'user') {
            if (!data.password) delete data.password;
            await api.users.update(_eid, data);
            toast('✅ تم تحديث بيانات المستخدم', 'ok');
        } else {
            await api.users.create(data);
            toast('✅ تم إضافة المستخدم بنجاح', 'ok');
        }

        closeModal('uModal');
        await loadAllData();
        _eid = null; _etype = null;
    } catch (e) {
        toast(e.message, 'err');
    }
}

// Delete functions
function askDel(type, id) {
    _eid = id;
    _etype = type;
    document.getElementById('cfModal').classList.add('open');
}

async function doDel() {
    try {
        if (_etype === 'app') await api.applicants.delete(_eid);
        else if (_etype === 'co') await api.companies.delete(_eid);
        else if (_etype === 'pay') await api.payments.delete(_eid);
        else if (_etype === 'user') await api.users.delete(_eid);

        toast('🗑️ تم الحذف بنجاح', 'ok');
        await loadAllData();
        closeModal('cfModal');
        _eid = null; _etype = null;
    } catch (e) {
        toast(e.message, 'err');
    }
}

// Helper to open edit
async function openEdit(type, id) {
    _eid = id;
    _etype = type;

    try {
        if (type === 'app') {
            const res = await api.request(`/applicants/${id}`);
            const r = res.data.applicant;

            document.getElementById('aMdlTitle').textContent = 'تعديل بيانات المتقدم';
            document.getElementById('a-n').value = r.name || '';
            document.getElementById('a-ph').value = r.phone || '';
            document.getElementById('a-ad').value = r.address || '';
            document.getElementById('a-j').value = r.job || '';
            document.getElementById('a-co').value = r.company || '';
            document.getElementById('a-id').value = r.idate ? new Date(r.idate).toISOString().split('T')[0] : '';
            document.getElementById('a-s').value = r.send || '';
            document.getElementById('a-st').value = r.status || '';
            document.getElementById('a-d').value = r.deduct || 0;
            document.getElementById('a-sd').value = r.sdate ? new Date(r.sdate).toISOString().split('T')[0] : '';
            document.getElementById('a-no').value = r.notes || '';

            loadScorecard(r.scorecard);
            switchTab('info');
            openModal('aModal');
        } else if (type === 'co') {
            const res = await api.request(`/companies/${id}`);
            const r = res.data.company;

            document.getElementById('cMdlTitle').textContent = 'تعديل بيانات الشركة';
            document.getElementById('c-n').value = r.name || '';
            document.getElementById('c-s').value = r.sector || '';
            document.getElementById('c-c').value = r.contact || '';
            document.getElementById('c-p').value = r.phone || '';
            document.getElementById('c-a').value = r.addr || '';
            document.getElementById('c-no').value = r.note || '';

            openModal('cModal');
        } else if (type === 'pay') {
            const res = await api.request(`/payments/${id}`);
            const r = res.data.payment;
            openPayModal(r);
        } else if (type === 'user') {
            const u = G.usr.find(x => x.id === id);
            if (!u) return;

            document.getElementById('uMdlTitle').textContent = 'تعديل بيانات المستخدم';
            document.getElementById('u-n').value = u.name || '';
            document.getElementById('u-u').value = u.username || '';
            document.getElementById('u-p').value = '';
            document.getElementById('u-t').value = u.title || '';
            document.getElementById('u-a').value = u.active.toString();

            document.getElementById('p-add').checked = u.perms.add;
            document.getElementById('p-edit').checked = u.perms.edit;
            document.getElementById('p-del').checked = u.perms.del;
            document.getElementById('p-pay').checked = u.perms.pay;
            document.getElementById('p-rep').checked = u.perms.rep;
            document.getElementById('p-adm').checked = u.perms.adm;

            openModal('uModal');
        }
    } catch (err) {
        toast('فشل تحميل البيانات', 'err');
    }
}

function applyRole(role) {
    const perms = RPRESET[role];
    if (!perms) return;

    document.getElementById('p-add').checked = perms.add;
    document.getElementById('p-edit').checked = perms.edit;
    document.getElementById('p-del').checked = perms.del;
    document.getElementById('p-pay').checked = perms.pay;
    document.getElementById('p-rep').checked = perms.rep;
    document.getElementById('p-adm').checked = perms.adm;
}

function saveData() {
    localStorage.setItem('wz2_log', JSON.stringify(G.log));
}
