# 任务：创建 AIGeneratingScreen 等待界面

## 背景
AI 生成需要 15-30 秒，这个界面通过渐进提示文字让用户感到"有事在发生"。同时处理生成失败的错误展示。

## 要创建的文件
- `src/components/AIGeneratingScreen.vue`

## 参考文件（请先阅读）
- `src/components/InsightBridge.vue` — 渐进文字揭示的动效模式（最相似的参考）
- `src/components/ResultCard.vue` — 凝聚入场动画

## 设计规范
同项目全局：暗色主题，移动端优先，prefers-reduced-motion 支持。

## 具体要求

### Props 和 Emits

```ts
interface AIError {
  type: string
  message: string
}

const props = defineProps<{
  status: 'generating' | 'error'
  error: AIError | null
}>()

const emit = defineEmits<{
  (e: 'cancel'): void    // 取消生成
  (e: 'retry'): void     // 重试
  (e: 'fallback'): void  // 体验示例场景
}>()
```

### 生成中状态（status === 'generating'）

```
[全屏，min-h-screen，flex flex-col justify-center items-center]

  [居中容器，max-w-md，px-6，text-center]

    ●                                    （加载动画，见下方）

    正在为你推演可能的路线...              （标题，20px，#f1f5f9，font-bold）

    [当前提示文字]                        （17px，#94a3b8，渐进切换）

    取消                                 （底部，文字按钮，#94a3b8）
```

**渐进提示文字：** 每 3.5 秒切换一条，fade 过渡：
```ts
const PROGRESS_HINTS = [
  '正在理解你的处境...',
  '正在构思 4 条可能的路线...',
  '正在推演每条路的时间线...',
  '正在寻找最容易后悔的瞬间...',
  '正在分析翻盘条件...',
  '正在对比不同路线的差异...',
  '快好了，正在收尾...',
]
```

循环播放：到最后一条后回到第一条（表示仍在进行中）。

**加载动画：** 用纯 CSS 实现一个脉冲圆点：
```css
/* 脉冲呼吸圆点 */
.pulse-dot {
  width: 12px;
  height: 12px;
  background: #d4a574;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
```

prefers-reduced-motion 时，圆点静止不动画。

### 错误状态（status === 'error'）

```
[全屏，min-h-screen，flex flex-col justify-center items-center]

  [居中容器，max-w-md，px-6，text-center]

    ✕                                    （错误图标，48px，text-red-400）

    生成失败                              （标题，20px，#f1f5f9，font-bold）

    {{ error.message }}                  （错误详情，17px，#94a3b8）

    [ 重试 ]                             （主按钮，bg-[#d4a574]）

    先体验示例场景                        （文字按钮，#94a3b8）
```

### 状态切换动画
- generating → error：整个内容区 fade 过渡
- 使用 Vue 的 `<Transition>` 包裹，`name="fade"`（复用项目已有的 fade 过渡样式）

### 定时器管理
- `onMounted` 启动 `setInterval` 切换渐进提示
- `onUnmounted` 清除 `setInterval`
- 状态从 `generating` 变为 `error` 时也清除定时器（用 `watch`）

## 注意事项
- 代码注释用中文
- 不引入第三方库
- 错误图标用纯文本 "✕" 或 CSS 画的叉号，不用 emoji
- 全部动画都要处理 prefers-reduced-motion
