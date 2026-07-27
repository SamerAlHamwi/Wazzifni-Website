// app.js - Main application initialization and event handlers

// Scorecard state for the current editing applicant
let SC_DATA = {
    fit: 0, tech: 0, comm: 0, salary: 0, risk: 0,
    decision: '', notes: '', recruiterName: '', recruiterDate: ''
};

// Initialize the app
document.addEventListener('DOMContentLoaded', async function() {
    // Initial UI setup (static stuff)
    const tbDate = document.getElementById('tbDate');
    if (tbDate) {
        tbDate.textContent = new Date().toLocaleDateString('ar-IQ', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    // Load data from API or LocalStorage
    await initData();

    // Check if user is logged in
    if (G.cu) {
        const loginScreen = document.getElementById('loginScreen');
        if (loginScreen) loginScreen.classList.add('hidden');
        applyUI();
        nav('dashboard');
        setTimeout(() => checkAndNotifyOnLogin(), 2500);
    }

    // Setup event listeners
    setupEventListeners();
    initScorecardEvents();
});

function setupEventListeners() {
    // Helper to add event listener safely
    const on = (id, event, handler) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener(event, handler);
        return el;
    };

    // Login
    on('loginBtn', 'click', doLogin);
    on('li-p', 'keydown', e => {
        if (e.key === 'Enter') doLogin();
    });
    on('li-u', 'keydown', e => {
        if (e.key === 'Enter') {
            const p = document.getElementById('li-p');
            if (p) p.focus();
        }
    });
    on('fillDefaultBtn', 'click', () => {
        const u = document.getElementById('li-u');
        const p = document.getElementById('li-p');
        if (u) u.value = 'admin';
        if (p) p.value = 'admin123';
    });

    // Logout
    on('logoutBtn', 'click', doLogout);

    // Sidebar toggle
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (menuBtn && sidebar && sidebarOverlay) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            sidebarOverlay.classList.toggle('show');
        });
    }

    if (sidebarOverlay && sidebar) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('show');
        });
    }

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            if (view) {
                nav(view);
                // Close sidebar on mobile after clicking
                if (window.innerWidth <= 900 && sidebar && sidebarOverlay) {
                    sidebar.classList.remove('open');
                    sidebarOverlay.classList.remove('show');
                }
            }
        });
    });

    // Export/Import
    on('exportBtn', 'click', exportData);
    on('importFile', 'change', importData);

    // Modal close buttons
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-close');
            const modal = document.getElementById(modalId);
            if (modal) modal.classList.remove('open');
        });
    });

    // Overlay click to close
    document.querySelectorAll('.overlay').forEach(o => {
        o.addEventListener('click', e => {
            if (e.target === o) o.classList.remove('open');
        });
    });

    // Global search shortcut
    document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (G.cu) openGSearch();
        }
        if (e.key === 'Escape') {
            document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
        }
    });

    // Modal save buttons
    on('saveApplicantBtn', 'click', saveA);
    on('saveCompanyBtn', 'click', saveC);
    on('savePaymentBtn', 'click', saveP);
    on('saveUserBtn', 'click', saveU);

    // Phone number enforcement for applicants
    const phInput = document.getElementById('a-ph');
    if (phInput) {
        phInput.addEventListener('input', function(e) {
            let val = e.target.value;
            if (!val.startsWith('964')) {
                if (val.startsWith('0')) {
                    e.target.value = '964' + val.substring(1);
                } else if (val.length < 3) {
                    e.target.value = '964';
                } else {
                    e.target.value = '964' + val.replace(/^964/, '');
                }
            }
        });
        phInput.addEventListener('keydown', function(e) {
            if (e.target.selectionStart < 3 && (e.key === 'Backspace' || e.key === 'Delete')) {
                e.preventDefault();
            }
        });
    }

    // Confirm button for delete
    on('cfBtn', 'click', doDel);

    // Role buttons
    document.querySelectorAll('[data-role]').forEach(btn => {
        btn.addEventListener('click', function() {
            const role = this.getAttribute('data-role');
            if (typeof applyRole === 'function') applyRole(role);
        });
    });
}

function openGSearch() {
    const modal = document.getElementById('gsModal');
    const input = document.getElementById('gsInput');
    const res = document.getElementById('gsResults');
    if (modal) modal.classList.add('open');
    if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 100);
    }
    if (res) res.innerHTML = '';
}

