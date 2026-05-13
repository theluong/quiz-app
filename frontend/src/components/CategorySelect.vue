<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['select', 'viewLeaderboard'])

const categories = ref([])
const loading = ref(true)
const error = ref(null)
const selectedCategory = ref(null)
const playerName = ref('')
const showNameInput = ref(false)
const leaderboard = ref([])
const showLeaderboard = ref(false)

const questionCounts = [
  { value: 20, label: '20 câu' },
  { value: 30, label: '30 câu' },
  { value: 50, label: '50 câu' },
]

onMounted(async () => {
  await Promise.all([loadCategories(), loadLeaderboard()])
})

async function loadCategories() {
  try {
    const res = await fetch('/api/categories')
    const data = await res.json()
    categories.value = data.categories || []
  } catch (e) {
    error.value = 'Không thể kết nối đến máy chủ.'
  } finally {
    loading.value = false
  }
}

async function loadLeaderboard() {
  try {
    const res = await fetch('/api/leaderboard')
    const data = await res.json()
    leaderboard.value = data.results || []
  } catch (e) {
    leaderboard.value = []
  }
}

function selectCategory(id) {
  selectedCategory.value = categories.value.find(c => c.id === id)
  showNameInput.value = true
}

function goBack() {
  selectedCategory.value = null
  showNameInput.value = false
}

function goBackToCategories() {
  selectedCategory.value = null
  showNameInput.value = false
}

function startQuiz(count) {
  if (!playerName.value.trim()) {
    alert('Vui lòng nhập tên của bạn')
    return
  }
  emit('select', { 
    categoryId: selectedCategory.value.id, 
    categoryName: selectedCategory.value.name, 
    count,
    playerName: playerName.value.trim()
  })
}

function viewLeaderboard() {
  showLeaderboard.value = !showLeaderboard.value
  if (showLeaderboard.value) {
    loadLeaderboard()
  }
}

