import type { Scenario } from '../types/scenario'

const ROUTE_IDS = ['A', 'B', 'C', 'D'] as const
type RouteId = (typeof ROUTE_IDS)[number]

export type ValidateResult =
  | { valid: true; scenario: Scenario }
  | { valid: false; errors: string[] }

type UnknownRecord = Record<string, unknown>
type RequiredValueResult =
  | { exists: true; value: unknown }
  | { exists: false }

function isPlainObject(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isRouteId(value: unknown): value is RouteId {
  return isNonEmptyString(value) && ROUTE_IDS.includes(value as RouteId)
}

function hasOwn(record: UnknownRecord, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key)
}

function getPath(containerPath: string, fieldLabel: string): string {
  return containerPath ? `${containerPath}.${fieldLabel}` : fieldLabel
}

function getMissingMessage(containerPath: string, fieldLabel: string): string {
  return containerPath ? `${containerPath} 缺少 ${fieldLabel}` : `缺少 ${fieldLabel}`
}

function readRequiredValue(
  record: UnknownRecord,
  key: string,
  containerPath: string,
  errors: string[],
  fieldLabel = key,
): RequiredValueResult {
  if (!hasOwn(record, key)) {
    errors.push(getMissingMessage(containerPath, fieldLabel))
    return { exists: false }
  }

  return {
    exists: true,
    value: record[key],
  }
}

function validateRequiredString(
  record: UnknownRecord,
  key: string,
  containerPath: string,
  errors: string[],
  fieldLabel = key,
): string | undefined {
  const result = readRequiredValue(record, key, containerPath, errors, fieldLabel)

  if (!result.exists) {
    return undefined
  }

  if (!isNonEmptyString(result.value)) {
    errors.push(`${getPath(containerPath, fieldLabel)} 必须是非空字符串`)
    return undefined
  }

  return result.value
}

function validateRequiredObject(
  record: UnknownRecord,
  key: string,
  containerPath: string,
  errors: string[],
  fieldLabel = key,
): UnknownRecord | undefined {
  const result = readRequiredValue(record, key, containerPath, errors, fieldLabel)

  if (!result.exists) {
    return undefined
  }

  if (!isPlainObject(result.value)) {
    errors.push(`${getPath(containerPath, fieldLabel)} 必须是对象`)
    return undefined
  }

  return result.value
}

function validateRequiredArray(
  record: UnknownRecord,
  key: string,
  containerPath: string,
  errors: string[],
  fieldLabel = key,
): unknown[] | undefined {
  const result = readRequiredValue(record, key, containerPath, errors, fieldLabel)

  if (!result.exists) {
    return undefined
  }

  if (!Array.isArray(result.value)) {
    errors.push(`${getPath(containerPath, fieldLabel)} 必须是数组`)
    return undefined
  }

  return result.value
}

function validateStringArray(
  value: unknown,
  path: string,
  errors: string[],
  exactLength?: number,
) {
  if (!Array.isArray(value)) {
    errors.push(`${path} 必须是数组`)
    return
  }

  if (exactLength !== undefined && value.length !== exactLength) {
    errors.push(`${path} 长度必须为 ${exactLength}`)
  }

  value.forEach((item, index) => {
    if (!isNonEmptyString(item)) {
      errors.push(`${path}[${index}] 必须是非空字符串`)
    }
  })
}

function hasExactRouteCoverage(ids: string[]): boolean {
  return ids.length === ROUTE_IDS.length
    && ROUTE_IDS.every(routeId => ids.includes(routeId))
    && new Set(ids).size === ROUTE_IDS.length
}

function validateBranchOption(option: UnknownRecord, path: string, errors: string[]) {
  validateRequiredString(option, 'label', path, errors)
  validateRequiredString(option, 'feeling', path, errors)

  const consequences = validateRequiredArray(option, 'consequences', path, errors)

  if (consequences) {
    validateStringArray(consequences, `${path}.consequences`, errors, 4)
  }
}

