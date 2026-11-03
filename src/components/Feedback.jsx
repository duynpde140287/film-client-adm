import { AlertCircle, RefreshCw } from "lucide-react";
import { Spinner } from "./Spinner.jsx";

export function LoadingState({ label = "Đang tải…" }) {
  return (
    <div className="loading-view">
      <Spinner /> <span>{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="error-view">
      <span className="error-icon">
        <AlertCircle size={20} />
      </span>
      <strong>Không tải được dữ liệu</strong>
      <p>{message}</p>
      {onRetry && (
        <button className="button button-secondary" onClick={onRetry}>
          <RefreshCw size={15} /> Thử lại
        </button>
      )}
    </div>
  );
}
