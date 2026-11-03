import { ADMIN_API_DEFAULT } from "../constants/admin-navigation.js";
import { apiRequest, getAdminDeviceId, persistApiBase } from "./api.service.js";

export async function loginAdmin({
  username,
  password,
  apiBase,
  onBackendStatus,
}) {
  const base = persistApiBase(apiBase || ADMIN_API_DEFAULT);
  return apiRequest("/admin/auth/login", {
    base,
    session: null,
    onBackendStatus,
    retry: false,
    method: "POST",
    body: { username: username.trim(), password, deviceId: getAdminDeviceId() },
  });
}

export async function logoutAdmin(request) {
  try {
    await request("/admin/auth/logout", { method: "POST", body: {} });
  } catch {
    /* Local session must still be cleared if the backend is unavailable. */
  }
}
