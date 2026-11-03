import { useState } from "react";
import {
  ArrowRight,
  Database,
  Film,
  Settings2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ADMIN_API_DEFAULT } from "../constants/admin-navigation.js";
import { Spinner } from "../components/Spinner.jsx";

export function LoginPage({ apiBase, error, busy, onSubmit }) {
  const [backendUrl, setBackendUrl] = useState(apiBase || ADMIN_API_DEFAULT);

  function submit(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    onSubmit({
      apiBase: String(values.get("api") || "").trim(),
      username: String(values.get("username") || "").trim(),
      password: String(values.get("password") || ""),
    });
  }

  return (
    <main className="login-page">
      <section className="login-showcase">
        <div className="brand login-brand">
          <span className="brand-icon">
            <Film size={22} />
          </span>
          <span>
            ProjectX<span className="brand-dot">.</span>film
            <small>ADMIN STUDIO</small>
          </span>
        </div>
        <div className="login-showcase-copy">
          <span className="eyebrow">ADMIN CONTROL CENTER</span>
          <h1>
            Điều hành hệ thống
            <br />
            <span>trên một không gian.</span>
          </h1>
          <p>
            Quản lý người dùng, license và hoạt động của backend FilmX trong
            giao diện riêng dành cho quản trị viên.
          </p>
          <div className="showcase-stats">
            <span>
              <ShieldCheck size={16} /> Phân quyền theo vai trò
            </span>
            <span>
              <Database size={16} /> Dữ liệu từ database FilmX
            </span>
            <span>
              <Sparkles size={16} /> Một backend · hai frontend
            </span>
          </div>
        </div>
        <div className="showcase-glow glow-one" />
        <div className="showcase-glow glow-two" />
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <div className="login-card-icon">
            <Settings2 size={21} />
          </div>
          <span className="eyebrow">ĐĂNG NHẬP QUẢN TRỊ</span>
          <h2>Chào mừng trở lại</h2>
          <p>Chỉ tài khoản ADMIN mới được truy cập web này.</p>
          <label>
            Backend API URL
            <input
              name="api"
              type="url"
              value={backendUrl}
              onChange={(event) => setBackendUrl(event.target.value)}
              autoComplete="url"
              required
            />
          </label>
          <label>
            Tài khoản
            <input
              name="username"
              autoComplete="username"
              placeholder="Tên tài khoản admin"
              required
            />
          </label>
          <label>
            Mật khẩu
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
              required
            />
          </label>
          {error && (
            <div className="login-error">
              <ShieldCheck size={16} /> {error}
            </div>
          )}
          <button
            className="button button-primary login-submit"
            disabled={busy}
          >
            {busy ? (
              <>
                <Spinner small /> Đang xác thực…
              </>
            ) : (
              <>
                Đăng nhập Admin <ArrowRight size={17} />
              </>
            )}
          </button>
          <div className="login-security">
            <ShieldCheck size={15} /> Phiên quản trị được xác thực bởi backend
            FilmX.
          </div>
        </form>
      </section>
    </main>
  );
}
