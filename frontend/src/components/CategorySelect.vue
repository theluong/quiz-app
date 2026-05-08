<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['select'])

const categories = ref([])
const loading = ref(true)
const error = ref(null)
const selectedCategory = ref(null)

const questionCounts = [
  { value: 20, label: '20 câu' },
  { value: 30, label: '30 câu' },
  { value: 50, label: '50 câu' },
]

onMounted(async () => {
  try {
    const res = await fetch('/api/categories')
    const data = await res.json()
    categories.value = data.categories || []
  } catch (e) {
    error.value = 'Không thể kết nối đến máy chủ.'
  } finally {
    loading.value = false
  }
})

function selectCategory(id) {
  selectedCategory.value = categories.value.find(c => c.id === id)
}

function selectCount(count) {
  emit('select', { categoryId: selectedCategory.value.id, count })
}

function goBack() {
  selectedCategory.value = null
}
</script>

<template>
  <div class="category-wrapper">
    <div class="header-section">
      <h1>👋 Chọn Bộ Câu Hỏi</h1>
      <p>Chọn một chủ đề để bắt đầu ôn tập và kiểm tra kiến thức của bạn.</p>
    </div>

    <!-- State: Loading -->
    <div v-if="loading" class="state-box">
      <div class="spinner"></div>
      <p>Đang tải danh sách...</p>
    </div>

    <!-- State: Error -->
    <div v-else-if="error" class="state-box error">
      <p>⚠️ {{ error }}</p>
      <button class="btn-retry" @click="$router.go(0)">Thử lại</button>
    </div>

    <!-- State: Success -->
    <div v-else-if="!selectedCategory" class="grid-container">
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

    <!-- Step 2: Select question count -->
    <div v-else class="count-section">
      <button class="btn-back" @click="goBack">← Quay lại</button>
      <div class="count-header">
        <h2>{{ selectedCategory.name }}</h2>
        <p>Chọn số lượng câu hỏi</p>
      </div>
      <div class="count-options">
        <button
          v-for="opt in questionCounts"
          :key="opt.value"
          class="count-card"
          @click="selectCount(opt.value)"
        >
          <span class="count-num">{{ opt.value }}</span>
          <span class="count-label">{{ opt.label }}</span>
        </button>
      </div>
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
}

/* Grid Layout */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
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

/* Count Selection */
.count-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

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

.count-header {
  text-align: center;
}

.count-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.count-header p {
  color: #666;
}

.count-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.count-card {
  background: #fff;
  border: 2px solid #e0e6ed;
  border-radius: 16px;
  padding: 28px 16px;
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
  font-size: 36px;
  font-weight: 800;
  color: #1a73e8;
}

.count-label {
  font-size: 14px;
  color: #555;
}

/* State Boxes */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: #fff;
  border-radius: 16px;
  gap: 16px;
  color: #555;
}

.state-box.error {
  color: #d93025;
}

.btn-retry {
  padding: 8px 16px;
  background: #d93025;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1a73e8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
