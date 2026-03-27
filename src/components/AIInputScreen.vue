<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

const MIN_LENGTH = 20
const MAX_LENGTH = 2000

const props = defineProps<{
  initialInput?: string
}>()

const emit = defineEmits<{
  (e: 'submit', text: string): void
  (e: 'back'): void
  (e: 'settings'): void
}>()

const text = ref(props.initialInput ?? '')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const trimmedText = computed(() => text.value.trim())
const charCount = computed(() => text.value.length)
const canSubmit = computed(() => trimmedText.value.length >= MIN_LENGTH && charCount.value <= MAX_LENGTH)

watch(
  () => props.initialInput,
  (value) => {
    text.value = value ?? ''
  },
)

onMounted(async () => {
  await nextTick()
  textareaRef.value?.focus()
})

function handleSubmit() {
  if (!canSubmit.value) {
    return
  }

  emit('submit', trimmedText.value)
}
</script>

<template>
  <div class="min-h-screen flex flex-col justify-center px-6 py-12">
    <div class="w-full max-w-md mx-auto">
      <button
        class="text-[14px] text-[#94a3b8] hover:text-[#d4a574] transition-colors duration-200 mb-10 animate-reveal [animation-delay:0ms]"
        @click="emit('back')"
      >
        ← 返回
      </button>

      <h2 class="text-[28px] font-bold text-[#d4a574] mb-4 animate-reveal [animation-delay:200ms]">描述你的纠结</h2>
      <p class="text-[17px] text-[#94a3b8] leading-[1.75] mb-8 animate-reveal [animation-delay:400ms]">
        把你现在最纠结的事写出来，<br>
        像跟朋友聊天一样就好。
      </p>

      <textarea
        ref="textareaRef"
        v-model="text"
        maxlength="2000"
        placeholder="比如：我现在的工作还行，&#10;但越来越想试试自由职业..."
        class="bg-[#111827] border border-[#1e293b] rounded-xl text-[#f1f5f9] text-[17px] px-4 py-4 w-full min-h-[200px] resize-none focus:border-[#d4a574] focus:outline-none transition-colors duration-200 placeholder:text-[#94a3b8] placeholder:opacity-50 animate-reveal [animation-delay:600ms]"
      />

      <div class="flex items-center justify-between text-[14px] text-[#94a3b8] mt-3 mb-8 animate-reveal [animation-delay:800ms]">
        <span>至少 20 字，最多 2000 字</span>
        <span :class="charCount > MAX_LENGTH ? 'text-red-400' : ''">已输入 {{ charCount }} 字</span>
      </div>

      <button
        :disabled="!canSubmit"
        class="bg-[#d4a574] text-[#0a0f1a] font-bold rounded-xl min-h-[44px] py-3 px-6 w-full transition-all duration-200 hover:bg-[#b88c5d] hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 animate-reveal [animation-delay:1000ms]"
        @click="handleSubmit"
      >
        开始分析
      </button>

      <button
        class="mt-8 text-[14px] text-[#94a3b8] hover:text-[#d4a574] transition-colors duration-200 w-full animate-reveal [animation-delay:1200ms]"
        @click="emit('settings')"
      >
        ⚙ 修改 AI 设置
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-reveal {
  opacity: 0;
  animation: reveal 400ms ease-out forwards;
}

@media (prefers-reduced-motion: reduce) {
  .animate-reveal {
    opacity: 1;
    animation: none;
  }
}
</style>
