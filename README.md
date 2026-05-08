# Quiz App

Ứng dụng quiz kiểm tra kiến thức với Vue.js và Supabase.

## Tính năng

- Chọn danh mục câu hỏi
- Trả lời câu hỏi với 4 lựa chọn (A, B, C, D)
- Gợi ý cho mỗi câu hỏi
- Xem lại đáp án sau khi nộp bài
- Hiển thị điểm số và thống kê

## Cấu trúc dự án

```
quiz-app/
├── backend/           # Express.js API server
│   ├── index.js       # API endpoints
│   └── seed_questions.sql
├── frontend/          # Vue.js frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── CategorySelect.vue
│   │   │   ├── QuizQuestion.vue
│   │   │   ├── QuizResult.vue
│   │   │   └── QuizView.vue
│   │   └── App.vue
│   └── index.html
├── vercel.json        # Vercel deployment config
└── package.json       # Root package (concurrently)
```

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/categories` | Lấy danh sách danh mục |
| GET | `/api/questions?category=UUID` | Lấy 30 câu hỏi ngẫu nhiên |
| POST | `/api/submit` | Nộp bài và chấm điểm |
| GET | `/api/test` | Test kết nối backend |

## Phát triển local

```bash
npm install
npm run dev
```

Chạy đồng thời backend (port 5000) và frontend (port 5173).

## Database Schema (Supabase)

### categories
- `id` UUID (PK)
- `name` TEXT
- `created_at` TIMESTAMP

### questions
- `id` UUID (PK)
- `category_id` UUID (FK)
- `order_number` INTEGER
- `question_text` TEXT
- `option_a`, `option_b`, `option_c`, `option_d` TEXT
- `correct_option` TEXT
- `hint` TEXT
- `created_at` TIMESTAMP

## Deploy lên Vercel

```bash
npm install -g vercel
vercel
```

Vercel sẽ tự động:
1. Build frontend với `npm run build` trong thư mục `frontend`
2. Deploy output ra thư mục `frontend/dist`
3. Cấu hình rewrites cho SPA routing và API proxy
