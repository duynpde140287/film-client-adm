import { ChevronDown, Cloud, Film, LogOut, ShieldCheck, X } from "lucide-react";
import {
  ADMIN_NAV_GROUPS,
  ADMIN_NAV_ITEMS,
} from "../constants/admin-navigation.js";

export function AdminSidebar({
  page,
  user,
  backendOnline,
  onNavigate,
  onLogout,
  open,
  onClose,
}) {
  const backendLabel =
    backendOnline === true
      ? "API sẵn sàng"
      : backendOnline === false
        ? "Mất kết nối"
        : "Chưa kiểm tra";
  const statusTone =
    backendOnline === true
      ? ""
      : backendOnline === false
        ? " status-led-off"
        : " status-led-idle";

  return (
    <>
      {open && (
        <button
          className="sidebar-scrim"
          aria-label="Đóng menu"
          onClick={onClose}
        />
      )}
      <aside className={`admin-sidebar${open ? " sidebar-open" : ""}`}>
        <div className="sidebar-brand-row">
          <button className="brand" onClick={() => onNavigate("overview")}>
            <span className="brand-icon">
              <Film size={19} />
            </span>
            <span>
              ProjectX<span className="brand-dot">.</span>film
              <small>ADMIN STUDIO</small>
            </span>
          </button>
          <button
            className="icon-button sidebar-close"
            aria-label="Đóng menu"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <div className="sidebar-account">
          <span className="avatar">
            {user?.username?.slice(0, 1).toUpperCase() || "A"}
          </span>
          <div className="account-copy">
            <strong>{user?.username}</strong>
            <small>
              <ShieldCheck size={12} /> Quản trị viên
            </small>
          </div>
          <span className="account-menu-dot">
            <ChevronDown size={14} />
          </span>
        </div>
        <div className="sidebar-nav-wrap">
          {ADMIN_NAV_GROUPS.map((group) => (
            <nav className="nav-group" key={group}>
              <span className="nav-group-label">{group}</span>
              {ADMIN_NAV_ITEMS.filter((item) => item.group === group).map(
                ({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    className={`nav-item${page === id ? " nav-active" : ""}`}
                    onClick={() => onNavigate(id)}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                    {page === id && <span className="nav-active-mark" />}
                  </button>
                ),
              )}
            </nav>
          ))}
        </div>
        <div className="sidebar-footer">
          <div className="backend-status">
            <span className={`status-led${statusTone}`} />
            <span>
              <strong>Backend FilmX</strong>
              <small>{backendLabel}</small>
            </span>
            <Cloud size={16} />
          </div>
          <button className="sidebar-logout" onClick={onLogout}>
            <LogOut size={17} /> Đăng xuất
          </button>
          <div className="sidebar-version">FilmX Admin · React</div>
        </div>
      </aside>
    </>
  );
}
