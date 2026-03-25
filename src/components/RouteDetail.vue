<script setup lang="ts">
import type { Route } from '../types/scenario'

const props = defineProps<{
  route: Route
  isSecond: boolean
  buttonText: string
}>()

const emit = defineEmits<{
  (e: 'next'): void
}>()
</script>

<template>
  <div class="min-h-screen flex flex-col px-6 py-12 md:max-w-[520px] md:mx-auto">
    <!-- Header -->
    <div class="mb-10 sticky top-0 bg-[#0a0f1a] pt-4 pb-4 z-10">
      <p v-if="isSecond" class="text-[14px] text-[#d4a574] mb-2 font-medium">和上一条路不同的是…</p>
      <h2 class="text-[28px] font-bold text-[#f1f5f9] leading-tight mb-2">{{ route.name }}</h2>
      <p class="text-[17px] text-[#94a3b8] leading-[1.75]">{{ route.oneLiner }}</p>
    </div>

    <!-- Timeline -->
    <div class="relative pl-6 border-l-2 border-[#1e293b] mb-12 space-y-10">
      <!-- Start -->
      <div class="relative">
        <div class="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-[#1e293b] border-2 border-[#0a0f1a]"></div>
        <span class="text-[14px] text-[#d4a574] font-medium block mb-2">它会怎么开始</span>
        <p class="text-[17px] text-[#f1f5f9] leading-[1.75]">{{ route.timeline.start }}</p>
      </div>
      
      <!-- 3 Months -->
      <div class="relative">
        <div class="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-[#1e293b] border-2 border-[#0a0f1a]"></div>
        <span class="text-[14px] text-[#d4a574] font-medium block mb-2">3 个月后</span>
        <p class="text-[17px] text-[#f1f5f9] leading-[1.75]">{{ route.timeline.threeMonths }}</p>
      </div>

      <!-- 6 Months -->
      <div class="relative">
        <div class="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-[#d4a574] border-2 border-[#0a0f1a] shadow-[0_0_8px_rgba(212,165,116,0.5)]"></div>
        <span class="text-[14px] text-[#d4a574] font-bold block mb-2 flex items-center gap-2">
          半年后
          <span class="bg-[#1e293b] text-[#d4a574] px-2 py-0.5 rounded text-[12px] font-normal">分水岭</span>
        </span>
        <p class="text-[17px] text-[#f1f5f9] leading-[1.75]">{{ route.timeline.sixMonths }}</p>
      </div>

      <!-- 1 Year -->
      <div class="relative">
        <div class="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-[#1e293b] border-2 border-[#0a0f1a]"></div>
        <span class="text-[14px] text-[#d4a574] font-medium block mb-2">1 年后</span>
        <p class="text-[17px] text-[#f1f5f9] leading-[1.75]">{{ route.timeline.oneYear }}</p>
      </div>
    </div>

    <!-- Regret Moment -->
    <div class="bg-[#d4a574] bg-opacity-10 border border-[#d4a574] border-opacity-20 rounded-xl p-5 mb-10">
      <h3 class="text-[14px] font-bold text-[#d4a574] mb-3">最容易后悔的瞬间</h3>
      <p class="text-[17px] text-[#f1f5f9] leading-[1.75]">{{ route.regretMoment }}</p>
    </div>

    <!-- Future Reflection -->
    <div class="mb-12">
      <h3 class="text-[14px] font-bold text-[#94a3b8] mb-3">如果未来的你回头看今天</h3>
      <p class="text-[17px] text-[#94a3b8] italic leading-[1.75]">"{{ route.futureReflection }}"</p>
    </div>

    <!-- Button -->
    <div class="mt-auto pb-8">
      <button 
        @click="emit('next')"
        class="w-full bg-[#d4a574] text-[#0a0f1a] font-bold rounded-xl min-h-[44px] py-3 px-6 transition-all duration-200 shadow-lg hover:bg-[#b88c5d] hover:scale-[1.02] active:scale-95"
      >
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>
