# 阶段 3.5：单元测试（Codex）

生成时间：2026-03-25
状态：待执行
负责工具：Codex

---

## 你的任务

为"选择后果沙盘"项目编写 4 个单元测试文件。项目用 Vue 3 + TypeScript，测试框架已配置好（Vitest + @vue/test-utils + happy-dom）。

## 验收标准

`pnpm test` 全部通过，零失败。

---

## 项目现状

项目是一个纯前端 Vue 3 单页应用，已经有完整的组件和数据。你只需要写测试。

测试命令：`pnpm test`（已配置，等于 `vitest run`）

测试配置文件 `vitest.config.ts` 已存在：

```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
  },
})
```

---

## 你需要了解的已有代码

### src/composables/useProgress.ts

```typescript
export const STEPS = {
  INTRO: 0,
  INSIGHT_BRIDGE: 1,
  ROUTES_OVERVIEW: 2,
  ROUTE_DETAIL_1: 3,
  ROUTE_DETAIL_2: 4,
  BRANCH_CHOICE: 5,
  COMPARE: 6,
  RESULT: 7,
} as const

export function useProgress() {
  // 返回：
  // - currentStep: ComputedRef<number>          初始值 0
  // - selectedRouteIds: ComputedRef<[string, string] | null>  初始值 null
  // - branchChoice: ComputedRef<'A' | 'B' | null>             初始值 null
  // - viewedRoutes: ComputedRef<string[]>                     初始值 []
  // - nextStep(): void           currentStep++，不超过 STEPS.RESULT (7)
  // - goToStep(step): void       跳到指定步骤，范围 0-7
  // - selectRoutes(ids): void    设置选中的 2 条路线，重复 ID 会被忽略
  // - chooseBranch(choice): void 设置分叉选择 'A' | 'B'
  // - markRouteViewed(id): void  标记路线已查看，不重复添加
  // - reset(): void              重置所有状态到初始值
}
```

### src/composables/useScenario.ts

```typescript
export function useScenario(scenario: Scenario) {
  // 返回：
  // - scenario: Scenario                        原始数据
  // - getSelectedRoutes(ids): [Route, Route] | null   根据 ID 获取两条路线，找不到返回 null
  // - getFilteredDimensions(ids): ComparisonDimension[]  过滤对比维度，只保留选中路线的 scores
  // - hasBranch(ids): boolean                   选中的路线里是否有分叉
  // - getBranchRoute(ids): Route | null         获取有分叉的那条路线
}
```

### src/data/scenarios/stay-or-go.ts

```typescript
export const stayOrGo: Scenario
// 场景数据要点：
// - 4 条路线，ID 分别是 'A', 'B', 'C', 'D'
// - defaultSelectedRouteIds: ['B', 'C']
// - 只有路线 C 有 branch（关键小分叉）
// - comparison.dimensions 有 4 个维度，每个维度的 scores 覆盖 A/B/C/D
// - conditionChange.impacts 覆盖 A/B/C/D 四条路线
```

### src/types/scenario.ts

```typescript
export interface Scenario {
  id: string
  title: string
  intro: { userVoice: string; systemInsight: string; keyFactors: string[] }
  routes: Route[]
  defaultSelectedRouteIds: [string, string]
  comparison: { dimensions: ComparisonDimension[]; keyContrast: string }
  conditionChange: { question: string; impacts: ConditionImpact[]; reminder: string }
  closing: { insight: string; nextStep: string }
}

export interface Route {
  id: string; name: string; oneLiner: string
  timeline: { start: string; threeMonths: string; sixMonths: string; oneYear: string }
  regretMoment: string; flipConditions: string[]; futureReflection: string
  branch?: Branch
}

export interface Branch {
  question: string; optionA: BranchOption; optionB: BranchOption; insight: string
}

export interface BranchOption { label: string; feeling: string; consequences: string[] }

export interface ComparisonDimension { label: string; scores: Record<string, string> }

export interface ConditionImpact { routeId: string; change: string }
```

### App.vue 流程逻辑（App.spec.ts 需要知道）

- 初始渲染 IntroScreen
- 点击"开始体验"→ InsightBridge
- 点击"看看你的几条路"→ RoutesOverview（渲染 4 条路线）
- 选 2 条路线点"继续"→ RouteDetail（第一条）
- 点"看下一条路"→ RouteDetail（第二条）
- 如果选的路线有 branch → BranchChoice；否则跳过
- BranchChoice 选择后点"继续对比"→ CompareView
- CompareView 滚动到底点"生成我的结果卡"→ ResultCard
- ResultCard 点"尝试其他路线"→ 重置回 IntroScreen

