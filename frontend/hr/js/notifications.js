// notifications.js - SMS integration (via Backend Proxy)

const SMS_CFG = JSON.parse(localStorage.getItem('wz_sms') || '{}');
const SMS = {
    apiKey: SMS_CFG.key || '',
    senderId: SMS_CFG.sender || 'Wazzifni',
    adminPhone: SMS_CFG.phone || '9647818049186',
    enabled: !!SMS_CFG.key || true
};

function saveSMSConfig() {
    const key = document.getElementById('sms-key')?.value || '';
    const sender = document.getElementById('sms-sender')?.value || 'Wazzifni';
    const phone = document.getElementById('sms-phone')?.value || '9647818049186';

    if (!key.trim()) {
        toast('أدخل مفتاح الـ API', 'err');
        return;
    }

    localStorage.setItem('wz_sms', JSON.stringify({
        key: key.trim(),
        sender: sender.trim(),
        phone: phone.trim()
    }));

    SMS.apiKey = key.trim();
    SMS.senderId = sender.trim();
    SMS.adminPhone = phone.trim();
    SMS.enabled = true;

    toast('تم حفظ إعدادات SMS', 'ok');
    updateSMSStatus();
}

function clearSMSConfig() {
    localStorage.removeItem('wz_sms');
    SMS.enabled = false;
    ['sms-key', 'sms-sender', 'sms-phone'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    toast('تم مسح الإعدادات', 'info');
    updateSMSStatus();
}

function updateSMSStatus() {
    const el = document.getElementById('smsStatus');
    if (!el) return;
    el.className = 'ej-status ' + (SMS.enabled ? 'ej-ok' : 'ej-off');
    el.textContent = SMS.enabled ? '✅ مفعّل' : '❌ غير مفعّل';

    const cfg = JSON.parse(localStorage.getItem('wz_sms') || '{}');
    if (cfg.key) {
        const k = document.getElementById('sms-key');
        if (k) k.value = cfg.key;
        const s = document.getElementById('sms-sender');
        if (s) s.value = cfg.sender;
        const p = document.getElementById('sms-phone');
        if (p) p.value = cfg.phone || '9647818049186';
    }
}

function saveNotifPrefs() {
    const prefs = {};
    ['accept', 'reject', 'payment', 'overdue', 'neardue', 'new'].forEach(k => {
        const el = document.getElementById('nt-' + k);
        prefs[k] = el ? el.checked : false;
    });
    localStorage.setItem('wz_nprefs', JSON.stringify(prefs));
    toast('تم حفظ تفضيلات الإشعارات', 'ok');
}

function getNotifPref(key) {
    const prefs = JSON.parse(localStorage.getItem('wz_nprefs') || '{}');
    return prefs[key] !== false;
}

function addSMSLog(message, to, status) {
    const logs = JSON.parse(localStorage.getItem('wz_smslog') || '[]');
    logs.unshift({ message, to, status, time: new Date().toISOString() });
    localStorage.setItem('wz_smslog', JSON.stringify(logs.slice(0, 500)));
    renderSMSLog();
}

function renderSMSLog() {
    const el = document.getElementById('smsLog');
    const pagEl = document.getElementById('smsLogPag');
    if (!el) return;

    const logs = JSON.parse(localStorage.getItem('wz_smslog') || '[]');
    if (!logs.length) {
        el.innerHTML = '<div class="empty"><span class="ei">📭</span><p>لا توجد إشعارات مرسلة بعد</p></div>';
        if (pagEl) pagEl.innerHTML = '';
        return;
    }

    // Since SMS logs are local, we still slice locally, but using the same helper logic
    const total = logs.length;
    const start = (pg.smsLog - 1) * PS;
    const slice = logs.slice(start, start + PS);

    el.innerHTML = slice.map(l => {
        const t = new Date(l.time).toLocaleString('ar-IQ', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const sb = l.status === 'sent'
            ? '<span class="badge b-gr">✅ أُرسل</span>'
            : '<span class="badge b-rd">❌ فشل</span>';
        return `
            <div class="log-item">
                <div class="log-ic">📱</div>
                <div class="log-tx"><strong>${l.message.substring(0, 30)}...</strong><br><span style="font-size:.7rem;color:var(--tx3)">${l.to}</span></div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px">${sb}<span class="log-tm">${t}</span></div>
            </div>`;
    }).join('');

    if (pagEl) pagEl.innerHTML = paginate(total, 'smsLog', PS);
}

function clearSMSLog() {
    localStorage.removeItem('wz_smslog');
    renderSMSLog();
    toast('تم مسح السجل', 'info');
}

async function sendSMS(message) {
    if (!SMS.enabled) return;
    try {
        const result = await api.sms.send(SMS.adminPhone, message, SMS.apiKey);
        if (result.status === 'success') {
            addSMSLog(message, SMS.adminPhone, 'sent');
        } else {
            console.warn('SMS Error:', result);
            addSMSLog(message, SMS.adminPhone, 'failed');
        }
    } catch (err) {
        console.warn('SMS Fetch Error:', err);
        addSMSLog(message, SMS.adminPhone, 'failed');
    }
}

async function sendTestSMS() {
    if (!SMS.enabled) {
        toast('أدخل مفتاح الـ API أولاً ثم اضغط حفظ وتفعيل', 'err');
        return;
    }
    toast('جاري الإرسال...', 'info');
    await sendSMS('اختبار نظام وظّفني: النظام يعمل بشكل صحيح وإشعاراتك مفعّلة.');
    toast('تم إرسال رسالة الاختبار!', 'ok');
}

function notifyApplicantAdded(name, job) {
    if (!getNotifPref('new')) return;
    sendSMS(`➕ متقدم جديد: ${name}\nالوظيفة: ${job || '—'}`);
}

function notifyStatusChanged(name, job, status) {
    if (status === 'مقبول' && !getNotifPref('accept')) return;
    if (status === 'مرفوض' && !getNotifPref('reject')) return;
    if (status !== 'مقبول' && status !== 'مرفوض') return;

    sendSMS(`${status}: ${name}\nالوظيفة: ${job || '—'}`);
}

function notifyPaymentAdded(empName, amount, month) {
    if (!getNotifPref('payment')) return;
    sendSMS(`دفعة جديدة: ${empName}\nالمبلغ: ${Number(amount).toLocaleString()} د.ع\nالشهر: ${month || '—'}`);
}

function checkAndNotifyOnLogin() {
    if (!SMS.enabled) return;

    const over = G.app.filter(r => r.status === 'مقبول' && r.sdate && calcDays(r.sdate) >= 25);
    const near = G.app.filter(r => r.status === 'مقبول' && r.sdate && calcDays(r.sdate) >= 18 && calcDays(r.sdate) < 25);
    const late = G.pay.filter(p => p.status === 'متأخر');

    if (over.length && getNotifPref('overdue')) {
        sendSMS(`${over.length} موظف تجاوزوا مدة الاستقطاع:\n${over.map(r => r.name).join(', ')}`);
    }
    if (near.length && getNotifPref('neardue')) {
        sendSMS(`${near.length} موظف قريبون من الاستحقاق:\n${near.map(r => r.name).join(', ')}`);
    }
    if (late.length) {
        sendSMS(`${late.length} متأخر عن الدفع:\n${late.map(p => p.empName).join(', ')}`);
    }
}
