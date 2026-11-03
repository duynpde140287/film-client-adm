import { ChevronDown, ChevronRight, Menu, RefreshCw } from "lucide-react";
import { ADMIN_NAV_ITEMS } from "../constants/admin-navigation.js";

export function AdminTopbar({
  page,
  user,
  backendOnline,
  loading,
  onRefresh,
  onLogout,
  onMenu,
}) {
  const activeItem =
    ADMIN_NAV_ITEMS.find((item) => item.id === page) || ADMIN_NAV_ITEMS[0];
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
    <header className="admin-topbar">
      <div className="topbar-left">
        <button
          className="icon-button mobile-menu-button"
          onClick={onMenu}
          aria-label="Mở menu"
        >
          <Menu size={20} />
        </button>
        <div className="breadcrumbs">
          <span>FilmX</span>
          <ChevronRight size={13} />
          <span>Admin</span>
          <ChevronRight size={13} />
          <strong>{activeItem.label}</strong>
        </div>
      </div>
      <div className="topbar-actions">
        <div
          className={`topbar-api${backendOnline === false ? " api-offline" : backendOnline === null ? " api-idle" : ""}`}
        >
          <span className={`status-led${statusTone}`} />
          <span>{backendLabel}</span>
        </div>
        <button
          className="icon-button refresh-button"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Làm mới dữ liệu"
          title="Làm mới"
        >
          <RefreshCw size={17} className={loading ? "spin" : ""} />
        </button>
        <button className="topbar-profile" onClick={onLogout} title="Đăng xuất">
          <span className="avatar avatar-small">
            {user?.username?.slice(0, 1).toUpperCase() || "A"}
          </span>
          <span>{user?.username}</span>
          <ChevronDown size={14} />
        </button>
      </div>
    </header>
  );
}
