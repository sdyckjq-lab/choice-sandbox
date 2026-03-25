import { describe, expect, it } from 'vitest'
import { stayOrGo } from '../stay-or-go'

describe('stayOrGo 场景数据', () => {
  const routeIds = stayOrGo.routes.map(route => route.id)
  const branchRoutes = stayOrGo.routes.filter(route => route.branch)

  it('有 id 和 title', () => {
    expect(stayOrGo.id).toBeTruthy()
    expect(stayOrGo.title).toBeTruthy()
  })

  it('intro 有 userVoice、systemInsight、keyFactors', () => {
    expect(stayOrGo.intro.userVoice).toBeTruthy()
    expect(stayOrGo.intro.systemInsight).toBeTruthy()
    expect(stayOrGo.intro.keyFactors.length).toBeGreaterThan(0)
  })

  it('恰好 4 条路线', () => {
    expect(stayOrGo.routes).toHaveLength(4)
  })

  it('每条路线有完整 timeline（start, threeMonths, sixMonths, oneYear）', () => {
    stayOrGo.routes.forEach((route) => {
      expect(route.timeline.start).toBeTruthy()
      expect(route.timeline.threeMonths).toBeTruthy()
      expect(route.timeline.sixMonths).toBeTruthy()
      expect(route.timeline.oneYear).toBeTruthy()
    })
  })

  it('每条路线有 regretMoment 和 futureReflection', () => {
    stayOrGo.routes.forEach((route) => {
      expect(route.regretMoment).toBeTruthy()
      expect(route.futureReflection).toBeTruthy()
    })
  })

  it('每条路线有至少 1 个 flipCondition', () => {
    stayOrGo.routes.forEach((route) => {
      expect(route.flipConditions.length).toBeGreaterThan(0)
    })
  })

  it('恰好 1 条路线有 branch', () => {
    expect(branchRoutes).toHaveLength(1)
  })

  it('有 branch 的路线有 optionA 和 optionB，各有 label、feeling、consequences', () => {
    const branch = branchRoutes[0]?.branch

    expect(branch?.optionA.label).toBeTruthy()
    expect(branch?.optionA.feeling).toBeTruthy()
    expect(branch?.optionA.consequences.length).toBeGreaterThan(0)
    expect(branch?.optionB.label).toBeTruthy()
    expect(branch?.optionB.feeling).toBeTruthy()
    expect(branch?.optionB.consequences.length).toBeGreaterThan(0)
  })

  it('defaultSelectedRouteIds 长度为 2 且指向存在的路线', () => {
    expect(stayOrGo.defaultSelectedRouteIds).toHaveLength(2)
    expect(stayOrGo.defaultSelectedRouteIds.every(routeId => routeIds.includes(routeId))).toBe(true)
  })

  it('comparison.dimensions 每个维度的 scores 覆盖所有 4 条路线 ID', () => {
    stayOrGo.comparison.dimensions.forEach((dimension) => {
      expect(Object.keys(dimension.scores).sort()).toEqual([...routeIds].sort())
    })
  })

  it('conditionChange.impacts 覆盖所有 4 条路线 ID', () => {
    const impactRouteIds = stayOrGo.conditionChange.impacts.map(impact => impact.routeId).sort()

    expect(impactRouteIds).toEqual([...routeIds].sort())
  })

  it('closing 有 insight 和 nextStep', () => {
    expect(stayOrGo.closing.insight).toBeTruthy()
    expect(stayOrGo.closing.nextStep).toBeTruthy()
  })
})
