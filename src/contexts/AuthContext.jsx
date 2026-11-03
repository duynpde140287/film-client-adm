import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { ADMIN_API_DEFAULT } from "../constants/admin-navigation.js";
import {
  apiRequest,
  persistAdminSession,
  readAdminSession,
  readApiBase,
} from "../services/api.service.js";
import { loginAdmin, logoutAdmin } from "../services/auth.service.js";

const AuthContext = createContext(null);

function loadAdminSession() {
  const stored = readAdminSession();
  if (stored?.user?.is_admin === 1) return stored;
  if (stored) persistAdminSession(null);
  return null;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadAdminSession);
  const [apiBase, setApiBase] = useState(() => readApiBase(ADMIN_API_DEFAULT));
  const [backendOnline, setBackendOnline] = useState(null);
  const sessionRef = useRef(session);

  const updateSession = useCallback((nextSession) => {
    sessionRef.current = nextSession;
    persistAdminSession(nextSession);
    setSession(nextSession);
  }, []);

  const request = useCallback(
    (path, options = {}) =>
      apiRequest(path, {
        ...options,
        base: options.base || apiBase,
        session:
          options.session === undefined ? sessionRef.current : options.session,
        onSessionChange: updateSession,
        onBackendStatus: setBackendOnline,
      }),
    [apiBase, updateSession],
  );

  const login = useCallback(
    async (credentials) => {
      const result = await loginAdmin({
        ...credentials,
        onBackendStatus: setBackendOnline,
      });
      if (result?.user?.is_admin !== 1)
        throw new Error("Tài khoản này không có quyền ADMIN.");
      const nextBase = readApiBase(ADMIN_API_DEFAULT);
      setApiBase(nextBase);
      updateSession(result);
      return result;
    },
    [updateSession],
  );

  const logout = useCallback(async () => {
    await logoutAdmin(request);
    updateSession(null);
  }, [request, updateSession]);

  return (
    <AuthContext.Provider
      value={{
        session,
        apiBase,
        backendOnline,
        isAdmin: session?.user?.is_admin === 1,
        request,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
