export const getAdminOverview = (request) => request("/admin/overview");
export const getAdminUsers = (request) => request("/admin/users");
export const getAdminUserFiles = (request, userId) =>
  request(`/admin/users/${encodeURIComponent(userId)}/files`);
export const getAdminResources = (request) => request("/admin/resources");
export const getAdminResource = (request, name) =>
  request(`/admin/resources/${encodeURIComponent(name)}`);
export const getAdminTasks = (request) => request("/admin/tasks");
export const getAdminActivity = (request) => request("/admin/activity");

export const createAdminUser = (request, payload) =>
  request("/admin/users", { method: "POST", body: payload });
export const updateAdminUserStatus = (request, userId, status) =>
  request(`/admin/users/${encodeURIComponent(userId)}/status`, {
    method: "PATCH",
    body: { status },
  });
export const updateAdminUserLicense = (request, userId, payload) =>
  request(`/admin/users/${encodeURIComponent(userId)}/license`, {
    method: "PATCH",
    body: payload,
  });
