import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import App from '../App.vue'
import { stayOrGo } from '../data/scenarios/stay-or-go'

class MockIntersectionObserver {
  root = null
  rootMargin = ''
  thresholds: number[] = []
  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  disconnect() {}

  observe(element: Element) {
    this.callback(
      [{ isIntersecting: true, target: element } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }

  unobserve() {}
}

function getButton(wrapper: VueWrapper, text: string) {
  const button = wrapper.findAll('button').find(item => item.text().includes(text))

  if (!button) {
    throw new Error(`未找到按钮：${text}`)
  }

  return button
}

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

function createJsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  })
}

function createAIScenario() {
  return {
    ...structuredClone(stayOrGo),
    id: 'ai-generated',
    title: '我要不要现在离开大厂，转去做自己的小项目？',
    intro: {
      userVoice: '我在现在的工作里不算差，但越来越想试试自己做项目。',
      systemInsight: '你真正卡住的，不是方向，而是你怕一旦动了，现有秩序就回不来了。',
      keyFactors: [
        '你手里能不能买到试错时间',
        '你有没有证据说明自己真的想做这件事',
        '你愿不愿意接受一段时间的波动和不确定',
      ],
    },
  }
}

function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

async function goToRoutesOverview(wrapper: VueWrapper) {
  await getButton(wrapper, '体验示例场景').trigger('click')
  await nextTick()

  await getButton(wrapper, '看看你的几条路').trigger('click')
  await nextTick()
  await nextTick()
}

async function goToFirstRouteDetail(wrapper: VueWrapper) {
  await goToRoutesOverview(wrapper)
  await getButton(wrapper, '继续').trigger('click')
  await nextTick()
}

async function goToSecondRouteDetail(wrapper: VueWrapper) {
  await goToFirstRouteDetail(wrapper)
  await getButton(wrapper, '看下一条路').trigger('click')
  await nextTick()
}

async function goToCompareWithBranch(wrapper: VueWrapper) {
  const branch = stayOrGo.routes.find(route => route.id === 'C')?.branch

  if (!branch) {
    throw new Error('未找到路线 C 的分叉数据')
  }

  await goToSecondRouteDetail(wrapper)
  await getButton(wrapper, '继续').trigger('click')
  await nextTick()
  await getButton(wrapper, branch.optionA.label).trigger('click')
  await nextTick()
  await getButton(wrapper, '继续对比').trigger('click')
  await nextTick()
  await nextTick()
}

async function goToCompareWithoutBranch(wrapper: VueWrapper) {
  await goToRoutesOverview(wrapper)

  const options = wrapper.findAll('[role="option"]')
  await options[2]!.trigger('click')
  await nextTick()
  await options[0]!.trigger('click')
  await nextTick()

  await getButton(wrapper, '继续').trigger('click')
  await nextTick()
  await getButton(wrapper, '看下一条路').trigger('click')
  await nextTick()
  await getButton(wrapper, '继续').trigger('click')
  await nextTick()
  await nextTick()
}

