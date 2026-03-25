<script setup lang="ts">
import type { Branch } from '../types/scenario'
import { ref } from 'vue'

const props = defineProps<{
  branch: Branch
}>()

const emit = defineEmits<{
  (e: 'choose', choice: 'A' | 'B'): void
  (e: 'next'): void
}>()

const selectedChoice = ref<'A' | 'B' | null>(null)

function handleChoose(choice: 'A' | 'B') {
  selectedChoice.value = choice
  emit('choose', choice)
}
</script>

<template>
  <div class="min-h-screen flex flex-col justify-center px-6 py-12">
    <div class="w-full md:max-w-[520px] md:mx-auto">
      <h2 class="text-[28px] font-bold text-[#f1f5f9] mb-10 leading-tight">
        {{ branch.question }}
      </h2>

      <!-- Options -->
      <div class="flex flex-col md:flex-row gap-4 mb-10">
        <!-- Option A -->
        <button 
          @click="handleChoose('A')"
          class="flex-1 text-left p-5 rounded-xl transition-all duration-200 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#d4a574]"
          :class="[
            selectedChoice === 'A' 
              ? 'bg-[#1e293b] border-2 border-[#d4a574] scale-[1.02]' 
              : 'bg-[#111827] border-2 border-transparent hover:bg-[#1e293b]',
            selectedChoice && selectedChoice !== 'A' ? 'opacity-50' : ''
          ]"
        >
          <div class="text-[17px] font-bold text-[#f1f5f9] mb-1">{{ branch.optionA.label }}</div>
          <div class="text-[14px] text-[#94a3b8]">{{ branch.optionA.feeling }}</div>
        </button>

        <!-- Option B -->
        <button 
          @click="handleChoose('B')"
          class="flex-1 text-left p-5 rounded-xl transition-all duration-200 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#d4a574]"
          :class="[
            selectedChoice === 'B' 
              ? 'bg-[#1e293b] border-2 border-[#d4a574] scale-[1.02]' 
              : 'bg-[#111827] border-2 border-transparent hover:bg-[#1e293b]',
            selectedChoice && selectedChoice !== 'B' ? 'opacity-50' : ''
          ]"
        >
          <div class="text-[17px] font-bold text-[#f1f5f9] mb-1">{{ branch.optionB.label }}</div>
          <div class="text-[14px] text-[#94a3b8]">{{ branch.optionB.feeling }}</div>
        </button>
      </div>

      <!-- Results Area (Transitions in after selection) -->
      <Transition 
        enter-active-class="transition-all duration-400 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
      >
        <div v-if="selectedChoice" class="mt-8">
          <ul class="space-y-3 mb-8">
            <li 
              v-for="(cons, idx) in (selectedChoice === 'A' ? branch.optionA.consequences : branch.optionB.consequences)" 
              :key="idx"
              class="text-[17px] text-[#f1f5f9] flex items-start leading-[1.75]"
            >
              <span class="mr-2 text-[#d4a574] mt-0.5">•</span>
              <span>{{ cons }}</span>
            </li>
          </ul>

          <div class="border-t border-[#1e293b] pt-8 mb-10">
            <p class="text-[17px] text-[#d4a574] font-medium leading-[1.75]">
              {{ branch.insight }}
            </p>
          </div>

          <button 
            @click="emit('next')"
            class="w-full bg-[#d4a574] text-[#0a0f1a] font-bold rounded-xl min-h-[44px] py-3 px-6 transition-all duration-200 shadow-lg hover:bg-[#b88c5d] hover:scale-[1.02] active:scale-95"
          >
            继续对比
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>
