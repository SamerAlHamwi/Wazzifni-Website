// ui.js - UI rendering functions

async function nav(name) {
    if (!G.cu) {
        document.getElementById('loginScreen').classList.remove('hidden');
        return;
    }
    if (name === 'payments' && !can('pay')) {
        showView('noaccess');
        return;
    }
    if (name === 'reports' && !can('rep')) {
        showView('noaccess');
        return;
    }
    if (name === 'admin' && !can('adm')) {
        showView('noaccess');
        return;
    }

    showView(name);
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const ni = document.querySelector(`[data-view="${name}"]`);
    if (ni) ni.classList.add('active');

    const renders = {
        dashboard: renderDashboard,
        applicants: renderApp,
        accepted: () => renderFlt('accepted'),
        rejected: () => renderFlt('rejected'),
        pending: () => renderFlt('pending'),
        payments: renderPay,
        companies: renderCo,
        reports: renderReports,
        alerts: renderAlerts,
        admin: renderAdmin,
        notifications: () => { updateSMSStatus(); renderSMSLog(); }
    };

    if (renders[name]) await renders[name]();
    updateBadges();
}

function showView(name) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const el = document.getElementById('v-' + name);
    if (el) el.classList.add('active');
}

function updateBadges() {
    if (!G.dashboard) return;
    const { stats } = G.dashboard;

    const setB = (id, v) => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = v > 0 ? '' : 'none';
            el.textContent = v;
        }
    };

    setB('nb-all', stats.totalApplicants);
    setB('nb-pay', stats.lateCount);
    setB('nb-alert', stats.lateCount);
}

