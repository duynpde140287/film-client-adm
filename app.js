const APP_KEY = 'filmx.admin.session';
const API_KEY = 'filmx.admin.api';
let page = 'overview';
let busy = false;
let toastTimer;

const app = document.querySelector('#app');
const createDialog = document.querySelector('#create-user-dialog');
const licenseDialog = document.querySelector('#license-dialog');
const apiBase = () => (localStorage.getItem(API_KEY) || 'http://127.0.0.1:3000/api').replace(/\/$/, '');
const getSession = () => { try { return JSON.parse(sessionStorage.getItem(APP_KEY) || 'null'); } catch { return null; } };
const saveSession = value => value ? sessionStorage.setItem(APP_KEY, JSON.stringify(value)) : sessionStorage.removeItem(APP_KEY);
const h = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const date = value => value ? new Date(value).toLocaleString('vi-VN') : '—';
const day = value => value ? new Date(value).toLocaleDateString('sv-SE') : '';
const money = value => Number(value || 0).toLocaleString('vi-VN');
const status = value => `<span class="status status-${h(String(value || 'UNKNOWN').toLowerCase())}">${h(value || 'UNKNOWN')}</span>`;

async function request(path, method = 'GET', body, retry = true) {
  const session = getSession();
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (session?.token) headers.set('Authorization', `Bearer ${session.token}`);
  let response;
  try {
    response = await fetch(apiBase() + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new Error('Không kết nối được backend. Kiểm tra backend và API URL.');
  }
  if (response.status === 401 && retry && session?.refreshToken) {
    const refreshed = await fetch(apiBase() + '/auth/refresh', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    }).catch(() => null);
    if (refreshed?.ok) {
      const payload = await refreshed.json();
      saveSession(payload.data);
      return request(path, method, body, false);
    }
    saveSession(null);
    throw new Error('Phiên quản trị hết hạn. Hãy đăng nhập lại.');
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error?.message || payload.message || 'Yêu cầu không thành công.');
  return payload.data;
}

function showLogin(message = '') {
  app.innerHTML = `<main class="login-shell"><section class="login-brand"><div class="brand-mark">F</div><span class="eyebrow">FILMX · ADMIN CONSOLE</span><h1>Quản trị<br />không gian sáng tạo.</h1><p>Quản lý tài khoản, license, tài nguyên template và tác vụ của hệ thống FilmX.</p><div class="login-points"><span>● Phân quyền ADMIN độc lập</span><span>● Dữ liệu theo database FilmX</span><span>● Không lưu mật khẩu ở trình duyệt</span></div></section><section class="login-card"><span class="eyebrow">ĐĂNG NHẬP QUẢN TRỊ</span><h2>Chào mừng trở lại</h2><p>Chỉ tài khoản ADMIN mới vào được web này.</p><form id="login-form"><label>Backend API<input name="api" value="${h(apiBase())}" autocomplete="url" required /></label><label>Tài khoản<input name="username" autocomplete="username" required /></label><label>Mật khẩu<input name="password" type="password" autocomplete="current-password" required /></label><div class="error-message">${h(message)}</div><button class="button primary" ${busy ? 'disabled' : ''}>${busy ? 'Đang xác thực…' : 'Đăng nhập Admin'}</button></form></section></main>`;
  document.querySelector('#login-form').addEventListener('submit', async event => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    localStorage.setItem(API_KEY, String(values.get('api')).trim().replace(/\/$/, ''));
    busy = true;
    showLogin();
    try {
      const device = localStorage.getItem('filmx.admin.device') || (crypto.randomUUID ? crypto.randomUUID() : `admin-device-${Date.now()}`);
      localStorage.setItem('filmx.admin.device', device);
      const result = await request('/admin/auth/login', 'POST', {
        username: String(values.get('username')).trim(),
        password: String(values.get('password')),
        deviceId: device,
      }, false);
      if (result.user?.is_admin !== 1) throw new Error('Tài khoản này không có quyền ADMIN.');
      saveSession(result);
      busy = false;
      page = 'overview';
      await renderShell();
    } catch (error) {
      busy = false;
      showLogin(error.message);
    }
  });
}

function notify(message, isError = false) {
  let node = document.querySelector('.toast');
  if (!node) { node = document.createElement('div'); node.className = 'toast'; document.body.append(node); }
  node.classList.toggle('is-error', isError);
  node.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.remove(), 3500);
}

