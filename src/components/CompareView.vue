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

// Intersection Observer for closing insight
const insightRef = ref<HTMLElement | null>(null)
const insightVisible = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      insightVisible.value = true
      // Only trigger once
      if (insightRef.value) {
        observer?.unobserve(insightRef.value)
      }
    }
  }, { threshold: 0.5 })
  
  if (insightRef.value) {
    observer.observe(insightRef.value)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
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
          class="bg-[#111827] rounded-xl p-5"
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

      <div class="bg-[#1e293b] rounded-xl p-6 text-center border border-[#d4a574] border-opacity-30">
        <p class="text-[17px] text-[#f1f5f9] font-medium leading-[1.75]">
          {{ keyContrast }}
        </p>
      </div>
    </div>

    <!-- Block 2: Condition Change -->
    <div class="mb-24">
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
