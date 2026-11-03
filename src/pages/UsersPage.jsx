import { useState } from "react";
import { Search, UserRoundPlus } from "lucide-react";
import { CardHeading } from "../components/CardHeading.jsx";
import { CookieStatus, StatusBadge } from "../components/StatusBadge.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { Spinner } from "../components/Spinner.jsx";
import { formatDateTime, formatNumber } from "../utils/format.js";

export function UsersPage({ users, onAdd, onEdit, onToggle, busyUserId }) {
  const [search, setSearch] = useState("");
  const filtered = users.filter((user) =>
    `${user.username} ${user.email || ""} ${user.planCode || ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <section className="surface-card">
      <CardHeading
        eyebrow="USERS TABLE"
        title={`${formatNumber(users.length)} tài khoản`}
        action={
          <button
            className="button button-primary button-small"
            onClick={onAdd}
          >
            <UserRoundPlus size={15} /> Thêm tài khoản
          </button>
        }
      />
      <div className="table-toolbar">
        <label className="search-field">
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm username, email hoặc gói…"
          />
        </label>
        <span className="table-count">{filtered.length} kết quả</span>
      </div>
      {filtered.length ? (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>TÀI KHOẢN</th>
                <th>TRẠNG THÁI</th>
                <th>LICENSE</th>
                <th>GÓI</th>
                <th>DỰ ÁN / TEMPLATE</th>
                <th>COOKIE AI</th>
                <th>HẾT HẠN</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <span className="avatar avatar-table">
                        {user.username?.slice(0, 1).toUpperCase()}
                      </span>
                      <span>
                        <strong>{user.username}</strong>
                        <small>{user.email || "Chưa có email"}</small>
                      </span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge value={user.status} />
                  </td>
                  <td>
                    <StatusBadge value={user.effectiveLicenseStatus} />
                  </td>
                  <td>
                    <span className="plan-chip">
                      {user.planCode || "default"}
                    </span>
                  </td>
                  <td className="numeric-cell">
                    {formatNumber(user.projects)} <span>/</span>{" "}
                    {formatNumber(user.templates)}
                  </td>
                  <td>
                    <div className="cookie-status-list">
                      {user.cookies?.length ? (
                        user.cookies.map((cookie) => (
                          <CookieStatus key={cookie.provider} cookie={cookie} />
                        ))
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {user.licenseExpiresAt ? (
                      formatDateTime(user.licenseExpiresAt)
                    ) : (
                      <span className="muted">Không hết hạn</span>
                    )}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="button button-secondary button-small"
                        onClick={() => onEdit(user)}
                      >
                        License
                      </button>
                      <button
                        className={`button button-small${user.status === "DISABLED" ? " button-secondary" : " button-danger"}`}
                        disabled={busyUserId === user.id}
                        onClick={() => onToggle(user)}
                      >
                        {busyUserId === user.id ? (
                          <Spinner small />
                        ) : user.status === "DISABLED" ? (
                          "Mở khóa"
                        ) : (
                          "Khóa"
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="Không tìm thấy tài khoản"
          detail={
            search
              ? "Thử đổi từ khóa tìm kiếm."
              : "Tài khoản USER mới sẽ hiển thị ở đây."
          }
        />
      )}
    </section>
  );
}
