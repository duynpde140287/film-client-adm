import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, AlertCircle, ArrowDownToLine, ArrowRight, ArrowUpRight,
  BookOpen, Check, ChevronDown, ChevronRight, CircleHelp, ClipboardList,
  Cloud, Copy, Database, FileImage, FileText, Film, FolderOpen, LayoutDashboard,
  LoaderCircle, LogOut, Menu, RefreshCw, Search, Settings2, ShieldCheck,
  Sparkles, UserRound, UserRoundPlus, Users, X,
} from "lucide-react";

const SESSION_KEY = "filmx.admin.session";
const API_KEY = "filmx.admin.api";
const DEVICE_KEY = "filmx.admin.device";
const DEFAULT_API = "http://127.0.0.1:3000/api";

const NAV_ITEMS = [
  { id: "overview", label: "Tổng quan", icon: LayoutDashboard, group: "Điều hành" },
  { id: "users", label: "Tài khoản USER", icon: Users, group: "Điều hành" },
  { id: "files", label: "File khách hàng", icon: FileImage, group: "Điều hành" },
  { id: "resources", label: "Template gốc", icon: BookOpen, group: "Hệ thống" },
  { id: "tasks", label: "Tác vụ AI", icon: Activity, group: "Hệ thống" },
  { id: "activity", label: "Nhật ký", icon: ClipboardList, group: "Hệ thống" },
];

const PAGE_TITLES = {
  overview: ["TỔNG QUAN", "Tổng quan hệ thống", "Theo dõi hoạt động và sức khỏe hệ thống FilmX."],
  users: ["NGƯỜI DÙNG", "Tài khoản USER", "Quản lý quyền truy cập, license và gói sử dụng."],
  files: ["ĐẦU RA KHÁCH HÀNG", "File khách hàng", "Theo dõi metadata media đã sinh theo từng tài khoản."],
  resources: ["THƯ VIỆN HỆ THỐNG", "Template gốc", "Các tài nguyên đang được backend sử dụng trong pipeline."],
  tasks: ["BACKEND WORKER", "Tác vụ AI", "Theo dõi hàng đợi và trạng thái tác vụ gần đây."],
  activity: ["AUDIT TRAIL", "Nhật ký hoạt động", "Các sự kiện quản trị và thay đổi trong phiên backend."],
};

function readSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); }
  catch { return null; }
}

function getApiBase() {
  return (localStorage.getItem(API_KEY) || DEFAULT_API).replace(/\/$/, "");
}

function saveSession(value) {
  if (value) sessionStorage.setItem(SESSION_KEY, JSON.stringify(value));
  else sessionStorage.removeItem(SESSION_KEY);
}

function dateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" });
}

function dateOnly(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("sv-SE");
}

function localDateTime(date, endOfDay = false) {
  return new Date(`${date}T${endOfDay ? "23:59:59" : "00:00:00"}`).toISOString();
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function errorMessage(payload, fallback) {
  return payload?.error?.message || payload?.message || fallback;
}

function Spinner({ small = false }) {
  return <LoaderCircle className={`spin${small ? " spin-small" : ""}`} aria-hidden="true" />;
}

function Badge({ value }) {
  const label = value || "UNKNOWN";
  const tone = String(label).toLowerCase().replace(/[^a-z0-9_-]/g, "_");
  return <span className={`badge badge-${tone}`}>{label}</span>;
}

function EmptyState({ icon: Icon = FolderOpen, title, detail }) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={21} /></span><strong>{title}</strong>{detail && <p>{detail}</p>}</div>;
}

function MetricCard({ icon: Icon, label, value, note, tone = "blue" }) {
  return <article className={`metric-card metric-${tone}`}><div className="metric-top"><span className="metric-icon"><Icon size={17} /></span><span className="metric-label">{label}</span></div><strong className="metric-value">{formatNumber(value)}</strong><small>{note}</small></article>;
}

