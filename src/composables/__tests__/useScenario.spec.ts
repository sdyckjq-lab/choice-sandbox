import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { stayOrGo } from '../../data/scenarios/stay-or-go'
import { useScenario } from '../useScenario'

describe('useScenario', () => {
  const scenarioApi = useScenario(stayOrGo)

  it('返回原始 scenario 对象', () => {
    expect(scenarioApi.scenario.value).toBe(stayOrGo)
  })

  it('支持传入 ref，并在场景切换后读取最新数据', () => {
    const scenarioRef = ref(stayOrGo)
    const scenarioApi = useScenario(scenarioRef)

    expect(scenarioApi.scenario.value).toBe(scenarioRef.value)
    expect(scenarioApi.hasBranch(['B', 'C'])).toBe(true)

    scenarioRef.value = {
      ...stayOrGo,
      routes: stayOrGo.routes.map(route =>
        route.id === 'C'
          ? {
              ...route,
              branch: undefined,
            }
          : route,
      ),
    }

    expect(scenarioApi.scenario.value).toBe(scenarioRef.value)
    expect(scenarioApi.hasBranch(['B', 'C'])).toBe(false)
  })

  it("getSelectedRoutes(['B','C']) 返回对应的两条路线", () => {
    const selectedRoutes = scenarioApi.getSelectedRoutes(['B', 'C'])

    expect(selectedRoutes?.map(route => route.id)).toEqual(['B', 'C'])
  })

  it('getSelectedRoutes() 传入不存在的 ID 返回 null', () => {
    expect(scenarioApi.getSelectedRoutes(['B', 'Z'])).toBeNull()
  })

  it("getFilteredDimensions(['B','C']) 只包含 B 和 C 的 scores", () => {
    const filteredDimensions = scenarioApi.getFilteredDimensions(['B', 'C'])

    expect(filteredDimensions).toHaveLength(stayOrGo.comparison.dimensions.length)
    expect(
      filteredDimensions.every((dimension) => Object.keys(dimension.scores).sort().join(',') === 'B,C'),
    ).toBe(true)
    expect(filteredDimensions[0]?.scores.B).toBe(stayOrGo.comparison.dimensions[0]?.scores.B)
    expect(filteredDimensions[0]?.scores.C).toBe(stayOrGo.comparison.dimensions[0]?.scores.C)
  })

  it("hasBranch(['B','C']) 返回 true（C 有 branch）", () => {
    expect(scenarioApi.hasBranch(['B', 'C'])).toBe(true)
  })

  it("hasBranch(['A','B']) 返回 false（A 和 B 都没有 branch）", () => {
    expect(scenarioApi.hasBranch(['A', 'B'])).toBe(false)
  })

  it("getBranchRoute(['B','C']) 返回路线 C", () => {
    expect(scenarioApi.getBranchRoute(['B', 'C'])?.id).toBe('C')
  })

  it("getBranchRoute(['A','B']) 返回 null", () => {
    expect(scenarioApi.getBranchRoute(['A', 'B'])).toBeNull()
  })
})
