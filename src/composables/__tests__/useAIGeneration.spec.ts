import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildUserPrompt, SCENARIO_SYSTEM_PROMPT } from '../../data/aiPrompt'
import { stayOrGo } from '../../data/scenarios/stay-or-go'
import type { Scenario } from '../../types/scenario'

const llmClientMocks = vi.hoisted(() => {
  class MockLLMError extends Error {
    type: string

    constructor(type: string, message: string) {
      super(message)
      this.type = type
    }
  }

  return {
    callLLM: vi.fn(),
    extractJSON: vi.fn(),
    LLMError: MockLLMError,
  }
})

const validateScenarioMocks = vi.hoisted(() => ({
  validateScenario: vi.fn(),
}))

vi.mock('../../utils/llmClient', () => llmClientMocks)
vi.mock('../../utils/validateScenario', () => validateScenarioMocks)

type UseAIGenerationModule = typeof import('../useAIGeneration')

const CONFIG_STORAGE_KEY = 'choice-sandbox-ai-config'
const LAST_SCENARIO_KEY = 'choice-sandbox-ai-last'

let useAIGeneration: UseAIGenerationModule['useAIGeneration']

function createLocalStorageMock(): Storage {
  const storage = new Map<string, string>()

  return {
    get length() {
      return storage.size
    },
    clear() {
      storage.clear()
    },
    getItem(key) {
      return storage.has(key) ? storage.get(key)! : null
    },
    key(index) {
      return Array.from(storage.keys())[index] ?? null
    },
    removeItem(key) {
      storage.delete(key)
    },
    setItem(key, value) {
      storage.set(key, String(value))
    },
  }
}

function createScenario(): Scenario {
  return structuredClone(stayOrGo)
}

function createConfig() {
  return {
    apiKey: 'sk-test',
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4o',
  }
}

function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