// Dashboard
async function renderDashboard(data = null) {
    let dashboardData = data;
    if (!dashboardData) {
        const res = await api.dashboard.get();
        dashboardData = res.data;
        G.dashboard = dashboardData;
    }

    const { pipeline, stats, monthlyCommissions, recent } = dashboardData;

    const now = new Date();
    const dSub = document.getElementById('dSub');
    if (dSub) {
        dSub.textContent = now.toLocaleDateString('ar-IQ', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    // Pipeline
    const dPipe = document.getElementById('dPipe');
    if (dPipe) {
        dPipe.innerHTML = pipeline.map(p => `
            <div class="pipe-card pc-${p.status === 'إجمالي' ? 'total' : p.status === 'مقبول' ? 'accept' : p.status === 'مرفوض' ? 'reject' : 'review'}">
                <div class="pipe-num">${p.count}</div>
                <div class="pipe-lbl">${p.status === 'إجمالي' ? 'إجمالي المتقدمين' : p.status}</div>
            </div>`).join('');
    }

    // Stats
    const dStats = document.getElementById('dStats');
    if (dStats) {
        const diff = stats.paidPrevious > 0 ? Math.round((stats.paidCurrent - stats.paidPrevious) / stats.paidPrevious * 100) : 0;
        dStats.innerHTML = `
            <div class="stat s-bl"><div class="stat-bar"></div><div class="stat-ico">👥</div>
                <div class="stat-lbl">إجمالي المتقدمين</div><div class="stat-num">${stats.totalApplicants}</div>
                <div class="stat-foot">${stats.pending} قيد المراجعة</div></div>
            <div class="stat s-gr"><div class="stat-bar"></div><div class="stat-ico">✅</div>
                <div class="stat-lbl">المقبولون</div><div class="stat-num">${stats.accepted}</div>
                <div class="stat-foot">معدل ${stats.totalApplicants ? Math.round(stats.accepted / stats.totalApplicants * 100) : 0}% قبول</div></div>
            <div class="stat s-or"><div class="stat-bar"></div><div class="stat-ico">💰</div>
                <div class="stat-lbl">عمولات هذا الشهر</div><div class="stat-num">${(stats.paidCurrent / 1000).toFixed(0)}k</div>
                <div class="stat-foot">${diff >= 0 ? '▲' : '▼'} ${Math.abs(diff)}% عن الشهر الماضي</div></div>
            <div class="stat s-rd"><div class="stat-bar"></div><div class="stat-ico">⚠️</div>
                <div class="stat-lbl">متأخرون عن الدفع</div><div class="stat-num">${stats.lateCount}</div>
                <div class="stat-foot">${stats.lateCount > 0 ? 'يحتاج متابعة' : 'كل شيء منتظم'}</div></div>`;
    }

    // Status chart
    const cStatus = document.getElementById('cStatus');
    if (cStatus) {
        const total = stats.totalApplicants || 1;
        cStatus.innerHTML = [
            { l: 'مقبول', c: stats.accepted, cl: 'var(--green)' },
            { l: 'مرفوض', c: stats.rejected, cl: 'var(--red)' },
            { l: 'مراجعة', c: stats.pending, cl: 'var(--yellow)' }
        ].map(s => `
            <div class="mc-row">
                <div class="mc-lbl">${s.l}</div>
                <div class="mc-track"><div class="mc-fill" style="width:${Math.round(s.c / total * 100)}%;background:${s.cl}"></div></div>
                <div class="mc-val" style="color:${s.cl}">${s.c}</div>
            </div>`).join('');
    }

    // Bar chart
    const cBars = document.getElementById('cBars');
    if (cBars) {
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(d.toLocaleDateString('ar-IQ', { month: 'short' }));
        }
        const maxV = Math.max(...monthlyCommissions, 1);
        cBars.innerHTML = months.map((m, i) => `
            <div class="bc-col">
                <div class="bc-bar" style="height:${Math.round(monthlyCommissions[i] / maxV * 78) + 4}px;background:linear-gradient(180deg,var(--orange),var(--amber))" data-v="${fmtM(monthlyCommissions[i])}"></div>
                <div class="bc-lbl">${m}</div>
            </div>`).join('');
    }

    // Recent applicants
    const dRecent = document.getElementById('dRecent');
    if (dRecent) {
        dRecent.innerHTML = recent.map(r => `
                <tr>
                    <td><strong>${r.name}</strong><div style="font-size:.68rem;color:var(--tx3)">${r.address || ''}</div></td>
                    <td>${r.job || '—'}</td>
                    <td><span class="badge b-nv">${r.company || '—'}</span></td>
                    <td style="color:var(--tx2)">${fmtD(r.idate)}</td>
                    <td>${bSt(r.status)}</td>
                    <td>${bAl(r)}</td>
                </tr>`).join('') || emptyR(6);
    }
}

// Applicants
async function renderApp(p = null) {
    if (p === null) pg.all = 1;
    else pg.all = p;

    const q = document.querySelector('#v-applicants .sr-wrap input')?.value.trim() || '';
    const params = { page: pg.all, limit: PS, sort: '-createdAt' };
    if (q) params.name = q;

    const res = await api.applicants.getAll(params);
    G.app = res.data.applicants;
    G.meta.app = res.total;

    const table = document.getElementById('appTable');
    if (table) {
        table.innerHTML = G.app.map(r => `
            <tr>
                <td><strong>${r.name}</strong><div style="font-size:.68rem;color:var(--tx3)">${r.address || ''}</div></td>
                <td>${waLink(r.phone)}</td>
                <td>${r.job || '—'}</td>
                <td><span class="badge b-nv">${r.company || '—'}</span></td>
                <td>${fmtD(r.idate)}</td>
                <td>${fmtD(r.sdate)}</td>
                <td>${fmtM(r.deduct)}</td>
                <td>${bSe(r.send)}</td>
                <td>${bSt(r.status)}</td>
                <td><div class="cell-note" title="${r.notes || ''}">${r.notes || '—'}</div></td>
                <td>${actBtns(r.id, 'app')}</td>
            </tr>`).join('') || emptyR(11);
    }

    const pag = document.getElementById('appPag');
    if (pag) pag.innerHTML = paginate(G.meta.app, 'all', PS);
}

// Filtered views (Accepted, Rejected, Pending)
async function renderFlt(type, p = null) {
    if (p === null) pg[type] = 1;
    else pg[type] = p;

    const stMap = { accepted: 'مقبول', rejected: 'مرفوض', pending: 'قيد المراجعة' };
    const q = document.querySelector(`#v-${type} .sr-wrap input`)?.value.trim() || '';
    const params = { status: stMap[type], page: pg[type], limit: PS, sort: '-createdAt' };
    if (q) params.name = q;

    const res = await api.applicants.getAll(params);
    const list = res.data.applicants;
    const total = res.total;

    const tableId = type === 'accepted' ? 'accTable' : type === 'rejected' ? 'rejTable' : 'penTable';
    const pagId = type === 'accepted' ? 'accPag' : type === 'rejected' ? 'rejPag' : 'penPag';

    const table = document.getElementById(tableId);
    if (table) {
        if (type === 'accepted') {
            table.innerHTML = list.map(r => `
                <tr>
                    <td><strong>${r.name}</strong><div style="font-size:.68rem;color:var(--tx3)">${r.address || ''}</div></td>
                    <td>${waLink(r.phone)}</td>
                    <td>${r.job || '—'}</td>
                    <td><span class="badge b-nv">${r.company || '—'}</span></td>
                    <td>${fmtD(r.idate)}</td>
                    <td>${fmtD(r.sdate)}</td>
                    <td>${fmtM(r.deduct)}</td>
                    <td>${bAl(r)}</td>
                    <td><div class="cell-note" title="${r.notes || ''}">${r.notes || '—'}</div></td>
                    <td>${actBtns(r.id, 'app')}</td>
                </tr>`).join('') || emptyR(10);
        } else if (type === 'rejected') {
            table.innerHTML = list.map(r => `
                <tr>
                    <td><strong>${r.name}</strong><div style="font-size:.68rem;color:var(--tx3)">${r.address || ''}</div></td>
                    <td>${waLink(r.phone)}</td>
                    <td>${r.job || '—'}</td>
                    <td>${r.company || '—'}</td>
                    <td>${fmtD(r.idate)}</td>
                    <td>${bSt(r.status)}</td>
                    <td><div class="cell-note" title="${r.notes || ''}">${r.notes || '—'}</div></td>
                    <td>${actBtns(r.id, 'app')}</td>
                </tr>`).join('') || emptyR(8);
        } else {
            table.innerHTML = list.map(r => `
                <tr>
                    <td><strong>${r.name}</strong><div style="font-size:.68rem;color:var(--tx3)">${r.address || ''}</div></td>
                    <td>${waLink(r.phone)}</td>
                    <td>${r.job || '—'}</td>
                    <td>${r.company || '—'}</td>
                    <td>${fmtD(r.idate)}</td>
                    <td>${bSe(r.send)}</td>
                    <td><div class="cell-note" title="${r.notes || ''}">${r.notes || '—'}</div></td>
                    <td>${actBtns(r.id, 'app')}</td>
                </tr>`).join('') || emptyR(8);
        }
    }
    const pag = document.getElementById(pagId);
    if (pag) pag.innerHTML = paginate(total, type, PS);
}

// Payments
async function renderPay(p = null) {
    if (p === null) pg.pay = 1;
    else pg.pay = p;

    const q = document.querySelector('#v-payments .sr-wrap input')?.value.trim() || '';
    const st = document.getElementById('fPay')?.value;
    const params = { page: pg.pay, limit: PS, sort: '-createdAt' };
    if (q) params.empName = q;
    if (st) params.status = st;

    const res = await api.payments.getAll(params);
    G.pay = res.data.payments;
    G.meta.pay = res.total;

    const paidAmount = G.dashboard ? G.dashboard.stats.paidCurrent : 0;
    const lateCount = G.dashboard ? G.dashboard.stats.lateCount : 0;

    const pSum = document.getElementById('pSum');
    if (pSum) {
        pSum.innerHTML = `
            <div class="ps-item"><div class="ps-ico" style="background:rgba(0,119,182,.1);color:var(--blue)">📊</div>
                <div><div class="ps-n">${G.meta.pay}</div><div class="ps-l">إجمالي الدفعات</div></div></div>
            <div class="ps-item"><div class="ps-ico" style="background:rgba(10,153,112,.1);color:var(--green)">💰</div>
                <div><div class="ps-n">${(paidAmount / 1000).toFixed(0)}k</div><div class="ps-l">المبلغ المستلم (الشهر)</div></div></div>
            <div class="ps-item"><div class="ps-ico" style="background:rgba(214,40,40,.1);color:var(--red)">⚠️</div>
                <div><div class="ps-n">${lateCount}</div><div class="ps-l">دفعات متأخرة</div></div></div>`;
    }

    const table = document.getElementById('payTable');
    if (table) {
        table.innerHTML = G.pay.map(p => `
            <tr>
                <td><strong>${p.empName || '—'}</strong><div style="font-size:.68rem;color:var(--tx3)">${p.company || ''}</div></td>
                <td><strong>${fmtM(p.amount)}</strong></td>
                <td>${p.month || '—'}</td>
                <td>${fmtD(p.pdate)}</td>
                <td>${bPay(p.status)}</td>
                <td><div style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${p.note || ''}">${p.note || '—'}</div></td>
                <td>${actBtns(p.id, 'pay')}</td>
            </tr>`).join('') || emptyR(7);
    }

    const pag = document.getElementById('payPag');
    if (pag) pag.innerHTML = paginate(G.meta.pay, 'pay', PS);
}

// Companies
async function renderCo(p = null) {
    if (p === null) pg.co = 1;
    else pg.co = p;

    const q = document.querySelector('#v-companies .sr-wrap input')?.value.trim() || '';
    const params = { page: pg.co, limit: PS, sort: '-createdAt' };
    if (q) params.name = q;

    const res = await api.companies.getAll(params);
    G.co = res.data.companies;
    G.meta.co = res.total;

    const table = document.getElementById('coTable');
    if (table) {
        table.innerHTML = G.co.map(c => `
            <tr>
                <td><strong>${c.name}</strong></td>
                <td><span class="badge b-bl">${c.sector || 'عام'}</span></td>
                <td>${c.contact || '—'}</td>
                <td>${waLink(c.phone)}</td>
                <td>${c.addr || '—'}</td>
                <td>${actBtns(c.id, 'co')}</td>
            </tr>`).join('') || emptyR(6);
    }

    const pag = document.getElementById('coPag');
    if (pag) pag.innerHTML = paginate(G.meta.co, 'co', PS);
}

// Reports
async function renderReports(p = null) {
    if (p) pg.repApp = p;

    const dbRes = await api.dashboard.get();
    const { stats, monthlyCommissions } = dbRes.data;

    const rSum = document.getElementById('rSum');
    if (rSum) {
        rSum.innerHTML = `
            <div class="rs-c"><div class="rs-l">إجمالي المتقدمين</div><div class="rs-n">${stats.totalApplicants}</div></div>
            <div class="rs-c"><div class="rs-l">المقبولون</div><div class="rs-n" style="color:var(--green)">${stats.accepted}</div></div>
            <div class="rs-c"><div class="rs-l">المرفوضون</div><div class="rs-n" style="color:var(--red)">${stats.rejected}</div></div>
            <div class="rs-c"><div class="rs-l">أرباح الشهر</div><div class="rs-n" style="color:var(--orange)">${(stats.paidCurrent / 1000).toFixed(0)}k</div></div>`;
    }

    const rStatus = document.getElementById('rStatus');
    if (rStatus) {
        const tot = stats.totalApplicants || 1;
        rStatus.innerHTML = [
            { l: 'مقبول', c: stats.accepted, cl: 'var(--green)' },
            { l: 'مرفوض', c: stats.rejected, cl: 'var(--red)' },
            { l: 'قيد المراجعة', c: stats.pending, cl: 'var(--yellow)' }
        ].map(s => `
            <div class="mc-row">
                <div class="mc-lbl">${s.l}</div>
                <div class="mc-track"><div class="mc-fill" style="width:${Math.round(s.c / tot * 100)}%;background:${s.cl}"></div></div>
                <div class="mc-val">${s.c}</div>
            </div>`).join('');
    }

    const rBars = document.getElementById('rBars');
    if (rBars) {
        const now = new Date();
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(d.toLocaleDateString('ar-IQ', { month: 'short' }));
        }
        const maxV = Math.max(...monthlyCommissions, 1);
        rBars.innerHTML = months.map((m, i) => `
            <div class="bc-col">
                <div class="bc-bar" style="height:${Math.round(monthlyCommissions[i] / maxV * 100)}%;background:var(--blue)" data-tip="${fmtM(monthlyCommissions[i])}"></div>
                <div class="bc-lbl">${m}</div>
            </div>`).join('');
    }

    const appRes = await api.applicants.getAll({ page: pg.repApp, limit: PS, sort: '-createdAt' });
    const table = document.getElementById('rAppTable');
    if (table) {
        table.innerHTML = appRes.data.applicants.map(r => `
            <tr>
                <td><strong>${r.name}</strong></td>
                <td>${r.job || '—'}</td>
                <td><span class="badge b-nv">${r.company || '—'}</span></td>
                <td>
                    <div style="display:flex;align-items:center;gap:5px">
                        <span style="font-weight:800;color:var(--blue)">${r.scorecard?.total || 0}/25</span>
                        <div style="width:40px;height:4px;background:var(--surf2);border-radius:10px;overflow:hidden">
                            <div style="width:${(r.scorecard?.total || 0) / 25 * 100}%;height:100%;background:var(--blue)"></div>
                        </div>
                    </div>
                </td>
                <td>${bSt(r.status)}</td>
                <td>
                    <button class="btn btn-ghost btn-xs" onclick="previewScorecard('${r.id}')" title="عرض بطاقة التقييم">📋 عرض التقييم</button>
                </td>
            </tr>`).join('') || emptyR(6);
    }

    const repPag = document.getElementById('repAppPag');
    if (repPag) repPag.innerHTML = paginate(appRes.total, 'repApp', PS);
}

