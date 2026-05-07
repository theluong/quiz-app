<script setup>
import { ref, computed, onMounted } from 'vue'
import QuizQuestion from './QuizQuestion.vue'
import QuizResult from './QuizResult.vue'

const questions = ref([])
const currentIndex = ref(0)
const answers = ref({})
const submitted = ref(false)
const submitResult = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/questions')
    const data = await res.json()
    questions.value = data.questions
  } catch (e) {
    error.value = 'Không thể tải câu hỏi. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
})

const currentQuestion = computed(() => questions.value[currentIndex.value])
const total = computed(() => questions.value.length)
const currentNumber = computed(() => currentIndex.value + 1)

const answeredCount = computed(() => Object.keys(answers.value).length)
const correctCount = computed(() => {
  if (!submitResult.value) return 0
  return submitResult.value.correct
})
const wrongCount = computed(() => {
  if (!submitResult.value) return 0
  return submitResult.value.wrong
})

// Before submit: count selected for progress display
const selectedCount = computed(() => Object.keys(answers.value).length)

function selectAnswer(questionId, option) {
  answers.value = { ...answers.value, [questionId]: option }
}

function prev() {
  if (currentIndex.value > 0) currentIndex.value--
}

function next() {
  if (currentIndex.value < total.value - 1) {
    currentIndex.value++
  }
}

async function submitQuiz() {
  const answersArray = Object.entries(answers.value).map(([id, selected]) => ({
    id: Number(id),
    selected,
  }))
  try {
    const res = await fetch('http://localhost:5000/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: answersArray }),
    })
    submitResult.value = await res.json()
    submitted.value = true
  } catch (e) {
    alert('Lỗi khi nộp bài. Vui lòng thử lại.')
  }
}

function restart() {
  currentIndex.value = 0
  answers.value = {}
  submitted.value = false
  submitResult.value = null
}
</script>

<template>
  <div class="quiz-wrapper">
    <!-- Loading -->
    <div v-if="loading" class="quiz-card loading-state">
      <div class="spinner"></div>
      <p>Đang tải câu hỏi...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="quiz-card error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button class="btn-primary" @click="$router.go(0)">Thử lại</button>
    </div>

    <!-- Result Screen -->
    <QuizResult
      v-else-if="submitted"
      :result="submitResult"
      :total="total"
      @restart="restart"
    />

    <!-- Quiz Screen -->
    <div v-else-if="questions.length" class="quiz-card">
      <!-- Header -->
      <div class="quiz-header">
        <div class="quiz-title">
          <span class="quiz-icon">📝</span>
          <span>Kiểm tra từ vựng Du lịch &amp; Công tác</span>
        </div>
        <button class="btn-close" @click="restart" title="Thoát">✕</button>
      </div>

      <!-- Progress Bar -->
      <div class="progress-section">
        <div class="progress-bar">
          <div
            v-for="(q, i) in questions"
            :key="q.id"
            class="progress-dash"
            :class="{
              'active': i < currentIndex,
              'current': i === currentIndex,
              'answered': answers[q.id] !== undefined && i !== currentIndex,
            }"
          ></div>
        </div>
        <div class="progress-stats">
          <span class="stat-current">{{ currentNumber }}/{{ total }}</span>
          <span class="stat-wrong" v-if="submitResult">
            <span class="icon-x">✕</span> {{ wrongCount }}
          </span>
          <span class="stat-correct" v-if="submitResult">
            <span class="icon-check">✓</span> {{ correctCount }}
          </span>
          <span class="stat-answered" v-if="!submitResult && answeredCount > 0">
            <span class="icon-check">✓</span> {{ answeredCount }}
          </span>
        </div>
      </div>

      <!-- Question -->
      <QuizQuestion
        :question="currentQuestion"
        :selected-answer="answers[currentQuestion?.id]"
        @select="(opt) => selectAnswer(currentQuestion.id, opt)"
      />

      <!-- Footer Navigation -->
      <div class="quiz-footer">
        <button
          class="btn-back"
          :disabled="currentIndex === 0"
          @click="prev"
        >
          Quay lại
        </button>

        <button
          v-if="currentIndex < total - 1"
          class="btn-primary"
          @click="next"
        >
          Tiếp theo
        </button>

        <button
          v-else
          class="btn-submit"
          @click="submitQuiz"
          :disabled="answeredCount === 0"
        >
          Nộp bài
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
  padding: 20px;
}

.quiz-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 700px;
  padding: 28px 36px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header */
.quiz-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 4px;
}

.quiz-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
}

.quiz-icon {
  font-size: 20px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #888;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s, color 0.2s;
  line-height: 1;
}

.btn-close:hover {
  background: #f0f0f0;
  color: #333;
}

/* Progress */
.progress-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  display: flex;
  gap: 4px;
  align-items: center;
}

.progress-dash {
  flex: 1;
  height: 5px;
  border-radius: 3px;
  background: #e0e0e0;
  transition: background 0.3s;
}

.progress-dash.active,
.progress-dash.answered {
  background: #1a73e8;
}

.progress-dash.current {
  background: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.3);
}

.progress-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
}

.stat-current {
  color: #555;
}

.stat-wrong {
  background: #fdecea;
  color: #d93025;
  border-radius: 20px;
  padding: 2px 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-correct,
.stat-answered {
  background: #e6f4ea;
  color: #1e8e3e;
  border-radius: 20px;
  padding: 2px 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Footer */
.quiz-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.btn-back {
  background: none;
  border: none;
  color: #1a73e8;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 8px;
  transition: background 0.2s;
}

.btn-back:hover:not(:disabled) {
  background: #f0f4ff;
}

.btn-back:disabled {
  color: #ccc;
  cursor: default;
}

.btn-primary {
  background: #1a73e8;
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 10px 28px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.btn-primary:hover {
  background: #1557b0;
  transform: translateY(-1px);
}

.btn-submit {
  background: #34a853;
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 10px 28px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}

.btn-submit:hover:not(:disabled) {
  background: #2d8f46;
  transform: translateY(-1px);
}

.btn-submit:disabled {
  background: #b0bec5;
  cursor: default;
}

/* Loading */
.loading-state {
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #555;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e0e0e0;
  border-top-color: #1a73e8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #d93025;
  gap: 12px;
}

.error-icon {
  font-size: 40px;
}
</style>
