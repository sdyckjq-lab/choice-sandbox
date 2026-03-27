import { afterEach, describe, expect, it, vi } from 'vitest'
import { LLMError, callLLM, extractJSON, type LLMErrorType, type LLMRequest } from '../llmClient'

function createRequest(overrides: Partial<LLMRequest> = {}): LLMRequest {
  return {
    systemPrompt: '你是系统提示词',
    userPrompt: '给我一个 JSON 结果',
    config: {
      apiKey: 'sk-test',
      baseURL: 'https://example.com/v1',
      model: 'gpt-4o-mini',
    },
    ...overrides,
  }
}

function createJsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  })
}

function createAbortError(name: 'AbortError' | 'TimeoutError' = 'AbortError'): Error {
  const error = new Error(name)
  error.name = name
  return error
}

async function expectLLMError(
  action: Promise<unknown>,
  expectedType: LLMErrorType,
  expectedMessage: string,
) {
  try {
    await action
    throw new Error('预期这里应该抛出 LLMError')
  }
  catch (error) {
    expect(error).toBeInstanceOf(LLMError)
    expect(error).toMatchObject({
      type: expectedType,
      message: expectedMessage,
    })
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('extractJSON', () => {
  it('能直接解析 JSON 字符串', () => {
    expect(extractJSON('{"ok":true,"count":2}')).toEqual({
      ok: true,
      count: 2,
    })
  })

  it('能从代码块里提取 JSON', () => {
    expect(extractJSON('```json\n{"name":"codex"}\n```')).toEqual({
      name: 'codex',
    })
  })

  it('遇到无效内容时返回 null', () => {
    expect(extractJSON('这不是 JSON')).toBeNull()
  })
})

describe('callLLM', () => {
  it('按要求发送请求并返回 message.content', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse({
      choices: [
        {
          message: {
            content: '{"answer":"ok"}',
          },
        },
      ],
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await callLLM(createRequest())

    expect(result).toBe('{"answer":"ok"}')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://example.com/v1/chat/completions')
    expect(options.method).toBe('POST')
    expect(options.headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer sk-test',
    })
    expect(options.signal).toBeInstanceOf(AbortSignal)
    expect(JSON.parse(String(options.body))).toEqual({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: '你是系统提示词' },
        { role: 'user', content: '给我一个 JSON 结果' },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })
  })

  it.each([
    [401, 'auth', 'API 密钥无效，请检查后重试'],
    [402, 'quota', 'API 额度不足'],
    [429, 'quota', '请求太频繁，请稍后重试'],
    [503, 'server', 'AI 服务暂时不可用'],
  ] satisfies Array<[number, LLMErrorType, string]>)(
    '将 HTTP %i 映射成对应错误',
    async (status, expectedType, expectedMessage) => {
      const fetchMock = vi.fn().mockResolvedValue(createJsonResponse(
        { error: { message: 'failed' } },
        { status },
      ))
      vi.stubGlobal('fetch', fetchMock)

      await expectLLMError(callLLM(createRequest()), expectedType, expectedMessage)
    },
  )

  it('AI 返回空内容时抛出 unknown', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse({
      choices: [
        {
          message: {
            content: '   ',
          },
        },
      ],
    }))
    vi.stubGlobal('fetch', fetchMock)

    await expectLLMError(callLLM(createRequest()), 'unknown', 'AI 返回了空内容')
  })

  it('fetch 抛出 TypeError 时映射成 network', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    vi.stubGlobal('fetch', fetchMock)

    await expectLLMError(callLLM(createRequest()), 'network', '网络连接失败，请检查网络')
  })

  it('外部主动取消时映射成 cancelled', async () => {
    const controller = new AbortController()
    controller.abort()

    const fetchMock = vi.fn().mockRejectedValue(createAbortError())
    vi.stubGlobal('fetch', fetchMock)

    await expectLLMError(callLLM(createRequest({ signal: controller.signal })), 'cancelled', '')
  })

  it('没有外部取消时将 AbortError 视为 timeout', async () => {
    const fetchMock = vi.fn().mockRejectedValue(createAbortError())
    vi.stubGlobal('fetch', fetchMock)

    await expectLLMError(callLLM(createRequest()), 'timeout', '生成超时，可能是网络不稳定')
  })
})