function validateBranch(branch: UnknownRecord, path: string, errors: string[]) {
  validateRequiredString(branch, 'question', path, errors)

  const optionA = validateRequiredObject(branch, 'optionA', path, errors)
  if (optionA) {
    validateBranchOption(optionA, `${path}.optionA`, errors)
  }

  const optionB = validateRequiredObject(branch, 'optionB', path, errors)
  if (optionB) {
    validateBranchOption(optionB, `${path}.optionB`, errors)
  }

  validateRequiredString(branch, 'insight', path, errors)
}

function validateRoute(route: unknown, index: number, errors: string[]): string | undefined {
  const routePath = `routes[${index}]`

  if (!isPlainObject(route)) {
    errors.push(`${routePath} 必须是对象`)
    return undefined
  }

  const routeId = validateRequiredString(route, 'id', routePath, errors)
  validateRequiredString(route, 'name', routePath, errors)
  validateRequiredString(route, 'oneLiner', routePath, errors)

  const timeline = validateRequiredObject(route, 'timeline', routePath, errors)
  if (timeline) {
    validateRequiredString(timeline, 'start', routePath, errors, 'timeline.start')
    validateRequiredString(timeline, 'threeMonths', routePath, errors, 'timeline.threeMonths')
    validateRequiredString(timeline, 'sixMonths', routePath, errors, 'timeline.sixMonths')
    validateRequiredString(timeline, 'oneYear', routePath, errors, 'timeline.oneYear')
  }

  validateRequiredString(route, 'regretMoment', routePath, errors)
  validateRequiredString(route, 'futureReflection', routePath, errors)

  const flipConditions = validateRequiredArray(route, 'flipConditions', routePath, errors)
  if (flipConditions) {
    validateStringArray(flipConditions, `${routePath}.flipConditions`, errors, 3)
  }

  if (hasOwn(route, 'branch') && route.branch !== undefined) {
    if (!isPlainObject(route.branch)) {
      errors.push(`${routePath}.branch 必须是对象`)
    }
    else {
      validateBranch(route.branch, `${routePath}.branch`, errors)
    }
  }

  return routeId
}

function validateComparison(root: UnknownRecord, errors: string[]) {
  const comparison = validateRequiredObject(root, 'comparison', '', errors)
  if (!comparison) {
    return
  }

  const dimensions = validateRequiredArray(comparison, 'dimensions', 'comparison', errors)
  if (dimensions) {
    if (dimensions.length < 3 || dimensions.length > 4) {
      errors.push('comparison.dimensions 长度必须为 3 到 4')
    }

    dimensions.forEach((dimension, index) => {
      const dimensionPath = `comparison.dimensions[${index}]`

      if (!isPlainObject(dimension)) {
        errors.push(`${dimensionPath} 必须是对象`)
        return
      }

      validateRequiredString(dimension, 'label', dimensionPath, errors)

      const scores = validateRequiredObject(dimension, 'scores', dimensionPath, errors)
      if (!scores) {
        return
      }

      if (!hasExactRouteCoverage(Object.keys(scores))) {
        errors.push(`${dimensionPath}.scores 必须覆盖 A、B、C、D`)
      }

      ROUTE_IDS.forEach((routeId) => {
        if (!hasOwn(scores, routeId)) {
          errors.push(`${dimensionPath}.scores 缺少 ${routeId}`)
          return
        }

        if (!isNonEmptyString(scores[routeId])) {
          errors.push(`${dimensionPath}.scores.${routeId} 必须是非空字符串`)
        }
      })
    })
  }

  validateRequiredString(comparison, 'keyContrast', 'comparison', errors)
}

