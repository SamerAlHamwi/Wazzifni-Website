/* DASHBOARD & STATS */
function renderDashboard() {
  const total = state.reports.length;
  const pts = state.reports.reduce((s, r) => s + (parseInt(r.total_points) || 0), 0);
  const amt = pts * POINT_VALUE;

  const statReports = document.getElementById('stat-reports');
  const statPoints = document.getElementById('stat-points');
  const statAmount = document.getElementById('stat-amount');
  const statRepsCount = document.getElementById('stat-reps-count');

  if (statReports) statReports.textContent = total;
  if (statPoints) statPoints.textContent = pts;
  if (statAmount) statAmount.textContent = amt.toLocaleString();
  if (statRepsCount) statRepsCount.textContent = state.reps.length;

  applyPermissions();
  renderCompanies();
}

function applyPermissions() {
    const canEdit = state.currentAdmin && state.currentAdmin.canEdit;
    const isSuper = state.currentAdmin && state.currentAdmin.isSuperAdmin;

    // Hide clear reports button
    const clearBtn = document.querySelector('#content-reports .btn-danger');
    if (clearBtn) clearBtn.style.display = canEdit ? '' : 'none';

    // Hide add/update rep cards
    const repCards = document.querySelector('#content-reps .two-col');
    if (repCards) repCards.style.display = canEdit ? '' : 'none';

    // Hide add/delete action cards
    const actionCards = document.querySelector('#content-actions .two-col');
    if (actionCards) actionCards.style.display = canEdit ? '' : 'none';

    // Admins tab only for super admin
    const adminTab = document.getElementById('atab-admins');
    if (adminTab) adminTab.style.display = isSuper ? '' : 'none';
}

/* UTILS */
function formatReportDate(dateVal) {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (!isNaN(d.getTime())) {
    return d.toLocaleString('ar-EG');
  }
  return dateVal;
}

/* COMPANIES LIST */
function renderCompanies() {
  const grid = document.getElementById('companies-grid');
  const countEl = document.getElementById('companies-count');
  const canEdit = state.currentAdmin && state.currentAdmin.canEdit;
  if (!grid) return;

  if (!state.reports.length) {
    grid.innerHTML = `<div class="empty-state"><div class="es-icon">🏢</div><p>لا توجد شركات بعد.<br/>ستظهر هنا بعد إرسال أول تقرير من المندوب.</p></div>`;
    if (countEl) countEl.textContent = '';
    return;
  }

  const sorted = [...state.reports].reverse();
  if (countEl) countEl.textContent = `${sorted.length} زيارة مسجلة`;

  grid.innerHTML = sorted.map(r => {
    const pts = parseInt(r.total_points) || 0;
    const acts = Array.isArray(r.actions) ? r.actions : [];
    const gpsCoords = r.company_gps ? r.company_gps.trim() : '';

    let detailRows = '';
    if (r.company_phone)
      detailRows += `<div class="company-detail-row"><span class="d-icon">📞</span><a href="tel:${r.company_phone}">${r.company_phone}</a></div>`;
    if (r.company_email)
      detailRows += `<div class="company-detail-row"><span class="d-icon">✉️</span><a href="mailto:${r.company_email}">${r.company_email}</a></div>`;
    if (r.company_address)
      detailRows += `<div class="company-detail-row"><span class="d-icon">📍</span><span>${r.company_address}</span></div>`;
    if (gpsCoords)
      detailRows += `<div class="company-detail-row"><span class="d-icon">🗺️</span><a class="map-link" href="https://maps.google.com/?q=${gpsCoords}" target="_blank">عرض على الخريطة</a></div>`;
    if (r.notes)
      detailRows += `<div class="company-detail-row"><span class="d-icon">📝</span><span style="color:var(--text)">${r.notes}</span></div>`;

    const actsHtml = acts.length
      ? acts.map(a => `<span class="badge badge-blue" style="margin:2px 2px 0 0;font-size:11px;">${a}</span>`).join('')
      : '<span style="color:var(--text-muted);font-size:12px;">—</span>';

    const dateStr = r.created_at ? formatReportDate(r.created_at) : (r.date || '');

    return `<div class="company-card">
      <div class="company-card-stripe"></div>
      <div class="company-card-body">
        <div class="company-card-header">
          <div class="company-name">🏢 ${r.company_name || '—'}</div>
          <span class="company-rep-badge">👤 ${r.rep_name || '—'}</span>
        </div>
        <div class="company-details">
          ${detailRows || '<div style="color:var(--text-muted);font-size:12px;">لا توجد تفاصيل إضافية</div>'}
        </div>
        <div style="margin-top:12px;">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:5px;font-weight:600;">الإجراءات:</div>
          <div>${actsHtml}</div>
        </div>
        ${canEdit ? `<button class="btn btn-sm" style="margin-top:10px; width:100%; background:var(--surface2); color:var(--primary); font-weight:600;" onclick="openEditReport('${r._id}')">✏️ تعديل البيانات</button>` : ''}
      </div>
      <div class="company-card-footer">
        <div class="company-footer-pts">النقاط: <strong>${pts}</strong> &nbsp;|&nbsp; المبلغ: <strong>${(pts * POINT_VALUE).toLocaleString()} د.ع</strong></div>
        <div class="company-footer-date">${dateStr}</div>
      </div>
    </div>`;
  }).join('');
}