function runGSearch() {
    const input = document.getElementById('gsInput');
    const res = document.getElementById('gsResults');
    if (!input || !res) return;

    const q = input.value.toLowerCase().trim();

    if (!q) {
        res.innerHTML = '<div class="empty"><div class="ei">🔍</div><p>اكتب للبحث...</p></div>';
        return;
    }

    const results = [];

    if (G.app) {
        G.app.filter(r => (r.name + (r.job || '') + (r.phone || '') + (r.company || '')).toLowerCase().includes(q))
            .slice(0, 5)
            .forEach(r => results.push({
                type: 'متقدم',
                name: r.name,
                detail: `${r.job || ''} — ${r.company || ''}`,
                action: () => { closeModal('gsModal'); nav('applicants'); }
            }));
    }

    if (G.co) {
        G.co.filter(r => (r.name + (r.sector || '')).toLowerCase().includes(q))
            .slice(0, 3)
            .forEach(r => results.push({
                type: 'شركة',
                name: r.name,
                detail: `${r.sector || ''} — ${r.contact || ''}`,
                action: () => { closeModal('gsModal'); nav('companies'); }
            }));
    }

    if (G.pay) {
        G.pay.filter(r => (r.empName || '').toLowerCase().includes(q))
            .slice(0, 3)
            .forEach(r => results.push({
                type: 'دفعة',
                name: r.empName,
                detail: `${fmtM(r.amount)} — ${r.month || ''}`,
                action: () => { closeModal('gsModal'); nav('payments'); }
            }));
    }

    if (!results.length) {
        res.innerHTML = `<div class="empty"><div class="ei">😕</div><p>لا توجد نتائج لـ "${q}"</p></div>`;
        return;
    }

    res.innerHTML = results.map((r, i) => `
        <div class="gs-item" onclick="gsAction(${i})">
            <span class="badge b-${r.type === 'متقدم' ? 'gr' : r.type === 'شركة' ? 'nv' : 'or'}">${r.type}</span>
            <div>
                <div class="gs-name">${r.name}</div>
                <div class="gs-detail">${r.detail}</div>
            </div>
        </div>`).join('');

    res._results = results;
}

function gsAction(i) {
    const res = document.getElementById('gsResults');
    if (res && res._results && res._results[i]) {
        res._results[i].action();
    }
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
}

function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
}

function openAddApp() {
    _eid = null; _etype = 'app';
    const modal = document.getElementById('aModal');
    if (modal) {
        document.getElementById('aMdlTitle').textContent = 'إضافة متقدم جديد';
        modal.querySelectorAll('input, select, textarea').forEach(i => {
            if (i.id === 'a-ph') i.value = '964';
            else if (i.type === 'checkbox') i.checked = false;
            else i.value = '';
        });
        resetScorecard();
        switchTab('info');
    }
    openModal('aModal');
}

function openAddCo() {
    _eid = null; _etype = 'co';
    const modal = document.getElementById('cModal');
    if (modal) {
        document.getElementById('cMdlTitle').textContent = 'إضافة شركة جديدة';
        modal.querySelectorAll('input, select').forEach(i => i.value = '');
    }
    openModal('cModal');
}

function openAddUser() {
    _eid = null; _etype = 'user';
    const modal = document.getElementById('uModal');
    if (modal) {
        document.getElementById('uMdlTitle').textContent = 'إضافة مستخدم جديد';
        modal.querySelectorAll('input, select').forEach(i => {
            if (i.type === 'checkbox') i.checked = false;
            else if (i.id === 'u-a') i.value = 'true';
            else i.value = '';
        });
    }
    openModal('uModal');
}