function validateConditionChange(root: UnknownRecord, errors: string[]) {
  const conditionChange = validateRequiredObject(root, 'conditionChange', '', errors)
  if (!conditionChange) {
    return
  }

  validateRequiredString(conditionChange, 'question', 'conditionChange', errors)

  const impacts = validateRequiredArray(conditionChange, 'impacts', 'conditionChange', errors)
  if (impacts) {
    if (impacts.length !== 4) {
      errors.push('conditionChange.impacts 长度必须为 4')
    }

    const impactRouteIds: string[] = []

    impacts.forEach((impact, index) => {
      const impactPath = `conditionChange.impacts[${index}]`

      if (!isPlainObject(impact)) {
        errors.push(`${impactPath} 必须是对象`)
        return
      }

      const routeId = validateRequiredString(impact, 'routeId', impactPath, errors)
      if (routeId) {
        impactRouteIds.push(routeId)
      }

      validateRequiredString(impact, 'change', impactPath, errors)
    })

    if (!hasExactRouteCoverage(impactRouteIds)) {
      errors.push('conditionChange.impacts 的 routeId 必须覆盖 A、B、C、D')
    }
  }

  validateRequiredString(conditionChange, 'reminder', 'conditionChange', errors)
}

function validateDefaultSelectedRouteIds(root: UnknownRecord, errors: string[]) {
  const selectedRouteIds = validateRequiredArray(root, 'defaultSelectedRouteIds', '', errors)
  if (!selectedRouteIds) {
    return
  }

  if (selectedRouteIds.length !== 2) {
    errors.push('defaultSelectedRouteIds 长度必须为 2')
  }

  selectedRouteIds.forEach((routeId, index) => {
    if (!isNonEmptyString(routeId)) {
      errors.push(`defaultSelectedRouteIds[${index}] 必须是非空字符串`)
      return
    }

    if (!isRouteId(routeId)) {
      errors.push(`defaultSelectedRouteIds[${index}] 必须是 A、B、C、D 之一`)
    }
  })

  if (
    selectedRouteIds.length === 2
    && isNonEmptyString(selectedRouteIds[0])
    && selectedRouteIds[0] === selectedRouteIds[1]
  ) {
    errors.push('defaultSelectedRouteIds 不能重复')
  }
}

export function validateScenario(data: unknown): ValidateResult {
  if (!isPlainObject(data)) {
    return {
      valid: false,
      errors: ['输入不是一个对象'],
    }
  }

  const errors: string[] = []

  validateRequiredString(data, 'id', '', errors)
  validateRequiredString(data, 'title', '', errors)

  const intro = validateRequiredObject(data, 'intro', '', errors)
  if (intro) {
    validateRequiredString(intro, 'userVoice', 'intro', errors)
    validateRequiredString(intro, 'systemInsight', 'intro', errors)

    const keyFactors = validateRequiredArray(intro, 'keyFactors', 'intro', errors)
    if (keyFactors) {
      validateStringArray(keyFactors, 'intro.keyFactors', errors, 3)
    }
  }

  const routes = validateRequiredArray(data, 'routes', '', errors)
  if (routes) {
    if (routes.length !== 4) {
      errors.push('routes 长度必须为 4')
    }

    const routeIds: string[] = []
    let branchCount = 0

    routes.forEach((route, index) => {
      const routeId = validateRoute(route, index, errors)

      if (routeId) {
        routeIds.push(routeId)
      }

      if (isPlainObject(route) && hasOwn(route, 'branch') && route.branch !== undefined) {
        branchCount += 1
      }
    })

    if (!hasExactRouteCoverage(routeIds)) {
      errors.push('routes 的 id 必须覆盖 A、B、C、D')
    }

    if (branchCount > 1) {
      errors.push(`最多只能有 1 条路线有 branch，但发现了 ${branchCount} 条`)
    }
  }

  validateDefaultSelectedRouteIds(data, errors)
  validateComparison(data, errors)
  validateConditionChange(data, errors)

  const closing = validateRequiredObject(data, 'closing', '', errors)
  if (closing) {
    validateRequiredString(closing, 'insight', 'closing', errors)
    validateRequiredString(closing, 'nextStep', 'closing', errors)
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
    }
  }

  return {
    valid: true,
    scenario: data as unknown as Scenario,
  }
}
