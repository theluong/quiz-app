<script setup>
defineProps({
  result: { type: Object, required: true },
  total: { type: Number, required: true },
})

const emit = defineEmits(['restart'])

function getGrade(score) {
  if (score >= 90) return { label: 'Xuất sắc! 🏆', color: '#1e8e3e' }
  if (score >= 70) return { label: 'Tốt! 👍', color: '#1a73e8' }
  if (score >= 50) return { label: 'Trung bình 📚', color: '#f9a825' }
  return { label: 'Cần cố gắng hơn 💪', color: '#d93025' }
}
</script>

<template>
  <div class="result-card">
    <!-- Header -->
    <div class="result-header">
      <div class="result-icon">🎯</div>
      <h2 class="result-title">Kết quả bài thi</h2>
      <p class="result-subtitle">Kiểm tra từ vựng Du lịch &amp; Công tác</p>
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
      <div class="stat-box stat-total">
        <div class="stat-num">{{ result.answered }}</div>
        <div class="stat-lbl">📝 Đã trả lời</div>
      </div>
    </div>

    <!-- Skipped notice -->
    <p v-if="result.answered < total" class="skipped-notice">
      ⚠️ Bạn đã bỏ qua {{ total - result.answered }} câu hỏi
    </p>

    <!-- Action Buttons -->
    <div class="result-actions">
      <button class="btn-restart" @click="emit('restart')">
        🔄 Làm lại
      </button>
    </div>
  </div>
</template>

<style scoped>
.result-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 700px;
  padding: 40px 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
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

.stat-correct {
  background: #e6f4ea;
}

.stat-wrong {
  background: #fdecea;
}

.stat-total {
  background: #e8f0fe;
}

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
</style>
