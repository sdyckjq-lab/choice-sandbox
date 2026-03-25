# 贡献指南

感谢你对"选择后果沙盘"的兴趣。这个项目最需要的贡献是新场景。

## 贡献新场景

### 什么样的场景适合

- 很多人都会遇到的真实纠结（不是假设性的思想实验）
- 能拆出 4 条明显不同的路线
- 至少有 1 条路线值得设一个关键小分叉
- 半年到一年的时间跨度内，不同路线会产生明显差异

好的例子：
- "要不要从大厂跳到创业公司？"
- "要不要gap year？"
- "要不要从一线城市回老家？"

### 怎么贡献

1. Fork 这个仓库
2. 在 `src/data/scenarios/` 下创建新文件（如 `big-to-startup.ts`）
3. 按照 `stay-or-go.ts` 的结构填写数据
4. 提交 PR

### 场景数据结构

每个场景需要填写以下内容：

```typescript
import type { Scenario } from '../../types/scenario'

export const yourScenario: Scenario = {
  id: 'your-scenario-id',
  title: '场景标题（一句话描述纠结）',

  intro: {
    userVoice: '用户的原话，描述他们的纠结',
    systemInsight: '系统点出的真正矛盾',
    keyFactors: [
      '关键因素 1',
      '关键因素 2',
      '关键因素 3',
    ],
  },

  routes: [
    // 4 条路线，每条包含：
    // - id, name, oneLiner
    // - timeline: { start, threeMonths, sixMonths, oneYear }
    // - regretMoment, flipConditions, futureReflection
    // - branch（可选，只给 1 条路线加）
  ],

  defaultSelectedRouteIds: ['推荐的路线ID1', '推荐的路线ID2'],

  comparison: {
    dimensions: [
      // 3-5 个对比维度，每个维度覆盖所有 4 条路线
    ],
    keyContrast: '一句最关键的对比',
  },

  conditionChange: {
    question: '如果改变一个关键条件呢？',
    impacts: [
      // 4 条路线各受什么影响
    ],
    reminder: '一句提醒',
  },

  closing: {
    insight: '收口洞察',
    nextStep: '最值得先验证的一件事',
  },
}
```

参考 `src/data/scenarios/stay-or-go.ts` 看完整示例。

### 写作原则

- 像跟朋友聊天一样写，不要用分析报告的语气
- 每条路线的时间线要具体、有画面感，不要泛泛而谈
- "最容易后悔的瞬间"要扎心，不要鸡汤
- "未来的你回头看"要像真的在自言自语
- 小分叉的两个选项要让人真的犹豫

### 质量检查

提交前问自己：
1. 别人看了会不会自己继续点下去？
2. 会不会在小分叉那里停一下？
3. 会不会说"这条真的像我"？

## 代码贡献

如果你想改进代码：

1. `pnpm install` 安装依赖
2. `pnpm dev` 启动开发服务器
3. `pnpm test` 跑测试
4. `pnpm build` 确认构建通过
5. 提交 PR

代码规范：
- Vue 3 Composition API + TypeScript
- 样式用 Tailwind CSS 类名
- 注释用中文
