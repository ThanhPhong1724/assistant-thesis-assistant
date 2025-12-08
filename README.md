# Thesis Assistant

Hệ thống hỗ trợ viết đồ án/luận văn với format chuẩn 100% theo quy định của trường.

## 🚀 Quick Start

### Yêu cầu
- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

### Cài đặt

```bash
# Clone và cài đặt dependencies
pnpm install

# Copy file environment
cp .env.example .env

# Khởi động database
docker-compose up -d

# Generate Prisma client
pnpm db:generate

# Chạy migration và seed data
pnpm db:push
pnpm --filter @thesis/database seed

# Khởi động development servers
pnpm dev
```

### Truy cập
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api/docs
- **MinIO Console**: http://localhost:9001

### Tài khoản demo
- **Admin**: admin@thesis.local / admin123
- **Student**: student@thesis.local / student123

## 📁 Cấu trúc dự án

```
thesis-assistant/
├── apps/
│   ├── api/          # NestJS Backend
│   └── web/          # Next.js Frontend
├── packages/
│   ├── database/     # Prisma schema & migrations
│   └── shared/       # Shared types & constants
├── docker-compose.yml
└── turbo.json
```

## 🛠 Tech Stack

- **Backend**: NestJS, Prisma, PostgreSQL
- **Frontend**: Next.js 14, Tailwind CSS, TanStack Query
- **Auth**: JWT + Passport
- **Export**: docx.js
- **DevOps**: Docker, Turborepo, pnpm

## 📚 Features

- ✅ Quản lý tài liệu (CRUD)
- ✅ Cây nội dung (chapters, sections, paragraphs)
- ✅ Format profiles theo quy định trường
- ✅ Xuất file Word chuẩn format
- 🔄 AI gợi ý nội dung (coming soon)
- 🔄 Kiểm tra format file Word (coming soon)


Chức năng có thể test ngay
Đăng nhập/Đăng ký
http://localhost:3000/login
Tài khoản: 
admin@thesis.local
admin123

API Swagger Docs
http://localhost:3001/api/docs
Test tất cả endpoints API
CRUD Documents (qua API)
Tạo, xem, sửa, xóa tài liệu
Xuất Word (qua API)
POST /api/documents/{id}/export/word