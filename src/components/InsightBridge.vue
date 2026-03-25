<script setup lang="ts">
import type { Scenario } from '../types/scenario'
import { ref, onMounted } from 'vue'

const props = defineProps<{
  intro: Scenario['intro']
}>()

const emit = defineEmits<{
  (e: 'next'): void
}>()

// 渐进揭示状态
const showVoice = ref(false)
const showInsight = ref(false)
const visibleFactors = ref(0)
const showButton = ref(false)

// 检测用户是否偏好减少动画
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

onMounted(() => {
  if (prefersReducedMotion()) {
    // 减少动画模式：直接全部可见
    showVoice.value = true
    showInsight.value = true
    visibleFactors.value = props.intro.keyFactors.length
    showButton.value = true
    return
  }

  // 链式触发：userVoice → systemInsight → keyFactors 逐个 → 按钮
  showVoice.value = true

  setTimeout(() => {
    showInsight.value = true
  }, 800)

  const factorStart = 1600
  props.intro.keyFactors.forEach((_, i) => {
    setTimeout(() => {
      visibleFactors.value = i + 1
    }, factorStart + i * 200)
  })

  const buttonDelay = factorStart + props.intro.keyFactors.length * 200 + 400
  setTimeout(() => {
    showButton.value = true
  }, buttonDelay)
})
</script>

<template>
  <div class="min-h-screen flex flex-col justify-center px-6 py-12">
    <div class="w-full md:max-w-[520px] md:mx-auto">
      <div
        class="relative pl-6 border-l-4 border-[#d4a574] mb-12 transition-all duration-400 ease-out"
        :class="showVoice ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
      >
        <p class="text-[17px] text-[#f1f5f9] leading-[1.75] font-medium">
          "{{ intro.userVoice }}"
        </p>
      </div>

      <p
        class="text-[17px] text-[#d4a574] font-medium mb-8 leading-[1.75] transition-all duration-400 ease-out"
        :class="showInsight ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
      >
        {{ intro.systemInsight }}
      </p>

      <ul class="space-y-3 mb-16">
        <li
          v-for="(factor, index) in intro.keyFactors"
          :key="index"
          class="text-[14px] text-[#94a3b8] flex items-start leading-tight transition-all duration-400 ease-out"
          :class="index < visibleFactors ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
        >
          <span class="mr-2 text-[#d4a574] mt-0.5">•</span>
          <span>{{ factor }}</span>
        </li>
      </ul>

      <button
        @click="emit('next')"
        class="w-full bg-[#d4a574] text-[#0a0f1a] font-bold rounded-xl min-h-[44px] py-3 px-6 transition-all duration-400 ease-out hover:bg-[#b88c5d] hover:scale-[1.02] active:scale-95"
        :class="showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'"
      >
        看看你的几条路
      </button>
    </div>
  </div>
</template>
