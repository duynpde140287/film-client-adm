import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { ADMIN_PAGE_META } from "../constants/admin-navigation.js";
import { AdminSidebar } from "./AdminSidebar.jsx";
import { AdminTopbar } from "./AdminTopbar.jsx";

export function AdminLayout({
  page,
  user,
  backendOnline,
  loading,
  error,
  onNavigate,
  onRefresh,
  onLogout,
  children,
}) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const meta = ADMIN_PAGE_META[page] || ADMIN_PAGE_META.overview;
  const navigate = (target) => {
    onNavigate(target);
    setMobileMenu(false);
  };

  return (
    <div className="admin-app-shell">
      <AdminSidebar
        page={page}
        user={user}
        backendOnline={backendOnline}
        onNavigate={navigate}
        onLogout={onLogout}
        open={mobileMenu}
        onClose={() => setMobileMenu(false)}
      />
      <main className="admin-main">
        <AdminTopbar
          page={page}
          user={user}
          backendOnline={backendOnline}
          loading={loading}
          onRefresh={onRefresh}
          onLogout={onLogout}
          onMenu={() => setMobileMenu(true)}
        />
        <section className="page-workspace">
          <div className="page-heading">
            <div>
              <span className="eyebrow">{meta.eyebrow}</span>
              <h1>{meta.title}</h1>
              <p>{meta.description}</p>
            </div>
            {headerAction}
          </div>
          {error && (
            <div className="inline-warning">
              <AlertCircle size={17} /> {error}
              <button onClick={onRefresh}>Thử lại</button>
            </div>
          )}
          {children}
        </section>
      </main>
    </div>
  );
}
