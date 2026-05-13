# 📝 Quiz App – Kiểm Tra Kiến Thức

Ứng dụng trắc nghiệm kiến thức trực tuyến, xây dựng bằng **Vue.js 3** (frontend) và **Express.js + Supabase** (backend), hỗ trợ deploy lên **Vercel**.

---

## ✨ Tính năng

- Chọn danh mục câu hỏi (Toán, Lịch sử - Địa lý, Tiếng Anh, ...)
- Nhập tên người chơi trước khi bắt đầu
- Chọn số lượng câu hỏi: **20 / 30 / 50 câu**
- Câu hỏi 4 lựa chọn (A, B, C, D) được xáo trộn ngẫu nhiên
- Đồng hồ đếm giờ trong quá trình làm bài
- Thanh điều hướng tiến trình, có thể nhảy đến bất kỳ câu nào
- Gợi ý (hint) cho mỗi câu hỏi
- Xem lại kết quả chi tiết sau khi nộp bài (đúng / sai / bỏ qua)
- Lưu kết quả vào **Bảng Xếp Hạng** (Leaderboard)
- Xem bảng xếp hạng top 50 theo điểm số & thời gian

---

## 🗂 Cấu trúc dự án

```
quiz-app/
├── api/                        # Vercel Serverless Functions
│   ├── categories.js
│   ├── questions.js
│   ├── submit.js
│   └── leaderboard.js
├── backend/                    # Express.js API server (chạy local)
│   ├── src/
│   │   ├── config/             # Cấu hình Supabase client
│   │   ├── controllers/        # Logic xử lý từng endpoint
│   │   │   ├── categoryController.js
│   │   │   ├── questionController.js
│   │   │   ├── submitController.js
│   │   │   └── leaderboardController.js
│   │   ├── routes/             # Định nghĩa routes
│   │   └── utils/              # Hàm tiện ích (shuffle, ...)
│   ├── index.js                # Entry point (dùng cho local dev)
│   ├── generate.js             # Script tạo câu hỏi mẫu & seed SQL
│   ├── questions.json          # Dữ liệu câu hỏi (nguồn seed)
│   └── package.json
├── frontend/                   # Vue.js 3 frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── CategorySelect.vue   # Màn hình chọn danh mục & bảng xếp hạng
│   │   │   ├── QuizView.vue         # Màn hình làm bài (container chính)
│   │   │   ├── QuizQuestion.vue     # Component hiển thị từng câu hỏi
│   │   │   └── QuizResult.vue       # Màn hình kết quả
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css
│   └── index.html
├── supabase/
│   └── migrations/             # SQL migration cho Supabase
│       ├── 20260507000000_new-migration.sql   # Tạo bảng categories & questions
│       └── quiz_results.sql                   # Tạo bảng quiz_results
├── vercel.json                 # Cấu hình deploy Vercel
└── package.json                # Root package: chạy đồng thời backend + frontend
```

---

## 🚀 Phát triển local

### Yêu cầu

