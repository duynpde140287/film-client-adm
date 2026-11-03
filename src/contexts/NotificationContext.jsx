import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const notify = useCallback((message, isError = false) => {
    window.clearTimeout(timer.current);
    setToast({ message, isError });
    timer.current = window.setTimeout(() => setToast(null), 3600);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      {toast && (
        <div
          className={`toast${toast.isError ? " toast-error" : ""}`}
          role="status"
        >
          {toast.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotify() {
  const notify = useContext(NotificationContext);
  if (!notify)
    throw new Error("useNotify must be used inside NotificationProvider");
  return notify;
}
