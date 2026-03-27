# 任务：改造 IntroScreen 为双入口

## 背景
当前 IntroScreen 只有一个"开始体验"按钮。需要改为双入口：一个走预写示例场景，一个走 AI 个性化生成。

## 要改的文件
- `src/components/IntroScreen.vue`

## 参考文件（请先阅读）
- `src/components/IntroScreen.vue` — 当前实现（入场动画、按钮样式）

## 当前代码（完整）

```vue
<script setup lang="ts">

const emit = defineEmits<{
  (e: 'next'): void
}>()
</script>

<template>
  <div class="min-h-screen flex flex-col justify-center items-center px-6">
    <div class="text-center w-full md:max-w-[520px] md:mx-auto">
      <h1 class="text-[28px] font-bold text-[#d4a574] mb-4 animate-reveal [animation-delay:0ms]">选择后果沙盘</h1>
      <p class="text-[17px] text-[#94a3b8] mb-12 animate-reveal [animation-delay:300ms]">先试走几条路，再决定往哪走</p>

      <button
        @click="emit('next')"
        class="w-full bg-[#d4a574] text-[#0a0f1a] font-bold rounded-xl min-h-[44px] py-3 px-6 transition-all duration-200 hover:bg-[#b88c5d] hover:scale-[1.02] active:scale-95 animate-reveal [animation-delay:600ms]"
      >
        开始体验 · 5分钟
      </button>
    </div>
  </div>
</template>
```

## 改造要求

### 新增 Emits

```ts
const emit = defineEmits<{
  (e: 'next'): void       // 体验示例场景（原有）
  (e: 'ai'): void         // 输入你的纠结（AI 生成）
  (e: 'settings'): void   // 打开设置
}>()
```

### 新 UI 布局

```
[居中]

  选择后果沙盘                           （标题，不变）
  先试走几条路，再决定往哪走              （副标题，不变）

  [ 体验示例场景 · 5分钟 ]               （主按钮，bg-[#d4a574]，emit('next')）

  [ 输入你的纠结 · AI 生成 ]             （次按钮，透明边框样式，emit('ai')）

  ⚙ 设置                               （底部小文字链接，emit('settings')）
```

### 次按钮样式（"输入你的纠结"）

透明背景 + 边框，与主按钮对比：
```
w-full bg-transparent border-2 border-[#d4a574] text-[#d4a574]
font-bold rounded-xl min-h-[44px] py-3 px-6
transition-all duration-200
hover:bg-[#d4a574] hover:bg-opacity-10 hover:scale-[1.02]
active:scale-95
```

### 按钮间距
- 主按钮和次按钮间距：`mb-4`
- 次按钮下方到设置链接：`mt-8`

### 设置链接样式
```
text-[14px] text-[#94a3b8]
transition-colors duration-200
hover:text-[#d4a574]
cursor-pointer
```

### 入场动画
延续现有的 `animate-reveal` 模式：
- 标题：delay 0ms
- 副标题：delay 300ms
- 主按钮：delay 600ms
- 次按钮：delay 800ms
- 设置链接：delay 1000ms

### prefers-reduced-motion
已有的 `@media (prefers-reduced-motion)` 样式会自动覆盖新元素（因为用的是同一个 `.animate-reveal` class），不需要额外处理。

## 注意事项
- 保留所有现有样式和动画
- 不改现有的 `animate-reveal` keyframe 定义
- 代码注释用中文
- 改动尽量小，只添加新元素
