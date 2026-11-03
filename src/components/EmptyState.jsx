import { FolderOpen } from "lucide-react";

export function EmptyState({ icon: Icon = FolderOpen, title, detail }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={21} />
      </span>
      <strong>{title}</strong>
      {detail && <p>{detail}</p>}
    </div>
  );
}
