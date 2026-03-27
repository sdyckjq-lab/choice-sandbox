import { computed, ref } from 'vue'
import { SCENARIO_SYSTEM_PROMPT, buildUserPrompt } from '../data/aiPrompt'
import type { Scenario } from '../types/scenario'
import { LLMError, callLLM, extractJSON, type LLMConfig } from '../utils/llmClient'
import { validateScenario } from '../utils/validateScenario'

const CONFIG_STORAGE_KEY = 'choice-sandbox-ai-config'
const CONFIG_STORAGE_VERSION = 1
const LAST_SCENARIO_KEY = 'choice-sandbox-ai-last'

const DEFAULT_CONFIG: LLMConfig = {
  apiKey: '',
  baseURL: 'https://api.openai.com/v1',
  model: 'gpt-4o',
}

export type AIGenerationStatus =
  | 'idle'
  | 'configuring'
  | 'inputting'
  | 'generating'
  | 'success'
  | 'error'

export interface AIError {
  type: string
  message: string
}

interface StoredConfig {
  version: number
  config: LLMConfig
}

interface StoredLastScenario {
  input: string
  scenario: Scenario
  timestamp: number
}

let currentAbortController: AbortController | null = null
let hasAutoRetried = false
let cachedLastScenario: Scenario | null | undefined

function createDefaultConfig(): LLMConfig {
  return { ...DEFAULT_CONFIG }
}

function clearStoredConfig() {
  try {
    localStorage.removeItem(CONFIG_STORAGE_KEY)
  }
  catch {
    // 忽略 localStorage 不可用或不可写的情况
  }
}

function clearStoredLastScenario() {
  try {
    localStorage.removeItem(LAST_SCENARIO_KEY)
  }
  catch {
    // 忽略 localStorage 不可用或不可写的情况
  }
}

function readInitialConfig(): LLMConfig {
  const defaultConfig = createDefaultConfig()

  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY)

    if (!raw) {
      return defaultConfig
    }

    const stored = JSON.parse(raw) as StoredConfig

    if (stored.version !== CONFIG_STORAGE_VERSION) {
      clearStoredConfig()
      return defaultConfig
    }

    return {
      apiKey: stored.config.apiKey ?? '',
      baseURL: stored.config.baseURL ?? DEFAULT_CONFIG.baseURL,
      model: stored.config.model ?? DEFAULT_CONFIG.model,
    }
  }
  catch {
    clearStoredConfig()
    return defaultConfig
  }
}

function persistConfig(config: LLMConfig) {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify({
      version: CONFIG_STORAGE_VERSION,
      config,
    } satisfies StoredConfig))
  }
  catch {
    // 忽略 localStorage 不可用或不可写的情况
  }
}

function readStoredLastScenario(): Scenario | null {
  if (cachedLastScenario !== undefined) {
    return cachedLastScenario
  }

  try {
    const raw = localStorage.getItem(LAST_SCENARIO_KEY)

    if (!raw) {
      cachedLastScenario = null
      return null
    }

    const stored = JSON.parse(raw) as Partial<StoredLastScenario>

    if (!stored || typeof stored !== 'object' || !('scenario' in stored) || stored.scenario == null) {
      clearStoredLastScenario()
      cachedLastScenario = null
      return null
    }

    cachedLastScenario = stored.scenario as Scenario
    return cachedLastScenario
  }
  catch {
    clearStoredLastScenario()
    cachedLastScenario = null
    return null
  }
}

function saveLastScenario(input: string, scenario: Scenario) {
  const storedLastScenario: StoredLastScenario = {
    input,
    scenario,
    timestamp: Date.now(),
  }

  cachedLastScenario = scenario

  try {
    localStorage.setItem(LAST_SCENARIO_KEY, JSON.stringify(storedLastScenario))
  }
  catch {
    // 忽略 localStorage 不可用或不可写的情况
  }
}

export function useAIGeneration() {
  const status = ref<AIGenerationStatus>('idle')
  const userInput = ref('')
  const generatedScenario = ref<Scenario | null>(null)
  const error = ref<AIError | null>(null)
  const config = ref<LLMConfig>(readInitialConfig())

  const isConfigured = computed(() => config.value.apiKey.trim().length > 0)

  function startAIFlow() {
    error.value = null
    status.value = isConfigured.value ? 'inputting' : 'configuring'
  }

  function saveConfig(newConfig: LLMConfig) {
    config.value = { ...newConfig }
    persistConfig(config.value)
    error.value = null
    status.value = 'inputting'
  }

  function openSettings() {
    status.value = 'configuring'
  }

  async function submitInput(text: string): Promise<void> {
    userInput.value = text
    generatedScenario.value = null
    status.value = 'generating'
    error.value = null

    const abortController = new AbortController()
    currentAbortController = abortController

    try {
      const rawContent = await callLLM({
        systemPrompt: SCENARIO_SYSTEM_PROMPT,
        userPrompt: buildUserPrompt(text),
        config: config.value,
        signal: abortController.signal,
      })

      const parsed = extractJSON(rawContent)
      if (parsed === null) {
        throw {
          type: 'parse',
          message: 'AI 返回的内容无法解析为 JSON',
        } satisfies AIError
      }

      const result = validateScenario(parsed)
      if (!result.valid) {
        if (!hasAutoRetried) {
          hasAutoRetried = true
          await submitInput(text)
          return
        }

        throw {
          type: 'validation',
          message: 'AI 返回的数据结构不完整，请重试',
        } satisfies AIError
      }

      generatedScenario.value = result.scenario
      status.value = 'success'
      hasAutoRetried = false
      saveLastScenario(text, result.scenario)
    }
    catch (err) {
      if (err instanceof LLMError && err.type === 'cancelled') {
        hasAutoRetried = false
        status.value = 'inputting'
        return
      }

      status.value = 'error'

      if (err instanceof LLMError) {
        error.value = {
          type: err.type,
          message: err.message,
        }
      }
      else if (typeof err === 'object' && err !== null && 'type' in err && 'message' in err) {
        error.value = err as AIError
      }
      else {
        error.value = {
          type: 'unknown',
          message: '发生未知错误',
        }
      }

      hasAutoRetried = false
    }
    finally {
      if (currentAbortController === abortController) {
        currentAbortController = null
      }
    }
  }

  function cancelGeneration() {
    currentAbortController?.abort()
  }

  function retry() {
    if (!userInput.value.trim()) {
      return
    }

    void submitInput(userInput.value)
  }

  function reset() {
    status.value = 'idle'
    userInput.value = ''
    generatedScenario.value = null
    error.value = null
    hasAutoRetried = false
  }

  function restoreLastScenario(): Scenario | null {
    return readStoredLastScenario()
  }

  return {
    status,
    userInput,
    generatedScenario,
    error,
    config,
    isConfigured,
    startAIFlow,
    saveConfig,
    openSettings,
    submitInput,
    cancelGeneration,
    retry,
    reset,
    restoreLastScenario,
  }
}
