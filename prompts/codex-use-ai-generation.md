# 任务：创建 useAIGeneration composable（AI 生成状态机）

## 背景
这是 AI 个性化生成功能的核心 composable，管理从"用户点击 AI 入口"到"生成完成"的全部状态流转。它串联 `llmClient.ts`、`validateScenario.ts`、`aiPrompt.ts` 三个工具模块。

## 要创建的文件
- `src/composables/useAIGeneration.ts`
- `src/composables/__tests__/useAIGeneration.spec.ts`

## 参考文件（请先阅读）
- `src/utils/llmClient.ts` — callLLM、extractJSON、LLMError、LLMConfig
- `src/utils/validateScenario.ts` — validateScenario、ValidateResult
- `src/data/aiPrompt.ts` — SCENARIO_SYSTEM_PROMPT、buildUserPrompt
- `src/composables/useProgress.ts` — 参考其 localStorage 读写模式和测试风格
- `src/types/scenario.ts` — Scenario 类型

## 具体要求

### 1. 状态定义

```ts
// AI 生成流程的状态
export type AIGenerationStatus =
  | 'idle'         // 未开始，或已完成回到初始
  | 'configuring'  // 正在配置 API Key（设置浮层打开）
  | 'inputting'    // 用户正在输入纠结描述
  | 'generating'   // API 调用中
  | 'success'      // 生成成功
  | 'error'        // 生成失败

// AI 错误信息
export interface AIError {
  type: string      // 对应 LLMErrorType 或 'parse' | 'validation'
  message: string   // 中文用户友好消息
}
```

### 2. localStorage 存储

两个独立的 key：

```ts
const CONFIG_STORAGE_KEY = 'choice-sandbox-ai-config'
const CONFIG_STORAGE_VERSION = 1

const LAST_SCENARIO_KEY = 'choice-sandbox-ai-last'

// 存储格式
interface StoredConfig {
  version: number
  config: LLMConfig
}

interface StoredLastScenario {
  input: string        // 用户输入的纠结描述
  scenario: Scenario   // 生成的场景数据
  timestamp: number    // 生成时间戳
}
```

读写模式参考 `useProgress.ts`：try-catch 包裹，失败静默。

### 3. composable 签名

```ts
export function useAIGeneration() {
  // === 响应式状态 ===
  const status: Ref<AIGenerationStatus>
  const userInput: Ref<string>
  const generatedScenario: Ref<Scenario | null>
  const error: Ref<AIError | null>
  const config: Ref<LLMConfig>  // 从 localStorage 读取，有默认值

  // === 计算属性 ===
  const isConfigured: ComputedRef<boolean>  // config.apiKey 非空

  // === 操作方法 ===

  // 开始 AI 流程：检查是否已配置，决定进入 configuring 还是 inputting
  function startAIFlow(): void

  // 保存配置到 localStorage，进入 inputting 状态
  function saveConfig(newConfig: LLMConfig): void

  // 打开配置浮层（从 inputting 状态也能进入）
  function openSettings(): void

  // 提交用户输入，触发 AI 生成
  async function submitInput(text: string): Promise<void>

  // 取消正在进行的生成
  function cancelGeneration(): void

  // 用同样的输入重试
  function retry(): void

  // 回到 idle 状态，清空临时数据
  function reset(): void

  // 尝试从 localStorage 恢复上次 AI 生成的场景
  function restoreLastScenario(): Scenario | null

  return {
    status, userInput, generatedScenario, error, config, isConfigured,
    startAIFlow, saveConfig, openSettings, submitInput, cancelGeneration, retry, reset,
    restoreLastScenario,
  }
}
```

### 4. submitInput 核心流程

```ts
async function submitInput(text: string): Promise<void> {
  // 1. 保存输入文本
  userInput.value = text
  status.value = 'generating'
  error.value = null

  // 2. 创建 AbortController
  // 存到模块级变量，cancelGeneration() 可以调用 abort()
  currentAbortController = new AbortController()

  try {
    // 3. 调用 LLM API
    const rawContent = await callLLM({
      systemPrompt: SCENARIO_SYSTEM_PROMPT,
      userPrompt: buildUserPrompt(text),
      config: config.value,
      signal: currentAbortController.signal,
    })

    // 4. 解析 JSON
    const parsed = extractJSON(rawContent)
    if (parsed === null) {
      throw { type: 'parse', message: 'AI 返回的内容无法解析为 JSON' }
    }

    // 5. 校验结构
    const result = validateScenario(parsed)
    if (!result.valid) {
      // 如果是第一次校验失败且未重试过，自动重试一次
      if (!hasAutoRetried) {
        hasAutoRetried = true
        await submitInput(text)  // 递归重试
        return
      }
      throw { type: 'validation', message: 'AI 返回的数据结构不完整，请重试' }
    }

    // 6. 成功
    generatedScenario.value = result.scenario
    status.value = 'success'
    hasAutoRetried = false

    // 7. 存入 localStorage
    saveLastScenario(text, result.scenario)

  } catch (err) {
    // 用户取消 → 静默回到 inputting
    if (err instanceof LLMError && err.type === 'cancelled') {
      status.value = 'inputting'
      return
    }

    // 其他错误
    status.value = 'error'
    if (err instanceof LLMError) {
      error.value = { type: err.type, message: err.message }
    } else if (err && typeof err === 'object' && 'type' in err) {
      error.value = err as AIError
    } else {
      error.value = { type: 'unknown', message: '发生未知错误' }
    }
    hasAutoRetried = false
  }
}
```

### 5. config 默认值

```ts
const DEFAULT_CONFIG: LLMConfig = {
  apiKey: '',
  baseURL: 'https://api.openai.com/v1',
  model: 'gpt-4o',
}
```

### 6. 测试要求

**Mock 策略：**
```ts
vi.mock('../../utils/llmClient', () => ({
  callLLM: vi.fn(),
  extractJSON: vi.fn(),
  LLMError: class LLMError extends Error {
    type: string
    constructor(type: string, message: string) {
      super(message)
      this.type = type
    }
  },
}))

vi.mock('../../utils/validateScenario', () => ({
  validateScenario: vi.fn(),
}))
```

**测试用例（约 10 个）：**
1. 初始状态：status='idle'，isConfigured=false，generatedScenario=null
2. startAIFlow() 未配置 → status 变为 'configuring'
3. saveConfig() 后 → isConfigured=true，status 变为 'inputting'，localStorage 更新
4. startAIFlow() 已配置 → status 直接变为 'inputting'
5. submitInput() 成功 → status='success'，generatedScenario 非 null
6. submitInput() 网络错误 → status='error'，error.type='network'
7. submitInput() JSON 解析失败 → status='error'，error.type='parse'
8. cancelGeneration() → status 回到 'inputting'
9. retry() → 用同样的 userInput 重新调 submitInput
10. restoreLastScenario() 从 localStorage 读取 → 返回 Scenario 对象
11. reset() → 所有状态回到初始值

**localStorage mock：** 参考 `useProgress.spec.ts` 的 `createLocalStorageMock()`。

## 注意事项
- 不要改其他文件
- 不要添加新的 npm 依赖
- 代码注释用中文
- `hasAutoRetried` 是模块级变量（或闭包内变量），不是响应式的
- `currentAbortController` 也是模块级变量
