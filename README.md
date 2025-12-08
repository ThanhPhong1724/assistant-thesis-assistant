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
| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **API** | http://localhost:3001 |
| **Swagger Docs** | http://localhost:3001/api/docs |
| **MinIO Console** | http://localhost:9001 |

### Tài khoản demo
- **Admin**: `admin@thesis.local` / `admin123`
- **Student**: `student@thesis.local` / `student123`

---

## 📱 Hướng dẫn sử dụng

### 1. Đăng nhập
1. Truy cập http://localhost:3000/login
2. Nhập email và password
3. Click "Đăng nhập"

### 2. Dashboard
- Xem danh sách tài liệu đã tạo
- Click "Tạo tài liệu mới" để bắt đầu

### 3. Tạo tài liệu mới
1. Click **+ Tạo tài liệu mới**
2. Điền thông tin:
   - Tên đề tài
   - Mô tả (tùy chọn)
   - Chọn Trường, Khoa
   - Chọn loại tài liệu (Đồ án, Luận văn...)
   - Chọn Format chuẩn
3. Click **Tạo tài liệu**

### 4. Soạn thảo nội dung
1. Từ Dashboard → Click vào tài liệu
2. **Sidebar trái**: Đề cương
   - Click **+** để thêm chương mới
   - Click vào chương để chọn
3. **Vùng soạn thảo**: 
   - Toolbar: Bold, Italic, H2, H3, Lists, Quote, Code
   - Auto-save sau 2 giây
   - Hoặc nhấn **Ctrl+S** để lưu ngay

### 5. Xuất file Word
- Click nút **📄 Xuất Word** ở header
- File .docx sẽ tự động download với format chuẩn

### 6. Format Lab
- Truy cập `/format-lab` để xem chi tiết format profiles
- Tabs: Trang, Styles, Đánh số, Mục lục, JSON

---

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

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | NestJS, Prisma, PostgreSQL |
| **Frontend** | Next.js 14, Tailwind CSS, Zustand |
| **Auth** | JWT + Passport |
| **Export** | docx.js |
| **Editor** | TipTap |
| **DevOps** | Docker, Turborepo, pnpm |

---

## 📚 Features

### ✅ Đã hoàn thành

| Feature | Mô tả |
|---------|-------|
| **Authentication** | Đăng nhập/Đăng ký với JWT |
| **Document CRUD** | Tạo, xem, sửa, xóa tài liệu |
| **Outline Editor** | Quản lý cây đề cương (chapters/sections) |
| **Content Editor** | Rich text editor với TipTap |
| **Word Export** | Xuất file .docx chuẩn format |
| **Format Lab** | Xem chi tiết format profiles |
| **AI Integration** | Multi-provider (Groq, Gemini, OpenRouter, Ollama, OpenAI) |
| **Validation** | Kiểm tra document theo format profile |
| **Admin Dashboard** | Quản trị hệ thống |

### 🔄 Coming Soon
- PDF Export
- Word file validation
- Responsive mobile design

---

## 🔌 API Endpoints

### Auth
```
POST /api/auth/register    - Đăng ký
POST /api/auth/login       - Đăng nhập
GET  /api/auth/me          - Lấy thông tin user
```

### Documents
```
GET  /api/documents        - Danh sách tài liệu
POST /api/documents        - Tạo tài liệu
GET  /api/documents/:id    - Chi tiết tài liệu
PUT  /api/documents/:id    - Cập nhật
POST /api/documents/:id/export/word  - Xuất Word
GET  /api/documents/:id/validation   - Kiểm tra format
```

### AI (Yêu cầu API keys trong .env)
```
GET  /api/ai/providers        - Danh sách providers khả dụng
POST /api/ai/suggest-outline  - Gợi ý đề cương
POST /api/ai/suggest-content  - Gợi ý nội dung
POST /api/ai/rewrite-academic - Viết lại văn phong học thuật
```

---

## ⚙️ Environment Variables

```env
# Database
DATABASE_URL=postgresql://thesis:thesis@localhost:5432/thesis_db

# JWT
JWT_SECRET=your-super-secret-key

# AI Providers (optional)
GROQ_API_KEY=your-groq-key
GEMINI_API_KEY=your-gemini-key
OPENROUTER_API_KEY=your-openrouter-key
OLLAMA_BASE_URL=http://localhost:11434
OPENAI_API_KEY=your-openai-key
```

---

## 📝 License

MIT