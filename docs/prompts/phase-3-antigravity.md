# 阶段 3：前端组件开发（Antigravity）

生成时间：2026-03-25
状态：待执行
负责工具：Antigravity

---

## 你的任务

在一个已有骨架的 Vue 3 + Tailwind CSS + TypeScript 项目里，开发所有页面组件和 UI 组件，实现从 IntroScreen 到 ResultCard 的 6 屏完整体验流程。

## 验收标准

1. 从 IntroScreen 点"开始体验"，一路点到 ResultCard，完整流程可以走通
2. `pnpm build` 零错误
3. 移动端（375px 宽）体验流畅，桌面端（≥768px）内容居中 max-width: 520px

---

## 项目现状

项目已经有骨架和数据，你只需要写组件。

技术栈：Vue 3 (Composition API) + Tailwind CSS 4 + Vite + TypeScript

### 已有文件（不要修改，直接 import 使用）

**src/types/scenario.ts** — 类型定义：

```typescript
export interface Scenario {
  id: string
  title: string
  intro: {
    userVoice: string
    systemInsight: string
    keyFactors: string[]
  }
  routes: Route[]
  defaultSelectedRouteIds: [string, string]
  comparison: {
    dimensions: ComparisonDimension[]
    keyContrast: string
  }
  conditionChange: {
    question: string
    impacts: ConditionImpact[]
    reminder: string
  }
  closing: {
    insight: string
    nextStep: string
  }
}

export interface Route {
  id: string
  name: string
  oneLiner: string
  timeline: {
    start: string
    threeMonths: string
    sixMonths: string
    oneYear: string
  }
  regretMoment: string
  flipConditions: string[]
  futureReflection: string
  branch?: Branch
}

export interface Branch {
  question: string
  optionA: BranchOption
  optionB: BranchOption
  insight: string
}

export interface BranchOption {
  label: string
  feeling: string
  consequences: string[]
}

export interface ComparisonDimension {
  label: string
  scores: Record<string, string>
}

export interface ConditionImpact {
  routeId: string
  change: string
}
```

**src/composables/useProgress.ts** — 进度状态管理：

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

// useProgress() 返回：
// - currentStep: ComputedRef<number>
// - selectedRouteIds: ComputedRef<[string, string] | null>
// - branchChoice: ComputedRef<'A' | 'B' | null>
// - viewedRoutes: ComputedRef<string[]>
// - nextStep(): void
// - goToStep(step: number): void
// - selectRoutes(ids: [string, string]): void  — 不允许重复 ID
// - chooseBranch(choice: 'A' | 'B'): void
// - markRouteViewed(routeId: string): void
// - reset(): void
```

**src/composables/useScenario.ts** — 场景数据管理：

```typescript
// useScenario(scenario) 返回：
// - scenario: Scenario
// - getSelectedRoutes(ids): [Route, Route] | null
// - getFilteredDimensions(ids): ComparisonDimension[]
// - hasBranch(ids): boolean
// - getBranchRoute(ids): Route | null
```

**src/data/scenarios/stay-or-go.ts** — 场景数据：

```typescript
import { stayOrGo } from './data/scenarios/stay-or-go'
// stayOrGo 是一个完整的 Scenario 对象
// 4 条路线 ID: 'A', 'B', 'C', 'D'
// 默认推荐: ['B', 'C']
// 只有路线 C 有 branch（关键小分叉）
```

**src/styles/transitions.css** — 已有过渡动画：

```css
@import "tailwindcss";

/* .fade-enter-active / .fade-leave-active 已定义 */
/* 400ms ease-in-out，淡入 + 微上移 */
/* 已处理 prefers-reduced-motion */
```

---

## 你需要创建的文件

### 1. 改写 src/App.vue（根组件）

App.vue 是流程控制器。它要做的事：

- import useProgress、useScenario、stayOrGo 数据
- 根据 currentStep 渲染对应的页面组件
- 用 `<Transition name="fade">` 包裹页面切换
- 顶部放 ProgressBar 组件（IntroScreen 时隐藏）
- 把 progress 和 scenario 的方法通过 props 传给子组件

流程逻辑：
```
INTRO → INSIGHT_BRIDGE → ROUTES_OVERVIEW → ROUTE_DETAIL_1 → ROUTE_DETAIL_2
  → BRANCH_CHOICE（如果选的路线有 branch，否则跳过）
  → COMPARE → RESULT
