<script setup>
import { ref } from 'vue'

const props = defineProps({
  question: { type: Object, required: true },
  selectedAnswer: { type: String, default: null },
})

const emit = defineEmits(['select'])

const hintVisible = ref(false)

const optionLabels = ['A', 'B', 'C', 'D']

function selectOption(label) {
  emit('select', label)
}
</script>

<template>
  <div class="question-section" v-if="question">
    <!-- Question Text -->
    <div class="question-text">
      <span class="question-num">{{ question.id }}.</span>
      {{ question.question }}
    </div>

    <!-- Options -->
    <div class="options-list">
      <button
        v-for="label in optionLabels"
        :key="label"
        class="option-btn"
        :class="{
          'selected': selectedAnswer === label,
        }"
        @click="selectOption(label)"
      >
        <span class="option-label">{{ label }}.</span>
        <span class="option-text">{{ question.options[label] }}</span>
      </button>
    </div>

    <!-- Hint -->
    <div class="hint-section">
      <button class="hint-toggle" @click="hintVisible = !hintVisible">
        Hiện gợi ý
        <span class="hint-arrow" :class="{ 'open': hintVisible }">∨</span>
      </button>
      <Transition name="hint-slide">
        <div v-if="hintVisible" class="hint-content">
          {{ question.hint }}
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.question-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.question-text {
  font-size: 16px;
  color: #1a1a2e;
  line-height: 1.6;
  font-weight: 500;
  padding: 4px 0;
}

.question-num {
  font-weight: 700;
  margin-right: 6px;
  color: #1a1a2e;
}

/* Options */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f4f6fb;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 14px 18px;
  cursor: pointer;
  text-align: left;
  font-size: 15px;
  color: #333;
  transition: background 0.18s, border-color 0.18s, transform 0.1s;
  width: 100%;
}

.option-btn:hover {
  background: #e8efff;
  border-color: #c0d1f7;
  transform: translateX(2px);
}

.option-btn.selected {
  background: #e8f0fe;
  border-color: #1a73e8;
  color: #1a1a2e;
}

.option-label {
  font-weight: 700;
  color: #555;
  min-width: 20px;
}

.option-btn.selected .option-label {
  color: #1a73e8;
}

.option-text {
  flex: 1;
}

/* Hint */
.hint-section {
  padding-top: 4px;
}

.hint-toggle {
  background: none;
  border: none;
  color: #555;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  font-weight: 500;
  transition: color 0.2s;
}

.hint-toggle:hover {
  color: #1a73e8;
}

.hint-arrow {
  display: inline-block;
  transition: transform 0.25s;
  font-style: normal;
}

.hint-arrow.open {
  transform: rotate(180deg);
}

.hint-content {
  margin-top: 8px;
  background: #fffde7;
  border-left: 3px solid #f9a825;
  border-radius: 0 8px 8px 0;
  padding: 12px 16px;
  font-size: 14px;
  color: #5d4037;
  line-height: 1.6;
}

/* Hint animation */
.hint-slide-enter-active,
.hint-slide-leave-active {
  transition: opacity 0.25s, transform 0.25s;
  transform-origin: top;
}

.hint-slide-enter-from,
.hint-slide-leave-to {
  opacity: 0;
  transform: scaleY(0.8) translateY(-6px);
}
</style>