function shell(content) {
  const user = getSession()?.user;
  app.innerHTML = `<div class="admin-shell"><aside class="sidebar"><a class="brand" href="#overview"><span class="brand-mark">F</span><span>FilmX <small>ADMIN</small></span></a><div class="admin-user"><span class="avatar">${h(user?.username?.slice(0, 1).toUpperCase())}</span><div><strong>${h(user?.username)}</strong><small>Quản trị viên</small></div></div><nav>${[
    ['overview', 'Tổng quan', '▦'], ['users', 'Tài khoản USER', '♙'], ['files', 'File khách hàng', '▤'], ['resources', 'Template gốc', '▧'], ['tasks', 'Tác vụ AI', '◷'], ['activity', 'Nhật ký', '≡'],
  ].map(([id, label, icon]) => `<button data-page="${id}" class="nav-item ${page === id ? 'active' : ''}"><span>${icon}</span>${label}</button>`).join('')}</nav><div class="sidebar-bottom"><span class="connection-dot"></span> Backend FilmX <button id="logout" class="logout">Đăng xuất ↗</button></div></aside><main class="admin-main"><header class="topbar"><div><span class="eyebrow">ADMIN / ${h(page.toUpperCase())}</span><h1>${({ overview: 'Tổng quan hệ thống', users: 'Tài khoản người dùng', files: 'File khách hàng', resources: 'Tài nguyên template', tasks: 'Theo dõi tác vụ AI', activity: 'Nhật ký hoạt động' })[page]}</h1></div><div class="topbar-user"><span>ADMIN</span><span class="avatar">${h(user?.username?.slice(0, 1).toUpperCase())}</span></div></header><section id="page-content">${content}</section></main></div>`;
  app.querySelectorAll('[data-page]').forEach(button => button.addEventListener('click', () => { page = button.dataset.page; void loadPage(); }));
  document.querySelector('#logout').addEventListener('click', async () => {
    try { await request('/admin/auth/logout', 'POST', {}); } catch { /* Local logout still clears the browser session. */ }
    saveSession(null); showLogin();
  });
}

const statCard = (label, value, note, accent = '') => `<article class="stat-card ${accent}"><span>${h(label)}</span><strong>${h(value)}</strong><small>${h(note)}</small></article>`;
const empty = text => `<div class="empty-state">${h(text)}</div>`;

async function overviewPage() {
  const data = await request('/admin/overview');
  return `<div class="stat-grid">${statCard('USER', data.stats.users, `${data.stats.activeUsers} đang hoạt động`, 'blue')}${statCard('PROJECT', data.stats.projects, 'Trong bảng project', 'violet')}${statCard('TEMPLATE', data.stats.templates, `${data.stats.incompleteTemplates} chưa hoàn chỉnh`, 'amber')}${statCard('TÁC VỤ ĐANG CHẠY', data.stats.activeTasks, 'Hàng đợi backend hiện tại', 'green')}${statCard('COOKIE CONNECTED', data.stats.connectedCookies, `${data.stats.expiredCookies} hết hạn`, 'cyan')}</div><div class="content-grid"><section class="panel"><div class="panel-heading"><div><span class="eyebrow">AI WORKER</span><h2>Tác vụ gần đây</h2></div><button class="text-button" data-open="tasks">Xem tất cả →</button></div>${data.activeTasks.length ? `<div class="table-wrap"><table><thead><tr><th>USER</th><th>Loại</th><th>Project</th><th>Trạng thái</th><th>Cập nhật</th></tr></thead><tbody>${data.activeTasks.map(task => `<tr><td>${h(task.user)}</td><td>${h(task.kind)}${task.sceneIndex ? ` · cảnh ${task.sceneIndex}` : ''}</td><td class="mono">${h(task.projectId)}</td><td>${status(task.status)}</td><td>${date(task.updatedAt)}</td></tr>`).join('')}</tbody></table></div>` : empty('Không có tác vụ đang chạy.')}</section><section class="panel"><div class="panel-heading"><div><span class="eyebrow">ACTIVITY</span><h2>Hoạt động mới</h2></div><button class="text-button" data-open="activity">Nhật ký →</button></div>${data.recentActivity.length ? `<div class="activity-list">${data.recentActivity.map(item => `<div class="activity-row"><span class="activity-mark">✓</span><div><strong>${h(item.action)}</strong><small>${h(item.actor)} · ${date(item.createdAt)}</small></div></div>`).join('')}</div>` : empty('Chưa có hoạt động.')}</section></div><div class="notice">ⓘ ${h(data.runtimeNotice)}</div>`;
}