/* REPORTS TABLE */
function renderReportsTable() {
  const wrap = document.getElementById('reports-table-wrap');
  const canEdit = state.currentAdmin && state.currentAdmin.canEdit;
  if (!wrap) return;
  if (!state.reports.length) {
    wrap.innerHTML = `<div class="empty-state"><div class="es-icon">📭</div><p>لا توجد تقارير حتى الآن.</p></div>`;
    return;
  }
  const rows = [...state.reports].reverse().map(r => {
    const acts = Array.isArray(r.actions) ? r.actions.join('، ') : (r.actions || '');
    const pts = parseInt(r.total_points) || 0;
    let info = [];
    if (r.company_phone) info.push(`📞 <a href="tel:${r.company_phone}" style="color:var(--primary)">${r.company_phone}</a>`);
    if (r.company_email) info.push(`✉️ <a href="mailto:${r.company_email}" style="color:var(--primary)">${r.company_email}</a>`);
    if (r.company_address) info.push(`📍 ${r.company_address}`);
    if (r.company_gps) info.push(`<a class="map-link" href="https://maps.google.com/?q=${r.company_gps.trim()}" target="_blank">🗺️ خريطة</a>`);
    const infoHtml = info.length ? `<div style="font-size:11px;color:var(--text-muted);margin-top:3px;line-height:1.8;">${info.join(' &nbsp;|&nbsp; ')}</div>` : '';
    const dateStr = r.created_at ? formatReportDate(r.created_at) : (r.date || '');
    return `<tr>
      <td><strong>${r.rep_name || ''}</strong></td>
      <td><div style="font-weight:600;">${r.company_name || ''}</div>${infoHtml}</td>
      <td><span class="badge badge-blue">${pts} نقطة</span></td>
      <td><span class="badge badge-gold">${(pts * POINT_VALUE).toLocaleString()} د.ع</span></td>
      <td style="font-size:12px;max-width:160px;">${acts}</td>
      <td style="font-size:11px;color:var(--text-muted);">${dateStr}</td>
      <td>${canEdit ? `<button class="btn btn-sm" style="background:var(--surface2); color:var(--primary);" onclick="openEditReport('${r._id}')">✏️</button>` : ''}</td>
    </tr>`;
  }).join('');
  wrap.innerHTML = `<div style="overflow-x:auto;"><table class="wz-table">
    <thead><tr><th>المندوب</th><th>الشركة</th><th>النقاط</th><th>المبلغ</th><th>الإجراءات</th><th>التاريخ</th><th>تعديل</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}

async function clearReports() {
  if (!confirm('هل أنت متأكد من مسح جميع التقارير؟')) return;
  try {
    const res = await apiFetch(`/reports`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to clear reports');
    state.reports = [];
    renderDashboard();
    renderReportsTable();
  } catch (err) {
    console.error('Error clearing reports:', err);
    alert('حدث خطأ أثناء مسح التقارير');
  }
}

/* FINANCE */
function renderFinance() {
  const grid = document.getElementById('finance-grid');
  if (!grid) return;
  const totals = {};
  state.reports.forEach(r => {
    const rep = r.rep_name || 'غير معروف';
    if (!totals[rep]) totals[rep] = { points: 0, amount: 0, count: 0 };
    const pts = parseInt(r.total_points) || 0;
    totals[rep].points += pts;
    totals[rep].amount += pts * POINT_VALUE;
    totals[rep].count++;
  });
  if (!Object.keys(totals).length) {
    grid.innerHTML = `<div class="empty-state"><div class="es-icon">📊</div><p>لا توجد بيانات مالية بعد.</p></div>`;
    return;
  }
  grid.innerHTML = Object.entries(totals).map(([rep, d]) => `
    <div class="rep-fin-card" onclick="showFinanceDetail('${rep}')">
      <div class="rep-fin-name">👤 ${rep}</div>
      <div class="rep-fin-pts">⭐ ${d.points} نقطة &nbsp;|&nbsp; 📄 ${d.count} تقرير</div>
      <div class="rep-fin-amount">${d.amount.toLocaleString()} <span class="rep-fin-currency">د.ع</span></div>
      <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">اضغط للتفاصيل ←</div>
    </div>`).join('');
}

let currentDetailRep = '';

function showFinanceDetail(repName) {
  currentDetailRep = repName;
  const rr = [...state.reports].filter(r => r.rep_name === repName).reverse();
  const detailTitle = document.getElementById('fin-detail-title');
  if (detailTitle) detailTitle.textContent = `📊 تفاصيل: ${repName}`;
  const rows = rr.map(r => {
    const pts = parseInt(r.total_points) || 0;
    const acts = Array.isArray(r.actions) ? r.actions.join('، ') : '';
    let info = [];
    if (r.company_phone) info.push(`📞 ${r.company_phone}`);
    if (r.company_email) info.push(`✉️ ${r.company_email}`);
    if (r.company_address) info.push(`📍 ${r.company_address}`);
    if (r.company_gps) info.push(`<a class="map-link" href="https://maps.google.com/?q=${r.company_gps.trim()}" target="_blank">🗺️ خريطة</a>`);
    const infoHtml = info.length ? `<div style="font-size:11px;color:var(--text-muted);margin-top:3px;line-height:1.8;">${info.join(' | ')}</div>` : '';
    const dateStr = r.created_at ? formatReportDate(r.created_at) : (r.date || '');
    return `<tr>
      <td><div style="font-weight:600;">${r.company_name || ''}</div>${infoHtml}</td>
      <td><span class="badge badge-blue">${pts} نقطة</span></td>
      <td><span class="badge badge-gold">${(pts * POINT_VALUE).toLocaleString()} د.ع</span></td>
      <td style="font-size:12px;">${acts}</td>
      <td style="font-size:11px;color:var(--text-muted);">${dateStr}</td>
    </tr>`;
  }).join('');

  const totalPts = rr.reduce((s, r) => s + (parseInt(r.total_points) || 0), 0);
  const detailBody = document.getElementById('fin-detail-body');
  if (detailBody) {
    detailBody.innerHTML = `
      <div style="background:var(--surface2);border-radius:10px;padding:14px 18px;margin-bottom:16px;display:flex;gap:24px;flex-wrap:wrap;">
        <div><div style="font-size:12px;color:var(--text-muted);">مجموع النقاط</div><div style="font-size:22px;font-weight:800;color:var(--primary);">${totalPts}</div></div>
        <div><div style="font-size:12px;color:var(--text-muted);">المبلغ الإجمالي</div><div style="font-size:22px;font-weight:800;color:var(--accent-dark);">${(totalPts * POINT_VALUE).toLocaleString()} د.ع</div></div>
        <div><div style="font-size:12px;color:var(--text-muted);">عدد التقارير</div><div style="font-size:22px;font-weight:800;color:var(--text);">${rr.length}</div></div>
      </div>
      <div style="overflow-x:auto;"><table class="wz-table">
        <thead><tr><th>الشركة</th><th>النقاط</th><th>المبلغ</th><th>الإجراءات</th><th>التاريخ</th></tr></thead>
        <tbody>${rows}</tbody></table></div>`;
  }
  const detailEl = document.getElementById('finance-detail');
  if (detailEl) {
    detailEl.style.display = '';
    detailEl.scrollIntoView({ behavior: 'smooth' });
  }
}

function hideFinanceDetail() {
  const detailEl = document.getElementById('finance-detail');
  if (detailEl) {
    detailEl.style.display = 'none';
    currentDetailRep = '';
  }
}

/* REPS MANAGEMENT */
function copyRepDetails(id) {
  const rep = state.reps.find(r => r._id === id);
  if (!rep) return;
  const text = `مرحباً بك في مندوبي وظفني
اسم المستخدم:
${rep.username}
كلمة المرور:
${rep.password}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      alert('تم نسخ البيانات بنجاح ✅');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      fallbackCopyTextToClipboard(text);
    });
  } else {
    fallbackCopyTextToClipboard(text);
  }
}

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    const successful = document.execCommand('copy');
    if (successful) alert('تم نسخ البيانات بنجاح ✅');
  } catch (err) {
    console.error('Fallback copy failed', err);
  }
  document.body.removeChild(textArea);
}

