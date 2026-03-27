import { describe, expect, it } from 'vitest'
import { stayOrGo } from '../../data/scenarios/stay-or-go'
import type { Scenario } from '../../types/scenario'
import { validateScenario } from '../validateScenario'

function createValidScenario(): Scenario {
  return structuredClone(stayOrGo)
}

function expectErrorContaining(
  result: ReturnType<typeof validateScenario>,
  message: string,
) {
  expect(result.valid).toBe(false)

  if (result.valid) {
    throw new Error('预期校验失败，但实际通过了')
  }

  expect(result.errors).toEqual(expect.arrayContaining([expect.stringContaining(message)]))
}

describe('validateScenario', () => {
  it('完整合法的 Scenario 返回 valid=true 和原始场景数据', () => {
    const result = validateScenario(createValidScenario())

    expect(result).toEqual({
      valid: true,
      scenario: stayOrGo,
    })
  })

  it('传入 null 返回对象错误', () => {
    expect(validateScenario(null)).toEqual({
      valid: false,
      errors: ['输入不是一个对象'],
    })
  })

  it('传入 undefined 返回对象错误', () => {
    expect(validateScenario(undefined)).toEqual({
      valid: false,
      errors: ['输入不是一个对象'],
    })
  })

  it('传入数字返回对象错误', () => {
    expect(validateScenario(42)).toEqual({
      valid: false,
      errors: ['输入不是一个对象'],
    })
  })

  it('缺少 id 时返回相关错误', () => {
    const scenario = createValidScenario() as unknown as Record<string, unknown>
    delete scenario.id

    expectErrorContaining(validateScenario(scenario), '缺少 id')
  })

  it('缺少 routes 时返回相关错误', () => {
    const scenario = createValidScenario() as unknown as Record<string, unknown>
    delete scenario.routes

    expectErrorContaining(validateScenario(scenario), '缺少 routes')
  })

  it('routes 长度不是 4 时返回相关错误', () => {
    const scenario = createValidScenario()
    scenario.routes.pop()

    expectErrorContaining(validateScenario(scenario), 'routes 长度必须为 4')
  })

  it('routes id 不覆盖 A/B/C/D 时返回相关错误', () => {
    const scenario = createValidScenario()
    scenario.routes[3].id = 'E'

    expectErrorContaining(validateScenario(scenario), 'routes 的 id 必须覆盖 A、B、C、D')
  })

  it('多于 1 条路线有 branch 时返回相关错误', () => {
    const scenario = createValidScenario()
    scenario.routes[0].branch = structuredClone(scenario.routes[2].branch)

    expectErrorContaining(validateScenario(scenario), '最多只能有 1 条路线有 branch')
  })

  it('comparison.dimensions[0].scores 缺少 routeId 时返回相关错误', () => {
    const scenario = createValidScenario()
    delete scenario.comparison.dimensions[0].scores.D

    expectErrorContaining(validateScenario(scenario), 'comparison.dimensions[0].scores 必须覆盖 A、B、C、D')
  })

  it('conditionChange.impacts 长度不是 4 时返回相关错误', () => {
    const scenario = createValidScenario()
    scenario.conditionChange.impacts.pop()

    expectErrorContaining(validateScenario(scenario), 'conditionChange.impacts 长度必须为 4')
  })

  it('conditionChange.impacts 的 routeId 不覆盖 A/B/C/D 时返回相关错误', () => {
    const scenario = createValidScenario()
    scenario.conditionChange.impacts[3].routeId = 'E'

    expectErrorContaining(validateScenario(scenario), 'conditionChange.impacts 的 routeId 必须覆盖 A、B、C、D')
  })

  it('intro.keyFactors 长度不是 3 时返回相关错误', () => {
    const scenario = createValidScenario()
    scenario.intro.keyFactors.pop()

    expectErrorContaining(validateScenario(scenario), 'intro.keyFactors 长度必须为 3')
  })

  it('routes[0].flipConditions 长度不是 3 时返回相关错误', () => {
    const scenario = createValidScenario()
    scenario.routes[0].flipConditions.pop()

    expectErrorContaining(validateScenario(scenario), 'routes[0].flipConditions 长度必须为 3')
  })

  it('defaultSelectedRouteIds 包含非法 ID 时返回相关错误', () => {
    const scenario = createValidScenario()
    scenario.defaultSelectedRouteIds = ['A', 'Z']

    expectErrorContaining(validateScenario(scenario), 'defaultSelectedRouteIds[1] 必须是 A、B、C、D 之一')
  })
})
