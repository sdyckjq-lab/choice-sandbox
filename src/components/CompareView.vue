<script setup lang="ts">
import type { ComparisonDimension, Scenario, Route } from '../types/scenario'
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  dimensions: ComparisonDimension[]
  keyContrast: string
  conditionChange: Scenario['conditionChange']
  closing: Scenario['closing']
  selectedRouteIds: [string, string]
  routes: Route[]
}>()

const emit = defineEmits<{
  (e: 'next'): void
}>()

const route1 = props.routes.find(r => r.id === props.selectedRouteIds[0])
const route2 = props.routes.find(r => r.id === props.selectedRouteIds[1])

const relevantImpacts = props.conditionChange.impacts.filter(i =>
  props.selectedRouteIds.includes(i.routeId)
)

const getRouteName = (routeId: string) => {
  return props.routes.find(r => r.id === routeId)?.name || ''
}

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// 维度卡片 + keyContrast + 条件变化区块的 refs
const dimRefs = ref<(HTMLElement | null)[]>([])
const dimVisible = ref<boolean[]>([])
const keyContrastVisible = ref(false)
const conditionRef = ref<HTMLElement | null>(null)
const conditionVisible = ref(false)

// 收口金句（保持原有逻辑）
const insightRef = ref<HTMLElement | null>(null)
const insightVisible = ref(false)

let observer: IntersectionObserver | null = null

const setDimRef = (index: number) => (el: any) => {
  dimRefs.value[index] = el as HTMLElement
}

onMounted(() => {
  dimVisible.value = new Array(props.dimensions.length).fill(false)

  if (prefersReducedMotion()) {
    dimVisible.value = new Array(props.dimensions.length).fill(true)
    keyContrastVisible.value = true
    conditionVisible.value = true
    insightVisible.value = true
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return

        // 维度卡片
        const dimIndex = dimRefs.value.indexOf(entry.target as HTMLElement)
        if (dimIndex !== -1) {
          dimVisible.value[dimIndex] = true
          observer?.unobserve(entry.target)

          // 最后一个维度可见后 600ms 显示 keyContrast
          if (dimIndex === props.dimensions.length - 1) {
            setTimeout(() => {
              keyContrastVisible.value = true
            }, 600)
          }
          return
        }

        // 条件变化区块
        if (entry.target === conditionRef.value) {
          conditionVisible.value = true
          observer?.unobserve(entry.target)
          return
        }

        // 收口金句
        if (entry.target === insightRef.value) {
          insightVisible.value = true
          observer?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.3 }
  )

  // 监听维度卡片
  dimRefs.value.forEach((el) => {
    if (el) observer?.observe(el)
  })
  // 监听条件变化
  if (conditionRef.value) observer.observe(conditionRef.value)
  // 监听收口金句（用更高 threshold 保持原有效果）
  if (insightRef.value) {
    // 收口金句用单独的 observer，threshold 0.5
    const insightObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          insightVisible.value = true
          insightObserver.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    insightObserver.observe(insightRef.value)
  }
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <div class="min-h-screen flex flex-col px-6 py-12 md:max-w-[760px] md:mx-auto pt-6">
    <!-- Block 1: Comparison table -->
    <div class="mb-16">
      <h2 class="text-[28px] font-bold text-[#f1f5f9] mb-8">并排对比</h2>

      <div class="space-y-6 mb-8">
        <div
          v-for="(dim, idx) in dimensions"
          :key="idx"
          :ref="setDimRef(idx)"
          class="bg-[#111827] rounded-xl p-5 transition-all duration-400 ease-out"
          :class="dimVisible[idx] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
        >
          <div class="text-[14px] text-[#d4a574] font-bold mb-4 border-b border-[#1e293b] pb-2">{{ dim.label }}</div>

          <div class="flex flex-col md:flex-row md:gap-8 gap-4">
            <div class="flex-1">
              <span class="text-[14px] text-[#94a3b8] block mb-1">{{ route1?.name }}</span>
              <span class="text-[17px] text-[#f1f5f9] leading-[1.75]">{{ dim.scores[selectedRouteIds[0]] }}</span>
            </div>

            <!-- divider for desktop -->
            <div class="hidden md:block w-[1px] bg-[#1e293b]"></div>

            <div class="flex-1">
              <span class="text-[14px] text-[#94a3b8] block mb-1">{{ route2?.name }}</span>
              <span class="text-[17px] text-[#f1f5f9] leading-[1.75]">{{ dim.scores[selectedRouteIds[1]] }}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        ref="keyContrastRef"
        class="bg-[#1e293b] rounded-xl p-6 text-center border border-[#d4a574] border-opacity-30 transition-all duration-400 ease-out"
        :class="keyContrastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
      >
        <p class="text-[17px] text-[#f1f5f9] font-medium leading-[1.75]">
          {{ keyContrast }}
        </p>
      </div>
    </div>

    <!-- Block 2: Condition Change -->
    <div
      ref="conditionRef"
      class="mb-24 transition-all duration-400 ease-out"
      :class="conditionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
    >
      <h3 class="text-[17px] text-[#d4a574] font-bold mb-6">{{ conditionChange.question }}</h3>

      <div class="space-y-4 mb-6">
        <div
          v-for="impact in relevantImpacts"
          :key="impact.routeId"
          class="border-l-[3px] border-[#d4a574] pl-4 py-1"
        >
          <span class="text-[14px] text-[#94a3b8] font-bold block mb-1">{{ getRouteName(impact.routeId) }}</span>
          <p class="text-[17px] text-[#f1f5f9] leading-[1.75]">{{ impact.change }}</p>
        </div>
      </div>

      <p class="text-[14px] text-[#94a3b8] italic">
        * {{ conditionChange.reminder }}
      </p>
    </div>

    <!-- Block 3: Closing Insight -->
    <div
      ref="insightRef"
      class="py-[120px] transition-all duration-[2500ms] ease-out flex flex-col justify-center items-center min-h-[40vh] mb-12"
      :class="insightVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
    >
      <div class="w-12 h-[1px] bg-[#d4a574] mb-8"></div>
      <p class="text-[20px] text-[#f1f5f9] font-bold text-center leading-loose md:max-w-[80%]">
        "{{ closing.insight }}"
      </p>
      <div class="w-12 h-[1px] bg-[#d4a574] mt-8"></div>
    </div>

    <!-- Block 4: Next step -->
    <div
      class="pb-12 text-center transition-all duration-1000 delay-1000"
      :class="insightVisible ? 'opacity-100' : 'opacity-0'"
    >
      <p class="text-[17px] text-[#f1f5f9] mb-8">{{ closing.nextStep }}</p>

      <button
        @click="emit('next')"
        class="w-full md:w-auto md:min-w-[280px] bg-[#d4a574] text-[#0a0f1a] font-bold rounded-xl min-h-[44px] py-3 px-8 transition-all duration-200 shadow-lg hover:bg-[#b88c5d] hover:scale-[1.02] active:scale-95 mx-auto block"
      >
        生成我的结果卡
      </button>
    </div>
  </div>
</template>
