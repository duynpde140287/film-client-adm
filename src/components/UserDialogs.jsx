import { UserRoundPlus } from "lucide-react";
import {
  formatDateTime,
  MAX_LICENSE_EXPIRY_DATE,
  MAX_LICENSE_START_DATE,
  toDateInput,
} from "../utils/format.js";
import { Modal } from "./Modal.jsx";
import { Spinner } from "./Spinner.jsx";

function dateInput(value) {
  return toDateInput(value) || toDateInput(new Date());
}

function defaultExpiry() {
  return toDateInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
}

export function CreateUserDialog({ onClose, onSubmit, saving }) {
  return (
    <Modal
      title="Thêm tài khoản USER"
      eyebrow="DATABASE · USERS"
      onClose={onClose}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <label>
          Username
          <input
            name="username"
            minLength="2"
            maxLength="100"
            required
            autoFocus
          />
        </label>
        <label>
          Email <span className="muted">(không bắt buộc)</span>
          <input name="email" type="email" maxLength="255" />
        </label>
        <label>
          Mật khẩu tạm
          <input
            name="password"
            type="password"
            minLength="8"
            maxLength="256"
            required
          />
          <small>
            Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
            Backend băm mật khẩu trước khi lưu.
          </small>
        </label>
        <div className="form-row">
          <label>
            Bắt đầu license
            <input
              name="licenseActivatedAt"
              type="date"
              defaultValue={dateInput()}
              max={MAX_LICENSE_START_DATE}
              required
            />
          </label>
          <label>
            Hết hạn license
            <input
              name="licenseExpiresAt"
              type="date"
              defaultValue={defaultExpiry()}
              max={MAX_LICENSE_EXPIRY_DATE}
              required
            />
          </label>
        </div>
        <label>
          Gói sử dụng
          <input name="planCode" defaultValue="default" maxLength="30" />
        </label>
        <footer className="modal-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={onClose}
          >
            Hủy
          </button>
          <button className="button button-primary" disabled={saving}>
            {saving ? (
              <>
                <Spinner small /> Đang lưu…
              </>
            ) : (
              <>
                <UserRoundPlus size={16} /> Tạo tài khoản
              </>
            )}
          </button>
        </footer>
      </form>
    </Modal>
  );
}

export function LicenseDialog({ user, onClose, onSubmit, saving }) {
  return (
    <Modal
      title="Điều chỉnh license"
      eyebrow={`USER · ${user.username}`}
      onClose={onClose}
    >
      <form className="modal-form" onSubmit={onSubmit}>
        <div className="form-row">
          <label>
            Bắt đầu
            <input
              name="licenseActivatedAt"
              type="date"
              defaultValue={toDateInput(user.licenseActivatedAt)}
              max={MAX_LICENSE_START_DATE}
            />
            <small>Để trống sẽ giữ nguyên ngày bắt đầu hiện tại.</small>
          </label>
          <label>
            Hết hạn
            <input
              name="licenseExpiresAt"
              type="date"
              defaultValue={toDateInput(user.licenseExpiresAt)}
              max={MAX_LICENSE_EXPIRY_DATE}
            />
            <small>
              Để trống sẽ giữ nguyên ngày hết hạn hiện tại (
              {user.licenseExpiresAt ? "có hạn" : "không hết hạn"}).
            </small>
          </label>
        </div>
        <label>
          Gói sử dụng
          <input
            name="planCode"
            defaultValue={user.planCode || "default"}
            maxLength="30"
          />
        </label>
        <label>
          Số dư credit
          <input
            name="creditBalance"
            type="number"
            min="0"
            step="0.01"
            defaultValue={user.creditBalance || 0}
          />
        </label>
        <p className="dialog-user-meta">
          Tài khoản được tạo {formatDateTime(user.createdAt)}.
        </p>
        <footer className="modal-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={onClose}
          >
            Hủy
          </button>
          <button className="button button-primary" disabled={saving}>
            {saving ? (
              <>
                <Spinner small /> Đang lưu…
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
