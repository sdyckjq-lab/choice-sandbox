# 任务：创建 LLM API 客户端（fetch 封装）

## 背景
AI 个性化生成需要调用 OpenAI 兼容的 Chat Completions API。用原生 `fetch` 封装一个轻量客户端，不引入任何 SDK。

## 要创建的文件
- `src/utils/llmClient.ts`

## 具体要求

### 1. 类型定义

```ts
// LLM 服务配置
export interface LLMConfig {
  apiKey: string       // API 密钥
  baseURL: string      // API 地址，如 'https://api.openai.com/v1'
  model: string        // 模型名称，如 'gpt-4o'
}

// 调用请求参数
export interface LLMRequest {
  systemPrompt: string
  userPrompt: string
  config: LLMConfig
  signal?: AbortSignal  // 支持取消
}

// 错误类型枚举
export type LLMErrorType =
  | 'auth'       // 401 — API Key 无效
  | 'quota'      // 402/429 — 额度不足或限频
  | 'server'     // 5xx — 服务端错误
  | 'network'    // fetch 抛出 TypeError（断网等）
  | 'timeout'    // AbortSignal 超时
  | 'cancelled'  // 用户主动取消
  | 'unknown'    // 其他未知错误

// 自定义错误类
export class LLMError extends Error {
  type: LLMErrorType
  constructor(type: LLMErrorType, message: string)
}
```

### 2. 主函数签名

```ts
// 调用 OpenAI 兼容 API，返回 message.content 字符串
// 失败时抛出 LLMError
export async function callLLM(request: LLMRequest): Promise<string>
```

### 3. 实现细节

**请求构造：**
```
POST ${config.baseURL}/chat/completions
Headers:
  Content-Type: application/json
  Authorization: Bearer ${config.apiKey}
Body:
  {
    model: config.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7
  }
```

**超时控制：**
- 使用 `AbortSignal.timeout(60000)` 创建 60 秒超时信号
- 如果调用方也传了 `signal`，用 `AbortSignal.any([外部signal, 超时signal])` 合并两个信号
- 注意：`AbortSignal.any` 是较新的 API，如果需要兼容性，可以用 `AbortController` + `setTimeout` 手动实现

**响应处理：**
- 检查 `response.ok`，如果不是，根据 status code 抛出对应类型的 `LLMError`
- 解析 JSON 响应，提取 `response.choices[0].message.content`
- 如果 `content` 为空或不存在，抛出 `LLMError('unknown', 'AI 返回了空内容')`

**错误映射：**
| HTTP Status / 错误 | LLMErrorType | 用户友好消息 |
|---|---|---|
| 401 | auth | API 密钥无效，请检查后重试 |
| 402 | quota | API 额度不足 |
| 429 | quota | 请求太频繁，请稍后重试 |
| 5xx | server | AI 服务暂时不可用 |
| fetch TypeError | network | 网络连接失败，请检查网络 |
| AbortError + 外部 signal.aborted | cancelled | （不需要消息，静默处理） |
| AbortError + 超时 | timeout | 生成超时，可能是网络不稳定 |
| 其他 | unknown | 发生未知错误 |

**判断 AbortError 来源：**
如果 `error.name === 'AbortError'`，检查外部 `signal?.aborted` 是否为 true：
- 是 → `cancelled`（用户取消）
- 否 → `timeout`（60 秒超时）

### 4. JSON 提取辅助函数

```ts
// 尝试从字符串中解析 JSON
// 先直接 JSON.parse，失败后尝试提取 ```json ... ``` 代码块
export function extractJSON(content: string): unknown | null
```

逻辑：
1. 先 `try { return JSON.parse(content) }`
2. 失败后，用正则 `/```(?:json)?\s*([\s\S]*?)```/` 提取代码块内容，再 `JSON.parse`
3. 都失败返回 `null`

## 注意事项
- 不要添加新的 npm 依赖
- 代码注释用中文
- `LLMError` 的 `message` 字段存中文用户友好消息
- 导出所有类型和函数：`LLMConfig`、`LLMRequest`、`LLMErrorType`、`LLMError`、`callLLM`、`extractJSON`
