# DESIGN.md — Choice Sandbox 设计系统

> 所有场景、组件、贡献者页面都必须遵循此规范，保证视觉一致性。

## 色板：深夜温暖色

| Token | 值 | 用途 |
|-------|-------|------|
| `--bg-deep` | `#0a0f1a` | 页面底色 |
| `--bg-surface` | `#111827` | 卡片、容器背景 |
| `--bg-hover` | `#1e293b` | 悬停、选中状态背景 |
| `--text-primary` | `#f1f5f9` | 正文、标题 |
| `--text-secondary` | `#94a3b8` | 辅助说明、次要信息 |
| `--accent` | `#d4a574` | 强调色（按钮、高亮、进度条） |
| `--accent-dim` | `#92704a` | 强调色弱化版（边框、次要按钮） |

### 使用规则

- 永远是暗色主题，不做白底/亮色模式
- 背景层级：`bg-deep`（最底）→ `bg-surface`（卡片）→ `bg-hover`（交互态）
- 文字只用 `text-primary` 和 `text-secondary`，不自造灰度
- 强调色只用于需要用户注意的元素（CTA 按钮、当前进度、选中态）

## 字体

| Token | 值 | 说明 |
|-------|-------|------|
| `--font-family` | `system-ui` | 系统原生字体，各平台自动适配 |
| `--title-size` | `28px` | 场景标题、屏幕主标题 |
| `--body-size` | `17px` | 正文、描述、时间线内容 |

### 使用规则

- 不引入外部字体文件（保持加载速度）
- 标题用 `font-semibold`（600），正文用 `font-normal`（400）
- 行高：标题 1.3，正文 1.7（长文本需要更大行高）
- 字间距保持默认，不手动调整

## 间距系统

基于 4px 基础单位，使用 Tailwind 默认 spacing scale：

| 场景 | Tailwind Class | 实际值 |
|------|---------------|--------|
| 元素内边距（小） | `p-3` | 12px |
| 元素内边距（标准） | `p-4` ~ `p-6` | 16px ~ 24px |
| 卡片内边距 | `p-6` ~ `p-8` | 24px ~ 32px |
| 区块间距 | `space-y-4` ~ `space-y-6` | 16px ~ 24px |
| 屏幕级间距 | `py-12` ~ `py-16` | 48px ~ 64px |
| 最大内容宽度 | `max-w-md` | 448px（移动端优先） |

### 使用规则

- 移动端优先：所有布局在 375px 宽度下必须好看
- 最大内容宽度 `max-w-md`，居中显示
- 不用绝对像素值，统一用 Tailwind spacing class

## 动效规则

| 类型 | 时长 | 缓动 | 用途 |
|------|------|------|------|
| 页面切换 | 400ms | ease-in-out | 屏幕级过渡（fade + translateY） |
| UI 反馈 | 200ms | ease | 按钮悬停、选中态变化 |
| 内容揭示 | 300ms ~ 500ms | ease-out | 滚动驱动的渐现、文字逐段出现 |
| 收口停顿 | 2500ms | — | 洞察金句显示前的等待 |
| 交错入场 | 每项延迟 100ms | ease-out | 列表项依次出现（如 4 条路线） |

### 使用规则

- **必须** 支持 `prefers-reduced-motion`：减弱动画时长到 100ms，去掉位移
- 动画要慢（300-500ms），给沉浸感，不做闪现
- 入场动画用 `opacity 0→1` + `translateY 12px→0`
- 离场动画用 `opacity 1→0` + `translateY 0→-12px`
- 滚动驱动揭示用 `IntersectionObserver`，threshold 0.2

```css
/* prefers-reduced-motion 降级示例 */
@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 100ms ease;
    transform: none;
  }
}
```

## 组件级规范

### 卡片（路线选择卡、结果卡等）

- 背景：`bg-surface`
- 边框：`border border-white/10`，选中态 `border-accent`
- 圆角：`rounded-xl`（12px）
- 悬停：背景变 `bg-hover`，200ms 过渡

### 按钮

- 主按钮：`bg-accent text-bg-deep font-semibold rounded-lg px-6 py-3`
- 次要按钮：`border border-accent-dim text-accent rounded-lg px-6 py-3`
- 禁用态：`opacity-40 cursor-not-allowed`

### 进度条

- 轨道：`bg-white/10`
- 填充：`bg-accent`
- 高度：4px
- 过渡：宽度变化 400ms ease-in-out

### 文字层级

| 层级 | 样式 | 用途 |
|------|------|------|
| H1 | `text-[28px] font-semibold text-primary` | 场景标题 |
| H2 | `text-xl font-semibold text-primary` | 屏幕标题、路线名 |
| Body | `text-[17px] text-primary leading-relaxed` | 正文内容 |
| Secondary | `text-sm text-secondary` | 辅助说明、提示 |
| Accent | `text-accent font-medium` | 强调文字、关键词 |

## 响应式断点

| 断点 | 宽度 | 设计重点 |
|------|------|---------|
| 默认 | < 640px | **主要目标**，所有设计从这里开始 |
| `sm` | ≥ 640px | 卡片可以稍宽，间距适当加大 |
| `md` | ≥ 768px | 对比视图可以并排显示 |

### 使用规则

- 移动端优先：先写默认样式（手机），再用 `sm:` `md:` 覆盖
- 触摸目标最小 44×44px（iOS Human Interface Guidelines）
- 不做 `lg` 以上的适配（目标用户从手机社交媒体进入）

## 无障碍要求

- 所有可交互元素必须有 `aria-label` 或可见文字
- 颜色对比度满足 WCAG AA（强调色 `#d4a574` 在深色背景上对比度 > 4.5:1）
- 键盘可导航：按钮可 Tab 聚焦，Enter 触发
- 动画尊重 `prefers-reduced-motion`（见动效规则）
