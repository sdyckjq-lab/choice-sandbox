import type { Scenario, Route, ComparisonDimension } from '../types/scenario'

// 场景数据管理
export function useScenario(scenario: Scenario) {
  // 根据选中的路线 ID 获取路线详情
  function getSelectedRoutes(ids: [string, string]): [Route, Route] | null {
    const route1 = scenario.routes.find(r => r.id === ids[0])
    const route2 = scenario.routes.find(r => r.id === ids[1])
    if (!route1 || !route2) return null
    return [route1, route2]
  }

  // 根据选中的路线 ID 过滤对比维度
  function getFilteredDimensions(ids: [string, string]): ComparisonDimension[] {
    return scenario.comparison.dimensions.map(dim => ({
      label: dim.label,
      scores: {
        [ids[0]]: dim.scores[ids[0]] ?? '',
        [ids[1]]: dim.scores[ids[1]] ?? '',
      },
    }))
  }

  // 检查选中的路线是否有分叉
  function hasBranch(ids: [string, string]): boolean {
    return scenario.routes.some(r => ids.includes(r.id) && r.branch)
  }

  // 获取有分叉的路线
  function getBranchRoute(ids: [string, string]): Route | null {
    return scenario.routes.find(r => ids.includes(r.id) && r.branch) ?? null
  }

  return {
    scenario,
    getSelectedRoutes,
    getFilteredDimensions,
    hasBranch,
    getBranchRoute,
  }
}
