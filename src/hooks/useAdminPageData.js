import { useCallback, useEffect, useRef, useState } from "react";
import {
  getAdminActivity,
  getAdminOverview,
  getAdminResources,
  getAdminTasks,
  getAdminUserFiles,
  getAdminUsers,
} from "../services/admin.service.js";

async function loadAdminPage(page, selectedUserId, request) {
  if (page === "overview") return getAdminOverview(request);
  if (page === "users") return getAdminUsers(request);
  if (page === "files") {
    const users = await getAdminUsers(request);
    const userId = selectedUserId || users[0]?.id || "";
    const files = userId ? await getAdminUserFiles(request, userId) : [];
    return { users, files, selectedUserId: userId };
  }
  if (page === "resources") return getAdminResources(request);
  if (page === "tasks") return getAdminTasks(request);
  if (page === "activity") return getAdminActivity(request);
  return getAdminOverview(request);
}

export function useAdminPageData({
  page,
  selectedUserId,
  request,
  enabled = true,
}) {
  const [resultState, setResultState] = useState({ key: "", data: null });
  const [requestState, setRequestState] = useState({
    key: "",
    loading: false,
    error: "",
  });
  const requestVersion = useRef(0);
  const currentKey = page === "files" ? `${page}:${selectedUserId}` : page;

  const refresh = useCallback(
    async (targetPage = page, targetUserId = selectedUserId) => {
      if (!enabled) return null;
      const key =
        targetPage === "files" ? `${targetPage}:${targetUserId}` : targetPage;
      const version = ++requestVersion.current;
      setRequestState({ key, loading: true, error: "" });
      setResultState({ key, data: null });
      try {
        const result = await loadAdminPage(targetPage, targetUserId, request);
        if (requestVersion.current === version) {
          setResultState({ key, data: result });
          setRequestState({ key, loading: false, error: "" });
        }
        return result;
      } catch (cause) {
        if (requestVersion.current === version) {
          setResultState({ key, data: null });
          setRequestState({
            key,
            loading: false,
            error: cause.message || "Không tải được dữ liệu.",
          });
        }
        throw cause;
      }
    },
    [enabled, page, request, selectedUserId],
  );

  useEffect(() => {
    if (!enabled) {
      requestVersion.current += 1;
      setResultState({ key: "", data: null });
      setRequestState({ key: "", loading: false, error: "" });
      return undefined;
    }
    void refresh().catch(() => {});
    return () => {
      requestVersion.current += 1;
    };
  }, [enabled, refresh]);

  return {
    data: enabled && resultState.key === currentKey ? resultState.data : null,
    loading: enabled && requestState.key === currentKey && requestState.loading,
    error: enabled && requestState.key === currentKey ? requestState.error : "",
    refresh,
  };
}