describe('useAIGeneration', () => {
  beforeEach(async () => {
    vi.resetModules()
    llmClientMocks.callLLM.mockReset()
    llmClientMocks.extractJSON.mockReset()
    validateScenarioMocks.validateScenario.mockReset()

    const storage = createLocalStorageMock()
    vi.stubGlobal('localStorage', storage)
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: storage,
    })
    window.localStorage.clear()

    ;({ useAIGeneration } = await import('../useAIGeneration'))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("初始状态：status='idle'，isConfigured=false，generatedScenario=null", () => {
    const aiGen = useAIGeneration()

    expect(aiGen.status.value).toBe('idle')
    expect(aiGen.isConfigured.value).toBe(false)
    expect(aiGen.userInput.value).toBe('')
    expect(aiGen.generatedScenario.value).toBeNull()
    expect(aiGen.error.value).toBeNull()
    expect(aiGen.config.value).toEqual({
      apiKey: '',
      baseURL: 'https://api.openai.com/v1',
      model: 'gpt-4o',
    })
  })

  it("startAIFlow() 未配置时进入 'configuring'", () => {
    const aiGen = useAIGeneration()

    aiGen.startAIFlow()

    expect(aiGen.status.value).toBe('configuring')
  })

  it("saveConfig() 后保存配置并进入 'inputting'", () => {
    const aiGen = useAIGeneration()
    const config = createConfig()

    aiGen.saveConfig(config)

    expect(aiGen.isConfigured.value).toBe(true)
    expect(aiGen.status.value).toBe('inputting')
    expect(aiGen.config.value).toEqual(config)
    expect(JSON.parse(window.localStorage.getItem(CONFIG_STORAGE_KEY)!)).toEqual({
      version: 1,
      config,
    })
  })

  it("startAIFlow() 已配置时直接进入 'inputting'", () => {
    window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify({
      version: 1,
      config: createConfig(),
    }))

    const aiGen = useAIGeneration()

    aiGen.startAIFlow()

    expect(aiGen.status.value).toBe('inputting')
  })

  it("submitInput() 成功后进入 'success' 并保存结果", async () => {
    const aiGen = useAIGeneration()
    const scenario = createScenario()
    const config = createConfig()

    aiGen.saveConfig(config)
    llmClientMocks.callLLM.mockResolvedValue('{"ok":true}')
    llmClientMocks.extractJSON.mockReturnValue({ ok: true })
    validateScenarioMocks.validateScenario.mockReturnValue({
      valid: true,
      scenario,
    })

    await aiGen.submitInput('我要不要换工作')

    expect(llmClientMocks.callLLM).toHaveBeenCalledWith({
      systemPrompt: SCENARIO_SYSTEM_PROMPT,
      userPrompt: buildUserPrompt('我要不要换工作'),
      config,
      signal: expect.any(AbortSignal),
    })
    expect(aiGen.status.value).toBe('success')
    expect(aiGen.error.value).toBeNull()
    expect(aiGen.generatedScenario.value).toEqual(scenario)
    expect(JSON.parse(window.localStorage.getItem(LAST_SCENARIO_KEY)!)).toMatchObject({
      input: '我要不要换工作',
      scenario,
    })
    expect(JSON.parse(window.localStorage.getItem(LAST_SCENARIO_KEY)!).timestamp).toEqual(expect.any(Number))
  })

  it("submitInput() 遇到网络错误时进入 'error'", async () => {
    const aiGen = useAIGeneration()

    aiGen.saveConfig(createConfig())
    llmClientMocks.callLLM.mockRejectedValue(new llmClientMocks.LLMError(
      'network',
      '网络连接失败，请检查网络',
    ))

    await aiGen.submitInput('我要不要换工作')

    expect(aiGen.status.value).toBe('error')
    expect(aiGen.error.value).toEqual({
      type: 'network',
      message: '网络连接失败，请检查网络',
    })
  })

  it("submitInput() JSON 解析失败时进入 'error'", async () => {
    const aiGen = useAIGeneration()

    aiGen.saveConfig(createConfig())
    llmClientMocks.callLLM.mockResolvedValue('不是 JSON')
    llmClientMocks.extractJSON.mockReturnValue(null)

    await aiGen.submitInput('我要不要换工作')

    expect(aiGen.status.value).toBe('error')
    expect(aiGen.error.value).toEqual({
      type: 'parse',
      message: 'AI 返回的内容无法解析为 JSON',
    })
  })

  it('第一次校验失败时会自动重试一次', async () => {
    const aiGen = useAIGeneration()
    const scenario = createScenario()

    aiGen.saveConfig(createConfig())
    llmClientMocks.callLLM.mockResolvedValue('{"ok":true}')
    llmClientMocks.extractJSON.mockReturnValue({ ok: true })
    validateScenarioMocks.validateScenario
      .mockReturnValueOnce({
        valid: false,
        errors: ['缺少字段'],
      })
      .mockReturnValueOnce({
        valid: true,
        scenario,
      })

    await aiGen.submitInput('我要不要换工作')

    expect(llmClientMocks.callLLM).toHaveBeenCalledTimes(2)
    expect(aiGen.status.value).toBe('success')
    expect(aiGen.generatedScenario.value).toEqual(scenario)
  })

  it("cancelGeneration() 会取消请求并回到 'inputting'", async () => {
    const aiGen = useAIGeneration()

    aiGen.saveConfig(createConfig())
    llmClientMocks.callLLM.mockImplementation(({ signal }: { signal?: AbortSignal }) => {
      return new Promise((_resolve, reject) => {
        signal?.addEventListener('abort', () => {
          reject(new llmClientMocks.LLMError('cancelled', ''))
        }, { once: true })
      })
    })

    const task = aiGen.submitInput('我要不要换工作')
    expect(aiGen.status.value).toBe('generating')

    aiGen.cancelGeneration()
    await task

    expect(aiGen.status.value).toBe('inputting')
    expect(aiGen.error.value).toBeNull()
  })

  it('retry() 会用同一段输入重新发起生成', async () => {
    const aiGen = useAIGeneration()
    const scenario = createScenario()

    aiGen.saveConfig(createConfig())
    llmClientMocks.callLLM
      .mockRejectedValueOnce(new llmClientMocks.LLMError(
        'network',
        '网络连接失败，请检查网络',
      ))
      .mockResolvedValueOnce('{"ok":true}')
    llmClientMocks.extractJSON.mockReturnValue({ ok: true })
    validateScenarioMocks.validateScenario.mockReturnValue({
      valid: true,
      scenario,
    })

    await aiGen.submitInput('我要不要换工作')
    aiGen.retry()
    await flushPromises()
    await flushPromises()

    expect(llmClientMocks.callLLM).toHaveBeenCalledTimes(2)
    expect(llmClientMocks.callLLM).toHaveBeenLastCalledWith({
      systemPrompt: SCENARIO_SYSTEM_PROMPT,
      userPrompt: buildUserPrompt('我要不要换工作'),
      config: createConfig(),
      signal: expect.any(AbortSignal),
    })
    expect(aiGen.status.value).toBe('success')
  })

  it('restoreLastScenario() 从 localStorage 恢复场景', () => {
    const scenario = createScenario()

    window.localStorage.setItem(LAST_SCENARIO_KEY, JSON.stringify({
      input: '我要不要换工作',
      scenario,
      timestamp: Date.now(),
    }))

    const aiGen = useAIGeneration()

    expect(aiGen.restoreLastScenario()).toEqual(scenario)
  })

  it('reset() 会清空临时状态并回到初始界面', async () => {
    const aiGen = useAIGeneration()
    const scenario = createScenario()

    aiGen.saveConfig(createConfig())
    llmClientMocks.callLLM.mockResolvedValue('{"ok":true}')
    llmClientMocks.extractJSON.mockReturnValue({ ok: true })
    validateScenarioMocks.validateScenario.mockReturnValue({
      valid: true,
      scenario,
    })

    await aiGen.submitInput('我要不要换工作')
    aiGen.reset()

    expect(aiGen.status.value).toBe('idle')
    expect(aiGen.userInput.value).toBe('')
    expect(aiGen.generatedScenario.value).toBeNull()
    expect(aiGen.error.value).toBeNull()
    expect(aiGen.config.value).toEqual(createConfig())
  })
})
