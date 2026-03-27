# 任务：创建 AISettingsOverlay 配置浮层组件

## 背景
用户首次使用 AI 个性化生成时，需要配置 API Key、API 地址和模型名称。这是一个全屏暗色 overlay 浮层。

## 要创建的文件
- `src/components/AISettingsOverlay.vue`

## 参考文件（请先阅读，理解项目的组件风格）
- `src/components/IntroScreen.vue` — 按钮风格、动画模式
- `src/components/InsightBridge.vue` — 渐进揭示动画、prefers-reduced-motion 处理
- `src/utils/llmClient.ts` — `LLMConfig` 类型定义

## 设计规范
- 背景色：`#0a0f1a`（与全局一致）
- 表面色：`#111827`（输入框背景）
- 悬停色：`#1e293b`（输入框聚焦边框）
- 主文本：`#f1f5f9`
- 副文本：`#94a3b8`
- 强调色：`#d4a574`（按钮、标题）
- 字体：system-ui
- 所有动画需支持 `prefers-reduced-motion`
- 移动端优先，max-w-md 居中

## 具体要求

### Props 和 Emits

```ts
import type { LLMConfig } from '../utils/llmClient'

const props = defineProps<{
  config: LLMConfig  // 当前配置（回显用）
}>()

const emit = defineEmits<{
  (e: 'save', config: LLMConfig): void
  (e: 'close'): void
}>()
```

### UI 布局

```
[全屏 overlay，z-50，bg-[#0a0f1a]，min-h-screen]

  [居中容器，max-w-md，px-6]

    ← 返回                              （左上角，文字按钮，emit('close')）

    AI 设置                              （标题，text-[#d4a574]，28px）

    需要一个 AI 接口来为你生成            （副标题，text-[#94a3b8]，14px）
    个性化的选择分析

    API 密钥 *                           （label，14px，#94a3b8）
    [________________________]           （input type=password，可切换显示）
                                         （placeholder: "sk-..."）

    API 地址                             （label）
    [________________________]           （input type=text）
                                         （placeholder: "https://api.openai.com/v1"）

    模型名称                             （label）
    [________________________]           （input type=text）
                                         （placeholder: "gpt-4o"）

    [ 保存并继续 ]                       （主按钮，bg-[#d4a574]，apiKey 为空时 disabled）

    密钥仅存储在你的浏览器本地，          （底部小字，12px，#94a3b8，居中）
    不会上传到任何服务器
```

### 输入框样式

```
bg-[#111827] border border-[#1e293b] rounded-xl
text-[#f1f5f9] text-[17px] px-4 py-3 w-full
focus:border-[#d4a574] focus:outline-none
transition-colors duration-200
```

### API Key 输入框特殊处理
- 默认 `type="password"`
- 右侧有一个眼睛图标按钮，点击切换 `type="text"` / `type="password"`
- 眼睛图标用简单的 Unicode 字符：👁（显示状态）/ 🔒（隐藏状态）
- 或者用更简洁的文字按钮："显示" / "隐藏"

### 按钮样式
与项目一致：
```
bg-[#d4a574] text-[#0a0f1a] font-bold rounded-xl
min-h-[44px] py-3 px-6 w-full
transition-all duration-200
hover:bg-[#b88c5d] hover:scale-[1.02] active:scale-95
disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
```

### 入场动画
- `onMounted` 时，整个内容区从下方渐入（与 InsightBridge 一致的模式）
- `prefers-reduced-motion` 时直接显示

### 逻辑
- 组件 mount 时，用 `props.config` 初始化本地表单状态
- 提交时，emit('save', { apiKey, baseURL, model })
- `baseURL` 如果用户没填，使用默认值 `'https://api.openai.com/v1'`
- `model` 如果用户没填，使用默认值 `'gpt-4o'`
- `apiKey` 为空时，"保存并继续"按钮 disabled

## 注意事项
- 不要引入任何图标库，用 Unicode 或纯 CSS
- 代码注释用中文
- 组件是纯 UI，不操作 localStorage（由父组件通过 emit 处理）
