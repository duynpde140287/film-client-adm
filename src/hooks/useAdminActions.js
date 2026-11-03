import { useState } from "react";
import {
  createAdminUser,
  updateAdminUserLicense,
  updateAdminUserStatus,
} from "../services/admin.service.js";
import { toTimestamp } from "../utils/format.js";

export function useAdminActions({ request, notify, refreshUsers }) {
  const [saving, setSaving] = useState(false);
  const [busyUserId, setBusyUserId] = useState("");

  async function refreshAfterSave() {
    try {
      await refreshUsers();
    } catch (error) {
      notify(
        `Đã lưu thay đổi, nhưng chưa tải lại danh sách: ${error.message}`,
        true,
      );
    }
  }

  async function createUser(values) {
    setSaving(true);
    try {
      await createAdminUser(request, {
        username: String(values.username || "").trim(),
        email: String(values.email || "").trim() || undefined,
        password: String(values.password || ""),
        planCode: String(values.planCode || "default").trim(),
        licenseActivatedAt: toTimestamp(
          String(values.licenseActivatedAt || ""),
        ),
        licenseExpiresAt: toTimestamp(
          String(values.licenseExpiresAt || ""),
          true,
        ),
      });
      notify("Đã tạo tài khoản USER.");
      await refreshAfterSave();
      return true;
    } catch (error) {
      notify(error.message, true);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function updateLicense(user, values) {
    setSaving(true);
    try {
      const payload = {
        planCode: String(values.planCode || "").trim(),
        creditBalance: Number(values.creditBalance || 0),
      };
      if (values.licenseActivatedAt)
        payload.licenseActivatedAt = toTimestamp(
          String(values.licenseActivatedAt),
        );
      if (values.licenseExpiresAt)
        payload.licenseExpiresAt = toTimestamp(
          String(values.licenseExpiresAt),
          true,
        );
      await updateAdminUserLicense(request, user.id, payload);
      notify("Đã cập nhật license và số dư credit.");
      await refreshAfterSave();
      return true;
    } catch (error) {
      notify(error.message, true);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function toggleUser(user) {
    const status = user.status === "DISABLED" ? "ACTIVE" : "DISABLED";
    setBusyUserId(user.id);
    try {
      await updateAdminUserStatus(request, user.id, status);
      notify(
        status === "DISABLED"
          ? "Đã khóa tài khoản USER."
          : "Đã mở khóa tài khoản USER.",
      );
      await refreshAfterSave();
    } catch (error) {
      notify(error.message, true);
    } finally {
      setBusyUserId("");
    }
  }

  return { saving, busyUserId, createUser, updateLicense, toggleUser };
}
