import { BookOpen, ChevronRight, Copy, FileText } from "lucide-react";
import { CardHeading } from "../components/CardHeading.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { LoadingState } from "../components/Feedback.jsx";
import { formatDateTime } from "../utils/format.js";

export function ResourcesPage({ resources, selected, onSelect, onCopy }) {
  return (
    <div className="resource-grid">
      <section className="surface-card resource-list-card">
        <CardHeading
          eyebrow="PARENT TEMPLATES"
          title="Tài nguyên gốc"
          trailing={<span className="readonly-tag">Chỉ xem</span>}
        />
        {resources.length ? (
          <div className="resource-list">
            {resources.map((item) => (
              <button
                className={`resource-row${selected?.name === item.name ? " resource-selected" : ""}`}
                key={item.name}
                onClick={() => onSelect(item)}
              >
                <span className="resource-type">TXT</span>
                <span className="resource-meta">
                  <strong>{item.name}</strong>
                  <small>
                    {(item.bytes / 1024).toFixed(1)} KB <span>·</span>{" "}
                    {formatDateTime(item.updatedAt)}
                  </small>
                </span>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="Không tìm thấy tài nguyên"
            detail="Backend chưa có parent template được allowlist."
          />
        )}
      </section>
      <section className="surface-card resource-preview-card">
        <CardHeading
          eyebrow="RESOURCE PREVIEW"
          title={selected?.name || "Xem nội dung"}
          action={
            selected?.content && (
              <button
                className="button button-secondary button-small"
                onClick={onCopy}
              >
                <Copy size={14} /> Sao chép
              </button>
            )
          }
        />
        {!selected ? (
          <EmptyState
            icon={FileText}
            title="Chọn một tài nguyên"
            detail="Nội dung preview chỉ được tải khi chọn file."
          />
        ) : selected.loading ? (
          <LoadingState label="Đang tải nội dung…" />
        ) : selected.error ? (
          <div className="resource-error">{selected.error}</div>
        ) : (
          <pre className="resource-content">{selected.content}</pre>
        )}
      </section>
    </div>
  );
}
