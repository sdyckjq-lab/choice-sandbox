<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

interface AIError {
  type: string
  message: string
}

const PROGRESS_HINTS = [
  '正在理解你的处境...',
  '正在构思 4 条可能的路线...',
  '正在推演每条路的时间线...',
  '正在寻找最容易后悔的瞬间...',
  '正在分析翻盘条件...',
  '正在对比不同路线的差异...',
  '快好了，正在收尾...',
]

const props = defineProps<{
  status: 'generating' | 'error'
  error: AIError | null
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'retry'): void
  (e: 'fallback'): void
}>()

const currentHintIndex = ref(0)

let hintTimer: ReturnType<typeof globalThis.setInterval> | null = null

const currentHint = computed(() => PROGRESS_HINTS[currentHintIndex.value] ?? PROGRESS_HINTS[0])

function clearHintTimer() {
  if (hintTimer !== null) {
    clearInterval(hintTimer)
    hintTimer = null
  }
}

function startHintTimer() {
  clearHintTimer()

  if (props.status !== 'generating' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  hintTimer = globalThis.setInterval(() => {
    currentHintIndex.value = (currentHintIndex.value + 1) % PROGRESS_HINTS.length
  }, 3500)
}

watch(
  () => props.status,
  (status) => {
    if (status === 'generating') {
      currentHintIndex.value = 0
      startHintTimer()
      return
    }

    clearHintTimer()
  },
)

onMounted(() => {
  startHintTimer()
})

onUnmounted(() => {
  clearHintTimer()
})
</script>

<template>
  <div class="min-h-screen flex flex-col justify-center items-center px-6 py-12">
    <div class="w-full max-w-md mx-auto text-center">
      <Transition name="fade" mode="out-in">
        <div v-if="status === 'generating'" key="generating">
          <div class="pulse-dot mx-auto mb-8" />
          <h2 class="text-[20px] text-[#f1f5f9] font-bold mb-4">正在为你推演可能的路线...</h2>
          <p class="text-[17px] text-[#94a3b8] leading-[1.75] min-h-[52px] mb-8">{{ currentHint }}</p>
          <button
            class="text-[14px] text-[#94a3b8] hover:text-[#d4a574] transition-colors duration-200"
            @click="emit('cancel')"
          >
            取消
          </button>
        </div>

        <div v-else key="error">
          <div class="text-red-400 text-[48px] leading-none mb-6">✕</div>
          <h2 class="text-[20px] text-[#f1f5f9] font-bold mb-4">生成失败</h2>
          <p class="text-[17px] text-[#94a3b8] leading-[1.75] mb-8">{{ error?.message ?? '发生未知错误' }}</p>

          <button
            class="w-full bg-[#d4a574] text-[#0a0f1a] font-bold rounded-xl min-h-[44px] py-3 px-6 transition-all duration-200 hover:bg-[#b88c5d] hover:scale-[1.02] active:scale-95 mb-5"
            @click="emit('retry')"
          >
            重试
          </button>

          <button
            class="text-[14px] text-[#94a3b8] hover:text-[#d4a574] transition-colors duration-200"
            @click="emit('fallback')"
          >
            先体验示例场景
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.pulse-dot {
  width: 12px;
  height: 12px;
  background: #d4a574;
  border-radius: 9999px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
    transform: scale(0.8);
  }

  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .pulse-dot {
    animation: none;
  }
}
</style>