```

跳过逻辑：当 currentStep === STEPS.BRANCH_CHOICE 时，检查 `hasBranch(selectedRouteIds)`，如果 false，自动调用 `nextStep()` 跳到 COMPARE。

### 2. src/components/IntroScreen.vue

纯 hook 屏，只做一件事——拉人进来。

布局：
- 垂直居中，全屏高度
- 项目名"选择后果沙盘"（28px, 700 weight, #d4a574）
- 副标题"先试走几条路，再决定往哪走"（17px, #94a3b8）
- 按钮"开始体验 · 5分钟"（屏幕下半部分，#d4a574 背景，#0a0f1a 文字，圆角 12px，最小 44px 高）
- 无其他内容

事件：点击按钮 → emit('next')

### 3. src/components/InsightBridge.vue

系统洞察过渡屏。

Props: `intro: Scenario['intro']`

布局（从上到下）：
- userVoice（用户原话）：大字引述样式，居中，17px，#f1f5f9，左边加一条 #d4a574 竖线装饰
- systemInsight（系统洞察）：中等字号 17px，#d4a574 强调色
- keyFactors（关键因素）：14px 小字列表，#94a3b8，每条前面加 · 符号
- 按钮"看看你的几条路"

整屏淡入进场（用父级 Transition 即可）。

事件：点击按钮 → emit('next')

### 4. src/components/RoutesOverview.vue

路线选择屏。用户选 2 条最纠结的路线。

Props:
- `routes: Route[]`
- `defaultSelectedRouteIds: [string, string]`

布局：
- 引导语"你有四条路可以走，选两条最纠结的"（17px, #f1f5f9）
- 4 条路线垂直列表，每条占满宽度：
  - 默认态：#111827 背景，#f1f5f9 文字，12px 圆角
  - 选中态：#d4a574 左边框 3px + #1e293b 背景，左侧出现 ✓ 标记
  - 未选中但已满 2 条：opacity: 0.4
  - 每条显示：路线名（17px bold）+ 一句话感觉（14px, #94a3b8）
  - 最小高度 44px，padding 16px
- 底部状态：
  - 0 选：无提示
  - 1 选：显示"再选一条"（14px, #94a3b8）
  - 2 选：显示"继续"按钮

初始状态：defaultSelectedRouteIds 对应的 2 条路线预先高亮（和手动选中状态相同）。

交互：
- 点击未选中行 → 选中（最多 2 条）
- 点击已选中行 → 取消选中
- 不可选超过 2 条
- 选中/取消有 200ms 过渡动画

ARIA：列表用 role="listbox"，每条用 role="option" + aria-selected

事件：选满 2 条点击继续 → emit('select', [id1, id2])

### 5. src/components/RouteDetail.vue

单条路线的时间线展开。会被渲染 2 次（第一条和第二条路线）。

Props:
- `route: Route`
- `isSecond: boolean` — 是否是第二条路线（用于对比视角文案）
- `buttonText: string` — 按钮文字（"看下一条路" 或 "继续"）

布局（垂直滚动）：
- 顶部锚定：路线名（28px, 700, #f1f5f9）+ 一句话感觉（17px, #94a3b8）
- 时间线（垂直排列，左侧有连接线装饰）：
  - "它会怎么开始" — timeline.start
  - "3 个月后" — timeline.threeMonths
  - "半年后" — timeline.sixMonths（标注"分水岭"标签，#d4a574）
  - "1 年后" — timeline.oneYear
  - 每个节点：时间标签（14px, #d4a574）+ 内容（17px, #f1f5f9, line-height 1.75）
- "最容易后悔的瞬间"：regretMoment（#d4a574 背景色块高亮，padding 16px，圆角 12px）
- "如果未来的你回头看今天"：futureReflection（17px, #94a3b8，斜体感）
- 底部按钮

如果 isSecond 为 true，顶部加一句"和上一条路不同的是…"引导语。

事件：点击按钮 → emit('next')

### 6. src/components/BranchChoice.vue

关键小分叉选择 + 结果展示（同一屏）。

Props:
- `branch: Branch`

布局：
- 分叉问题（28px, 700, #f1f5f9）
- 两个选项按钮（全宽，上下排列，间距 16px）：
  - 默认态：#111827 背景，#f1f5f9 文字，12px 圆角，padding 20px
  - 选中态：#d4a574 边框 2px + #1e293b 背景 + 微缩放 scale(1.02)
  - 每个按钮显示：label（17px bold）+ feeling（14px, #94a3b8）
  - 桌面端（≥768px）：两个按钮左右并排
- 选择后淡入结果区（400ms）：
  - consequences 列表（每条 17px, #f1f5f9，前面加 · 符号）
  - insight 金句（17px, #d4a574，上方加分隔线）
- "继续对比"按钮（选择后才出现）

事件：
- 选择 → emit('choose', 'A' | 'B')
- 点击继续 → emit('next')

### 7. src/components/CompareView.vue

并排对比 + 条件变化 + 收口。一屏四个滚动区块。

Props:
- `dimensions: ComparisonDimension[]` — 已过滤为 2 条路线的对比数据
- `keyContrast: string`
- `conditionChange: Scenario['conditionChange']`
- `closing: Scenario['closing']`
- `selectedRouteIds: [string, string]`
- `routes: Route[]` — 用于显示路线名

布局（垂直滚动，4 个区块）：

区块 1 — 并排对比：
- 每个维度一行：维度名（14px, #d4a574）+ 两条路线的表现
- 移动端：上下排列（路线 1 在上，路线 2 在下）
- 桌面端：左右并排
- keyContrast 金句放在对比表下方（17px, #f1f5f9, 加上下 padding 24px）

区块 2 — 条件变化：
- 标题：conditionChange.question（17px, #d4a574）
- 只显示用户选的 2 条路线的 impact（根据 selectedRouteIds 过滤）
- 每条 impact：路线名（14px bold）+ change 内容（17px, #f1f5f9）
- reminder 提醒（14px, #94a3b8）

区块 3 — 收口金句：
- closing.insight 全屏停顿效果：
  - 初始不可见，滚动到此区域时触发
  - 2-3 秒缓慢淡入（用 IntersectionObserver 触发）
  - 大字居中（20px, #f1f5f9, font-weight 700）
  - 上下各留大量空白（padding 64px）

区块 4 — 下一步：
- closing.nextStep（17px, #f1f5f9）
- "生成我的结果卡"按钮

事件：点击按钮 → emit('next')

### 8. src/components/ResultCard.vue

可截图分享的结果卡。

Props:
- `title: string` — 场景标题
- `selectedRoutes: Route[]` — 用户选的 2 条路线
- `closingInsight: string` — 收口金句
- `branchChoice: 'A' | 'B' | null`

布局（固定比例 3:4，宽度 375px，居中）：
- 背景 #0a0f1a
- 场景标题（24px, #d4a574）
- 用户选择摘要：两条路线名 + oneLiner（14px, #f1f5f9）
- 如果有 branchChoice，显示选了哪个分叉
- 收口金句（20px, #f1f5f9）
- 底部水印"choice-sandbox.github.io"（12px, #94a3b8）
- 移动端：占满屏幕宽度，保持 3:4 比例

卡片下方（不在截图区域内）：
- "长按图片保存，或直接截屏"提示（14px, #94a3b8）
- "重新体验"按钮

事件：点击重新体验 → emit('restart')

### 9. src/components/ui/ProgressBar.vue

顶部进度条。

Props:
- `currentStep: number`
- `totalSteps: number` — 固定为 8（INTRO 到 RESULT）

布局：
- 固定在页面顶部，全宽
- 进度条高度 3px，背景 #111827，填充 #d4a574
- 填充宽度 = (currentStep / (totalSteps - 1)) * 100%
- 过渡动画 400ms

ARIA：role="progressbar", aria-valuenow, aria-valuemin=0, aria-valuemax=100

### 10. src/components/ui/TransitionWrap.vue

页面过渡动画包装器（可选，如果直接用 Vue 的 `<Transition name="fade">` 就够了，可以不创建这个文件）。

---

## Design Tokens（用 Tailwind 类名实现）

```
背景色：
  页面底色    bg-[#0a0f1a]
  区块背景    bg-[#111827]
  悬停/选中   bg-[#1e293b]

文字色：
  主文字      text-[#f1f5f9]
  次要文字    text-[#94a3b8]
  强调色      text-[#d4a574]

字体：
  标题        text-[28px] font-bold
  正文        text-[17px] leading-[1.75]
  小字        text-[14px]

间距：
  屏内边距    px-6 (24px)
  元素间距    gap-4 (16px)
  圆角        rounded-xl (12px)

动效：
  页面切换    transition-all duration-[400ms] ease-in-out
  UI 反馈     transition-all duration-200 ease
```

## 响应式

```
移动端（< 768px）— 默认
  全屏宽度，px-6
  所有列表垂直堆叠
  CompareView 对比表上下排列
  BranchChoice 按钮上下排列

桌面端（≥ 768px）— md: 前缀
  内容区居中 mx-auto max-w-[520px]
  CompareView 对比表左右并排
  BranchChoice 按钮左右并排
```

## 无障碍

- 所有可点击元素最小 44×44px
- 键盘导航：Tab 切换焦点，Enter/Space 选择
- RoutesOverview：role="listbox" + role="option" + aria-selected
- ProgressBar：role="progressbar"
- 动画尊重 prefers-reduced-motion（transitions.css 已处理）

## 注意事项

1. 不要修改 src/types/、src/composables/、src/data/ 下的文件，直接 import 使用
2. 不要安装新依赖，只用 Vue 3 + Tailwind CSS
3. 所有样式用 Tailwind 类名，不写 `<style>` 块（除非是 Tailwind 无法表达的动画）
4. 代码注释用中文
5. ResultCard 的 Canvas 截图功能不在这个阶段做，只做布局和展示
