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

async function goToRoutesOverview(wrapper: VueWrapper) {
  await getButton(wrapper, '开始体验').trigger('click')
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
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('初始渲染显示"选择后果沙盘"（IntroScreen）', () => {
    const wrapper = mount(App)

    expect(wrapper.text()).toContain('选择后果沙盘')
    expect(wrapper.text()).toContain('先试走几条路，再决定往哪走')
  })

  it('点击"开始体验"后显示 InsightBridge 内容', async () => {
    const wrapper = mount(App)

    await getButton(wrapper, '开始体验').trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain(stayOrGo.intro.userVoice)
    expect(wrapper.text()).toContain(stayOrGo.intro.systemInsight)
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