function renderRepsList() {
  const el = document.getElementById('reps-list');
  const selUpdate = document.getElementById('sel-update-rep-pass');
  const canEdit = state.currentAdmin && state.currentAdmin.canEdit;

  if (selUpdate) {
    selUpdate.innerHTML = '<option value="">— اختر —</option>' + state.reps.map(r => `<option value="${r._id}">${r.fullName} (${r.username})</option>`).join('');
  }

  if (!el) return;
  if (!state.reps.length) {
    el.innerHTML = '<div class="empty-state"><div class="es-icon">👤</div><p>لا يوجد مندوبون بعد.</p></div>';
    return;
  }
  el.innerHTML = state.reps.map(r => `
    <div class="list-item">
      <div>
        <div class="list-item-name">👤 ${r.fullName}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">اسم المستخدم: ${r.username}</div>
        <div style="font-size:11px;color:var(--primary);margin-top:2px;font-weight:600;">كلمة المرور: ${r.password}</div>
      </div>
      <div style="display:flex;gap:5px;align-items:center;">
        <button class="btn btn-sm" style="background:var(--primary);color:white;border:none;" onclick="copyRepDetails('${r._id}')">نسخ</button>
        ${canEdit ? `<button class="btn btn-danger btn-sm" onclick="quickDeleteRep('${r._id}', '${r.fullName}')">حذف</button>` : ''}
      </div>
    </div>`).join('');
}

