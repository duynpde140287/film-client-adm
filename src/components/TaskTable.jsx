import { formatDateTime, formatNumber } from "../utils/format.js";
import { StatusBadge } from "./StatusBadge.jsx";

export function TaskTable({ tasks, compact = false }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>USER</th>
            <th>LOẠI / CẢNH</th>
            <th>PROJECT</th>
            <th>TRẠNG THÁI</th>
            {!compact && <th>LẦN CHẠY</th>}
            <th>{compact ? "CẬP NHẬT" : "LỖI GẦN NHẤT"}</th>
            {!compact && <th>THỜI ĐIỂM</th>}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.user || "—"}</td>
              <td>
                {task.kind || "—"}
                {task.sceneIndex ? ` · cảnh ${task.sceneIndex}` : ""}
              </td>
              <td className="mono">{task.projectId || "—"}</td>
              <td>
                <StatusBadge value={task.status} />
              </td>
              {!compact && <td>{formatNumber(task.attempts)}</td>}
              <td className={task.error ? "error-text" : "muted"}>
                {compact ? formatDateTime(task.updatedAt) : task.error || "—"}
              </td>
              {!compact && <td>{formatDateTime(task.updatedAt)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
