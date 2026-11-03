import { CircleHelp, ClipboardList } from "lucide-react";
import { CardHeading } from "../components/CardHeading.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { formatDateTime, formatNumber } from "../utils/format.js";

export function ActivityPage({ events }) {
  return (
    <section className="surface-card">
      <CardHeading
        eyebrow="AUDIT TRAIL"
        title={`${formatNumber(events.length)} sự kiện gần nhất`}
        trailing={
          <span className="readonly-tag">
            <span className="status-led" /> Runtime
          </span>
        }
      />
      {events.length ? (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>THỜI ĐIỂM</th>
                <th>TÀI KHOẢN</th>
                <th>HÀNH ĐỘNG</th>
                <th>KẾT QUẢ</th>
                <th>THAM CHIẾU</th>
              </tr>
            </thead>
            <tbody>
              {events.map((item) => (
                <tr key={item.id}>
                  <td>{formatDateTime(item.createdAt)}</td>
                  <td>{item.actor}</td>
                  <td>
                    <strong>{item.action}</strong>
                    <small className="table-subtext">{item.service}</small>
                  </td>
                  <td>
                    <StatusBadge value={item.result} />
                  </td>
                  <td className="mono">
                    {item.metadata?.projectId ||
                      item.metadata?.userId ||
                      item.metadata?.templateId ||
                      item.metadata?.jobId ||
                      "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="Chưa có sự kiện"
          detail="Nhật ký mới sẽ hiển thị khi có hoạt động trong backend."
        />
      )}
      <div className="info-banner">
        <CircleHelp size={16} />
        <span>
          Nhật ký hiện dùng bộ nhớ runtime của backend, không phải bảng audit
          trong ERD.
        </span>
      </div>
    </section>
  );
}
