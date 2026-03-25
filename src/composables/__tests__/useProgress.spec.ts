import { describe, expect, it } from 'vitest'
import { STEPS, useProgress } from '../useProgress'

describe('useProgress', () => {
  it('初始状态：currentStep=0, selectedRouteIds=null, branchChoice=null, viewedRoutes=[]', () => {
    const progress = useProgress()

    expect(progress.currentStep.value).toBe(STEPS.INTRO)
    expect(progress.selectedRouteIds.value).toBeNull()
    expect(progress.branchChoice.value).toBeNull()
    expect(progress.viewedRoutes.value).toEqual([])
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

  it('reset() 恢复所有状态到初始值', () => {
    const progress = useProgress()

    progress.nextStep()
    progress.selectRoutes(['B', 'C'])
    progress.chooseBranch('A')
    progress.markRouteViewed('B')

    progress.reset()

    expect(progress.currentStep.value).toBe(STEPS.INTRO)
    expect(progress.selectedRouteIds.value).toBeNull()
    expect(progress.branchChoice.value).toBeNull()
    expect(progress.viewedRoutes.value).toEqual([])
  })
})
