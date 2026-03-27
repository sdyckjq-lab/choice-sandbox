const REQUEST_TIMEOUT_MS = 60_000

// LLM 服务配置
export interface LLMConfig {
  apiKey: string
  baseURL: string
  model: string
}

// 调用请求参数
export interface LLMRequest {
  systemPrompt: string
  userPrompt: string
  config: LLMConfig
  signal?: AbortSignal
}

// 错误类型枚举
export type LLMErrorType =
  | 'auth'
  | 'quota'
  | 'server'
  | 'network'
  | 'timeout'
  | 'cancelled'
  | 'unknown'

// 自定义错误类
export class LLMError extends Error {
  type: LLMErrorType

  constructor(type: LLMErrorType, message: string) {
    super(message)
    this.name = 'LLMError'
    this.type = type
  }
}

interface ChatCompletionRequestBody {
  model: string
  messages: Array<{
    role: 'system' | 'user'
    content: string
  }>
  response_format: {
    type: 'json_object'
  }
  temperature: number
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null
    }
  }>
}

interface SignalBundle {
  signal: AbortSignal
  cleanup: () => void
}

function buildRequestBody(request: LLMRequest): ChatCompletionRequestBody {
  return {
    model: request.config.model,
    messages: [
      { role: 'system', content: request.systemPrompt },
      { role: 'user', content: request.userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  }
}

function normalizeBaseURL(baseURL: string): string {
  return baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL
}

function createAbortReason(name: 'AbortError' | 'TimeoutError', message: string): Error {
  const error = new Error(message)
  error.name = name
  return error
}

function createRequestSignal(externalSignal?: AbortSignal): SignalBundle {
  if (typeof AbortSignal.timeout === 'function') {
    const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS)

    if (!externalSignal) {
      return {
        signal: timeoutSignal,
        cleanup: () => {},
      }
    }

    if (typeof AbortSignal.any === 'function') {
      return {
        signal: AbortSignal.any([externalSignal, timeoutSignal]),
        cleanup: () => {},
      }
    }
  }

  const controller = new AbortController()
  let timeoutId: ReturnType<typeof globalThis.setTimeout> | null = null

  const abortFromExternal = () => {
    controller.abort(externalSignal?.reason ?? createAbortReason('AbortError', '请求已取消'))
  }

  timeoutId = globalThis.setTimeout(() => {
    controller.abort(createAbortReason('TimeoutError', '请求超时'))
  }, REQUEST_TIMEOUT_MS)

  if (externalSignal) {
    if (externalSignal.aborted) {
      abortFromExternal()
    }
    else {
      externalSignal.addEventListener('abort', abortFromExternal, { once: true })
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      if (timeoutId !== null) {
        globalThis.clearTimeout(timeoutId)
      }

      externalSignal?.removeEventListener('abort', abortFromExternal)
    },
  }
}

function mapStatusToError(status: number): LLMError {
  if (status === 401) {
    return new LLMError('auth', 'API 密钥无效，请检查后重试')
  }

  if (status === 402) {
    return new LLMError('quota', 'API 额度不足')
  }

  if (status === 429) {
    return new LLMError('quota', '请求太频繁，请稍后重试')
  }

  if (status >= 500 && status < 600) {
    return new LLMError('server', 'AI 服务暂时不可用')
  }

  return new LLMError('unknown', '发生未知错误')
}

function isAbortLikeError(error: unknown): error is { name: string } {
  if (error instanceof Error) {
    return error.name === 'AbortError' || error.name === 'TimeoutError'
  }

  if (typeof error === 'object' && error !== null && 'name' in error) {
    const { name } = error as { name?: unknown }
    return name === 'AbortError' || name === 'TimeoutError'
  }

  return false
}

// 调用 OpenAI 兼容 API，返回 message.content 字符串
// 失败时抛出 LLMError
export async function callLLM(request: LLMRequest): Promise<string> {
  const { signal, cleanup } = createRequestSignal(request.signal)

  try {
    const response = await fetch(`${normalizeBaseURL(request.config.baseURL)}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${request.config.apiKey}`,
      },
      body: JSON.stringify(buildRequestBody(request)),
      signal,
    })

    if (!response.ok) {
      throw mapStatusToError(response.status)
    }

    const data = await response.json() as ChatCompletionResponse
    const content = data.choices?.[0]?.message?.content

    if (typeof content !== 'string' || content.trim() === '') {
      throw new LLMError('unknown', 'AI 返回了空内容')
    }

    return content
  }
  catch (error) {
    if (error instanceof LLMError) {
      throw error
    }

    if (error instanceof TypeError) {
      throw new LLMError('network', '网络连接失败，请检查网络')
    }

    if (isAbortLikeError(error)) {
      if (request.signal?.aborted) {
        throw new LLMError('cancelled', '')
      }

      throw new LLMError('timeout', '生成超时，可能是网络不稳定')
    }

    throw new LLMError('unknown', '发生未知错误')
  }
  finally {
    cleanup()
  }
}

// 尝试从字符串中解析 JSON
// 先直接 JSON.parse，失败后尝试提取代码块
export function extractJSON(content: string): unknown | null {
  try {
    return JSON.parse(content)
  }
  catch {
    const matched = content.match(/```(?:json)?\s*([\s\S]*?)```/i)

    if (!matched) {
      return null
    }

    try {
      return JSON.parse(matched[1].trim())
    }
    catch {
      return null
    }
  }
}
