export function readAdminSession() {
  try {
    return JSON.parse(sessionStorage.getItem("filmx.admin.session") || "null");
  } catch {
    return null;
  }
}

export function persistAdminSession(session) {
  if (session)
    sessionStorage.setItem("filmx.admin.session", JSON.stringify(session));
  else sessionStorage.removeItem("filmx.admin.session");
}

export function readApiBase(fallback) {
  return (localStorage.getItem("filmx.admin.api") || fallback).replace(
    /\/$/,
    "",
  );
}

export function persistApiBase(value) {
  const base = value.trim().replace(/\/$/, "");
  localStorage.setItem("filmx.admin.api", base);
  return base;
}

export function getAdminDeviceId() {
  let deviceId = localStorage.getItem("filmx.admin.device");
  if (!deviceId) {
    deviceId =
      globalThis.crypto?.randomUUID?.() || `admin-device-${Date.now()}`;
    localStorage.setItem("filmx.admin.device", deviceId);
  }
  return deviceId;
}

function getResponseError(payload, fallback) {
  return payload?.error?.message || payload?.message || fallback;
}

async function readPayload(response) {
  return response.json().catch(() => ({}));
}

/** Shared transport for all admin API calls. Business rules stay in the backend. */
export async function apiRequest(
  path,
  {
    base,
    session,
    onSessionChange,
    onBackendStatus,
    method = "GET",
    body,
    retry = true,
  },
) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (session?.token) headers.set("Authorization", `Bearer ${session.token}`);

  let response;
  try {
    response = await fetch(`${base.replace(/\/$/, "")}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    onBackendStatus?.(true);
  } catch {
    onBackendStatus?.(false);
    throw new Error("Không kết nối được backend. Kiểm tra backend và API URL.");
  }

  if (response.status === 401 && retry && session?.refreshToken) {
    const refreshed = await fetch(`${base.replace(/\/$/, "")}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    }).catch(() => null);

    if (!refreshed) onBackendStatus?.(false);

    if (refreshed?.ok) {
      const refreshPayload = await readPayload(refreshed);
      const nextSession = refreshPayload?.data;
      if (nextSession?.token && nextSession?.user?.is_admin === 1) {
        onSessionChange?.(nextSession);
        return apiRequest(path, {
          base,
          session: nextSession,
          onSessionChange,
          onBackendStatus,
          method,
          body,
          retry: false,
        });
      }
    }

    onSessionChange?.(null);
    throw new Error("Phiên quản trị hết hạn. Hãy đăng nhập lại.");
  }

  const payload = await readPayload(response);
  if (!response.ok)
    throw new Error(getResponseError(payload, "Yêu cầu không thành công."));
  return payload?.data;
}
