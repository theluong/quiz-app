const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

const questions = [
  {
    id: 1,
    question: "Trong ngân sách công tác, khoản tiền dùng cho các tình huống khẩn cấp hoặc không dự tính trước được gọi là gì?",
    options: { A: "Contingency fund", B: "Revenue", C: "Petty cash", D: "Fixed cost" },
    correct: "A",
    hint: "Đây là khoản dự phòng cho các chi phí bất ngờ trong chuyến công tác."
  },
  {
    id: 2,
    question: "Khi đặt phòng khách sạn cho đoàn công tác, thuật ngữ 'room block' có nghĩa là gì?",
    options: { A: "Phòng bị khóa", B: "Nhóm phòng được đặt trước với giá thương lượng", C: "Phòng không có cửa sổ", D: "Phòng dành cho VIP" },
    correct: "B",
    hint: "Đây là cách đặt phòng theo nhóm để hưởng giá ưu đãi."
  },
  {
    id: 3,
    question: "Từ nào dùng để mô tả vé máy bay có thể hoàn tiền hoặc đổi lịch bay?",
    options: { A: "Non-refundable", B: "Flexible ticket", C: "Budget fare", D: "One-way ticket" },
    correct: "B",
    hint: "Loại vé này cho phép thay đổi hành trình mà không mất phí cao."
  },
  {
    id: 4,
    question: "Trong lịch trình công tác quốc tế, 'layover' có nghĩa là gì?",
    options: { A: "Hành lý bị thất lạc", B: "Thời gian chờ ở sân bay trung chuyển", C: "Vé khứ hồi", D: "Chuyến bay thẳng" },
    correct: "B",
    hint: "Đây là khoảng thời gian giữa hai chuyến bay khi phải quá cảnh."
  },
  {
    id: 5,
    question: "Thuật ngữ 'per diem' trong công tác phí có nghĩa là gì?",
    options: { A: "Phí ăn uống cả chuyến", B: "Mức phụ cấp cố định mỗi ngày", C: "Chi phí đi lại", D: "Tiền thưởng công tác" },
    correct: "B",
    hint: "Đây là mức chi phí tối đa được thanh toán cho mỗi ngày công tác."
  },
  {
    id: 6,
    question: "Khi check-in tại sân bay, 'boarding pass' là gì?",
    options: { A: "Thẻ thành viên sân bay", B: "Thẻ lên tàu bay", C: "Giấy thông quan hải quan", D: "Thẻ hành lý" },
    correct: "B",
    hint: "Bạn cần xuất trình giấy tờ này để vào cửa và lên máy bay."
  },
  {
    id: 7,
    question: "Trong du lịch công vụ, 'expense report' là tài liệu dùng để làm gì?",
    options: { A: "Báo cáo doanh thu chuyến đi", B: "Khai báo và hoàn ứng chi phí công tác", C: "Đặt vé máy bay", D: "Lên kế hoạch lịch trình" },
    correct: "B",
    hint: "Sau chuyến công tác, nhân viên cần nộp tài liệu này để được hoàn tiền."
  },
  {
    id: 8,
    question: "Loại visa nào phù hợp nhất cho chuyến công tác ngắn ngày tại nước ngoài?",
    options: { A: "Tourist visa", B: "Student visa", C: "Business visa", D: "Transit visa" },
    correct: "C",
    hint: "Loại visa này cho phép tham dự hội nghị, gặp đối tác kinh doanh tại nước ngoài."
  },
  {
    id: 9,
    question: "Thuật ngữ 'itinerary' trong kế hoạch công tác có nghĩa là gì?",
    options: { A: "Ngân sách chuyến đi", B: "Lịch trình chi tiết chuyến đi", C: "Danh sách thành viên đoàn", D: "Hợp đồng với đối tác" },
    correct: "B",
    hint: "Tài liệu này mô tả từng bước trong hành trình: chuyến bay, khách sạn, các cuộc họp."
  },
  {
    id: 10,
    question: "Khi đặt vé máy bay hạng thương gia cho công tác, thuật ngữ nào mô tả đúng nhất?",
    options: { A: "Economy class", B: "First class", C: "Business class", D: "Premium economy" },
    correct: "C",
    hint: "Hạng ghế này nằm giữa economy và first class, thường dùng cho công tác dài ngày."
  }
];

// GET /api/questions
app.get("/api/questions", (req, res) => {
  // Phase 1: trả về câu hỏi nhưng KHÔNG có correct answer
  const safeQuestions = questions.map(({ correct, ...q }) => q);
  res.json({ total: safeQuestions.length, questions: safeQuestions });
});

// POST /api/submit
app.post("/api/submit", (req, res) => {
  const { answers } = req.body;
  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: "Invalid answers format" });
  }

  let correctCount = 0;
  const results = answers.map((ans) => {
    const question = questions.find((q) => q.id === ans.id);
    if (!question) return { id: ans.id, correct: false };
    const isCorrect = question.correct === ans.selected;
    if (isCorrect) correctCount++;
    return { id: ans.id, correct: isCorrect };
  });

  res.json({
    total: questions.length,
    answered: answers.length,
    correct: correctCount,
    wrong: answers.length - correctCount,
    score: Math.round((correctCount / questions.length) * 100),
    results,
  });
});

// GET /api/test
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend running OK" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});