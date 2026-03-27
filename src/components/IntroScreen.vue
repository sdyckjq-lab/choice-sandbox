<script setup lang="ts">
const emit = defineEmits<{
  (e: 'next'): void
  (e: 'ai'): void
  (e: 'settings'): void
}>()
</script>

<template>
  <div class="min-h-screen flex flex-col justify-center items-center px-6">
    <div class="text-center w-full md:max-w-[520px] md:mx-auto">
      <h1 class="text-[28px] font-bold text-[#d4a574] mb-4 animate-reveal [animation-delay:0ms]">选择后果沙盘</h1>
      <p class="text-[17px] text-[#94a3b8] mb-12 animate-reveal [animation-delay:300ms]">先试走几条路，再决定往哪走</p>

      <button
        @click="emit('next')"
        class="w-full bg-[#d4a574] text-[#0a0f1a] font-bold rounded-xl min-h-[44px] py-3 px-6 transition-all duration-200 hover:bg-[#b88c5d] hover:scale-[1.02] active:scale-95 animate-reveal [animation-delay:600ms] mb-4"
      >
        体验示例场景 · 5分钟
      </button>

      <button
        @click="emit('ai')"
        class="w-full bg-transparent border-2 border-[#d4a574] text-[#d4a574] font-bold rounded-xl min-h-[44px] py-3 px-6 transition-all duration-200 hover:bg-[#d4a574] hover:bg-opacity-10 hover:scale-[1.02] active:scale-95 animate-reveal [animation-delay:800ms]"
      >
        输入你的纠结 · AI 生成
      </button>

      <button
        @click="emit('settings')"
        class="mt-8 text-[14px] text-[#94a3b8] transition-colors duration-200 hover:text-[#d4a574] cursor-pointer animate-reveal [animation-delay:1000ms]"
      >
        ⚙ 设置
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