async function usersPage() {
  const users = await request('/admin/users');
  const rows = users.map(user => `<tr><td><strong>${h(user.username)}</strong><small>${h(user.email || 'Chưa có email')}</small></td><td>${status(user.status)}</td><td>${status(user.effectiveLicenseStatus)}</td><td>${h(user.planCode)}</td><td>${h(user.projects)} / ${h(user.templates)}</td><td>${user.cookies.map(cookie => `<span class="cookie-pill ${cookie.status === 'CONNECTED' ? 'connected' : 'expired'}">${h(cookie.provider)} · ${h(cookie.status)}</span>`).join(' ') || '—'}</td><td>${date(user.licenseExpiresAt)}</td><td><div class="table-actions"><button class="button small secondary" data-license="${h(user.id)}">License</button><button class="button small ${user.status === 'DISABLED' ? 'secondary' : 'danger'}" data-toggle-user="${h(user.id)}" data-next="${user.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED'}">${user.status === 'DISABLED' ? 'Mở khóa' : 'Khóa'}</button></div></td></tr>`).join('');
  return `<section class="panel"><div class="panel-heading"><div><span class="eyebrow">USERS TABLE</span><h2>${users.length} tài khoản USER</h2></div><button id="new-user" class="button primary">＋ Thêm tài khoản</button></div><div class="table-wrap"><table><thead><tr><th>Tài khoản</th><th>Trạng thái</th><th>License</th><th>Gói</th><th>Project / Template</th><th>Cookie AI</th><th>Hết hạn license</th><th>Quản lý</th></tr></thead><tbody>${rows || `<tr><td colspan="8">${empty('Chưa có tài khoản USER.')}</td></tr>`}</tbody></table></div></section>`;
}

async function filesPage() {
  const users = await request('/admin/users');
  const selected = new URLSearchParams(location.hash.split('?')[1] || '').get('user') || users[0]?.id || '';
  const files = selected ? await request(`/admin/users/${encodeURIComponent(selected)}/files`) : [];
  return `<section class="panel"><div class="panel-heading"><div><span class="eyebrow">CUSTOMER OUTPUTS</span><h2>File và media đã sinh</h2><p>Hiển thị metadata từ project; đường dẫn nội bộ không được gửi ra browser.</p></div><label class="select-user">Tài khoản<select id="file-user">${users.map(user => `<option value="${h(user.id)}" ${user.id === selected ? 'selected' : ''}>${h(user.username)}</option>`).join('')}</select></label></div>${files.length ? `<div class="table-wrap"><table><thead><tr><th>Tên file</th><th>Project</th><th>Loại</th><th>Cảnh</th><th>Dung lượng</th><th>Trạng thái</th><th>Tạo lúc</th></tr></thead><tbody>${files.map(file => `<tr><td class="file-name">▤ ${h(file.fileName)}</td><td>${h(file.projectName)}</td><td>${h(file.kind)}</td><td>${file.sceneIndex ?? '—'}</td><td>${file.bytes ? `${(file.bytes / 1024 / 1024).toFixed(1)} MB` : '—'}</td><td>${status(file.status)}</td><td>${date(file.createdAt)}</td></tr>`).join('')}</tbody></table></div>` : empty('Tài khoản này chưa có đầu ra media.')}</section>`;
}

async function resourcesPage() {
  const resources = await request('/admin/resources');
  return `<div class="resource-layout"><section class="panel"><div class="panel-heading"><div><span class="eyebrow">PARENT TEMPLATES</span><h2>Khung công thức gốc</h2></div><span class="readonly-pill">Chỉ xem · đang dùng trong pipeline</span></div><div class="resource-list">${resources.map(item => `<button class="resource-item" data-resource="${h(item.name)}"><span class="resource-file">TXT</span><span><strong>${h(item.name)}</strong><small>${(item.bytes / 1024).toFixed(1)} KB · ${date(item.updatedAt)}</small></span><b>›</b></button>`).join('')}</div></section><section class="panel resource-preview"><div id="resource-content">${empty('Chọn một tài nguyên để xem nội dung.')}</div></section></div>`;
}

