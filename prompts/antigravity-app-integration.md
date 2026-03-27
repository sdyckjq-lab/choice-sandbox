# 任务：App.vue 集成 AI 生成流程

## 背景
这是 AI 个性化生成功能的最后一步：把所有新组件和 composable 串联到 App.vue 中，与现有的 8 步流程无缝融合。

## 要改的文件
- `src/App.vue`

## 参考文件（必须先阅读）
- `src/App.vue` — 当前完整实现
- `src/composables/useAIGeneration.ts` — AI 生成状态机的 API
- `src/composables/useScenario.ts` — 已改造为接受 `MaybeRef<Scenario>`
- `src/data/scenarios/stay-or-go.ts` — 预写场景数据

## 前置条件
以下文件必须已经由 Codex 和 Antigravity 完成：
- `src/utils/llmClient.ts`
- `src/utils/validateScenario.ts`
- `src/data/aiPrompt.ts`
- `src/composables/useAIGeneration.ts`
- `src/composables/useScenario.ts`（已改造）
- `src/components/AISettingsOverlay.vue`
- `src/components/AIInputScreen.vue`
- `src/components/AIGeneratingScreen.vue`
- `src/components/IntroScreen.vue`（已改造）

## 改造要求

### 1. 新增 import

```ts
import { computed } from 'vue'  // 如果还没导入
import { useAIGeneration } from './composables/useAIGeneration'
import AISettingsOverlay from './components/AISettingsOverlay.vue'
import AIInputScreen from './components/AIInputScreen.vue'
import AIGeneratingScreen from './components/AIGeneratingScreen.vue'
```

### 2. 初始化 AI 生成

在 `<script setup>` 中，`useProgress()` 之后：

```ts
const aiGen = useAIGeneration()

// 动态场景数据源：AI 生成 > localStorage 恢复 > 预写场景
const activeScenario = computed(() => {
  if (aiGen.generatedScenario.value) {
    return aiGen.generatedScenario.value
  }
  // 尝试从 localStorage 恢复上次 AI 生成的场景
  const restored = aiGen.restoreLastScenario()
  if (restored) {
    return restored
  }
  return stayOrGo
})
```

### 3. 改造 useScenario 调用

```ts
// 之前：
// const { scenario, ... } = useScenario(stayOrGo)

// 改为：
const {
  scenario,
  getSelectedRoutes,
  getFilteredDimensions,
  hasBranch,
  getBranchRoute
} = useScenario(activeScenario)
```

注意：`useScenario` 现在接受 `MaybeRef<Scenario>`，`activeScenario` 是 `ComputedRef<Scenario>`，直接传入即可。

### 4. 处理 IntroScreen 的新 emits

```ts
// AI 入口点击
const handleAIStart = () => {
  aiGen.startAIFlow()
}

// 打开设置
const handleOpenSettings = () => {
  aiGen.openSettings()
}

// AI 生成成功后进入流程
// watch aiGen.status，当变为 'success' 时：
watch(() => aiGen.status.value, (newStatus) => {
  if (newStatus === 'success') {
    // 重置进度到开头
    reset()
    // 跳过 IntroScreen，直接进入 INSIGHT_BRIDGE
    nextStep()
    // AI 状态回到 idle，让主流程界面显示
    aiGen.reset()
  }
})
```

**注意：** 这里 `reset()` 会把 currentStep 设回 0，然后 `nextStep()` 把它推到 1（INSIGHT_BRIDGE）。`aiGen.reset()` 把 AI 状态设回 'idle'，此时模板中只会渲染主流程。

### 5. 模板改造

在现有 `<template>` 中，添加 AI 流程组件的条件渲染。

**核心逻辑：** AI 流程组件和主流程互斥显示。

```html
<template>
  <div class="bg-[#0a0f1a] min-h-screen text-[#f1f5f9] font-sans antialiased overflow-x-hidden relative">

    <!-- AI 设置浮层 -->
    <AISettingsOverlay
      v-if="aiGen.status.value === 'configuring'"
      :config="aiGen.config.value"
      @save="aiGen.saveConfig"
      @close="aiGen.reset"
    />

    <!-- AI 输入界面 -->
    <AIInputScreen
      v-else-if="aiGen.status.value === 'inputting'"
      :initial-input="aiGen.userInput.value"
      @submit="aiGen.submitInput"
      @back="aiGen.reset"
      @settings="aiGen.openSettings"
    />

    <!-- AI 生成中 / 错误 -->
    <AIGeneratingScreen
      v-else-if="aiGen.status.value === 'generating' || aiGen.status.value === 'error'"
      :status="aiGen.status.value as 'generating' | 'error'"
      :error="aiGen.error.value"
      @cancel="aiGen.cancelGeneration"
      @retry="aiGen.retry"
      @fallback="aiGen.reset"
    />

    <!-- 主流程（AI idle 或 success 时显示） -->
    <template v-else>
      <ProgressBar
        v-if="currentStep !== STEPS.INTRO && currentStep !== STEPS.RESULT"
        :current-step="currentStep"
        :total-steps="8"
      />

      <Transition name="fade" mode="out-in">

        <IntroScreen
          v-if="currentStep === STEPS.INTRO"
          @next="nextStep"
          @ai="handleAIStart"
          @settings="handleOpenSettings"
        />

        <!-- 其余步骤完全不变 -->
        <InsightBridge ... />
        <RoutesOverview ... />
        <RouteDetail ... />
        <RouteDetail ... />
        <BranchChoice ... />
        <CompareView ... />
        <ResultCard ... />

      </Transition>
    </template>
  </div>
</template>
```

**关键：** 只有 IntroScreen 的部分新增了 `@ai` 和 `@settings`，其余所有步骤组件的 props 和 events 完全不变！

### 6. 完整的改动清单

| 位置 | 改动 |
|------|------|
| import 区 | +3 行 import（useAIGeneration + 3 个组件） |
| setup 区 | +1 行 `const aiGen = useAIGeneration()` |
| setup 区 | +1 行 `const activeScenario = computed(...)` |
| setup 区 | `useScenario(stayOrGo)` → `useScenario(activeScenario)` |
| setup 区 | +2 个 handler 函数 |
| setup 区 | +1 个 watch（AI success → 进入主流程） |
| template | +3 个 AI 组件（条件渲染） |
| template | IntroScreen 新增 @ai 和 @settings |
| template | 主流程包裹在 `<template v-else>` 中 |

### 7. `restoreLastScenario` 的注意事项

`restoreLastScenario()` 在 computed 中被调用，每次 activeScenario 重新计算时都会跑一次。为避免重复解析 localStorage，`useAIGeneration` 内部应该做缓存（第一次读取后缓存结果）。如果 `useAIGeneration.ts` 没做缓存，可以在 App.vue 中这样处理：

```ts
// 启动时尝试恢复一次
const restoredScenario = aiGen.restoreLastScenario()

const activeScenario = computed(() => {
  if (aiGen.generatedScenario.value) {
    return aiGen.generatedScenario.value
  }
  if (restoredScenario) {
    return restoredScenario
  }
  return stayOrGo
})
```

这样 `restoreLastScenario()` 只在 setup 阶段调用一次。

## 注意事项
- 不要改任何子组件（除了 IntroScreen 的 emit 绑定）
- 不要改 STEPS 枚举和 useProgress 的逻辑
- 不要改 useScenario 的返回值访问方式
- 现有的所有步骤组件的 props 保持不变
- 代码注释用中文
- 确保回归：如果用户从不使用 AI 功能，整个体验与改造前完全一致
