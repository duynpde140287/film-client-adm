import { ChevronDown, FileImage } from "lucide-react";
import { CardHeading } from "../components/CardHeading.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { formatDateTime, formatMegabytes } from "../utils/format.js";

export function FilesPage({ data, selectedUserId, onSelect }) {
  const selected = selectedUserId || data.selectedUserId || "";
  return (
    <section className="surface-card">
      <CardHeading
        eyebrow="CUSTOMER OUTPUTS"
        title="File và media đã sinh"
        action={
          <label className="select-control">
            <span>Tài khoản</span>
            <select
              value={selected}
              onChange={(event) => onSelect(event.target.value)}
            >
              {data.users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </label>
        }
      />
      <p className="section-description">
        Metadata đầu ra được đọc từ tác vụ của người dùng. Đường dẫn nội bộ
        không được gửi ra trình duyệt.
      </p>
      {data.files?.length ? (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>TÊN FILE</th>
                <th>DỰ ÁN</th>
                <th>LOẠI</th>
                <th>CẢNH</th>
                <th>DUNG LƯỢNG</th>
                <th>TRẠNG THÁI</th>
                <th>THỜI ĐIỂM</th>
              </tr>
            </thead>
            <tbody>
              {data.files.map((file) => (
                <tr key={file.id}>
                  <td>
                    <span className="file-label">
                      <FileImage size={15} />
                      {file.fileName}
                    </span>
                  </td>
                  <td>{file.projectName}</td>
                  <td>{file.kind}</td>
                  <td>{file.sceneIndex ?? "—"}</td>
                  <td>{formatMegabytes(file.bytes)}</td>
                  <td>
                    <StatusBadge value={file.status} />
                  </td>
                  <td>{formatDateTime(file.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={FileImage}
          title="Chưa có đầu ra media"
          detail="File sẽ hiện sau khi project tạo được voice, ảnh hoặc video."
        />
      )}
    </section>
  );
}
