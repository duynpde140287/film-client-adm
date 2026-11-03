import {
  Activity,
  BookOpen,
  ClipboardList,
  FileImage,
  LayoutDashboard,
  Users,
} from "lucide-react";

export const ADMIN_NAV_GROUPS = ["Điều hành", "Hệ thống"];

export const ADMIN_NAV_ITEMS = [
  {
    id: "overview",
    label: "Tổng quan",
    icon: LayoutDashboard,
    group: "Điều hành",
  },
  { id: "users", label: "Tài khoản USER", icon: Users, group: "Điều hành" },
  {
    id: "files",
    label: "File khách hàng",
    icon: FileImage,
    group: "Điều hành",
  },
  { id: "resources", label: "Template gốc", icon: BookOpen, group: "Hệ thống" },
  { id: "tasks", label: "Tác vụ AI", icon: Activity, group: "Hệ thống" },
  { id: "activity", label: "Nhật ký", icon: ClipboardList, group: "Hệ thống" },
];

export const ADMIN_PAGE_META = {
  overview: {
    eyebrow: "TỔNG QUAN",
    title: "Tổng quan hệ thống",
    description: "Theo dõi hoạt động và sức khỏe hệ thống FilmX.",
  },
  users: {
    eyebrow: "NGƯỜI DÙNG",
    title: "Tài khoản USER",
    description: "Quản lý quyền truy cập, license và gói sử dụng.",
  },
  files: {
    eyebrow: "ĐẦU RA KHÁCH HÀNG",
    title: "File khách hàng",
    description: "Theo dõi metadata media đã sinh theo từng tài khoản.",
  },
  resources: {
    eyebrow: "THƯ VIỆN HỆ THỐNG",
    title: "Template gốc",
    description: "Các tài nguyên đang được backend sử dụng trong pipeline.",
  },
  tasks: {
    eyebrow: "BACKEND WORKER",
    title: "Tác vụ AI",
    description: "Theo dõi hàng đợi và trạng thái tác vụ gần đây.",
  },
  activity: {
    eyebrow: "AUDIT TRAIL",
    title: "Nhật ký hoạt động",
    description: "Các sự kiện quản trị và thay đổi trong phiên backend.",
  },
};

export const ADMIN_API_DEFAULT = "http://127.0.0.1:3000/api";