async function tasksPage() {
  const tasks = await request('/admin/tasks');
  return `<section class="panel"><div class="panel-heading"><div><span class="eyebrow">BACKEND WORKER</span><h2>${tasks.length} tác vụ gần nhất</h2></div><button class="button secondary" data-refresh>↻ Làm mới</button></div>${tasks.length ? `<div class="table-wrap"><table><thead><tr><th>USER</th><th>Loại / cảnh</th><th>Project ID</th><th>Trạng thái</th><th>Lần chạy</th><th>Lỗi gần nhất</th><th>Thời điểm</th></tr></thead><tbody>${tasks.map(task => `<tr><td>${h(task.user)}</td><td>${h(task.kind)}${task.sceneIndex ? ` · ${task.sceneIndex}` : ''}</td><td class="mono">${h(task.projectId)}</td><td>${status(task.status)}</td><td>${h(task.attempts)}</td><td class="error-cell">${h(task.error || '—')}</td><td>${date(task.updatedAt)}</td></tr>`).join('')}</tbody></table></div>` : empty('Chưa có tác vụ trong bộ nhớ backend.')}</section><div class="notice">Tác vụ runtime được giữ trong tiến trình backend hiện tại. Worker restart sẽ xóa danh sách runtime này.</div>`;
}

async function activityPage() {
  const items = await request('/admin/activity');
  return `<section class="panel"><div class="panel-heading"><div><span class="eyebrow">AUDIT TRAIL</span><h2>${items.length} sự kiện gần nhất</h2></div><button class="button secondary" data-refresh>↻ Làm mới</button></div>${items.length ? `<div class="table-wrap"><table><thead><tr><th>Thời điểm</th><th>Tài khoản</th><th>Hành động</th><th>Kết quả</th><th>Tham chiếu</th></tr></thead><tbody>${items.map(item => `<tr><td>${date(item.createdAt)}</td><td>${h(item.actor)}</td><td><strong>${h(item.action)}</strong><small>${h(item.service)}</small></td><td>${status(item.result)}</td><td class="mono">${h(item.metadata.projectId || item.metadata.userId || item.metadata.templateId || item.metadata.jobId || '—')}</td></tr>`).join('')}</tbody></table></div>` : empty('Chưa có nhật ký hoạt động.')}</section><div class="notice">Nhật ký hiện dùng bộ nhớ runtime của backend, không phải bảng audit trong ERD 4 bảng.</div>`;
}

async function loadPage() {
  if (!getSession()) { showLogin(); return; }
  shell('<div class="loading"><i></i> Đang lấy dữ liệu…</div>');
  try {
    const renderer = { overview: overviewPage, users: usersPage, files: filesPage, resources: resourcesPage, tasks: tasksPage, activity: activityPage }[page] || overviewPage;
    shell(await renderer());
    bindPageActions();
  } catch (error) {
    if (/đăng nhập lại|Phiên quản trị/i.test(error.message)) { saveSession(null); showLogin(error.message); return; }
    shell(`<section class="panel error-panel"><strong>Không tải được nội dung trang</strong><p>${h(error.message)}</p><button class="button secondary" data-refresh>Thử lại</button></section>`);
    bindPageActions();
  }
}

async function renderShell() { await loadPage(); }

function bindPageActions() {
  document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => { page = button.dataset.open; void loadPage(); }));
  document.querySelectorAll('[data-refresh]').forEach(button => button.addEventListener('click', () => void loadPage()));
  const fileUser = document.querySelector('#file-user');
  fileUser?.addEventListener('change', () => { location.hash = `files?user=${encodeURIComponent(fileUser.value)}`; page = 'files'; void loadPage(); });
  document.querySelector('#new-user')?.addEventListener('click', openCreateUser);
  document.querySelectorAll('[data-license]').forEach(button => button.addEventListener('click', () => openLicense(button.dataset.license)));
  document.querySelectorAll('[data-toggle-user]').forEach(button => button.addEventListener('click', async () => {
    try { await request(`/admin/users/${encodeURIComponent(button.dataset.toggleUser)}/status`, 'PATCH', { status: button.dataset.next }); notify(button.dataset.next === 'DISABLED' ? 'Đã khóa tài khoản USER.' : 'Đã mở khóa tài khoản USER.'); await loadPage(); }
    catch (error) { notify(error.message, true); }
  }));
  document.querySelectorAll('[data-resource]').forEach(button => button.addEventListener('click', async () => {
    const target = document.querySelector('#resource-content');
    target.innerHTML = '<div class="loading"><i></i> Đang tải nội dung…</div>';
    try { const item = await request(`/admin/resources/${encodeURIComponent(button.dataset.resource)}`); target.innerHTML = `<div class="panel-heading"><div><span class="eyebrow">READ ONLY</span><h2>${h(item.name)}</h2></div><button class="copy-button">Sao chép</button></div><pre>${h(item.content)}</pre>`; target.querySelector('.copy-button').addEventListener('click', async () => { await navigator.clipboard.writeText(item.content); notify('Đã sao chép tài nguyên.'); }); }
    catch (error) { target.innerHTML = `<div class="error-message">${h(error.message)}</div>`; }
  }));
}

