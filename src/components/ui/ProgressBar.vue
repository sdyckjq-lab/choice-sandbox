<script setup lang="ts">

const props = defineProps<{
  currentStep: number
  totalSteps: number
}>()
</script>

<template>
  <div 
    class="fixed top-0 left-0 w-full h-[3px] bg-[#111827] z-50"
    role="progressbar"
    :aria-valuenow="currentStep"
    aria-valuemin="0"
    :aria-valuemax="totalSteps - 1"
  >
    <div 
      class="h-full bg-[#d4a574] transition-all duration-400 ease-in-out"
      :style="{ width: `${(currentStep / Math.max(1, totalSteps - 1)) * 100}%` }"
    ></div>
  </div>
</template>
