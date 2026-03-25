<script setup lang="ts">

const emit = defineEmits<{
  (e: 'next'): void
}>()
</script>

<template>
  <div class="min-h-screen flex flex-col justify-center items-center px-6">
    <div class="text-center w-full md:max-w-[520px] md:mx-auto">
      <h1 class="text-[28px] font-bold text-[#d4a574] mb-4">选择后果沙盘</h1>
      <p class="text-[17px] text-[#94a3b8] mb-12">先试走几条路，再决定往哪走</p>
      
      <button 
        @click="emit('next')"
        class="w-full bg-[#d4a574] text-[#0a0f1a] font-bold rounded-xl min-h-[44px] py-3 px-6 transition-all duration-200 hover:bg-[#b88c5d] hover:scale-[1.02] active:scale-95"
      >
        开始体验 · 5分钟
      </button>
    </div>
  </div>
</template>