function openCreateUser() {
  createDialog.innerHTML = `<form method="dialog" id="create-user-form"><div class="dialog-head"><div><span class="eyebrow">DATABASE · users</span><h2>Thêm tài khoản USER</h2></div><button class="icon-close" value="cancel">×</button></div><label>Username<input name="username" minlength="2" maxlength="100" required /></label><label>Email<input name="email" type="email" maxlength="255" /></label><label>Mật khẩu tạm<input name="password" type="password" minlength="8" maxlength="256" required /><small>Ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.</small></label><div class="form-grid"><label>Bắt đầu license<input name="licenseActivatedAt" type="date" value="${day(new Date())}" max="2038-01-19" required /></label><label>Hết hạn license<input name="licenseExpiresAt" type="date" max="2038-01-19" required /></label></div><label>Gói<input name="planCode" maxlength="30" value="default" /></label><div class="dialog-actions"><button class="button secondary" value="cancel">Hủy</button><button class="button primary" value="create">Tạo tài khoản</button></div></form>`;
  createDialog.showModal();
  createDialog.querySelector('#create-user-form').addEventListener('submit', async event => {
    if (event.submitter?.value !== 'create') return;
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const start = new Date(`${form.get('licenseActivatedAt')}T00:00:00`).toISOString();
    const end = new Date(`${form.get('licenseExpiresAt')}T23:59:59`).toISOString();
    try {
      await request('/admin/users', 'POST', { username: form.get('username'), email: form.get('email') || undefined, password: form.get('password'), planCode: form.get('planCode'), licenseActivatedAt: start, licenseExpiresAt: end });
      createDialog.close(); notify('Đã tạo tài khoản USER.'); await loadPage();
    } catch (error) { notify(error.message, true); }
  });
}

async function openLicense(id) {
  const users = await request('/admin/users');
  const user = users.find(row => row.id === id);
  if (!user) return;
  licenseDialog.innerHTML = `<form method="dialog" id="license-form"><div class="dialog-head"><div><span class="eyebrow">USER · ${h(user.username)}</span><h2>Điều chỉnh license</h2></div><button class="icon-close" value="cancel">×</button></div><div class="form-grid"><label>Bắt đầu<input name="licenseActivatedAt" type="date" value="${day(user.licenseActivatedAt)}" max="2038-01-19" required /></label><label>Hết hạn<input name="licenseExpiresAt" type="date" value="${day(user.licenseExpiresAt)}" max="2038-01-19" required /></label></div><label>Gói sử dụng<input name="planCode" value="${h(user.planCode)}" maxlength="30" /></label><label>Số dư credit<input name="creditBalance" type="number" min="0" step="0.01" value="${h(user.creditBalance)}" /></label><div class="dialog-actions"><button class="button secondary" value="cancel">Hủy</button><button class="button primary" value="save">Lưu</button></div></form>`;
  licenseDialog.showModal();
  licenseDialog.querySelector('#license-form').addEventListener('submit', async event => {
    if (event.submitter?.value !== 'save') return;
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const start = new Date(`${form.get('licenseActivatedAt')}T00:00:00`).toISOString();
    const end = new Date(`${form.get('licenseExpiresAt')}T23:59:59`).toISOString();
    try {
      await request(`/admin/users/${encodeURIComponent(id)}/license`, 'PATCH', { licenseActivatedAt: start, licenseExpiresAt: end, planCode: form.get('planCode'), creditBalance: Number(form.get('creditBalance')) });
      licenseDialog.close(); notify('Đã cập nhật license và số dư.'); await loadPage();
    } catch (error) { notify(error.message, true); }
  });
}

if (getSession()?.user?.is_admin === 1) void loadPage();
else { saveSession(null); showLogin(); }
