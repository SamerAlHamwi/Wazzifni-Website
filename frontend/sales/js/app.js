/* PAGE NAVIGATION */
async function switchPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const pageEl = document.getElementById('page-' + page);
  const btnEl = document.getElementById('btn-' + page);

  if (pageEl) pageEl.classList.add('active');
  if (btnEl) btnEl.classList.add('active');

  if (page === 'rep') {
    startClock();
    renderRepForm();
  }
  if (page === 'admin') {
    renderDashboard();
  }
}

/* ADMIN TAB NAVIGATION */
function switchAdminTab(tab) {
  document.querySelectorAll('.admin-content').forEach(c => c.style.display = 'none');
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

  const contentEl = document.getElementById('content-' + tab);
  const tabEl = document.getElementById('atab-' + tab);

  if (contentEl) contentEl.style.display = '';
  if (tabEl) tabEl.classList.add('active');

  if (tab === 'companies') renderCompanies();
  if (tab === 'reports') renderReportsTable();
  if (tab === 'finance') renderFinance();
  if (tab === 'reps') renderRepsList();
  if (tab === 'actions') renderActionsList();
  if (tab === 'admins') renderAdminsList();
}

/* UI UTILS */
function showMsg(el, text, type) {
  if (!el) return;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  el.innerHTML = `<div class="alert alert-${type}">${icons[type] || ''} ${text}</div>`;
  setTimeout(() => { el.innerHTML = ''; }, 3500);
}

/* INITIALIZATION */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Initializing application...');
  // Note: For admin page, state is loaded within the login logic or on page load if already logged in.
  // We only loadState here if we are not on the admin page or if it's the rep page.
  if (!document.getElementById('page-admin')) {
      const success = await loadState();
      if (success) {
        if (document.getElementById('page-rep')) {
          renderRepForm();
        }
      }
//      else {
//        alert('Failed to connect to the server. Please ensure the backend is running.');
//      }
  }
});