function Modal({ title, eyebrow, onClose, children, wide = false }) {
  useEffect(() => {
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className={`modal-card${wide ? " modal-wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
      <header className="modal-header"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Đóng"><X size={18} /></button></header>
      {children}
    </section>
  </div>;
}

export function AdminApp() {
  const [session, setSession] = useState(readSession);
  const [apiBase, setApiBase] = useState(getApiBase);
  const [backendOnline, setBackendOnline] = useState(null);
  const [page, setPage] = useState("overview");
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busyUserId, setBusyUserId] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedResource, setSelectedResource] = useState(null);

  const apiRequest = useCallback(async (path, options = {}) => {
    const base = (options.base || apiBase).replace(/\/$/, "");
    const activeSession = options.sessionOverride === undefined ? session : options.sessionOverride;
    const headers = new Headers({ "Content-Type": "application/json" });
    if (activeSession?.token) headers.set("Authorization", `Bearer ${activeSession.token}`);
    let response;
    try {
      response = await fetch(`${base}${path}`, {
        method: options.method || "GET",
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      });
    } catch {
      setBackendOnline(false);
      throw new Error("Không kết nối được backend. Kiểm tra backend và API URL.");
    }
    setBackendOnline(true);
    if (response.status === 401 && options.retry !== false && activeSession?.refreshToken) {
      const refreshed = await fetch(`${base}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: activeSession.refreshToken }),
      }).catch(() => null);
      if (refreshed?.ok) {
        const result = await refreshed.json().catch(() => null);
        const nextSession = result?.data;
        if (nextSession?.token && nextSession?.user?.is_admin === 1) {
          saveSession(nextSession);
          setSession(nextSession);
          return apiRequest(path, { ...options, base, sessionOverride: nextSession, retry: false });
        }
      }
      saveSession(null);
      setSession(null);
      throw new Error("Phiên quản trị hết hạn. Hãy đăng nhập lại.");
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(errorMessage(result, "Yêu cầu không thành công."));
    return result?.data;
  }, [apiBase, session]);

  const notify = useCallback((message, isError = false) => {
    setToast({ message, isError });
    window.setTimeout(() => setToast(null), 3600);
  }, []);

  const loadPage = useCallback(async (target = page, selectedId = selectedUserId) => {
    if (!session?.token || session?.user?.is_admin !== 1) return;
    setLoading(true);
    setPageError("");
    setPageData(null);
    try {
      let data;
      if (target === "overview") data = await apiRequest("/admin/overview");
      else if (target === "users") data = await apiRequest("/admin/users");
      else if (target === "files") {
        const users = await apiRequest("/admin/users");
        const userId = selectedId || users[0]?.id || "";
        if (userId !== selectedUserId) setSelectedUserId(userId);
        const files = userId ? await apiRequest(`/admin/users/${encodeURIComponent(userId)}/files`) : [];
        data = { users, files, selectedUserId: userId };
      } else if (target === "resources") data = await apiRequest("/admin/resources");
      else if (target === "tasks") data = await apiRequest("/admin/tasks");
      else if (target === "activity") data = await apiRequest("/admin/activity");
      setPageData(data);
    } catch (error) {
      setPageError(error.message || "Không tải được dữ liệu.");
      setPageData(null);
    } finally {
      setLoading(false);
    }
  }, [apiRequest, page, selectedUserId, session]);

  useEffect(() => {
    if (session?.user?.is_admin === 1) void loadPage(page);
  }, [session?.user?.is_admin, page]);

  const navGroups = useMemo(() => ["Điều hành", "Hệ thống"], []);
  const activeNav = NAV_ITEMS.find((item) => item.id === page) || NAV_ITEMS[0];
  const pageTitle = PAGE_TITLES[page] || PAGE_TITLES.overview;
  const backendLabel = backendOnline === true ? "API sẵn sàng" : backendOnline === false ? "Mất kết nối" : "Chưa kiểm tra";

  async function handleLogin(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const nextBase = String(values.get("api") || DEFAULT_API).trim().replace(/\/$/, "");
    const username = String(values.get("username") || "").trim();
    const password = String(values.get("password") || "");
    if (!username || !password) return;
    localStorage.setItem(API_KEY, nextBase);
    setApiBase(nextBase);
    setLoginBusy(true);
    setLoginError("");
    try {
      let deviceId = localStorage.getItem(DEVICE_KEY);
      if (!deviceId) {
        deviceId = globalThis.crypto?.randomUUID?.() || `admin-device-${Date.now()}`;
        localStorage.setItem(DEVICE_KEY, deviceId);
      }
      const result = await apiRequest("/admin/auth/login", {
        method: "POST",
        body: { username, password, deviceId },
        base: nextBase,
        sessionOverride: null,
        retry: false,
      });
      if (result?.user?.is_admin !== 1) throw new Error("Tài khoản này không có quyền ADMIN.");
      saveSession(result);
      setSession(result);
      setPage("overview");
    } catch (error) {
      setLoginError(error.message || "Đăng nhập không thành công.");
    } finally {
      setLoginBusy(false);
    }
  }

  async function logout() {
    try { await apiRequest("/admin/auth/logout", { method: "POST", body: {} }); }
    catch { /* Clear local admin session even when the backend is unavailable. */ }
    saveSession(null);
    setSession(null);
    setPageData(null);
    setPage("overview");
  }

  async function createUser(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await apiRequest("/admin/users", {
        method: "POST",
        body: {
          username: String(values.get("username")).trim(),
          email: String(values.get("email") || "").trim() || undefined,
          password: String(values.get("password")),
          planCode: String(values.get("planCode") || "default").trim(),
          licenseActivatedAt: localDateTime(String(values.get("licenseActivatedAt"))),
          licenseExpiresAt: localDateTime(String(values.get("licenseExpiresAt")), true),
        },
      });
      setModal(null);
      notify("Đã tạo tài khoản USER.");
      await loadPage("users");
    } catch (error) { notify(error.message, true); }
    finally { setSaving(false); }
  }

  async function updateLicense(event) {
    event.preventDefault();
    const user = modal?.user;
    if (!user) return;
    const values = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await apiRequest(`/admin/users/${encodeURIComponent(user.id)}/license`, {
        method: "PATCH",
        body: {
          licenseActivatedAt: localDateTime(String(values.get("licenseActivatedAt"))),
          licenseExpiresAt: localDateTime(String(values.get("licenseExpiresAt")), true),
          planCode: String(values.get("planCode") || "").trim(),
          creditBalance: Number(values.get("creditBalance") || 0),
        },
      });
      setModal(null);
      notify("Đã cập nhật license và số dư credit.");
      await loadPage("users");
    } catch (error) { notify(error.message, true); }
    finally { setSaving(false); }
  }

  async function changeUserStatus(user) {
    const next = user.status === "DISABLED" ? "ACTIVE" : "DISABLED";
    setBusyUserId(user.id);
    try {
      await apiRequest(`/admin/users/${encodeURIComponent(user.id)}/status`, { method: "PATCH", body: { status: next } });
      notify(next === "DISABLED" ? "Đã khóa tài khoản USER." : "Đã mở khóa tài khoản USER.");
      await loadPage("users");
    } catch (error) { notify(error.message, true); }
    finally { setBusyUserId(""); }
  }

  async function selectFilesUser(userId) {
    setSelectedUserId(userId);
    await loadPage("files", userId);
  }

  async function openResource(resource) {
    setSelectedResource({ ...resource, loading: true });
    try {
      const data = await apiRequest(`/admin/resources/${encodeURIComponent(resource.name)}`);
      setSelectedResource({ ...resource, content: data.content, loading: false });
    } catch (error) { setSelectedResource({ ...resource, error: error.message, loading: false }); }
  }

  async function copyResource() {
    if (!selectedResource?.content) return;
    try {
      await navigator.clipboard.writeText(selectedResource.content);
      notify("Đã sao chép nội dung tài nguyên.");
    } catch { notify("Không thể truy cập clipboard của trình duyệt.", true); }
  }

  if (session?.user?.is_admin !== 1) {
    return <LoginPage apiBase={apiBase} error={loginError} busy={loginBusy} onSubmit={handleLogin} />;
  }

  let view;
  if (loading && !pageData) view = <LoadingView label="Đang tải dữ liệu từ backend…" />;
  else if (pageError && !pageData) view = <ErrorView message={pageError} onRetry={() => void loadPage(page)} />;
  else if (page === "overview") view = <OverviewPage data={pageData} onNavigate={setPage} />;
  else if (page === "users") view = <UsersPage data={pageData || []} search={search} onSearch={setSearch} onAdd={() => setModal({ type: "create" })} onEdit={(user) => setModal({ type: "license", user })} onToggle={changeUserStatus} busyUserId={busyUserId} />;
  else if (page === "files") view = <FilesPage data={pageData} selectedUserId={selectedUserId} onSelect={selectFilesUser} />;
  else if (page === "resources") view = <ResourcesPage data={pageData || []} selected={selectedResource} onSelect={openResource} onCopy={copyResource} />;
  else if (page === "tasks") view = <TasksPage data={pageData || []} />;
  else view = <ActivityPage data={pageData || []} />;

  return <div className="admin-app-shell">
    {mobileMenu && <button className="sidebar-scrim" aria-label="Đóng menu" onClick={() => setMobileMenu(false)} />}
    <aside className={`admin-sidebar${mobileMenu ? " sidebar-open" : ""}`}>
      <div className="sidebar-brand-row"><a className="brand" href="#overview" onClick={(event) => { event.preventDefault(); setPage("overview"); setMobileMenu(false); }}><span className="brand-icon"><Film size={19} /></span><span>ProjectX<span className="brand-dot">.</span>film<small>ADMIN STUDIO</small></span></a><button className="icon-button sidebar-close" aria-label="Đóng menu" onClick={() => setMobileMenu(false)}><X size={18} /></button></div>
      <div className="sidebar-account"><span className="avatar">{session.user.username?.slice(0, 1).toUpperCase() || "A"}</span><div className="account-copy"><strong>{session.user.username}</strong><small><ShieldCheck size={12} /> Quản trị viên</small></div><span className="account-menu-dot"><ChevronDown size={14} /></span></div>
      <div className="sidebar-nav-wrap">{navGroups.map((group) => <nav className="nav-group" key={group}><span className="nav-group-label">{group}</span>{NAV_ITEMS.filter((item) => item.group === group).map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item${page === id ? " nav-active" : ""}`} onClick={() => { setPage(id); setMobileMenu(false); }}><Icon size={18} /><span>{label}</span>{page === id && <span className="nav-active-mark" />}</button>)}</nav>)}</div>
      <div className="sidebar-footer"><div className="backend-status"><span className={`status-led${backendOnline === false ? " status-led-off" : backendOnline === null ? " status-led-idle" : ""}`} /><span><strong>Backend FilmX</strong><small>{backendLabel}</small></span><Cloud size={16} /></div><button className="sidebar-logout" onClick={() => void logout()}><LogOut size={17} /> Đăng xuất</button><div className="sidebar-version">FilmX Admin · React</div></div>
    </aside>

    <main className="admin-main">
      <header className="admin-topbar"><div className="topbar-left"><button className="icon-button mobile-menu-button" onClick={() => setMobileMenu(true)} aria-label="Mở menu"><Menu size={20} /></button><div className="breadcrumbs"><span>FilmX</span><ChevronRight size={13} /><span>Admin</span><ChevronRight size={13} /><strong>{activeNav.label}</strong></div></div><div className="topbar-actions"><div className={`topbar-api${backendOnline === false ? " api-offline" : backendOnline === null ? " api-idle" : ""}`}><span className={`status-led${backendOnline === false ? " status-led-off" : backendOnline === null ? " status-led-idle" : ""}`} /><span>{backendLabel}</span></div><button className="icon-button refresh-button" onClick={() => void loadPage(page)} disabled={loading} aria-label="Làm mới dữ liệu" title="Làm mới"><RefreshCw size={17} className={loading ? "spin" : ""} /></button><button className="topbar-profile" onClick={() => void logout()} title="Đăng xuất"><span className="avatar avatar-small">{session.user.username?.slice(0, 1).toUpperCase() || "A"}</span><span>{session.user.username}</span><ChevronDown size={14} /></button></div></header>
      <section className="page-workspace"><div className="page-heading"><div><span className="eyebrow">{pageTitle[0]}</span><h1>{pageTitle[1]}</h1><p>{pageTitle[2]}</p></div>{page === "users" && <button className="button button-primary" onClick={() => setModal({ type: "create" })}><UserRoundPlus size={17} /> Thêm USER</button>}</div>
        {pageError && pageData && <div className="inline-warning"><AlertCircle size={17} /> {pageError}<button onClick={() => void loadPage(page)}>Thử lại</button></div>}
        {loading && pageData && <div className="refresh-strip"><Spinner small /> Đang cập nhật dữ liệu…</div>}
        {view}
      </section>
    </main>

    {modal?.type === "create" && <CreateUserModal onClose={() => setModal(null)} onSubmit={createUser} saving={saving} />}
    {modal?.type === "license" && <LicenseModal user={modal.user} onClose={() => setModal(null)} onSubmit={updateLicense} saving={saving} />}
    {toast && <div className={`toast${toast.isError ? " toast-error" : ""}`}><span>{toast.isError ? <AlertCircle size={17} /> : <Check size={17} />}</span>{toast.message}</div>}
  </div>;
}

function LoginPage({ apiBase, error, busy, onSubmit }) {
  return <main className="login-page"><section className="login-showcase"><a className="brand login-brand" href="#"><span className="brand-icon"><Film size={22} /></span><span>ProjectX<span className="brand-dot">.</span>film<small>ADMIN STUDIO</small></span></a><div className="login-showcase-copy"><span className="eyebrow">ADMIN CONTROL CENTER</span><h1>Điều hành hệ thống<br /><span>trên một không gian.</span></h1><p>Quản lý người dùng, license và hoạt động của backend FilmX trong giao diện riêng dành cho quản trị viên.</p><div className="showcase-stats"><span><ShieldCheck size={16} /> Phân quyền theo vai trò</span><span><Database size={16} /> Dữ liệu từ database FilmX</span><span><Sparkles size={16} /> Một backend · hai frontend</span></div></div><div className="showcase-glow glow-one" /><div className="showcase-glow glow-two" /></section><section className="login-panel"><form className="login-card" onSubmit={onSubmit}><div className="login-card-icon"><Settings2 size={21} /></div><span className="eyebrow">ĐĂNG NHẬP QUẢN TRỊ</span><h2>Chào mừng trở lại</h2><p>Chỉ tài khoản ADMIN mới được truy cập web này.</p><label>Backend API URL<input name="api" type="url" defaultValue={apiBase} autoComplete="url" required /></label><label>Tài khoản<input name="username" autoComplete="username" placeholder="Tên tài khoản admin" required /></label><label>Mật khẩu<input name="password" type="password" autoComplete="current-password" placeholder="Nhập mật khẩu" required /></label>{error && <div className="login-error"><AlertCircle size={16} /> {error}</div>}<button className="button button-primary login-submit" disabled={busy}>{busy ? <><Spinner small /> Đang xác thực…</> : <>Đăng nhập Admin <ArrowRight size={17} /></>}</button><div className="login-security"><ShieldCheck size={15} /> Phiên quản trị được xác thực bởi backend FilmX.</div></form></section></main>;
}

function OverviewPage({ data, onNavigate }) {
  if (!data) return <LoadingView />;
  const stats = data.stats || {};
  return <div className="page-content"><div className="metric-grid"><MetricCard icon={Users} label="TÀI KHOẢN USER" value={stats.users} note={`${formatNumber(stats.activeUsers)} đang hoạt động`} tone="blue" /><MetricCard icon={FolderOpen} label="DỰ ÁN" value={stats.projects} note="Trong database FilmX" tone="violet" /><MetricCard icon={BookOpen} label="TEMPLATE" value={stats.templates} note={`${formatNumber(stats.incompleteTemplates)} đang hoàn thiện`} tone="amber" /><MetricCard icon={Activity} label="TÁC VỤ ĐANG CHẠY" value={stats.activeTasks} note="Worker backend hiện tại" tone="green" /><MetricCard icon={ShieldCheck} label="COOKIE AI CONNECTED" value={stats.connectedCookies} note={`${formatNumber(stats.expiredCookies)} hết hạn`} tone="cyan" /></div>
    <div className="dashboard-grid"><section className="surface-card dashboard-tasks"><CardHeading eyebrow="AI WORKER" title="Tác vụ đang chạy" action={<button className="text-link" onClick={() => onNavigate("tasks")}>Mở danh sách <ArrowUpRight size={15} /></button>} />{data.activeTasks?.length ? <TaskTable tasks={data.activeTasks} compact /> : <EmptyState icon={Activity} title="Không có tác vụ đang chạy" detail="Tác vụ mới sẽ xuất hiện ở đây." />}</section><section className="surface-card dashboard-activity"><CardHeading eyebrow="ACTIVITY" title="Hoạt động gần đây" action={<button className="text-link" onClick={() => onNavigate("activity")}>Xem nhật ký <ArrowUpRight size={15} /></button>} />{data.recentActivity?.length ? <div className="activity-feed">{data.recentActivity.map((item) => <div className="activity-item" key={item.id}><span className="activity-dot"><Check size={12} /></span><div><strong>{item.action}</strong><p>{item.actor} <span>·</span> {dateTime(item.createdAt)}</p></div></div>)}</div> : <EmptyState icon={ClipboardList} title="Chưa có hoạt động" detail="Nhật ký phiên backend sẽ hiển thị tại đây." />}</section></div>
    {data.runtimeNotice && <div className="info-banner"><CircleHelp size={16} /><span>{data.runtimeNotice}</span></div>}</div>;
}

function UsersPage({ data, search, onSearch, onAdd, onEdit, onToggle, busyUserId }) {
  const filtered = data.filter((user) => `${user.username} ${user.email} ${user.planCode}`.toLowerCase().includes(search.toLowerCase()));
  return <section className="surface-card"><CardHeading eyebrow="USERS TABLE" title={`${formatNumber(data.length)} tài khoản`} action={<button className="button button-primary button-small" onClick={onAdd}><UserRoundPlus size={15} /> Thêm tài khoản</button>} /><div className="table-toolbar"><div className="search-field"><Search size={16} /><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Tìm username, email hoặc gói…" /></div><span className="table-count">{filtered.length} kết quả</span></div>{filtered.length ? <div className="table-scroll"><table><thead><tr><th>TÀI KHOẢN</th><th>TRẠNG THÁI</th><th>LICENSE</th><th>GÓI</th><th>DỰ ÁN / TEMPLATE</th><th>COOKIE AI</th><th>HẾT HẠN</th><th></th></tr></thead><tbody>{filtered.map((user) => <tr key={user.id}><td><div className="user-cell"><span className="avatar avatar-table">{user.username?.slice(0, 1).toUpperCase()}</span><span><strong>{user.username}</strong><small>{user.email || "Chưa có email"}</small></span></div></td><td><Badge value={user.status} /></td><td><Badge value={user.effectiveLicenseStatus} /></td><td><span className="plan-chip">{user.planCode || "default"}</span></td><td className="numeric-cell">{formatNumber(user.projects)} <span>/</span> {formatNumber(user.templates)}</td><td><div className="cookie-status-list">{user.cookies?.length ? user.cookies.map((cookie) => <Badge key={cookie.provider} value={`${cookie.provider} · ${cookie.status}`} />) : <span className="muted">—</span>}</div></td><td>{user.licenseExpiresAt ? dateTime(user.licenseExpiresAt) : <span className="muted">Không hết hạn</span>}</td><td><div className="row-actions"><button className="button button-secondary button-small" onClick={() => onEdit(user)}>License</button><button className={`button button-small${user.status === "DISABLED" ? " button-secondary" : " button-danger"}`} disabled={busyUserId === user.id} onClick={() => onToggle(user)}>{busyUserId === user.id ? <Spinner small /> : user.status === "DISABLED" ? "Mở khóa" : "Khóa"}</button></div></td></tr>)}</tbody></table></div> : <EmptyState icon={Users} title="Không tìm thấy tài khoản" detail={search ? "Thử đổi từ khóa tìm kiếm." : "Tài khoản USER mới sẽ hiển thị ở đây."} />}</section>;
}

function FilesPage({ data, selectedUserId, onSelect }) {
  if (!data) return <LoadingView />;
  return <section className="surface-card"><CardHeading eyebrow="CUSTOMER OUTPUTS" title="File và media đã sinh" action={<label className="select-control"><span>Tài khoản</span><select value={selectedUserId || data.selectedUserId || ""} onChange={(event) => onSelect(event.target.value)}>{data.users.map((user) => <option key={user.id} value={user.id}>{user.username}</option>)}</select><ChevronDown size={14} /></label>} /><p className="section-description">Metadata đầu ra được đọc từ tác vụ của người dùng. Đường dẫn nội bộ không được gửi ra trình duyệt.</p>{data.files?.length ? <div className="table-scroll"><table><thead><tr><th>TÊN FILE</th><th>DỰ ÁN</th><th>LOẠI</th><th>CẢNH</th><th>DUNG LƯỢNG</th><th>TRẠNG THÁI</th><th>THỜI ĐIỂM</th></tr></thead><tbody>{data.files.map((file) => <tr key={file.id}><td><span className="file-label"><FileImage size={15} />{file.fileName}</span></td><td>{file.projectName}</td><td>{file.kind}</td><td>{file.sceneIndex ?? "—"}</td><td>{file.bytes ? `${(file.bytes / 1024 / 1024).toFixed(1)} MB` : "—"}</td><td><Badge value={file.status} /></td><td>{dateTime(file.createdAt)}</td></tr>)}</tbody></table></div> : <EmptyState icon={FileImage} title="Chưa có đầu ra media" detail="File sẽ hiện sau khi project tạo được voice, ảnh hoặc video." />}</section>;
}

function ResourcesPage({ data, selected, onSelect, onCopy }) {
  return <div className="resource-grid"><section className="surface-card resource-list-card"><CardHeading eyebrow="PARENT TEMPLATES" title="Tài nguyên gốc" trailing={<span className="readonly-tag">Chỉ xem</span>} />{data.length ? <div className="resource-list">{data.map((item) => <button className={`resource-row${selected?.name === item.name ? " resource-selected" : ""}`} key={item.name} onClick={() => onSelect(item)}><span className="resource-type">TXT</span><span className="resource-meta"><strong>{item.name}</strong><small>{(item.bytes / 1024).toFixed(1)} KB <span>·</span> {dateTime(item.updatedAt)}</small></span><ChevronRight size={16} /></button>)}</div> : <EmptyState icon={BookOpen} title="Không tìm thấy tài nguyên" detail="Backend chưa có parent template được allowlist." />}</section><section className="surface-card resource-preview-card"><CardHeading eyebrow="RESOURCE PREVIEW" title={selected?.name || "Xem nội dung"} action={selected?.content && <button className="button button-secondary button-small" onClick={onCopy}><Copy size={14} /> Sao chép</button>} />{!selected ? <EmptyState icon={FileText} title="Chọn một tài nguyên" detail="Nội dung preview chỉ được tải khi chọn file." /> : selected.loading ? <LoadingView label="Đang tải nội dung…" /> : selected.error ? <ErrorView message={selected.error} /> : <pre className="resource-content">{selected.content}</pre>}</section></div>;
}

function TasksPage({ data }) {
  return <section className="surface-card"><CardHeading eyebrow="BACKEND WORKER" title={`${formatNumber(data.length)} tác vụ gần nhất`} trailing={<span className="readonly-tag"><span className="status-led" /> Runtime</span>} />{data.length ? <TaskTable tasks={data} /> : <EmptyState icon={Activity} title="Chưa có tác vụ" detail="Tác vụ AI mới sẽ xuất hiện tại đây." />}<div className="info-banner"><CircleHelp size={16} /><span>Tác vụ hiện được giữ trong bộ nhớ backend và sẽ mất khi tiến trình backend khởi động lại.</span></div></section>;
}

function TaskTable({ tasks, compact = false }) {
  return <div className="table-scroll"><table><thead><tr><th>USER</th><th>LOẠI / CẢNH</th><th>PROJECT</th><th>TRẠNG THÁI</th>{!compact && <th>LẦN CHẠY</th>}<th>{compact ? "CẬP NHẬT" : "LỖI GẦN NHẤT"}</th>{!compact && <th>THỜI ĐIỂM</th>}</tr></thead><tbody>{tasks.map((task) => <tr key={task.id}><td>{task.user || "—"}</td><td>{task.kind || "—"}{task.sceneIndex ? ` · cảnh ${task.sceneIndex}` : ""}</td><td className="mono">{task.projectId || "—"}</td><td><Badge value={task.status} /></td>{!compact && <td>{formatNumber(task.attempts)}</td>}<td className={task.error ? "error-text" : "muted"}>{compact ? dateTime(task.updatedAt) : task.error || "—"}</td>{!compact && <td>{dateTime(task.updatedAt)}</td>}</tr>)}</tbody></table></div>;
}

function ActivityPage({ data }) {
  return <section className="surface-card"><CardHeading eyebrow="AUDIT TRAIL" title={`${formatNumber(data.length)} sự kiện gần nhất`} trailing={<span className="readonly-tag"><span className="status-led" /> Runtime</span>} />{data.length ? <div className="table-scroll"><table><thead><tr><th>THỜI ĐIỂM</th><th>TÀI KHOẢN</th><th>HÀNH ĐỘNG</th><th>KẾT QUẢ</th><th>THAM CHIẾU</th></tr></thead><tbody>{data.map((item) => <tr key={item.id}><td>{dateTime(item.createdAt)}</td><td>{item.actor}</td><td><strong>{item.action}</strong><small className="table-subtext">{item.service}</small></td><td><Badge value={item.result} /></td><td className="mono">{item.metadata?.projectId || item.metadata?.userId || item.metadata?.templateId || item.metadata?.jobId || "—"}</td></tr>)}</tbody></table></div> : <EmptyState icon={ClipboardList} title="Chưa có sự kiện" detail="Nhật ký mới sẽ hiển thị khi có hoạt động trong backend." />}<div className="info-banner"><CircleHelp size={16} /><span>Nhật ký hiện dùng bộ nhớ runtime của backend, không phải bảng audit trong ERD.</span></div></section>;
}

function CardHeading({ eyebrow, title, action, trailing }) {
  return <header className="card-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{action || trailing}</header>;
}

function LoadingView({ label = "Đang tải…" }) {
  return <div className="loading-view"><Spinner /> <span>{label}</span></div>;
}

function ErrorView({ message, onRetry }) {
  return <div className="error-view"><span className="error-icon"><AlertCircle size={20} /></span><strong>Không tải được dữ liệu</strong><p>{message}</p>{onRetry && <button className="button button-secondary" onClick={onRetry}><RefreshCw size={15} /> Thử lại</button>}</div>;
}

function CreateUserModal({ onClose, onSubmit, saving }) {
  const today = dateOnly(new Date());
  const defaultExpiry = dateOnly(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  return <Modal title="Thêm tài khoản USER" eyebrow="DATABASE · USERS" onClose={onClose}>
    <form className="modal-form" onSubmit={onSubmit}><label>Username<input name="username" minLength="2" maxLength="100" required autoFocus /></label><label>Email <span className="muted">(không bắt buộc)</span><input name="email" type="email" maxLength="255" /></label><label>Mật khẩu tạm<input name="password" type="password" minLength="8" maxLength="256" required /><small>Backend sẽ băm mật khẩu trước khi lưu.</small></label><div className="form-row"><label>Bắt đầu license<input name="licenseActivatedAt" type="date" defaultValue={today} max="2038-01-19" required /></label><label>Hết hạn license<input name="licenseExpiresAt" type="date" defaultValue={defaultExpiry} max="2038-01-19" required /></label></div><label>Gói sử dụng<input name="planCode" defaultValue="default" maxLength="30" /></label><footer className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Hủy</button><button className="button button-primary" disabled={saving}>{saving ? <><Spinner small /> Đang lưu…</> : <><UserRoundPlus size={16} /> Tạo tài khoản</>}</button></footer></form>
  </Modal>;
}

function LicenseModal({ user, onClose, onSubmit, saving }) {
  return <Modal title="Điều chỉnh license" eyebrow={`USER · ${user.username}`} onClose={onClose}>
    <form className="modal-form" onSubmit={onSubmit}><div className="form-row"><label>Bắt đầu<input name="licenseActivatedAt" type="date" defaultValue={dateOnly(user.licenseActivatedAt)} max="2038-01-19" required /></label><label>Hết hạn<input name="licenseExpiresAt" type="date" defaultValue={dateOnly(user.licenseExpiresAt)} max="2038-01-19" required /></label></div><label>Gói sử dụng<input name="planCode" defaultValue={user.planCode || "default"} maxLength="30" /></label><label>Số dư credit<input name="creditBalance" type="number" min="0" step="0.01" defaultValue={user.creditBalance || 0} /></label><footer className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Hủy</button><button className="button button-primary" disabled={saving}>{saving ? <><Spinner small /> Đang lưu…</> : "Lưu thay đổi"}</button></footer></form>
  </Modal>;
}