分叉跳过逻辑在 App.vue 里用 watch 实现：currentStep 变为 BRANCH_CHOICE 时，如果 hasBranch 为 false，自动 nextStep()。

---

## 你需要创建的 4 个测试文件

### 1. src/composables/__tests__/useProgress.spec.ts

测试用例：

```
describe('useProgress')
  ✓ 初始状态：currentStep=0, selectedRouteIds=null, branchChoice=null, viewedRoutes=[]
  ✓ nextStep() 递增 currentStep
  ✓ nextStep() 不超过最大步数 STEPS.RESULT (7)
  ✓ goToStep() 跳到指定步骤
  ✓ goToStep() 忽略超出范围的值（负数、大于 7）
  ✓ selectRoutes(['B','C']) 更新 selectedRouteIds
  ✓ selectRoutes() 拒绝重复 ID（如 ['A','A']）
  ✓ chooseBranch('A') 更新 branchChoice
  ✓ chooseBranch('B') 更新 branchChoice
  ✓ markRouteViewed() 添加到 viewedRoutes
  ✓ markRouteViewed() 不重复添加同一个 ID
  ✓ reset() 恢复所有状态到初始值
```

### 2. src/composables/__tests__/useScenario.spec.ts

测试用例：

```
describe('useScenario')
  ✓ 返回原始 scenario 对象
  ✓ getSelectedRoutes(['B','C']) 返回对应的两条路线
  ✓ getSelectedRoutes() 传入不存在的 ID 返回 null
  ✓ getFilteredDimensions(['B','C']) 只包含 B 和 C 的 scores
  ✓ hasBranch(['B','C']) 返回 true（C 有 branch）
  ✓ hasBranch(['A','B']) 返回 false（A 和 B 都没有 branch）
  ✓ getBranchRoute(['B','C']) 返回路线 C
  ✓ getBranchRoute(['A','B']) 返回 null
```

用 stayOrGo 数据作为测试输入。

### 3. src/data/scenarios/__tests__/stay-or-go.spec.ts

测试用例（数据完整性校验）：

```
describe('stayOrGo 场景数据')
  ✓ 有 id 和 title
  ✓ intro 有 userVoice、systemInsight、keyFactors
  ✓ 恰好 4 条路线
  ✓ 每条路线有完整 timeline（start, threeMonths, sixMonths, oneYear）
  ✓ 每条路线有 regretMoment 和 futureReflection
  ✓ 每条路线有至少 1 个 flipCondition
  ✓ 恰好 1 条路线有 branch
  ✓ 有 branch 的路线有 optionA 和 optionB，各有 label、feeling、consequences
  ✓ defaultSelectedRouteIds 长度为 2 且指向存在的路线
  ✓ comparison.dimensions 每个维度的 scores 覆盖所有 4 条路线 ID
  ✓ conditionChange.impacts 覆盖所有 4 条路线 ID
  ✓ closing 有 insight 和 nextStep
```

### 4. src/__tests__/App.spec.ts

测试用例（组件集成测试）：

```
describe('App 完整流程')
  ✓ 初始渲染显示"选择后果沙盘"（IntroScreen）
  ✓ 点击"开始体验"后显示 InsightBridge 内容
  ✓ 点击"看看你的几条路"后显示 4 条路线
  ✓ 默认预选 B 和 C 两条路线
  ✓ 点击"继续"后显示第一条路线详情
  ✓ 点击"看下一条路"后显示第二条路线详情（带"和上一条路不同的是…"）
  ✓ 选了含 branch 的路线时显示 BranchChoice
  ✓ 选了不含 branch 的路线时跳过 BranchChoice 直接到 CompareView
  ✓ 最终到达 ResultCard，显示场景标题和收口金句
```

注意：App.spec.ts 里用 `mount(App)` 挂载整个应用。用 `await nextTick()` 等待状态更新。点击按钮用 `wrapper.find('button').trigger('click')`。ew 的路线选择用 `wrapper.findAll('[role="option"]')` 定位。分叉跳过逻辑是 watch 触发的，需要 `await nextTick()` 两次（一次触发 watch，一次执行 nextStep）。

---

## 注意事项

1. 不要修改任何已有文件，只创建 4 个 .spec.ts 文件
2. import 路径用相对路径
3. 测试描述用中文
4. `pnpm test` 必须全部通过
