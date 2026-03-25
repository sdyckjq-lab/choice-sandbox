<script setup lang="ts">
import type { Route } from '../types/scenario'
import { ref, onMounted } from 'vue'

const props = defineProps<{
  routes: Route[]
  defaultSelectedRouteIds: [string, string]
}>()

const emit = defineEmits<{
  (e: 'select', selectedIds: [string, string]): void
}>()

const selectedIds = ref<string[]>([])

// 入场动画状态
const visibleCount = ref(0)
const animationDone = ref(false)

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

onMounted(() => {
  if (prefersReducedMotion()) {
    visibleCount.value = props.routes.length
    animationDone.value = true
    selectedIds.value = [...props.defaultSelectedRouteIds]
    return
  }

  // 路线逐条出现，每条间隔 150ms
  props.routes.forEach((_, i) => {
    setTimeout(() => {
      visibleCount.value = i + 1
      // 最后一条出现后，启用交互 + 显示预选高亮
      if (i === props.routes.length - 1) {
        setTimeout(() => {
          selectedIds.value = [...props.defaultSelectedRouteIds]
          animationDone.value = true
        }, 300)
      }
    }, i * 150)
  })
})

function toggleRoute(id: string) {
  if (!animationDone.value) return
  const isSelected = selectedIds.value.includes(id)

  if (isSelected) {
    selectedIds.value = selectedIds.value.filter(v => v !== id)
  } else {
    if (selectedIds.value.length < 2) {
      selectedIds.value.push(id)
    }
  }
}

function handleContinue() {
  if (selectedIds.value.length === 2) {
    emit('select', [selectedIds.value[0], selectedIds.value[1]])
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col justify-center px-6 py-12">
    <div class="w-full md:max-w-[520px] md:mx-auto">
      <p class="text-[17px] text-[#f1f5f9] mb-8 leading-[1.75]">
        你有四条路可以走，选两条最纠结的
      </p>

      <ul
        class="flex flex-col gap-4"
        role="listbox"
        aria-multiselectable="true"
      >
        <li
          v-for="(route, index) in routes"
          :key="route.id"
          role="option"
          :aria-selected="selectedIds.includes(route.id)"
          @click="toggleRoute(route.id)"
          @keydown.enter.space.prevent="toggleRoute(route.id)"
          tabindex="0"
          class="relative w-full rounded-xl min-h-[44px] p-4 transition-all duration-200 overflow-hidden flex items-start focus:outline-none focus:ring-2 focus:ring-[#d4a574]"
          :class="[
            index < visibleCount ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
            animationDone ? 'cursor-pointer' : 'cursor-default',
            selectedIds.includes(route.id)
              ? 'bg-[#1e293b] border-l-[3px] border-[#d4a574]'
              : 'bg-[#111827] border-l-[3px] border-transparent',
            !selectedIds.includes(route.id) && selectedIds.length >= 2
              ? 'opacity-40 hover:opacity-100'
              : animationDone ? 'hover:bg-[#1e293b]' : ''
          ]"
          :style="{ transitionDuration: '400ms', transitionTimingFunction: 'ease-out' }"
        >
          <!-- checkmark icon area -->
          <div class="w-6 shrink-0 flex items-center justify-center mr-3 mt-1">
            <span v-if="selectedIds.includes(route.id)" class="text-[#d4a574]">✓</span>
          </div>

          <div class="flex-1">
            <h3 class="text-[17px] text-[#f1f5f9] font-bold mb-1">{{ route.name }}</h3>
            <p class="text-[14px] text-[#94a3b8] leading-snug">{{ route.oneLiner }}</p>
          </div>
        </li>
      </ul>

      <!-- bottom state -->
      <div class="mt-12 h-14 flex items-center justify-center">
        <p v-if="selectedIds.length === 1" class="text-[14px] text-[#94a3b8] animate-pulse">
          再选一条
        </p>
        <button
          v-else-if="selectedIds.length === 2"
          @click="handleContinue"
          class="w-full bg-[#d4a574] text-[#0a0f1a] font-bold rounded-xl min-h-[44px] py-3 px-6 transition-all duration-200 shadow-lg hover:bg-[#b88c5d] hover:scale-[1.02] active:scale-95"
        >
          继续
        </button>
      </div>
    </div>
  </div>
</template>
