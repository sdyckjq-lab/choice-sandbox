# 任务：创建 AIInputScreen 用户输入界面

## 背景
用户配置好 API Key 后，在这个界面输入自己的纠结描述。这是 AI 生成流程的核心输入环节。

## 要创建的文件
- `src/components/AIInputScreen.vue`

## 参考文件（请先阅读）
- `src/components/IntroScreen.vue` — 布局风格、按钮样式、入场动画
- `src/components/InsightBridge.vue` — 渐进揭示动画模式

## 设计规范
同项目全局：暗色主题，移动端优先，prefers-reduced-motion 支持。

## 具体要求

### Props 和 Emits

```ts
const props = defineProps<{
  initialInput?: string  // 回退/重试时恢复之前的输入
}>()

const emit = defineEmits<{
  (e: 'submit', text: string): void
  (e: 'back'): void
  (e: 'settings'): void  // 点击设置按钮
}>()
```

### UI 布局

```
[全屏，min-h-screen，flex flex-col justify-center]

  [居中容器，max-w-md，px-6]

    ← 返回                              （左上角，文字按钮，emit('back')）

    描述你的纠结                         （标题，28px，#d4a574，font-bold）

    把你现在最纠结的事写出来，            （副标题，17px，#94a3b8）
    像跟朋友聊天一样就好。

    [                              ]     （textarea）
    [ 多行文本框                    ]
    [                              ]
    [                              ]
    placeholder: "比如：我现在的工作还行，
     但越来越想试试自由职业..."

    2000字以内            已输入 XX 字    （字数提示行，14px，#94a3b8）

    [ 开始分析 ]                         （主按钮，字数不足 20 字时 disabled）

    ⚙ 修改 AI 设置                      （底部，小文字按钮，emit('settings')）
```

### textarea 样式

```
bg-[#111827] border border-[#1e293b] rounded-xl
text-[#f1f5f9] text-[17px] px-4 py-4 w-full
min-h-[200px] resize-none
focus:border-[#d4a574] focus:outline-none
transition-colors duration-200
placeholder:text-[#94a3b8] placeholder:opacity-50
```

### 字数逻辑
- 最少 20 字，最多 2000 字
- 字数不足 20 字：按钮 disabled，字数显示正常颜色
- 字数 20-2000：按钮可用
- 字数超过 2000：输入框限制（maxlength 或 js 截断），字数显示变红 `text-red-400`
- 字数统计显示在 textarea 下方右侧

### 按钮样式
与 IntroScreen 一致：
```
bg-[#d4a574] text-[#0a0f1a] font-bold rounded-xl
min-h-[44px] py-3 px-6 w-full
disabled:opacity-40 disabled:cursor-not-allowed
```

### 入场动画
标题 → 副标题 → textarea → 按钮 依次渐入（间隔 200ms），与 IntroScreen 的 animate-reveal 模式一致。

### 逻辑
- 组件 mount 时，如果有 `initialInput`，填入 textarea
- textarea 自动获取焦点（`onMounted` 中 `nextTick` 后 focus）
- 提交时 emit('submit', text.trim())

## 注意事项
- 代码注释用中文
- 不引入第三方库
- textarea 不需要自动增高，固定 min-h-[200px] 即可
