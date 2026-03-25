<script setup lang="ts">
import type { Scenario } from '../types/scenario'

const props = defineProps<{
  intro: Scenario['intro']
}>()

const emit = defineEmits<{
  (e: 'next'): void
}>()
</script>

<template>
  <div class="min-h-screen flex flex-col justify-center px-6 py-12">
    <div class="w-full md:max-w-[520px] md:mx-auto">
      <div class="relative pl-6 border-l-4 border-[#d4a574] mb-12">
        <p class="text-[17px] text-[#f1f5f9] leading-[1.75] font-medium">
          "{{ intro.userVoice }}"
        </p>
      </div>

      <p class="text-[17px] text-[#d4a574] font-medium mb-8 leading-[1.75]">
        {{ intro.systemInsight }}
      </p>

      <ul class="space-y-3 mb-16">
        <li 
          v-for="(factor, index) in intro.keyFactors" 
          :key="index"
          class="text-[14px] text-[#94a3b8] flex items-start leading-tight"
        >
          <span class="mr-2 text-[#d4a574] mt-0.5">•</span>
          <span>{{ factor }}</span>
        </li>
      </ul>

      <button 
        @click="emit('next')"
        class="w-full bg-[#d4a574] text-[#0a0f1a] font-bold rounded-xl min-h-[44px] py-3 px-6 transition-all duration-200 hover:bg-[#b88c5d] hover:scale-[1.02] active:scale-95"
      >
        看看你的几条路
      </button>
    </div>
  </div>
</template>
