# 任务：改造 useScenario 支持动态数据源

## 背景
当前 `useScenario(scenario: Scenario)` 接收一个静态对象。为了支持 AI 生成的场景动态替换数据源，需要将参数改为响应式引用。

## 要改的文件
- `src/composables/useScenario.ts` — 参数改为 `MaybeRef<Scenario>`
- `src/composables/__tests__/useScenario.spec.ts` — 如果有，适配新参数（如果没有测试文件则跳过）

## 参考文件（请先阅读）
- `src/composables/useScenario.ts` — 当前实现
- `src/App.vue` — 看它如何使用 useScenario 的返回值

## 具体要求

### 1. 改造 useScenario.ts

**当前签名：**
```ts
export function useScenario(scenario: Scenario)
```

**改为：**
```ts
import { type MaybeRef, toValue } from 'vue'

export function useScenario(scenarioRef: MaybeRef<Scenario>)
```

`MaybeRef<T>` 是 Vue 3.3+ 内置类型，表示"可以是 `T` 也可以是 `Ref<T>`"。`toValue()` 自动解包。

**内部改动：** 所有 `scenario.xxx` 改为 `toValue(scenarioRef).xxx`：

```ts
export function useScenario(scenarioRef: MaybeRef<Scenario>) {
  function getSelectedRoutes(ids: [string, string]): [Route, Route] | null {
    const scenario = toValue(scenarioRef)
    const route1 = scenario.routes.find(r => r.id === ids[0])
    const route2 = scenario.routes.find(r => r.id === ids[1])
    if (!route1 || !route2) return null
    return [route1, route2]
  }

  function getFilteredDimensions(ids: [string, string]): ComparisonDimension[] {
    const scenario = toValue(scenarioRef)
    return scenario.comparison.dimensions.map(dim => ({
      label: dim.label,
      scores: {
        [ids[0]]: dim.scores[ids[0]] ?? '',
        [ids[1]]: dim.scores[ids[1]] ?? '',
      },
    }))
  }

  function hasBranch(ids: [string, string]): boolean {
    return toValue(scenarioRef).routes.some(r => ids.includes(r.id) && r.branch)
  }

  function getBranchRoute(ids: [string, string]): Route | null {
    return toValue(scenarioRef).routes.find(r => ids.includes(r.id) && r.branch) ?? null
  }

  return {
    scenario: scenarioRef,  // 注意：这里返回的是 MaybeRef，App.vue 模板中需要用 toValue 或直接解包
    getSelectedRoutes,
    getFilteredDimensions,
    hasBranch,
    getBranchRoute,
  }
}
```

**重要细节：** 返回的 `scenario` 字段现在是 `MaybeRef<Scenario>` 而不是 `Scenario`。App.vue 模板中访问 `scenario.intro` 等需要改为 `toValue(scenario).intro`。但因为 Vue 模板会自动解包 Ref，如果传入的是 `Ref<Scenario>` 或 `ComputedRef<Scenario>`，模板中 `scenario.intro` 仍然有效（Vue 自动 unwrap）。

为了让 App.vue 模板兼容性更好，可以额外返回一个 computed：

```ts
const scenarioValue = computed(() => toValue(scenarioRef))

return {
  scenario: scenarioValue,  // ComputedRef<Scenario>，模板自动解包
  ...
}
```

这样 App.vue 模板中 `scenario.intro` 无需任何改动。**推荐用这种方式。**

### 2. 验证

改完后运行 `pnpm test`，确保现有测试全绿。如果有 useScenario 的专属测试文件，适配参数改为 `ref(stayOrGo)` 或直接传 `stayOrGo`（`MaybeRef` 两种都接受）。

## 注意事项
- 不要改 `src/types/scenario.ts`
- 不要改 `src/App.vue`（App.vue 的改动由 Antigravity 负责）
- 不要改其他组件
- 代码注释用中文
- 改动尽量小，只改必要的部分