// Alerts
async function renderAlerts() {
    const res = await api.applicants.getAll({ status: 'مقبول', limit: 100, sort: '-sdate' });
    const list = res.data.applicants;

    const over = list.filter(r => r.sdate && calcDays(r.sdate) >= 25);
    const near = list.filter(r => r.sdate && calcDays(r.sdate) >= 18 && calcDays(r.sdate) < 25);

    const alBox = (list, cl) => {
        if (!list.length) return '<div class="empty" style="padding:1rem">لا توجد تنبيهات</div>';
        return `<div class="al-box">${list.map(r => `
            <div class="al-item">
                <div class="al-dot" style="background:${cl}"></div>
                <div style="flex:1"><strong>${r.name}</strong> — ${r.job || ''}</div>
                <div style="font-weight:700;color:${cl}">${calcDays(r.sdate)} يوم</div>
                <button class="btn btn-ghost btn-xs" onclick="openEdit('app', ${r.id})">✏️</button>
            </div>`).join('')}</div>`;
    };

    const alOver = document.getElementById('alOver');
    if (alOver) alOver.innerHTML = alBox(over, 'var(--red)');
    const alNear = document.getElementById('alNear');
    if (alNear) alNear.innerHTML = alBox(near, 'var(--orange)');
}

// Admin
async function renderAdmin(p = null) {
    if (p) {
        // Since Admin view has two paginations, we need to be careful.
        // But goPg passes the key, so we know which one to update.
        // Actually, renderAdmin is called for both 'user' and 'log' keys.
    }

    const uRes = await api.users.getAll({ page: pg.user, limit: PS });
    G.usr = uRes.data.users;

    const uGrid = document.getElementById('userGrid');
    if (uGrid) {
        uGrid.innerHTML = G.usr.map(u => `
            <div class="uc">
                <div class="uc-top">
                    <div class="uc-av" style="background:${u.color || '#0077b6'}">${u.name.charAt(0)}</div>
                    <div style="flex:1"><div class="uc-nm">${u.name}</div><div class="uc-un">@${u.username}</div></div>
                    <div class="uc-dot ${u.active ? 'on' : 'off'}"></div>
                </div>
                <div style="font-size:.73rem;font-weight:700;color:var(--tx2);margin-bottom:.5rem">المسمى: ${u.title || '—'}</div>
                <div class="pchips">
                    <div class="pchip ${u.perms.add ? 'on' : 'off'}">➕ إضافة</div>
                    <div class="pchip ${u.perms.edit ? 'on' : 'off'}">✏️ تعديل</div>
                    <div class="pchip ${u.perms.del ? 'on' : 'off'}">🗑️ حذف</div>
                    <div class="pchip ${u.perms.pay ? 'on' : 'off'}">💰 مالية</div>
                    <div class="pchip ${u.perms.rep ? 'on' : 'off'}">📈 تقارير</div>
                    <div class="pchip ${u.perms.adm ? 'on' : 'off'}">⚙️ إدارة</div>
                </div>
                <div style="display:flex;gap:5px;margin-top:.8rem">
                    <button class="btn btn-ghost btn-xs" style="flex:1" onclick="openEdit('user', ${u.id})">تعديل</button>
                    <button class="btn btn-danger btn-xs" onclick="askDel('user', ${u.id})">حذف</button>
                </div>
            </div>`).join('');
    }
    const uPag = document.getElementById('userPag');
    if (uPag) uPag.innerHTML = paginate(uRes.total, 'user', PS);

    const lRes = await api.request('/logs', { params: { page: pg.log, limit: PS, sort: '-time' } });
    const logs = lRes.data.logs;
    const lList = document.getElementById('logList');
    if (lList) {
        lList.innerHTML = logs.map(l => {
            const t = new Date(l.time).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
            return `
                <div class="log-item">
                    <div class="log-ic">${l.icon || '📝'}</div>
                    <div class="log-tx"><strong>${l.user}</strong> ${l.desc}</div>
                    <div class="log-tm">${t}</div>
                </div>`;
        }).join('') || '<div class="empty">لا يوجد نشاط مسجل</div>';
    }
    const lPag = document.getElementById('logPag');
    if (lPag) lPag.innerHTML = paginate(lRes.total, 'log', PS);
}
