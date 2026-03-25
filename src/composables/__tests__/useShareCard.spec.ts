import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const html2canvasMock = vi.fn()

vi.mock('html2canvas', () => ({
  default: html2canvasMock,
}))

describe('useShareCard', () => {
  beforeEach(() => {
    html2canvasMock.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('generateImage() 成功时生成 PNG 并下载固定文件名', async () => {
    const clickSpy = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    const anchor = document.createElement('a')
    anchor.click = clickSpy

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return anchor
      }

      return originalCreateElement(tagName)
    })

    html2canvasMock.mockResolvedValue({
      toDataURL: vi.fn(() => 'data:image/png;base64,abc'),
    })

    const { useShareCard } = await import('../useShareCard')
    const shareCard = useShareCard()
    const element = document.createElement('div')

    await shareCard.generateImage(element)

    expect(html2canvasMock).toHaveBeenCalledWith(element, {
      backgroundColor: '#0a0f1a',
      scale: 2,
      useCORS: true,
    })
    expect(anchor.download).toBe('choice-sandbox-result.png')
    expect(anchor.href).toBe('data:image/png;base64,abc')
    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(shareCard.generating.value).toBe(false)
    expect(shareCard.failed.value).toBe(false)
  })

  it('generateImage() 失败时标记 failed=true 供页面降级提示', async () => {
    html2canvasMock.mockRejectedValue(new Error('canvas failed'))

    const { useShareCard } = await import('../useShareCard')
    const shareCard = useShareCard()

    await shareCard.generateImage(document.createElement('div'))

    expect(shareCard.generating.value).toBe(false)
    expect(shareCard.failed.value).toBe(true)
  })
})
