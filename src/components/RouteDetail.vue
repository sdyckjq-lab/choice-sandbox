<script setup lang="ts">
import type { Route } from '../types/scenario'
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  route: Route
  isSecond: boolean
  buttonText: string
}>()

const emit = defineEmits<{
  (e: 'next'): void
}>()

// 6 个可揭示的段落：4 个时间段 + 后悔瞬间 + 未来反思
const sectionRefs = ref<(HTMLElement | null)[]>([null, null, null, null, null, null])
const visibleSections = ref<boolean[]>([false, false, false, false, false, false])
// 分水岭 glow 脉冲
const watershedPulse = ref(false)

let observer: IntersectionObserver | null = null

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const setSectionRef = (index: number) => (el: any) => {
  sectionRefs.value[index] = el as HTMLElement
}

onMounted(() => {
  if (prefersReducedMotion()) {
    visibleSections.value = [true, true, true, true, true, true]
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = sectionRefs.value.indexOf(entry.target as HTMLElement)
          if (index !== -1) {
            visibleSections.value[index] = true
            // 分水岭（index 2）触发 glow 脉冲
            if (index === 2) {
              watershedPulse.value = true
            }
            observer?.unobserve(entry.target)
          }
        }
      })
    },
    { threshold: 0.3 }
  )

  sectionRefs.value.forEach((el) => {
    if (el) observer?.observe(el)
  })
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <div class="min-h-screen flex flex-col px-6 py-12 md:max-w-[520px] md:mx-auto">
    <!-- Header -->
    <div class="mb-10 sticky top-0 bg-[#0a0f1a] pt-4 pb-4 z-10">
      <p
        v-if="isSecond"
        class="text-[17px] text-[#d4a574] mb-2 font-bold animate-slide-in"
      >和上一条路不同的是…</p>
      <h2 class="text-[28px] font-bold text-[#f1f5f9] leading-tight mb-2">{{ route.name }}</h2>
      <p class="text-[17px] text-[#94a3b8] leading-[1.75]">{{ route.oneLiner }}</p>
    </div>

    <!-- Timeline -->
    <div class="relative pl-6 border-l-2 border-[#1e293b] mb-12 space-y-10">
      <!-- Start -->
      <div
        :ref="setSectionRef(0)"
        class="relative transition-all duration-600 ease-out"
        :class="visibleSections[0] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
      >
        <div
          class="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 border-[#0a0f1a] transition-colors duration-600"
          :class="visibleSections[0] ? 'bg-[#d4a574]' : 'bg-[#1e293b]'"
        ></div>
        <span class="text-[14px] text-[#d4a574] font-medium block mb-2">它会怎么开始</span>
        <p class="text-[17px] text-[#f1f5f9] leading-[1.75]">{{ route.timeline.start }}</p>
      </div>

      <!-- 3 Months -->
      <div
        :ref="setSectionRef(1)"
        class="relative transition-all duration-600 ease-out"
        :class="[
          visibleSections[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
          visibleSections[2] ? 'opacity-60' : ''
        ]"
      >
        <div
          class="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 border-[#0a0f1a] transition-colors duration-600"
          :class="visibleSections[1] ? 'bg-[#d4a574]' : 'bg-[#1e293b]'"
        ></div>
        <span class="text-[14px] text-[#d4a574] font-medium block mb-2">3 个月后</span>
        <p class="text-[17px] text-[#f1f5f9] leading-[1.75]">{{ route.timeline.threeMonths }}</p>
      </div>

      <!-- 6 Months (分水岭) -->
      <div
        :ref="setSectionRef(2)"
        class="relative transition-all duration-600 ease-out"
        :class="[
          visibleSections[2] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
          visibleSections[3] ? 'opacity-60' : ''
        ]"
      >
        <div
          class="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 border-[#0a0f1a] transition-all duration-600"
          :class="[
            visibleSections[2] ? 'bg-[#d4a574] shadow-[0_0_8px_rgba(212,165,116,0.5)]' : 'bg-[#1e293b]',
            watershedPulse ? 'animate-watershed-glow' : ''
          ]"
        ></div>
        <span class="text-[14px] text-[#d4a574] font-bold block mb-2 flex items-center gap-2">
          半年后
          <span class="bg-[#1e293b] text-[#d4a574] px-2 py-0.5 rounded text-[12px] font-normal">分水岭</span>
        </span>
        <p class="text-[17px] text-[#f1f5f9] leading-[1.75]">{{ route.timeline.sixMonths }}</p>
      </div>

      <!-- 1 Year -->
      <div
        :ref="setSectionRef(3)"
        class="relative transition-all duration-600 ease-out"
        :class="visibleSections[3] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
      >
        <div
          class="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 border-[#0a0f1a] transition-colors duration-600"
          :class="visibleSections[3] ? 'bg-[#d4a574]' : 'bg-[#1e293b]'"
        ></div>
        <span class="text-[14px] text-[#d4a574] font-medium block mb-2">1 年后</span>
        <p class="text-[17px] text-[#f1f5f9] leading-[1.75]">{{ route.timeline.oneYear }}</p>
      </div>
    </div>

    <!-- Regret Moment -->
    <div
      :ref="setSectionRef(4)"
      class="bg-[#d4a574] bg-opacity-10 border border-[#d4a574] border-opacity-20 rounded-xl p-5 mb-10 transition-all duration-600 ease-out"
      :class="visibleSections[4] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
    >
      <h3 class="text-[14px] font-bold text-[#d4a574] mb-3">最容易后悔的瞬间</h3>
      <p class="text-[17px] text-[#f1f5f9] leading-[1.75]">{{ route.regretMoment }}</p>
    </div>

    <!-- Future Reflection -->
    <div
      :ref="setSectionRef(5)"
      class="mb-12 transition-all duration-600 ease-out"
      :class="visibleSections[5] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
    >
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

<style scoped>
/* 分水岭 glow 脉冲动画 */
@keyframes watershed-glow {
  0% { box-shadow: 0 0 8px rgba(212, 165, 116, 0.5); }
  50% { box-shadow: 0 0 20px rgba(212, 165, 116, 0.8); }
  100% { box-shadow: 0 0 8px rgba(212, 165, 116, 0.5); }
}

.animate-watershed-glow {
  animation: watershed-glow 800ms ease-in-out 1;
}

/* 第二条路线的"和上一条路不同的是…"滑入动画 */
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slide-in 300ms ease-out forwards;
}

@media (prefers-reduced-motion: reduce) {
  .animate-watershed-glow {
    animation: none;
  }
  .animate-slide-in {
    animation: none;
    opacity: 1;
  }
}
</style>
