// utils.js - Helper functions and constants

const COLS = ['#002848', '#0077b6', '#f77f00', '#2dc653', '#7b2d8b', '#ef233c', '#0096c7', '#e55b00'];

const RCOL = {
    admin: '#f77f00',
    editor: '#0077b6',
    viewer: '#8fa8c4'
};

const RLBL = {
    admin: '👑 مسؤول',
    editor: '✏️ محرر',
    viewer: '👁️ مشاهد'
};

const RPRESET = {
    admin: { add: true, edit: true, del: true, pay: true, rep: true, adm: true },
    editor: { add: true, edit: true, del: false, pay: true, rep: true, adm: false },
    viewer: { add: false, edit: false, del: false, pay: false, rep: true, adm: false }
};

// Avatar color
function avCol(i) {
    return COLS[i % COLS.length];
}

// Format date
function fmtD(d) {
    if (!d) return '—';
    try {
        const date = new Date(d);
        if (isNaN(date.getTime())) {
            // Try parsing YYYY-MM-DD
            const [y, m, day] = d.split('-');
            if (y && m && day) return `${day}/${m}/${y}`;
            return d;
        }
        return date.toLocaleDateString('ar-IQ');
    } catch (e) {
        return d;
    }
}

// Format money
function fmtM(n) {
    if (!n && n !== 0) return '—';
    return Number(n).toLocaleString() + ' د.ع';
}

// Calculate days since start date
function calcDays(sd) {
    if (!sd) return 0;
    return Math.max(0, Math.floor((new Date() - new Date(sd)) / 86400000));
}

// WhatsApp link
function waLink(p) {
    if (!p) return '—';
    const c = p.replace(/\D/g, '');
    return `<a href="https://wa.me/${c}" target="_blank" style="color:var(--sky);text-decoration:none;font-size:.77rem">📱 ${p}</a>`;
}

// Status badge
function bSt(s) {
    if (s === 'مقبول') return '<span class="badge b-gr">✅ مقبول</span>';
    if (s === 'مرفوض') return '<span class="badge b-rd">❌ مرفوض</span>';
    if (s === 'قيد المراجعة') return '<span class="badge b-yw">🔄 مراجعة</span>';
    return '<span class="badge b-gy">—</span>';
}

// Send status badge
function bSe(s) {
    return s === 'تم الإرسال'
        ? '<span class="badge b-bl">📤 تم</span>'
        : '<span class="badge b-gy">⏳ لم يتم</span>';
}

// Alert badge
function bAl(r) {
    if (!r.sdate) return '<span class="badge b-gy">—</span>';
    const d = calcDays(r.sdate);
    if (d >= 25) return '<span class="badge b-rd">🚨 تجاوز</span>';
    if (d >= 18) return '<span class="badge b-yw">🔔 قريب</span>';
    return '<span class="badge b-gr">✅ طبيعي</span>';
}

// Payment status badge
function bPay(s) {
    if (s === 'مدفوع') return '<span class="badge b-gr">✅ مدفوع</span>';
    if (s === 'متأخر') return '<span class="badge b-rd">⚠️ متأخر</span>';
    if (s === 'قريب') return '<span class="badge b-yw">🔔 مستحق</span>';
    return '<span class="badge b-gy">—</span>';
}

// Action buttons
function actBtns(id, type) {
    const e = can('edit')
        ? `<button class="btn btn-ghost btn-xs" onclick="openEdit('${type}', '${id}')">✏️</button>`
        : '';
    const d = can('del')
        ? `<button class="btn btn-danger btn-xs" onclick="askDel('${type}', '${id}')">🗑️</button>`
        : '';
    if (!e && !d) return '<span style="font-size:.68rem;color:var(--t3)">—</span>';
    return `<div style="display:flex;gap:4px">${e}${d}</div>`;
}

// Empty rows
function emptyR(n) {
    return `<tr><td colspan="${n}"><div class="empty"><div class="ei">🔍</div><p>لا توجد نتائج</p></div></td></tr>`;
}

// Server-side Pagination helper
function paginate(total, key, limit = 10) {
    if (!pg[key]) pg[key] = 1;
    const totalPg = Math.ceil(total / limit) || 1;

    if (pg[key] > totalPg) pg[key] = 1;

    let btns = '';
    let startPg = Math.max(1, pg[key] - 3);
    let endPg = Math.min(totalPg, startPg + 6);
    if (endPg - startPg < 6) startPg = Math.max(1, endPg - 6);

    for (let i = startPg; i <= endPg; i++) {
        btns += `<div class="pb ${i === pg[key] ? 'on' : ''}" onclick="goPg('${key}', ${i})">${i}</div>`;
    }

    const currentStart = (pg[key] - 1) * limit + 1;
    const currentEnd = Math.min(pg[key] * limit, total);

    return `<span>عرض ${total ? currentStart : 0}–${currentEnd} من ${total}</span><div class="pag-bs">${btns}</div>`;
}

// Go to page
function goPg(key, p) {
    pg[key] = p;
    const renders = {
        all: () => renderApp(p),
        accepted: () => renderFlt('accepted', p),
        rejected: () => renderFlt('rejected', p),
        pending: () => renderFlt('pending', p),
        pay: () => renderPay(p),
        co: () => renderCo(p),
        repApp: () => renderReports(p),
        user: () => renderAdmin(p),
        log: () => renderAdmin(p),
        smsLog: renderSMSLog
    };
    if (renders[key]) renders[key]();
}

// Check permission
function can(p) {
    return G.cu && G.cu.perms[p] === true;
}

// Toast notification
function toast(msg, type = 'ok') {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = `toast ${type} show`;
    setTimeout(() => el.classList.remove('show'), 3000);
}
