<script setup lang="ts">
import { ref } from 'vue'
import { useShareCard } from '../composables/useShareCard'
import type { Route } from '../types/scenario'

const props = defineProps<{
  title: string
  selectedRoutes: Route[]
  closingInsight: string
  branchChoice: 'A' | 'B' | null
}>()

const emit = defineEmits<{
  (e: 'restart'): void
}>()

const cardRef = ref<HTMLElement | null>(null)
const { generating, failed, generateImage } = useShareCard()

async function handleSave() {
  if (!cardRef.value) return
  await generateImage(cardRef.value)
}
</script>

<template>
  <div class="min-h-screen flex flex-col justify-center items-center px-6 py-8">
    
    <!-- Card Container -->
    <div ref="cardRef" class="w-full max-w-[375px] aspect-[3/4] bg-[#0a0f1a] rounded-2xl border border-[#1e293b] p-8 flex flex-col relative overflow-hidden shadow-2xl mb-8 flex-shrink-0">
      
      <div class="absolute top-0 left-0 w-full h-1.5 bg-[#d4a574]"></div>
      
      <h2 class="text-[24px] font-bold text-[#d4a574] mb-8 mt-2">{{ title }}</h2>
      
      <div class="space-y-6 flex-1">
        <div class="bg-[#111827] rounded-xl p-4">
          <span class="text-[12px] text-[#94a3b8] uppercase tracking-wider font-bold mb-2 block">我最终的选择考量</span>
          
          <div class="mb-4">
            <h3 class="text-[17px] font-bold text-[#f1f5f9] mb-1">选项 A: {{ selectedRoutes[0]?.name }}</h3>
            <p class="text-[14px] text-[#94a3b8]">{{ selectedRoutes[0]?.oneLiner }}</p>
          </div>
          
          <div>
            <h3 class="text-[17px] font-bold text-[#f1f5f9] mb-1">选项 B: {{ selectedRoutes[1]?.name }}</h3>
            <p class="text-[14px] text-[#94a3b8]">{{ selectedRoutes[1]?.oneLiner }}</p>
          </div>
        </div>
        
        <div v-if="branchChoice" class="bg-[#d4a574] bg-opacity-10 border border-[#d4a574] border-opacity-20 rounded-xl p-4">
          <span class="text-[12px] text-[#d4a574] uppercase tracking-wider font-bold mb-2 block">关键分叉决定</span>
          <p class="text-[14px] text-[#f1f5f9]">在关键时刻，我选择了: <span class="font-bold">分叉 {{ branchChoice }}</span></p>
        </div>
      </div>
      
      <div class="mt-auto pt-6 border-t border-[#1e293b]">
        <p class="text-[20px] font-bold text-[#f1f5f9] leading-tight mb-6">
          "{{ closingInsight }}"
        </p>
        
        <div class="flex items-center justify-between text-[12px] text-[#94a3b8] opacity-60">
          <span>选择后果沙盘</span>
          <span>choice-sandbox.github.io</span>
        </div>
      </div>
    </div>
    
    <!-- Action Area (outside of card) -->
    <div class="text-center w-full max-w-[375px]">
      <button
        v-if="!failed"
        :disabled="generating"
        @click="handleSave"
        class="w-full bg-[#d4a574] text-[#0a0f1a] font-bold rounded-xl min-h-[44px] py-3 px-6 transition-all duration-200 shadow-lg hover:bg-[#b88c5d] hover:scale-[1.02] active:scale-95 mb-6 disabled:opacity-60 disabled:hover:bg-[#d4a574] disabled:hover:scale-100 disabled:cursor-not-allowed"
      >
        {{ generating ? '生成中…' : '保存图片' }}
      </button>

      <p v-else class="text-[14px] text-[#94a3b8] mb-6">
        截图功能暂不可用，请直接截屏分享
      </p>
      
      <button 
        @click="emit('restart')"
        class="text-[17px] text-[#d4a574] font-bold transition-all duration-200 hover:text-[#f1f5f9] hover:underline p-2"
      >
        尝试其他路线 ↺
      </button>
    </div>
    
  </div>
</template>
