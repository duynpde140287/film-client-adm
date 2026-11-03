import { Activity, CircleHelp } from "lucide-react";
import { CardHeading } from "../components/CardHeading.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { TaskTable } from "../components/TaskTable.jsx";

export function TasksPage({ tasks }) {
  return (
    <section className="surface-card">
      <CardHeading
        eyebrow="BACKEND WORKER"
        title={`${tasks.length.toLocaleString("vi-VN")} tác vụ gần nhất`}
        trailing={
          <span className="readonly-tag">
            <span className="status-led" /> Runtime
          </span>
        }
      />
      {tasks.length ? (
        <TaskTable tasks={tasks} />
      ) : (
        <EmptyState
          icon={Activity}
          title="Chưa có tác vụ"
          detail="Tác vụ AI mới sẽ xuất hiện tại đây."
        />
      )}
      <div className="info-banner">
        <CircleHelp size={16} />
        <span>
          Tác vụ hiện được giữ trong bộ nhớ backend và sẽ mất khi tiến trình
          backend khởi động lại.
        </span>
      </div>
    </section>
  );
}