- Node.js >= 18
- Tài khoản [Supabase](https://supabase.com)

### Cài đặt

```bash
# Clone project
git clone <repo-url>
cd quiz-app

# Cài dependencies root
npm install

# Cài dependencies backend
cd backend && npm install && cd ..

# Cài dependencies frontend
cd frontend && npm install && cd ..
```

### Cấu hình biến môi trường

Tạo file `backend/.env`:

```env
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_KEY=<your-anon-key>
```

### Chạy ứng dụng

```bash
npm run dev
```

Lệnh này chạy đồng thời:

- **Backend** Express.js tại `http://localhost:5000`
- **Frontend** Vite dev server tại `http://localhost:5173`

---

## 🗄 Database Schema (Supabase)

### `categories`

| Cột           | Kiểu          | Mô tả          |
| ------------- | ------------- | -------------- |
| `id`          | UUID (PK)     | Khóa chính     |
| `name`        | TEXT          | Tên danh mục   |
| `slug`        | TEXT (UNIQUE) | Định danh URL  |
| `description` | TEXT          | Mô tả danh mục |
| `created_at`  | TIMESTAMP     | Thời gian tạo  |

### `questions`

| Cột                     | Kiểu      | Mô tả                         |
| ----------------------- | --------- | ----------------------------- |
| `id`                    | UUID (PK) | Khóa chính                    |
| `category_id`           | UUID (FK) | Liên kết `categories.id`      |
| `question_text`         | TEXT      | Nội dung câu hỏi              |
| `option_a` – `option_d` | TEXT      | 4 đáp án                      |
| `correct_option`        | TEXT      | Đáp án đúng (`A`/`B`/`C`/`D`) |
| `hint`                  | TEXT      | Gợi ý                         |
| `created_at`            | TIMESTAMP | Thời gian tạo                 |

### `quiz_results`

| Cột               | Kiểu      | Mô tả                    |
| ----------------- | --------- | ------------------------ |
| `id`              | UUID (PK) | Khóa chính               |
| `player_name`     | TEXT      | Tên người chơi           |
| `category_name`   | TEXT      | Tên danh mục đã làm      |
| `total_questions` | INTEGER   | Tổng số câu              |
| `correct_count`   | INTEGER   | Số câu đúng              |
| `wrong_count`     | INTEGER   | Số câu sai               |
| `skipped_count`   | INTEGER   | Số câu bỏ qua            |
| `score`           | INTEGER   | Điểm (%)                 |
| `time_spent`      | INTEGER   | Thời gian làm bài (giây) |
| `created_at`      | TIMESTAMP | Thời gian nộp bài        |

---

## 🔌 API Endpoints

| Method | Endpoint                                        | Mô tả                                |
| ------ | ----------------------------------------------- | ------------------------------------ |
| GET    | `/api/categories`                               | Lấy danh sách danh mục               |
| GET    | `/api/questions?category=UUID&limit=20\|30\|50` | Lấy câu hỏi ngẫu nhiên theo danh mục |
| POST   | `/api/submit`                                   | Nộp bài, chấm điểm & lưu kết quả     |
| GET    | `/api/leaderboard`                              | Lấy bảng xếp hạng top 50             |
| GET    | `/api/test`                                     | Kiểm tra trạng thái backend          |

### POST `/api/submit` – Request body

```json
{
  "answers": [{ "id": "question-uuid", "selected": "A" }],
  "allQuestionIds": ["uuid1", "uuid2"],
  "totalQuestions": 30,
  "playerName": "Nguyễn Văn A",
  "categoryName": "Toán Tiểu Học",
  "timeSpent": 180
}
```

---

## 🌐 Deploy lên Vercel

Project được cấu hình sẵn để deploy trên Vercel với **Serverless Functions** trong thư mục `api/`.

```bash
npm install -g vercel
vercel
```

Vercel sẽ tự động:

1. Build frontend: `cd frontend && npm install && npm run build`
2. Serve output từ `frontend/dist`
3. Expose API serverless tại `/api/*`
4. Cấu hình rewrite SPA cho Vue Router

### Biến môi trường trên Vercel

Vào **Project Settings → Environment Variables** và thêm:

```
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_KEY=<your-anon-key>
```

---

## 🛠 Scripts

| Lệnh                       | Mô tả                                           |
| -------------------------- | ----------------------------------------------- |
| `npm run dev`              | Chạy đồng thời backend + frontend (development) |
| `npm run backend`          | Chỉ chạy Express backend                        |
| `npm run frontend`         | Chỉ chạy Vite frontend                          |
| `node backend/generate.js` | Tạo file `seed_questions.sql` từ Supabase       |

---

## 🧩 Tech Stack

| Layer              | Công nghệ                        |
| ------------------ | -------------------------------- |
| Frontend           | Vue.js 3 (Composition API), Vite |
| Backend            | Node.js, Express.js 5            |
| Database           | Supabase (PostgreSQL)            |
| Hosting            | Vercel (Serverless)              |
| Realtime DB Client | `@supabase/supabase-js`          |
