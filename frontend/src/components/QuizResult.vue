<script setup>
const props = defineProps({
  result: { type: Object, required: true },
  total: { type: Number, required: true },
  timeSpent: { type: Number, default: 0 },
})

const emit = defineEmits(['restart'])

function getGrade(score) {
  if (score >= 90) return { label: 'Xuất sắc! 🏆', color: '#1e8e3e' }
  if (score >= 70) return { label: 'Tốt! 👍', color: '#1a73e8' }
  if (score >= 50) return { label: 'Trung bình 📚', color: '#f9a825' }
  return { label: 'Cần cố gắng hơn 💪', color: '#d93025' }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="result-wrapper">
    <div class="result-card main-card">
      <!-- Header -->
      <div class="result-header">
        <div class="result-icon">🎯</div>
        <h2 class="result-title">Kết quả bài thi</h2>
        <p class="result-subtitle">{{ result.categoryName || 'Không xác định' }} · {{ result.questionPackage || total }} câu</p>
        <p class="player-name-display">{{ result.playerName || '' }}</p>
      </div>

      <!-- Score Circle -->
      <div class="score-circle">
        <div class="score-number">{{ result.score }}<span class="score-pct">%</span></div>
        <div class="score-grade" :style="{ color: getGrade(result.score).color }">
          {{ getGrade(result.score).label }}
        </div>
      </div>

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat-box stat-correct">
          <div class="stat-num">{{ result.correct }}</div>
          <div class="stat-lbl">✓ Câu đúng</div>
        </div>
        <div class="stat-box stat-wrong">
          <div class="stat-num">{{ result.wrong }}</div>
          <div class="stat-lbl">✕ Câu sai</div>
        </div>
        <div class="stat-box stat-time">
          <div class="stat-num">{{ formatTime(timeSpent) }}</div>
          <div class="stat-lbl">⏱️ Thời gian</div>
        </div>
        <div class="stat-box stat-total">
          <div class="stat-num">{{ result.answered }}</div>
          <div class="stat-lbl">📝 Đã làm</div>
        </div>
      </div>

      <!-- Skipped notice -->
      <p v-if="(result.skipped || 0) > 0" class="skipped-notice">
        ⚠️ {{ result.skipped }} câu bỏ qua (tính là sai)
      </p>

      <!-- Action Buttons -->
      <div class="result-actions">
        <button class="btn-restart" @click="emit('restart')">
          🏠 Trang chủ
        </button>
      </div>
    </div>

    <!-- Review Section -->
    <div v-if="result.results && result.results.length > 0" class="result-card review-card">
      <h3 class="review-title">📋 Xem lại đáp án</h3>
      <div class="review-list">
        <div 
          v-for="ans in result.results" 
          :key="ans.id"
          class="review-item"
          :class="ans.skipped ? 'is-skipped' : (ans.correct ? 'is-correct' : 'is-wrong')"
        >
          <p class="review-question">
            <strong>Câu {{ ans.order }}:</strong> 
            <span v-if="ans.skipped" class="skipped-label">[Đã bỏ qua]</span>
            <span>{{ ans.question }}</span>
          </p>
          
          <div v-if="!ans.skipped" class="review-answers">
            <div class="answer-box user-answer" v-if="!ans.correct">
              <span class="ans-label">Bạn chọn:</span>
              <span class="ans-text">{{ ans.correct ? '✓' : '✕' }} {{ ans.userAnswer }}. {{ ans.userAnswerText || 'Bỏ trống' }}</span>
            </div>
            
            <div class="answer-box correct-answer">
              <span class="ans-label">Đáp án đúng:</span>
              <span class="ans-text">✓ {{ ans.correctAnswer }}. {{ ans.correctAnswerText }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 800px;
}

.result-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
  padding: 40px 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-card {
  gap: 28px;
}

.result-header {
  text-align: center;
}

.result-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.result-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 6px;
}

.result-subtitle {
  color: #777;
  font-size: 14px;
  margin: 0;
}

.player-name-display {
  font-size: 18px;
  font-weight: 700;
  color: #1a73e8;
  margin: 8px 0 0;
}

/* Score Circle */
.score-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e8f0fe 0%, #c2d7fb 100%);
  border: 4px solid #1a73e8;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(26, 115, 232, 0.25);
}

.score-number {
  font-size: 44px;
  font-weight: 800;
  color: #1a1a2e;
  line-height: 1;
}

.score-pct {
  font-size: 20px;
  font-weight: 600;
  color: #555;
}

.score-grade {
  font-size: 14px;
  font-weight: 600;
  margin-top: 4px;
}

/* Stats */
.stats-row {
  display: flex;
  gap: 16px;
  width: 100%;
}

.stat-box {
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
}

.stat-correct { background: #e6f4ea; }
.stat-wrong { background: #fdecea; }
.stat-time { background: #fff3e0; }
.stat-total { background: #e8f0fe; }

.stat-num {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
}

.stat-lbl {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
}

.skipped-notice {
  color: #f9a825;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.result-actions {
  display: flex;
  gap: 12px;
}

.btn-restart {
  background: #1a73e8;
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 12px 32px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.btn-restart:hover {
  background: #1557b0;
  transform: translateY(-1px);
}

/* Review Section */
.review-card {
  align-items: flex-start;
  padding: 30px;
}

.review-title {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #1a1a2e;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.review-item {
  background: #f8f9fa;
  border-left: 4px solid #ccc;
  padding: 16px;
  border-radius: 4px 8px 8px 4px;
}

.review-item.is-correct {
  border-left-color: #34a853;
}

.review-item.is-wrong {
  border-left-color: #ea4335;
  background: #fff8f7;
}

.review-item.is-skipped {
  border-left-color: #f9a825;
  background: #fffbf0;
}

.review-question {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #333;
  line-height: 1.5;
}

.skipped-label {
  color: #f9a825;
  font-weight: 600;
  font-style: italic;
}

.review-answers {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.answer-box {
  display: flex;
  gap: 8px;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 6px;
}

.user-answer {
  background: #fdecea;
  color: #d93025;
}

.correct-answer {
  background: #e6f4ea;
  color: #1e8e3e;
}

.ans-label {
  font-weight: 600;
  min-width: 90px;
}

.ans-text {
  flex: 1;
}
</style>
