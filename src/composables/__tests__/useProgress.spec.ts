import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { STEPS, useProgress } from '../useProgress'

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

describe('useProgress', () => {
  beforeEach(() => {
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

  it('初始状态：currentStep=0, selectedRouteIds=null, branchChoice=null, viewedRoutes=[]', () => {
    const progress = useProgress()

    expect(progress.currentStep.value).toBe(STEPS.INTRO)
    expect(progress.selectedRouteIds.value).toBeNull()
    expect(progress.branchChoice.value).toBeNull()
    expect(progress.viewedRoutes.value).toEqual([])
  })

  it('初始化时从 localStorage 恢复状态', () => {
    window.localStorage.setItem('choice-sandbox-progress', JSON.stringify({
      version: 1,
      state: {
        currentStep: STEPS.COMPARE,
        selectedRouteIds: ['B', 'C'],
        branchChoice: 'A',
        viewedRoutes: ['B', 'C'],
      },
    }))

    const progress = useProgress()

    expect(progress.currentStep.value).toBe(STEPS.COMPARE)
    expect(progress.selectedRouteIds.value).toEqual(['B', 'C'])
    expect(progress.branchChoice.value).toBe('A')
    expect(progress.viewedRoutes.value).toEqual(['B', 'C'])
  })

  it('状态变化后 localStorage 被更新', async () => {
    const progress = useProgress()

    progress.nextStep()
    progress.selectRoutes(['B', 'C'])
    progress.chooseBranch('B')
    progress.markRouteViewed('C')
    await nextTick()

    expect(JSON.parse(window.localStorage.getItem('choice-sandbox-progress')!)).toEqual({
      version: 1,
      state: {
        currentStep: STEPS.INSIGHT_BRIDGE,
        selectedRouteIds: ['B', 'C'],
        branchChoice: 'B',
        viewedRoutes: ['C'],
      },
    })
  })

  it('版本号不匹配时清除旧数据并使用默认值', () => {
    window.localStorage.setItem('choice-sandbox-progress', JSON.stringify({
      version: 999,
      state: {
        currentStep: STEPS.RESULT,
        selectedRouteIds: ['A', 'B'],
        branchChoice: 'A',
        viewedRoutes: ['A'],
      },
    }))

    const progress = useProgress()

    expect(progress.currentStep.value).toBe(STEPS.INTRO)
    expect(progress.selectedRouteIds.value).toBeNull()
    expect(progress.branchChoice.value).toBeNull()
    expect(progress.viewedRoutes.value).toEqual([])
    expect(window.localStorage.getItem('choice-sandbox-progress')).toBeNull()
  })

  it('localStorage 数据损坏时使用默认值', () => {
    window.localStorage.setItem('choice-sandbox-progress', '{broken-json')

    const progress = useProgress()

    expect(progress.currentStep.value).toBe(STEPS.INTRO)
    expect(progress.selectedRouteIds.value).toBeNull()
    expect(progress.branchChoice.value).toBeNull()
    expect(progress.viewedRoutes.value).toEqual([])
    expect(window.localStorage.getItem('choice-sandbox-progress')).toBeNull()
  })

  it('nextStep() 递增 currentStep', () => {
    const progress = useProgress()

    progress.nextStep()

    expect(progress.currentStep.value).toBe(STEPS.INSIGHT_BRIDGE)
  })

  it('nextStep() 不超过最大步数 STEPS.RESULT (7)', () => {
    const progress = useProgress()

    for (let index = 0; index < 20; index += 1) {
      progress.nextStep()
    }

    expect(progress.currentStep.value).toBe(STEPS.RESULT)
  })

  it('goToStep() 跳到指定步骤', () => {
    const progress = useProgress()

    progress.goToStep(STEPS.COMPARE)

    expect(progress.currentStep.value).toBe(STEPS.COMPARE)
  })

  it('goToStep() 忽略超出范围的值（负数、大于 7）', () => {
    const progress = useProgress()

    progress.goToStep(STEPS.ROUTE_DETAIL_1)
    progress.goToStep(-1)
    expect(progress.currentStep.value).toBe(STEPS.ROUTE_DETAIL_1)

    progress.goToStep(STEPS.RESULT + 1)
    expect(progress.currentStep.value).toBe(STEPS.ROUTE_DETAIL_1)
  })

  it("selectRoutes(['B','C']) 更新 selectedRouteIds", () => {
    const progress = useProgress()

    progress.selectRoutes(['B', 'C'])

    expect(progress.selectedRouteIds.value).toEqual(['B', 'C'])
  })

  it("selectRoutes() 拒绝重复 ID（如 ['A','A']）", () => {
    const progress = useProgress()

    progress.selectRoutes(['A', 'A'])

    expect(progress.selectedRouteIds.value).toBeNull()
  })

  it("chooseBranch('A') 更新 branchChoice", () => {
    const progress = useProgress()

    progress.chooseBranch('A')

    expect(progress.branchChoice.value).toBe('A')
  })

  it("chooseBranch('B') 更新 branchChoice", () => {
    const progress = useProgress()

    progress.chooseBranch('B')

    expect(progress.branchChoice.value).toBe('B')
  })

  it('markRouteViewed() 添加到 viewedRoutes', () => {
    const progress = useProgress()

    progress.markRouteViewed('C')

    expect(progress.viewedRoutes.value).toEqual(['C'])
  })

  it('markRouteViewed() 不重复添加同一个 ID', () => {
    const progress = useProgress()

    progress.markRouteViewed('C')
    progress.markRouteViewed('C')

    expect(progress.viewedRoutes.value).toEqual(['C'])
  })

  it('reset() 恢复所有状态到初始值并清除 localStorage', async () => {
    const progress = useProgress()

    progress.nextStep()
    progress.selectRoutes(['B', 'C'])
    progress.chooseBranch('A')
    progress.markRouteViewed('B')
    await nextTick()

    progress.reset()
    await nextTick()

    expect(progress.currentStep.value).toBe(STEPS.INTRO)
    expect(progress.selectedRouteIds.value).toBeNull()
    expect(progress.branchChoice.value).toBeNull()
    expect(progress.viewedRoutes.value).toEqual([])
    expect(window.localStorage.getItem('choice-sandbox-progress')).toBeNull()
  })
})
