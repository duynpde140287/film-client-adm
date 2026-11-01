# FilmX Admin Web

Web admin riêng, dùng chung backend FilmX nhưng tách khỏi tool frontend. Frontend này có Git repository riêng, độc lập với `client-app` và `server`.

## Công nghệ và chạy local

Web admin dùng React 19, Vite và Lucide; nó có bố cục sidebar/header/workspace giống tool frontend, nhưng là website riêng.

Frontend chỉ gọi API của backend FilmX để gửi hoặc nhận dữ liệu. FE không kết nối
database và không tự xử lý quyền, license hay nghiệp vụ; backend xác thực vai trò,
thực hiện quy tắc nghiệp vụ và đọc/ghi database. Tool frontend và web admin tiếp
tục dùng chung backend.

1. Khởi động backend FilmX.
2. Trong thư mục này chạy `npm install`, sau đó `npm start`.
3. Mở `http://127.0.0.1:4174`, nhập API URL (mặc định `http://127.0.0.1:3000/api`) và đăng nhập bằng tài khoản có role `admin`.

Build production bằng `npm run build`; Vite tạo nội dung trong `dist/`.

Tạo/cập nhật admin đã được yêu cầu trong PowerShell bằng cách nhập password ẩn, không ghi password vào command hoặc file:

```powershell
$secure = Read-Host 'Admin password (hidden)' -AsSecureString
try {
  $env:ADMIN_PROVISION_PASSWORD = [System.Net.NetworkCredential]::new('', $secure).Password
  npm run setup:admin --prefix ..\server
} finally {
  Remove-Item Env:ADMIN_PROVISION_PASSWORD -ErrorAction SilentlyContinue
}
```

Backend cho phép origin local admin `127.0.0.1:4174` và `localhost:4174`. Khi deploy, thêm origin web admin thật vào `CORS_ORIGINS` của backend.

## Phân quyền

- Admin đăng nhập qua `/admin/auth/login`; phiên này được gắn scope `admin`.
- Toàn bộ `/admin/*` cần role `admin`; API tool chỉ chấp nhận role `user`.
- Admin có thể tạo USER, khóa/mở khóa, sửa thời hạn license, gói và credit.
- Password được hash bằng scrypt trước khi ghi vào bảng `users`.
- Màn hình không trả password hash, license hash hoặc cookie AI.

## Nguồn dữ liệu

Các màn hình dùng bảng lõi hiện tại `users`, `cookiee`, `templates`, `project`. Tài nguyên `PARENT_MASTER_*` chỉ xem từ thư mục đang được backend sử dụng. Jobs và audit hiện là runtime memory theo thiết kế hiện tại; giao diện nêu rõ chúng mất khi backend restart. Không thêm bảng hoặc kiến trúc database riêng cho admin.