function startNewQuiz() {
  showLeaderboard.value = false
  playerName.value = ''
  showNameInput.value = false
  selectedCategory.value = null
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatTime(seconds) {
  if (!seconds) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="category-wrapper">
    <!-- Header -->
    <div class="header-section">
      <h1>👋 Kiểm Tra Kiến Thức</h1>
      <p>Bắt đầu thử thách bản thân với các bài trắc nghiệm</p>
      <button v-if="!showLeaderboard" class="btn-leaderboard" @click="viewLeaderboard">
        🏆 Bảng Xếp Hạng
      </button>
    </div>

    <!-- Loading Categories -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Đang tải danh mục...</p>
    </div>

    <!-- Leaderboard View -->
    <div v-else-if="showLeaderboard" class="leaderboard-section">
      <button class="btn-back" @click="viewLeaderboard">← Quay lại</button>
      <div class="leaderboard-card">
        <h2 class="leaderboard-title">🏆 Bảng Xếp Hạng</h2>
        <div v-if="leaderboard.length === 0" class="empty-leaderboard">
          <p>Chưa có kết quả nào</p>
          <p class="empty-hint">Hãy làm bài đầu tiên để ghi danh!</p>
        </div>
        <div v-else class="leaderboard-list">
          <div 
            v-for="(item, index) in leaderboard" 
            :key="item.id"
            class="leaderboard-item"
            :class="{ 'is-top3': index < 3 }"
          >
            <div class="rank" :class="`rank-${index + 1}`">
              {{ index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}` }}
            </div>
            <div class="player-info">
              <div class="player-name">{{ item.player_name }}</div>
              <div class="player-meta">{{ item.category_name }} · {{ item.total_questions }} câu</div>
            </div>
            <div class="player-score">
              <div class="score-num">{{ item.score }}%</div>
              <div class="score-stats">
                <span class="correct">✓ {{ item.correct_count }}</span>
                <span class="wrong">✕ {{ item.wrong_count }}</span>
                <span class="time">⏱ {{ formatTime(item.time_spent) }}</span>
              </div>
            </div>
            <div class="player-date">{{ formatDate(item.created_at) }}</div>
          </div>
        </div>
        <button class="btn-start-quiz" @click="startNewQuiz">
          🎯 Làm Bài Thi Ngay
        </button>
      </div>
    </div>

    <!-- Name Input View -->
    <div v-else-if="showNameInput" class="name-section">
      <button class="btn-back" @click="goBackToCategories">← Quay lại</button>
      <div class="name-card">
        <h2>{{ selectedCategory?.name }}</h2>
        <p>Nhập tên của bạn để bắt đầu</p>
        <input 
          v-model="playerName"
          type="text" 
          class="name-input" 
          placeholder="Nhập tên của bạn..."
          maxlength="50"
        />
        <p class="name-hint">Chọn số câu hỏi để bắt đầu</p>
        <div class="count-options">
          <button
            v-for="opt in questionCounts"
            :key="opt.value"
            class="count-card"
            @click="startQuiz(opt.value)"
          >
            <span class="count-num">{{ opt.value }}</span>
            <span class="count-label">{{ opt.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Category Selection -->
    <div v-else class="grid-container">
      <div v-if="categories.length === 0" class="empty-state">
        <p>Chưa có danh mục nào</p>
      </div>
      <button 
        v-for="cat in categories" 
        :key="cat.id" 
        class="category-card" 
        @click="selectCategory(cat.id)"
      >
        <h3 class="cat-name">{{ cat.name }}</h3>
        <p class="cat-desc">{{ cat.description }}</p>
      </button>
    </div>
  </div>
</template>

<style scoped>
.category-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.header-section h1 {
  font-size: 28px;
  font-weight: 800;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.header-section p {
  color: #666;
  margin-bottom: 20px;
}

.btn-leaderboard {
  background: linear-gradient(135deg, #f9a825 0%, #f57f17 100%);
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-leaderboard:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(249, 168, 37, 0.4);
}

/* Grid Layout */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px;
  color: #888;
}

.category-card {
  background: #ffffff;
  border: 1px solid #e0e6ed;
  border-radius: 16px;
  padding: 24px;
  text-align: left;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.165, 0.84, 0.44, 1);
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(26, 115, 232, 0.15);
  border-color: #a4c8f5;
}

.cat-name {
  font-size: 18px;
  font-weight: 700;
  color: #1a73e8;
  margin: 0;
}

.cat-desc {
  font-size: 14px;
  color: #555;
  margin: 0;
  line-height: 1.5;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 16px;
  color: #555;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.1);
  max-width: 800px;
  margin: 0 auto;
}

.loading-container .spinner {
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

/* Name Input Section */
.name-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.name-card {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.1);
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
  text-align: center;
}

.name-card h2 {
  margin: 0 0 8px;
  color: #1a1a2e;
}

.name-card p {
  color: #555;
  margin: 0 0 20px;
}

.name-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e0e6ed;
  border-radius: 12px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.name-input:focus {
  border-color: #1a73e8;
}

.name-hint {
  margin: 20px 0 12px !important;
  font-size: 14px;
  color: #888;
}

/* Count Selection */
.count-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.count-card {
  background: #fff;
  border: 2px solid #e0e6ed;
  border-radius: 16px;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.count-card:hover {
  border-color: #1a73e8;
  background: #f0f4ff;
  transform: translateY(-2px);
}

.count-num {
  font-size: 32px;
  font-weight: 800;
  color: #1a73e8;
}

.count-label {
  font-size: 14px;
  color: #555;
}

/* Leaderboard */
.leaderboard-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: calc(100vh - 200px);
}

.leaderboard-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.1);
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.leaderboard-title {
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.empty-leaderboard {
  text-align: center;
  padding: 40px;
  color: #888;
}

.empty-hint {
  font-size: 14px;
  color: #aaa;
  margin-top: 8px;
}

.leaderboard-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 8px;
  min-height: 0;
  max-height: 500px;
}

.leaderboard-list::-webkit-scrollbar {
  width: 6px;
}

.leaderboard-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.leaderboard-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.leaderboard-list::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: transform 0.2s;
}

.leaderboard-item:hover {
  transform: translateX(4px);
}

.leaderboard-item.is-top3 {
  background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%);
  border: 2px solid #f9a825;
}

.rank {
  font-size: 24px;
  min-width: 50px;
  text-align: center;
}

.rank-1 { color: #ffd700; }
.rank-2 { color: #c0c0c0; }
.rank-3 { color: #cd7f32; }

.player-info {
  flex: 1;
}

.player-name {
  font-weight: 700;
  color: #1a1a2e;
  font-size: 16px;
}

.player-meta {
  font-size: 13px;
  color: #888;
  margin-top: 2px;
}

.player-score {
  text-align: right;
}

.score-num {
  font-size: 20px;
  font-weight: 800;
  color: #1a73e8;
}

.score-stats {
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.score-stats .correct { color: #34a853; }
.score-stats .wrong { color: #d93025; }
.score-stats .time { color: #888; }

.player-date {
  font-size: 12px;
  color: #aaa;
  min-width: 80px;
  text-align: right;
}

.btn-start-quiz {
  margin-top: 20px;
  background: #1a73e8;
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-start-quiz:hover {
  background: #1557b0;
}

/* Common */
.btn-back {
  background: none;
  border: none;
  color: #1a73e8;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 0;
  align-self: flex-start;
}

.btn-back:hover {
  text-decoration: underline;
}
</style>
