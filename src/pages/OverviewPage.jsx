import {
  Activity,
  ArrowUpRight,
  BookOpen,
  CircleHelp,
  ClipboardList,
  FolderOpen,
  ShieldCheck,
  Users,
} from "lucide-react";
import { CardHeading } from "../components/CardHeading.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { MetricCard } from "../components/MetricCard.jsx";
import { TaskTable } from "../components/TaskTable.jsx";
import { formatDateTime, formatNumber } from "../utils/format.js";

export function OverviewPage({ data, onNavigate }) {
  const stats = data.stats || {};
  return (
    <div className="page-content">
      <div className="metric-grid">
        <MetricCard
          icon={Users}
          label="TÀI KHOẢN USER"
          value={stats.users}
          note={`${formatNumber(stats.activeUsers)} đang hoạt động`}
          tone="blue"
        />
        <MetricCard
          icon={FolderOpen}
          label="DỰ ÁN"
          value={stats.projects}
          note="Trong database FilmX"
          tone="violet"
        />
        <MetricCard
          icon={BookOpen}
          label="TEMPLATE"
          value={stats.templates}
          note={`${formatNumber(stats.incompleteTemplates)} đang hoàn thiện`}
          tone="amber"
        />
        <MetricCard
          icon={Activity}
          label="TÁC VỤ ĐANG CHẠY"
          value={stats.activeTasks}
          note="Worker backend hiện tại"
          tone="green"
        />
        <MetricCard
          icon={ShieldCheck}
          label="COOKIE AI CONNECTED"
          value={stats.connectedCookies}
          note={`${formatNumber(stats.expiredCookies)} hết hạn`}
          tone="cyan"
        />
      </div>
      <div className="dashboard-grid">
        <section className="surface-card dashboard-tasks">
          <CardHeading
            eyebrow="AI WORKER"
            title="Tác vụ đang chạy"
            action={
              <button className="text-link" onClick={() => onNavigate("tasks")}>
                Mở danh sách <ArrowUpRight size={15} />
              </button>
            }
          />
          {data.activeTasks?.length ? (
            <TaskTable tasks={data.activeTasks} compact />
          ) : (
            <EmptyState
              icon={Activity}
              title="Không có tác vụ đang chạy"
              detail="Tác vụ mới sẽ xuất hiện ở đây."
            />
          )}
        </section>
        <section className="surface-card dashboard-activity">
          <CardHeading
            eyebrow="ACTIVITY"
            title="Hoạt động gần đây"
            action={
              <button
                className="text-link"
                onClick={() => onNavigate("activity")}
              >
                Xem nhật ký <ArrowUpRight size={15} />
              </button>
            }
          />
          {data.recentActivity?.length ? (
            <div className="activity-feed">
              {data.recentActivity.map((item) => (
                <div className="activity-item" key={item.id}>
                  <span className="activity-dot">✓</span>
                  <div>
                    <strong>{item.action}</strong>
                    <p>
                      {item.actor} <span>·</span>{" "}
                      {formatDateTime(item.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="Chưa có hoạt động"
              detail="Nhật ký phiên backend sẽ hiển thị tại đây."
            />
          )}
        </section>
      </div>
      {data.runtimeNotice && (
        <div className="info-banner">
          <CircleHelp size={16} />
          <span>{data.runtimeNotice}</span>
        </div>
      )}
    </div>
  );
}