function exportData() {
    const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        applicants: G.app || [],
        companies: G.co || [],
        payments: G.pay || [],
        users: G.usr || []
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = 'wazzfni-backup-' + date + '.json';
    a.click();
    URL.revokeObjectURL(url);
    toast('💾 تم تصدير البيانات بنجاح', 'ok');
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(ev) {
        try {
            const backup = JSON.parse(ev.target.result);
            if (!backup.applicants || !backup.companies) {
                toast('الملف غير صالح', 'err');
                return;
            }
            if (!confirm('سيتم استبدال جميع البيانات الحالية. هل أنت متأكد؟')) return;

            G.app = backup.applicants || [];
            G.co = backup.companies || [];
            G.pay = backup.payments || [];
            saveData();
            toast('✅ تم استيراد البيانات بنجاح', 'ok');
            nav('dashboard');
        } catch (err) {
            toast('فشل قراءة الملف', 'err');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

// TAB SWITCHING
function switchTab(tab) {
    const infoBtn = document.getElementById('tab-info');
    const scBtn = document.getElementById('tab-sc');
    const infoDiv = document.getElementById('tabInfo');
    const scDiv = document.getElementById('tabSC');

    if (tab === 'info') {
        infoBtn.style.color = 'var(--blue)';
        infoBtn.style.borderBottomColor = 'var(--blue)';
        scBtn.style.color = 'var(--tx2)';
        scBtn.style.borderBottomColor = 'transparent';
        infoDiv.style.display = 'block';
        scDiv.style.display = 'none';
    } else {
        scBtn.style.color = 'var(--blue)';
        scBtn.style.borderBottomColor = 'var(--blue)';
        infoBtn.style.color = 'var(--tx2)';
        infoBtn.style.borderBottomColor = 'transparent';
        scDiv.style.display = 'block';
        infoDiv.style.display = 'none';
    }
}

// SCORECARD LOGIC
function initScorecardEvents() {
    // Score chips
    document.querySelectorAll('.chips').forEach(container => {
        const sec = container.getAttribute('data-sec');
        container.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', function() {
                container.querySelectorAll('.chip').forEach(c => c.classList.remove('on'));
                this.classList.add('on');
                const val = parseInt(this.getAttribute('data-v'));
                updateScore(sec, val);
            });
        });
    });

    // Decisions
    document.querySelectorAll('.dec-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.dec-item').forEach(i => i.classList.remove('on'));
            this.classList.add('on');
            SC_DATA.decision = this.getAttribute('data-dec');
        });
    });

    // Notes
    const ta = document.getElementById('sc2-ntx');
    if (ta) {
        ta.addEventListener('input', function() {
            document.getElementById('sc2-nc').textContent = `${this.value.length} / 500`;
            SC_DATA.notes = this.value;
        });
    }

    // Recruiter Info
    document.getElementById('sc2-rn').addEventListener('input', e => SC_DATA.recruiterName = e.target.value);
    document.getElementById('sc2-dtf').addEventListener('input', e => SC_DATA.recruiterDate = e.target.value);
}

function updateScore(sec, val) {
    const keys = ['', 'fit', 'tech', 'comm', 'salary', 'risk'];
    SC_DATA[keys[sec]] = val;

    const secEl = document.getElementById(`sc2-s${sec}`);
    if (secEl) secEl.classList.add('done');

    // Update stars/label
    const labelMap = {
        1: ['غير مناسب', 'ضعيفة', 'ضعيفة', 'غير متوافق', 'خطر مرتفع'],
        2: ['محدود', 'محدودة', 'محدودة', 'ضعيف', 'مرتفع'],
        3: ['مقبول', 'مقبولة', 'مقبولة', 'مقبول', 'متوسط'],
        4: ['جيد', 'جيدة', 'جيدة', 'جيد', 'منخفض'],
        5: ['مطابق', 'ممتازة', 'ممتازة', 'متوافق', 'منخفض جداً']
    };

    const sv = document.getElementById(`sc2-sv${sec}`);
    const st = document.getElementById(`sc2-st${sec}`);
    if (sv) sv.textContent = val + '/5 · ' + labelMap[val][sec - 1];
    if (st) renderStars(val, st);

    calculateTotal();
}

function renderStars(v, el) {
    el.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const s = document.createElement('span');
        s.className = 'ssb-star';
        s.textContent = i <= v ? '★' : '☆';
        s.style.color = i <= v ? '#f47b20' : '#c8d9f5';
        s.style.transition = 'transform .2s';
        el.appendChild(s);
    }
    el.querySelectorAll('.ssb-star').forEach((s, i) => {
        if (i < v) setTimeout(() => {
            s.style.transform = 'scale(1.35)';
            setTimeout(() => s.style.transform = 'scale(1)', 130);
        }, i * 55);
    });
}

