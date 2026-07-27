// auth.js - Login, logout, and session management

async function doLogin() {
    const u = document.getElementById('li-u').value.trim();
    const p = document.getElementById('li-p').value;
    const err = document.getElementById('li-err');
    const btn = document.getElementById('loginBtn');

    if (!u || !p) {
        err.textContent = '❌ يرجى إدخال اسم المستخدم وكلمة المرور';
        return;
    }

    try {
        btn.disabled = true;
        btn.textContent = 'جاري التحقق...';
        err.textContent = '';

        const user = await api.auth.login(u, p);

        G.cu = user;
        sessionStorage.setItem('wz2_cu', JSON.stringify(user));
        document.getElementById('loginScreen').classList.add('hidden');

        // Initial data load from API
        await loadAllData();

        applyUI();
        nav('dashboard');
        setTimeout(() => checkAndNotifyOnLogin(), 2500);

    } catch (e) {
        err.textContent = `❌ ${e.message}`;
    } finally {
        btn.disabled = false;
        btn.textContent = 'تسجيل الدخول ←';
    }
}

function doLogout() {
    api.auth.logout();
    G.cu = null;
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('li-u').value = '';
    document.getElementById('li-p').value = '';
    document.getElementById('li-err').textContent = '';
}

function applyUI() {
    if (!G.cu) return;

    const u = G.cu;
    const av = document.getElementById('tbAv');
    if (av) {
        av.textContent = u.name.charAt(0);
        av.style.background = u.color || '#0077b6';
    }

    const nm = document.getElementById('tbNm');
    if (nm) nm.textContent = u.name;

    const rl = document.getElementById('tbRl');
    if (rl) {
        const r = u.perms.adm ? 'admin' : u.perms.add ? 'editor' : 'viewer';
        rl.textContent = RLBL[r];
        rl.className = 'tb-rl rl-' + r;
    }

    const an = document.getElementById('adminNav');
    if (an) an.style.display = u.perms.adm ? '' : 'none';
}