async function addRep() {
  const fullName = document.getElementById('rep-full-name').value.trim();
  const username = document.getElementById('rep-username').value.trim();
  const password = document.getElementById('rep-password').value.trim();
  const msg = document.getElementById('rep-msg');

  if (!fullName || !username || !password) {
    showMsg(msg, 'يرجى ملء جميع الحقول.', 'error');
    return;
  }

  try {
    const res = await apiFetch(`/reps`, {
      method: 'POST',
      body: JSON.stringify({ fullName, username, password })
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add rep');
    }
    const newRep = await res.json();
    state.reps.push(newRep);
    state.reps.sort((a,b) => a.fullName.localeCompare(b.fullName, 'ar'));

    document.getElementById('rep-full-name').value = '';
    document.getElementById('rep-username').value = '';
    document.getElementById('rep-password').value = '';

    showMsg(msg, 'تمت إضافة المندوب بنجاح ✅', 'success');
    renderRepsList();
    renderDashboard();
  } catch (err) {
    console.error('Error adding rep:', err);
    showMsg(msg, err.message, 'error');
  }
}

async function updateRepPassword() {
  const id = document.getElementById('sel-update-rep-pass').value;
  const password = document.getElementById('inp-update-rep-pass').value.trim();
  const msg = document.getElementById('rep-update-msg');

  if (!id || !password) {
    showMsg(msg, 'اختر مندوباً واكتب كلمة المرور الجديدة.', 'error');
    return;
  }

  try {
    const res = await apiFetch(`/reps/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password })
    });
    if (!res.ok) throw new Error('Failed to update password');

    document.getElementById('inp-update-rep-pass').value = '';
    // Update local state password
    const rep = state.reps.find(r => r._id === id);
    if (rep) rep.password = password;

    showMsg(msg, 'تم تحديث كلمة المرور بنجاح ✅', 'success');
    renderRepsList();
  } catch (err) {
    console.error('Error updating password:', err);
    showMsg(msg, 'حدث خطأ أثناء التحديث', 'error');
  }
}

async function quickDeleteRep(id, name) {
  if (!confirm(`هل أنت متأكد من حذف المندوب "${name}"؟`)) return;
  try {
    const res = await apiFetch(`/reps/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete rep');

    state.reps = state.reps.filter(r => r._id !== id);
    renderRepsList();
    renderDashboard();
  } catch (err) {
    console.error('Error deleting rep:', err);
    alert('حدث خطأ أثناء الحذف');
  }
}

/* ACTIONS MANAGEMENT */
function renderActionsList() {
  const wrap = document.getElementById('actions-list-table');
  const sel = document.getElementById('sel-del-action');
  const canEdit = state.currentAdmin && state.currentAdmin.canEdit;

  if (sel) sel.innerHTML = '<option value="">— اختر —</option>' + state.actions.map(a => `<option>${a.name}</option>`).join('');

  if (!wrap) return;
  if (!state.actions.length) {
    wrap.innerHTML = '<div class="empty-state"><div class="es-icon">⚙️</div><p>لا توجد إجراءات بعد.</p></div>';
    return;
  }

  const rows = state.actions.map(a => `<tr>
    <td><strong>${a.name}</strong></td>
    <td><span class="badge badge-teal">⭐ ${a.points} نقطة</span></td>
    <td><span class="badge badge-gold">${(a.points * POINT_VALUE).toLocaleString()} د.ع</span></td>
    <td>${canEdit ? `<button class="btn btn-danger btn-sm" onclick="quickDeleteAction('${a._id || a.name}')">حذف</button>` : ''}</td>
  </tr>`).join('');
  wrap.innerHTML = `<div style="overflow-x:auto;"><table class="wz-table">
    <thead><tr><th>الإجراء</th><th>النقاط</th><th>القيمة</th><th>إجراء</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}

async function addAction() {
  const name = document.getElementById('inp-new-action').value.trim();
  const pts = parseInt(document.getElementById('inp-new-pts').value) || 0;
  const msg = document.getElementById('action-msg');
  if (!name) { showMsg(msg, 'اكتب اسم الإجراء.', 'error'); return; }

  try {
    const res = await apiFetch(`/actions`, {
      method: 'POST',
      body: JSON.stringify({ name, points: Math.max(0, pts) })
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add action');
    }
    const newAction = await res.json();
    state.actions.push(newAction);
    state.actions.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    document.getElementById('inp-new-action').value = '';
    document.getElementById('inp-new-pts').value = '';
    showMsg(msg, 'تمت الإضافة بنجاح ✅', 'success');
    renderActionsList();
  } catch (err) {
    console.error('Error adding action:', err);
    showMsg(msg, err.message, 'error');
  }
}

async function deleteAction() {
  const name = document.getElementById('sel-del-action').value;
  const msg = document.getElementById('action-del-msg');
  if (!name) { showMsg(msg, 'اختر إجراءً أولاً.', 'error'); return; }
  const action = state.actions.find(a => a.name === name);
  if (action) await performDeleteAction(action._id || action.name, msg);
}

async function quickDeleteAction(idOrName) {
  if (!confirm(`حذف هذا الإجراء؟`)) return;
  await performDeleteAction(idOrName);
}

async function performDeleteAction(idOrName, msgEl) {
    try {
        const res = await apiFetch(`/actions/${encodeURIComponent(idOrName)}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete action');

        state.actions = state.actions.filter(a => (a._id || a.name) !== idOrName);
        if (msgEl) showMsg(msgEl, 'تم الحذف ✅', 'success');
        renderActionsList();
    } catch (err) {
        console.error('Error deleting action:', err);
        if (msgEl) showMsg(msgEl, 'حدث خطأ أثناء الحذف', 'error');
    }
}

/* ADMINS MANAGEMENT */
function copyAdminDetails(id) {
  const admin = state.admins.find(a => a._id === id);
  if (!admin) return;
  const text = `بيانات دخول لوحة الإدارة:
الاسم: ${admin.fullName}
اسم المستخدم: ${admin.username}
كلمة المرور: ${admin.password}
صلاحية التعديل: ${admin.canEdit ? 'نعم' : 'لا'}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      alert('تم نسخ بيانات المدير بنجاح ✅');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      fallbackCopyTextToClipboard(text);
    });
  } else {
    fallbackCopyTextToClipboard(text);
  }
}

function renderAdminsList() {
  const el = document.getElementById('admins-list');
  if (!el) return;
  if (!state.admins.length) {
    el.innerHTML = '<div class="empty-state"><div class="es-icon">🔑</div><p>لا يوجد مدراء بعد.</p></div>';
    return;
  }
  el.innerHTML = state.admins.map(a => `
    <div class="list-item">
      <div>
        <div class="list-item-name">👤 ${a.fullName} ${a.isSuperAdmin ? '<span class="badge badge-gold">مدير عام</span>' : ''}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">اسم المستخدم: ${a.username} | صلاحية التعديل: ${a.canEdit ? '✅' : '❌'}</div>
        <div style="font-size:11px;color:var(--primary);margin-top:2px;font-weight:600;">كلمة المرور: ${a.password}</div>
      </div>
      <div style="display:flex;gap:5px;align-items:center;">
        <button class="btn btn-sm" style="background:var(--primary);color:white;border:none;" onclick="copyAdminDetails('${a._id}')">نسخ</button>
        ${!a.isSuperAdmin ? `<button class="btn btn-danger btn-sm" onclick="quickDeleteAdmin('${a._id}', '${a.fullName}')">حذف</button>` : ''}
      </div>
    </div>`).join('');
}

async function addAdmin() {
  const fullName = document.getElementById('admin-full-name').value.trim();
  const username = document.getElementById('admin-username').value.trim();
  const password = document.getElementById('admin-password').value.trim();
  const canEdit = document.getElementById('admin-can-edit').checked;
  const msg = document.getElementById('admin-msg');

  if (!fullName || !username || !password) {
    showMsg(msg, 'يرجى ملء جميع الحقول.', 'error');
    return;
  }

  try {
    const res = await apiFetch(`/admins`, {
      method: 'POST',
      body: JSON.stringify({ fullName, username, password, canEdit })
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add admin');
    }
    const newAdmin = await res.json();
    state.admins.push(newAdmin);
    state.admins.sort((a,b) => a.fullName.localeCompare(b.fullName, 'ar'));

    document.getElementById('admin-full-name').value = '';
    document.getElementById('admin-username').value = '';
    document.getElementById('admin-password').value = '';
    document.getElementById('admin-can-edit').checked = false;

    showMsg(msg, 'تمت إضافة المدير بنجاح ✅', 'success');
    renderAdminsList();
  } catch (err) {
    console.error('Error adding admin:', err);
    showMsg(msg, err.message, 'error');
  }
}

async function quickDeleteAdmin(id, name) {
  if (!confirm(`هل أنت متأكد من حذف المدير "${name}"؟`)) return;
  try {
    const res = await apiFetch(`/admins/${id}`, { method: 'DELETE' });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete admin');
    }

    state.admins = state.admins.filter(a => a._id !== id);
    renderAdminsList();
  } catch (err) {
    console.error('Error deleting admin:', err);
    alert(err.message || 'حدث خطأ أثناء الحذف');
  }
}

/* EXPORT TO EXCEL */
function downloadExcel(data, fileName) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

function exportReportsToExcel() {
  if (!state.reports.length) return alert('لا توجد بيانات لتصديرها');
  const data = state.reports.map(r => ({
    'اسم المندوب': r.rep_name,
    'اسم الشركة': r.company_name,
    'رقم الهاتف': r.company_phone || '',
    'البريد الإلكتروني': r.company_email || '',
    'العنوان': r.company_address || '',
    'الموقع (GPS)': r.company_gps || '',
    'الإجراءات': Array.isArray(r.actions) ? r.actions.join('، ') : (r.actions || ''),
    'النقاط': r.total_points,
    'المبلغ (د.ع)': r.total_points * POINT_VALUE,
    'ملاحظات': r.notes || '',
    'التاريخ': r.created_at || r.date || ''
  }));
  downloadExcel(data, 'تقارير_المندوبين');
}

function exportCompaniesToExcel() {
  if (!state.reports.length) return alert('لا توجد بيانات لتصديرها');
  const seen = new Set();
  const data = [];
  state.reports.forEach(r => {
    const key = `${r.company_name}-${r.company_phone}`;
    if (!seen.has(key)) {
      seen.add(key);
      data.push({
        'اسم الشركة': r.company_name,
        'رقم الهاتف': r.company_phone || '',
        'البريد الإلكتروني': r.company_email || '',
        'العنوان': r.company_address || '',
        'الموقع (GPS)': r.company_gps || ''
      });
    }
  });
  downloadExcel(data, 'بيانات_الشركات');
}

function exportFinanceToExcel() {
  if (!state.reports.length) return alert('لا توجد بيانات لتصديرها');
  const totals = {};
  state.reports.forEach(r => {
    const rep = r.rep_name || 'غير معروف';
    if (!totals[rep]) totals[rep] = { points: 0, count: 0 };
    totals[rep].points += (parseInt(r.total_points) || 0);
    totals[rep].count++;
  });
  const data = Object.entries(totals).map(([rep, d]) => ({
    'اسم المندوب': rep,
    'عدد التقارير': d.count,
    'إجمالي النقاط': d.points,
    'المبلغ الإجمالي (د.ع)': d.points * POINT_VALUE
  }));
  downloadExcel(data, 'التقارير_المالية');
}

function exportFinanceDetailToExcel() {
  if (!currentDetailRep) return;
  const rr = [...state.reports].filter(r => r.rep_name === currentDetailRep).reverse();
  if (!rr.length) return alert('لا توجد بيانات');
  const data = rr.map(r => ({
    'الشركة': r.company_name,
    'النقاط': r.total_points,
    'المبلغ (د.ع)': r.total_points * POINT_VALUE,
    'الإجراءات': Array.isArray(r.actions) ? r.actions.join('، ') : (r.actions || ''),
    'التاريخ': r.created_at || r.date || ''
  }));
  downloadExcel(data, `تفاصيل_مالية_${currentDetailRep}`);
}

function exportRepsToExcel() {
  if (!state.reps.length) return alert('لا توجد بيانات لتصديرها');
  const data = state.reps.map(r => ({ 'الاسم الكامل': r.fullName, 'اسم المستخدم': r.username }));
  downloadExcel(data, 'قائمة_المندوبين');
}

function exportActionsToExcel() {
  if (!state.actions.length) return alert('لا توجد بيانات لتصديرها');
  const data = state.actions.map(a => ({
    'اسم الإجراء': a.name,
    'النقاط': a.points,
    'القيمة (د.ع)': a.points * POINT_VALUE
  }));
  downloadExcel(data, 'قائمة_الإجراءات');
}

/* EDIT REPORT MODAL */
let editReportActions = [];

function openEditReport(reportId) {
    const report = state.reports.find(r => r._id === reportId);
    if (!report) return;

    document.getElementById('edit-report-id').value = report._id;
    document.getElementById('edit-company-name').value = report.company_name || '';
    document.getElementById('edit-company-phone').value = report.company_phone || '';
    document.getElementById('edit-company-email').value = report.company_email || '';
    document.getElementById('edit-company-address').value = report.company_address || '';
    document.getElementById('edit-company-gps').value = report.company_gps || '';
    document.getElementById('edit-notes').value = report.notes || '';

    editReportActions = Array.isArray(report.actions) ? [...report.actions] : [];
    renderEditActions();

    const sel = document.getElementById('edit-add-action-select');
    if (sel) {
        sel.innerHTML = '<option value="">— إضافة إجراء —</option>' +
            state.actions.map(a => `<option value="${a.name}">${a.name} (${a.points} ن)</option>`).join('');
    }

    document.getElementById('edit-report-modal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('edit-report-modal').style.display = 'none';
}

function renderEditActions() {
    const container = document.getElementById('edit-actions-container');
    if (!container) return;
    container.innerHTML = editReportActions.map(a => `
        <span class="badge badge-blue" style="display:flex; align-items:center; gap:5px; padding: 5px 10px;">
            ${a}
            <span style="cursor:pointer; font-weight:bold; font-size:16px; margin-right:5px;" onclick="removeActionFromEdit('${a}')">×</span>
        </span>
    `).join('');
}

function addActionToEdit() {
    const sel = document.getElementById('edit-add-action-select');
    const actionName = sel.value;
    if (!actionName) return;
    if (!editReportActions.includes(actionName)) {
        editReportActions.push(actionName);
        renderEditActions();
    }
    sel.value = '';
}

function removeActionFromEdit(name) {
    editReportActions = editReportActions.filter(a => a !== name);
    renderEditActions();
}

async function saveReportEdit() {
    const id = document.getElementById('edit-report-id').value;
    const updateData = {
        company_name: document.getElementById('edit-company-name').value.trim(),
        company_phone: document.getElementById('edit-company-phone').value.trim(),
        company_email: document.getElementById('edit-company-email').value.trim(),
        company_address: document.getElementById('edit-company-address').value.trim(),
        company_gps: document.getElementById('edit-company-gps').value.trim(),
        notes: document.getElementById('edit-notes').value.trim(),
        actions: editReportActions
    };

    let totalPoints = 0;
    updateData.actions.forEach(actName => {
        const found = state.actions.find(a => a.name === actName);
        if (found) totalPoints += found.points;
    });
    updateData.total_points = totalPoints;

    try {
        const res = await apiFetch(`/reports/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });

        if (!res.ok) throw new Error('Failed to update report');

        const updatedReport = await res.json();
        const idx = state.reports.findIndex(r => r._id === id);
        if (idx !== -1) state.reports[idx] = updatedReport;

        alert('تم التعديل بنجاح ✅');
        closeEditModal();
        renderDashboard();
        renderReportsTable();
        renderFinance();
    } catch (err) {
        console.error('Error saving report edit:', err);
        alert('حدث خطأ أثناء حفظ التعديلات');
    }
}
