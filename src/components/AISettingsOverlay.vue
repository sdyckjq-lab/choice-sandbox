<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { LLMConfig } from '../utils/llmClient'

const DEFAULT_BASE_URL = 'https://api.openai.com/v1'
const DEFAULT_MODEL = 'gpt-4o'

const props = defineProps<{
  config: LLMConfig
}>()

const emit = defineEmits<{
  (e: 'save', config: LLMConfig): void
  (e: 'close'): void
}>()

const apiKey = ref('')
const baseURL = ref(DEFAULT_BASE_URL)
const model = ref(DEFAULT_MODEL)
const showApiKey = ref(false)
const contentVisible = ref(false)

const canSave = computed(() => apiKey.value.trim().length > 0)

watch(
  () => props.config,
  (config) => {
    apiKey.value = config.apiKey ?? ''
    baseURL.value = config.baseURL ?? DEFAULT_BASE_URL
    model.value = config.model ?? DEFAULT_MODEL
  },
  { immediate: true, deep: true },
)

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    contentVisible.value = true
    return
  }

  requestAnimationFrame(() => {
    contentVisible.value = true
  })
})

function handleSubmit() {
  if (!canSave.value) {
    return
  }

  emit('save', {
    apiKey: apiKey.value.trim(),
    baseURL: baseURL.value.trim() || DEFAULT_BASE_URL,
    model: model.value.trim() || DEFAULT_MODEL,
  })
}
</script>

<template>
  <div class="min-h-screen bg-[#0a0f1a] px-6 py-10 fixed inset-0 z-50 overflow-y-auto">
    <div
      class="w-full max-w-md mx-auto transition-all duration-400 ease-out"
      :class="contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
    >
      <button
        class="text-[14px] text-[#94a3b8] hover:text-[#d4a574] transition-colors duration-200 mb-10"
        @click="emit('close')"
      >
        ← 返回
      </button>

      <h2 class="text-[28px] font-bold text-[#d4a574] mb-3">AI 设置</h2>
      <p class="text-[14px] text-[#94a3b8] leading-[1.7] mb-10">
        需要一个 AI 接口来为你生成<br>
        个性化的选择分析
      </p>

      <form class="space-y-6" @submit.prevent="handleSubmit">
        <label class="block">
          <span class="text-[14px] text-[#94a3b8] block mb-2">API 密钥 *</span>
          <div class="relative">
            <input
              v-model="apiKey"
              :type="showApiKey ? 'text' : 'password'"
              placeholder="sk-..."
              class="bg-[#111827] border border-[#1e293b] rounded-xl text-[#f1f5f9] text-[17px] px-4 py-3 w-full pr-20 focus:border-[#d4a574] focus:outline-none transition-colors duration-200"
            >
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-[14px] text-[#94a3b8] hover:text-[#d4a574] transition-colors duration-200"
              @click="showApiKey = !showApiKey"
            >
              {{ showApiKey ? '隐藏' : '显示' }}
            </button>
          </div>
        </label>

        <label class="block">
          <span class="text-[14px] text-[#94a3b8] block mb-2">API 地址</span>
          <input
            v-model="baseURL"
            type="text"
            placeholder="https://api.openai.com/v1"
            class="bg-[#111827] border border-[#1e293b] rounded-xl text-[#f1f5f9] text-[17px] px-4 py-3 w-full focus:border-[#d4a574] focus:outline-none transition-colors duration-200"
          >
        </label>

        <label class="block">
          <span class="text-[14px] text-[#94a3b8] block mb-2">模型名称</span>
          <input
            v-model="model"
            type="text"
            placeholder="gpt-4o"
            class="bg-[#111827] border border-[#1e293b] rounded-xl text-[#f1f5f9] text-[17px] px-4 py-3 w-full focus:border-[#d4a574] focus:outline-none transition-colors duration-200"
          >
        </label>

        <button
          type="submit"
          :disabled="!canSave"
          class="bg-[#d4a574] text-[#0a0f1a] font-bold rounded-xl min-h-[44px] py-3 px-6 w-full transition-all duration-200 hover:bg-[#b88c5d] hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          保存并继续
        </button>
      </form>

      <p class="text-[12px] text-[#94a3b8] text-center leading-[1.7] mt-6">
        密钥仅存储在你的浏览器本地，<br>
        不会上传到任何服务器
      </p>
    </div>
  </div>
</template>