function calculateTotal() {
    const total = SC_DATA.fit + SC_DATA.tech + SC_DATA.comm + SC_DATA.salary + SC_DATA.risk;
    SC_DATA.total = total;

    const numEl = document.getElementById('totNum');
    const stEl = document.getElementById('totStatus');
    const tmf = document.getElementById('sc2-tmf');
    const ttf = document.getElementById('sc2-ttf');
    const dcEl = document.getElementById('sc2-dc');
    const pbf = document.getElementById('sc2-pbf');

    if (numEl) numEl.textContent = total;

    // Progress bar and steps
    const doneCount = [SC_DATA.fit, SC_DATA.tech, SC_DATA.comm, SC_DATA.salary, SC_DATA.risk].filter(x => x > 0).length;
    if (dcEl) dcEl.textContent = doneCount;
    if (pbf) pbf.style.width = (doneCount / 5 * 100) + '%';
    if (ttf) ttf.style.width = (total / 25 * 100) + '%';
    if (tmf) tmf.style.width = (total / 25 * 100) + '%';

    // Update steps
    let nxt = 6;
    for (let i = 1; i <= 5; i++) if (![SC_DATA.fit, SC_DATA.tech, SC_DATA.comm, SC_DATA.salary, SC_DATA.risk][i-1]) { nxt = i; break; }

    for (let i = 1; i <= 5; i++) {
        const ps = document.getElementById(`sc2-ps${i}`);
        const pl = document.getElementById(`sc2-pl${i}`);
        const ok = [SC_DATA.fit, SC_DATA.tech, SC_DATA.comm, SC_DATA.salary, SC_DATA.risk][i-1] > 0;
        if (ps) {
            ps.className = 'ps' + (ok ? ' done' : i === nxt ? ' active' : '');
            ps.textContent = ok ? '✓' : i;
        }
        if (pl) pl.style.width = ok ? '100%' : '0%';
    }

    // Status & Highlight
    document.querySelectorAll('.vp').forEach(v => v.classList.remove('on'));
    let status = 'أكمل جميع معايير التقييم للحصول على النتيجة';
    let vpId = '';

    const card = document.getElementById('totCard');
    if (card) card.classList.toggle('live', total > 0);

    if (doneCount === 5) {
        if (total <= 10) {
            status = '<strong style="color:var(--re)">⛔ غير مناسب</strong> — لا يستوفي متطلبات الوظيفة';
            vpId = 'sc2-vp1';
        } else if (total <= 15) {
            status = '<strong style="color:var(--ye)">🔶 قابل للمراجعة</strong> — يحتاج تقييماً أعمق';
            vpId = 'sc2-vp2';
        } else if (total <= 20) {
            status = '<strong style="color:var(--b4)">✅ مناسب للوظيفة</strong> — يمكن إحالته للمرحلة التالية';
            vpId = 'sc2-vp3';
        } else {
            status = '<strong style="color:var(--gr)">🌟 مرشح قوي</strong> — يُنصح بالتوظيف الفوري';
            vpId = 'sc2-vp4';
        }
    }

    if (stEl) stEl.innerHTML = status;
    const vp = document.getElementById(vpId);
    if (vp) vp.classList.add('on');

    if (numEl) {
        if (total === 0) numEl.style.color = 'rgba(255,255,255,.12)';
        else if (total <= 10) numEl.style.color = '#ff8888';
        else if (total <= 15) numEl.style.color = '#f5d050';
        else if (total <= 20) numEl.style.color = '#7ab8f5';
        else numEl.style.color = '#50e898';
    }
}

function resetScorecard() {
    SC_DATA = { fit: 0, tech: 0, comm: 0, salary: 0, risk: 0, decision: '', notes: '', recruiterName: '', recruiterDate: '' };
    document.querySelectorAll('.sec').forEach(s => s.classList.remove('done'));
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('on'));
    document.querySelectorAll('.dec-item').forEach(i => i.classList.remove('on'));
    document.querySelectorAll('.ssb-val, .ssb-stars').forEach(el => el.textContent = '');
    const ntx = document.getElementById('sc2-ntx');
    if (ntx) ntx.value = '';
    const nc = document.getElementById('sc2-nc');
    if (nc) nc.textContent = '0 / 500';
    const rn = document.getElementById('sc2-rn');
    if (rn) rn.value = G.cu ? G.cu.name : '';
    SC_DATA.recruiterName = G.cu ? G.cu.name : '';
    const dtf = document.getElementById('sc2-dtf');
    if (dtf) dtf.value = new Date().toISOString().split('T')[0];
    SC_DATA.recruiterDate = dtf ? dtf.value : '';
    calculateTotal();
}

function loadScorecard(sc) {
    if (!sc) return resetScorecard();
    SC_DATA = { ...sc };
    const keys = ['', 'fit', 'tech', 'comm', 'salary', 'risk'];

    for (let i = 1; i <= 5; i++) {
        const val = sc[keys[i]];
        if (val) {
            const container = document.querySelector(`.chips[data-sec="${i}"]`);
            if (container) {
                const chip = container.querySelector(`.chip[data-v="${val}"]`);
                if (chip) chip.click();
            }
        }
    }

    if (sc.decision) {
        const item = document.querySelector(`.dec-item[data-dec="${sc.decision}"]`);
        if (item) item.click();
    }

    const ntx = document.getElementById('sc2-ntx');
    if (ntx) {
        ntx.value = sc.notes || '';
        const nc = document.getElementById('sc2-nc');
        if (nc) nc.textContent = `${(sc.notes || '').length} / 500`;
    }

    const rn = document.getElementById('sc2-rn');
    if (rn) rn.value = sc.recruiterName || '';

    const dtf = document.getElementById('sc2-dtf');
    if (dtf) dtf.value = sc.recruiterDate ? new Date(sc.recruiterDate).toISOString().split('T')[0] : '';

    calculateTotal();
}

function previewScorecard(id) {
    if (typeof openEdit === 'function') {
        openEdit('app', id);
        switchTab('sc');
    }
}
