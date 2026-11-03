import { useRef, useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import {
  NotificationProvider,
  useNotify,
} from "./contexts/NotificationContext.jsx";
import { useAdminActions } from "./hooks/useAdminActions.js";
import { useAdminPageData } from "./hooks/useAdminPageData.js";
import { AdminLayout } from "./layouts/AdminLayout.jsx";
import { ErrorState, LoadingState } from "./components/Feedback.jsx";
import {
  ActivityPage,
  FilesPage,
  LoginPage,
  OverviewPage,
  ResourcesPage,
  TasksPage,
  UsersPage,
} from "./pages/index.js";
import { CreateUserDialog, LicenseDialog } from "./components/UserDialogs.jsx";
import { getAdminResource } from "./services/admin.service.js";

export function AdminApp() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AdminRouter />
      </NotificationProvider>
    </AuthProvider>
  );
}

function AdminRouter() {
  const auth = useAuth();
  const notify = useNotify();
  const [page, setPage] = useState("overview");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedResource, setSelectedResource] = useState(null);
  const [modal, setModal] = useState(null);
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");
  const resourceRequest = useRef(0);

  const pageState = useAdminPageData({
    page,
    selectedUserId,
    request: auth.request,
    enabled: auth.isAdmin,
  });

  const actions = useAdminActions({
    request: auth.request,
    notify,
    refreshUsers: () => pageState.refresh("users"),
  });

  async function handleLogin(credentials) {
    setLoginBusy(true);
    setLoginError("");
    try {
      await auth.login(credentials);
      setPage("overview");
      setSelectedUserId("");
    } catch (error) {
      setLoginError(error.message || "Đăng nhập không thành công.");
    } finally {
      setLoginBusy(false);
    }
  }

  function navigate(target) {
    setPage(target);
    if (target !== "resources") {
      resourceRequest.current += 1;
      setSelectedResource(null);
    }
  }

  async function handleCreateUser(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (await actions.createUser(values)) setModal(null);
  }

  async function handleUpdateLicense(event) {
    event.preventDefault();
    if (!modal?.user) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (await actions.updateLicense(modal.user, values)) setModal(null);
  }

  async function handleSelectResource(resource) {
    const requestId = ++resourceRequest.current;
    setSelectedResource({ ...resource, loading: true });
    try {
      const result = await getAdminResource(auth.request, resource.name);
      if (resourceRequest.current === requestId)
        setSelectedResource({
          ...resource,
          content: result.content,
          loading: false,
        });
    } catch (error) {
      if (resourceRequest.current === requestId)
        setSelectedResource({
          ...resource,
          error: error.message,
          loading: false,
        });
    }
  }

  async function handleCopyResource() {
    if (!selectedResource?.content) return;
    try {
      await navigator.clipboard.writeText(selectedResource.content);
      notify("Đã sao chép nội dung tài nguyên.");
    } catch {
      notify("Không thể truy cập clipboard của trình duyệt.", true);
    }
  }

  if (!auth.isAdmin) {
    return (
      <LoginPage
        apiBase={auth.apiBase}
        error={loginError}
        busy={loginBusy}
        onSubmit={handleLogin}
      />
    );
  }

  let content;
  if (pageState.error && !pageState.data)
    content = (
      <ErrorState
        message={pageState.error}
        onRetry={() => void pageState.refresh().catch(() => {})}
      />
    );
  else if (!pageState.data)
    content = (
      <LoadingState
        label={
          pageState.loading
            ? "Đang tải dữ liệu từ backend…"
            : "Đang chuẩn bị trang…"
        }
      />
    );
  else if (page === "overview")
    content = <OverviewPage data={pageState.data} onNavigate={navigate} />;
  else if (page === "users")
    content = (
      <UsersPage
        users={pageState.data || []}
        onAdd={() => setModal({ type: "create" })}
        onEdit={(user) => setModal({ type: "license", user })}
        onToggle={actions.toggleUser}
        busyUserId={actions.busyUserId}
      />
    );
  else if (page === "files")
    content = (
      <FilesPage
        data={pageState.data || { users: [], files: [] }}
        selectedUserId={selectedUserId}
        onSelect={setSelectedUserId}
      />
    );
  else if (page === "resources")
    content = (
      <ResourcesPage
        resources={pageState.data || []}
        selected={selectedResource}
        onSelect={handleSelectResource}
        onCopy={handleCopyResource}
      />
    );
  else if (page === "tasks")
    content = <TasksPage tasks={pageState.data || []} />;
  else content = <ActivityPage events={pageState.data || []} />;

  return (
    <>
      <AdminLayout
        page={page}
        user={auth.session?.user}
        backendOnline={auth.backendOnline}
        loading={pageState.loading}
        error={pageState.data ? pageState.error : ""}
        onNavigate={navigate}
        onRefresh={() => void pageState.refresh().catch(() => {})}
        onLogout={() => void auth.logout()}
      >
        {content}
      </AdminLayout>
      {modal?.type === "create" && (
        <CreateUserDialog
          onClose={() => setModal(null)}
          onSubmit={handleCreateUser}
          saving={actions.saving}
        />
      )}
      {modal?.type === "license" && (
        <LicenseDialog
          user={modal.user}
          onClose={() => setModal(null)}
          onSubmit={handleUpdateLicense}
          saving={actions.saving}
        />
      )}
    </>
  );
}