describe('App 完整流程', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    // Mock prefers-reduced-motion 为 true，跳过所有动画延迟
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const storage = createLocalStorageMock()
    vi.stubGlobal('localStorage', storage)
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: storage,
    })
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('初始渲染显示"选择后果沙盘"（IntroScreen）', () => {
    const wrapper = mount(App)

    expect(wrapper.text()).toContain('选择后果沙盘')
    expect(wrapper.text()).toContain('先试走几条路，再决定往哪走')
    expect(wrapper.text()).toContain('体验示例场景')
    expect(wrapper.text()).toContain('输入你的纠结')
  })

  it('点击"体验示例场景"后显示 InsightBridge 内容', async () => {
    const wrapper = mount(App)

    await getButton(wrapper, '体验示例场景').trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain(stayOrGo.intro.userVoice)
    expect(wrapper.text()).toContain(stayOrGo.intro.systemInsight)
  })

  it('点击 AI 入口后，能完成配置、输入并进入 AI 生成的主流程', async () => {
    const wrapper = mount(App)
    const aiScenario = createAIScenario()
    const fetchMock = vi.fn().mockResolvedValue(createJsonResponse({
      choices: [
        {
          message: {
            content: JSON.stringify(aiScenario),
          },
        },
      ],
    }))
    vi.stubGlobal('fetch', fetchMock)

    await getButton(wrapper, '输入你的纠结').trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('AI 设置')

    await wrapper.get('input[type="password"]').setValue('sk-test')
    await wrapper.get('input[placeholder="https://api.openai.com/v1"]').setValue('https://example.com/v1')
    await wrapper.get('input[placeholder="gpt-4o"]').setValue('gpt-4o-mini')
    await wrapper.get('form').trigger('submit')
    await nextTick()

    expect(wrapper.text()).toContain('描述你的纠结')

    await wrapper.get('textarea').setValue('我现在的工作还行，但越来越想离开去做自己的项目，不过我怕失去稳定。')
    await getButton(wrapper, '开始分析').trigger('click')

    await flushPromises()
    await nextTick()
    await nextTick()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain(aiScenario.intro.userVoice)
    expect(wrapper.text()).toContain(aiScenario.intro.systemInsight)
  })

  it('AI 生成失败后，可以回退到示例入口', async () => {
    const wrapper = mount(App)
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    vi.stubGlobal('fetch', fetchMock)

    await getButton(wrapper, '输入你的纠结').trigger('click')
    await nextTick()
    await wrapper.get('input[type="password"]').setValue('sk-test')
    await wrapper.get('form').trigger('submit')
    await nextTick()
    await wrapper.get('textarea').setValue('我在一份稳定工作里，但也想试试另一条更想走的路。')
    await getButton(wrapper, '开始分析').trigger('click')

    await flushPromises()
    await nextTick()

    expect(wrapper.text()).toContain('生成失败')
    expect(wrapper.text()).toContain('网络连接失败，请检查网络')

    await getButton(wrapper, '先体验示例场景').trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('选择后果沙盘')
    expect(wrapper.text()).toContain('体验示例场景')
  })

  it('点击"看看你的几条路"后显示 4 条路线', async () => {
    const wrapper = mount(App)

    await goToRoutesOverview(wrapper)

    const options = wrapper.findAll('[role="option"]')

    expect(options).toHaveLength(4)
    expect(wrapper.text()).toContain(stayOrGo.routes[0]!.name)
    expect(wrapper.text()).toContain(stayOrGo.routes[3]!.name)
  })

  it('默认预选 B 和 C 两条路线', async () => {
    const wrapper = mount(App)

    await goToRoutesOverview(wrapper)

    const options = wrapper.findAll('[role="option"]')

    expect(options[0]!.attributes('aria-selected')).toBe('false')
    expect(options[1]!.attributes('aria-selected')).toBe('true')
    expect(options[2]!.attributes('aria-selected')).toBe('true')
    expect(options[3]!.attributes('aria-selected')).toBe('false')
  })

  it('点击"继续"后显示第一条路线详情', async () => {
    const wrapper = mount(App)

    await goToFirstRouteDetail(wrapper)

    expect(wrapper.text()).toContain(stayOrGo.routes[1]!.name)
    expect(wrapper.text()).toContain(stayOrGo.routes[1]!.timeline.start)
  })

  it('点击"看下一条路"后显示第二条路线详情（带"和上一条路不同的是…"）', async () => {
    const wrapper = mount(App)

    await goToSecondRouteDetail(wrapper)

    expect(wrapper.text()).toContain('和上一条路不同的是…')
    expect(wrapper.text()).toContain(stayOrGo.routes[2]!.name)
  })

  it('选了含 branch 的路线时显示 BranchChoice', async () => {
    const wrapper = mount(App)

    await goToSecondRouteDetail(wrapper)
    await getButton(wrapper, '继续').trigger('click')
    await nextTick()

    const branch = stayOrGo.routes[2]!.branch

    expect(wrapper.text()).toContain(branch!.question)
    expect(wrapper.text()).toContain(branch!.optionA.label)
    expect(wrapper.text()).toContain(branch!.optionB.label)
  })

  it('选了不含 branch 的路线时跳过 BranchChoice 直接到 CompareView', async () => {
    const wrapper = mount(App)

    await goToCompareWithoutBranch(wrapper)

    expect(wrapper.text()).toContain('并排对比')
    expect(wrapper.text()).not.toContain(stayOrGo.routes[2]!.branch!.question)
  })

  it('最终到达 ResultCard，显示场景标题和收口金句', async () => {
    const wrapper = mount(App)

    await goToCompareWithBranch(wrapper)
    await getButton(wrapper, '生成我的结果卡').trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain(stayOrGo.title)
    expect(wrapper.text()).toContain(stayOrGo.closing.insight)
  })
})
