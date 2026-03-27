# CLAUDE.md — 选择后果沙盘 (choice-sandbox)

## 项目简介

帮用户可视化人生选择的交互网页。用户面对一个现实纠结，体验 4 条可能的人生路线，选 2 条深入探索，在关键节点做选择，最后生成可分享的结果卡。

- **线上地址**: https://sdyckjq-lab.github.io/choice-sandbox/
- **目标用户**: 社交媒体上的陌生人（小红书、公众号）
- **核心体验**: 5 分钟内走完一个完整的选择后果推演

## 技术栈

| 层 | 选型 |
|---|------|
| 框架 | Vue 3 (Composition API) + TypeScript |
| 样式 | Tailwind CSS 4 |
| 构建 | Vite 8 |
| 测试 | Vitest + @vue/test-utils + happy-dom |
| 截图 | html2canvas |
| 部署 | GitHub Pages (自动部署，push main 即触发) |
| 包管理 | pnpm |

## 常用命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 类型检查 + 构建
pnpm test         # 运行全部测试（vitest run）
pnpm preview      # 预览构建产物
```

## 项目结构

```
src/
├── App.vue                        # 根组件，状态机管理 8 步流程 + AI 流程切换
├── main.ts                        # 入口
├── types/
│   └── scenario.ts                # Scenario/Route/Branch 等类型定义
├── data/
│   ├── aiPrompt.ts                # AI system prompt + user prompt builder
│   └── scenarios/
│       ├── stay-or-go.ts          # "求稳还是试新路" 场景数据
│       └── scenario-template.ts   # 场景贡献模板（复制此文件添加新场景）
├── components/
│   ├── AISettingsOverlay.vue      # AI 设置浮层（API key / baseURL / model）
│   ├── AIInputScreen.vue          # AI 输入纠结页面
│   ├── AIGeneratingScreen.vue     # AI 生成中 / 错误回退页面
│   ├── IntroScreen.vue            # 第1屏：双入口（示例 / AI）
│   ├── InsightBridge.vue          # 第1.5屏：系统洞察（渐进文字揭示）
│   ├── RoutesOverview.vue         # 第2屏：4条路线选择（交错入场）
│   ├── RouteDetail.vue            # 第3屏：时间线详情（滚动驱动揭示）
│   ├── BranchChoice.vue           # 第4屏：关键分叉选择
│   ├── CompareView.vue            # 第5屏：对比+条件变化+收口金句
│   ├── ResultCard.vue             # 第6屏：可截图分享的结果卡
│   └── ui/
│       ├── ProgressBar.vue        # 进度条
│       └── TransitionWrap.vue     # 过渡动画包装
├── composables/
│   ├── useProgress.ts             # 状态管理 + localStorage 持久化（防刷新丢进度）
│   ├── useScenario.ts             # 场景数据加载和过滤（支持动态数据源）
│   ├── useAIGeneration.ts         # AI 生成状态机（配置 / 输入 / 调用 / 重试 / 回退）
│   ├── useShareCard.ts            # html2canvas 截图（含 iOS Safari 降级）
│   └── useRevealOnScroll.ts       # 滚动揭示（IntersectionObserver 封装）
├── utils/
│   ├── llmClient.ts               # OpenAI 兼容 API 客户端
│   └── validateScenario.ts        # AI 输出运行时结构校验
└── styles/
    └── transitions.css            # 页面级 fade 过渡 + prefers-reduced-motion
```

## 用户流程状态机

```
IntroScreen → InsightBridge → RoutesOverview → [选2条]
  → RouteDetail(路线1) → RouteDetail(路线2)
  → BranchChoice(如有分叉) → CompareView → ResultCard
```

## 设计规范（Design Tokens）

```css
/* 色板 — 深夜温暖色 */
--bg-deep: #0a0f1a;       --bg-surface: #111827;    --bg-hover: #1e293b;
--text-primary: #f1f5f9;   --text-secondary: #94a3b8;
--accent: #d4a574;         --accent-dim: #92704a;

/* 字体 */
--font-family: system-ui;  --title-size: 28px;  --body-size: 17px;

/* 动效规则 */
页面切换: 400ms ease-in-out    UI反馈: 200ms ease    收口停顿: 2500ms
所有动画必须尊重 prefers-reduced-motion
```

## 测试

- 测试框架: Vitest + @vue/test-utils + happy-dom
- Mock: IntersectionObserver 立即触发 + matchMedia 返回 reduced-motion
- 测试文件: `src/__tests__/App.spec.ts`, `src/composables/__tests__/`, `src/components/__tests__/`, `src/data/__tests__/`, `src/data/scenarios/__tests__/`, `src/utils/__tests__/`
- 当前: 95 个测试全绿

## 关键设计文档

- **主设计文档**: `~/.gstack/projects/tounao-fengbao/kangjiaqi-main-design-20260324-153601.md`（包含完整的信息层级、交互状态、响应式规格、无障碍要求）
- **测试计划**: `~/.gstack/projects/tounao-fengbao/kangjiaqi-main-eng-review-test-plan-20260324-162304.md`
- **设计系统**: `DESIGN.md`（色板、字体、间距、动效、组件规范、响应式、无障碍）
- **贡献指南**: `CONTRIBUTING.md`（场景贡献流程和写作要点）
- **待办事项**: `TODOS.md`（V2 功能列表）

## 当前状态

- V1 MVP: ✅ 完成（6屏+1过渡，完整可点通）
- 体验升级: ✅ 完成（滚动驱动时间线、渐进文字揭示、交错入场、卡片凝聚入场）
- 部署: ✅ GitHub Pages 自动部署
- localStorage 持久化: ✅ 完成（刷新不丢进度，版本号兼容机制）
- 场景贡献模板: ✅ 完成（scenario-template.ts + CONTRIBUTING.md）
- 设计系统文档: ✅ 完成（DESIGN.md）
- AI 个性化生成: ✅ 完成（双入口 + 本地 AI 配置 + 输入页 + 生成中/失败回退 + 动态接入主流程）
- AI 输出安全网: ✅ 完成（结构校验、空内容处理、网络/超时/取消错误分类）

## V2 待办（见 TODOS.md）

1. **更多高质量预写场景** — 扩大示例题材覆盖面，给不想自己配 API 的用户更多可直接体验的入口
2. **更低门槛的 AI 接入** — 降低必须自备 API Key 的门槛

## AI 工具分工

- **Claude Code**: 规划调度（大脑），生成指令 prompt，验收集成，写数据和文档
- **Codex**: 代码执行（体力活），创建骨架、写测试、配部署
- **Antigravity**: 前端开发，所有 .vue 组件

> Claude Code 不亲自写组件代码，只输出指令文档给对应工具执行。

## 开发规范

- 移动端优先（目标用户从手机社交媒体点入）
- 暗色主题，不要白底
- 每屏只做一件事，不堆叠信息
- 动画要慢（300-500ms），给沉浸感
- 新场景数据必须符合 `Scenario` 类型定义（见 `src/types/scenario.ts`）
- 所有动画必须支持 `prefers-reduced-motion`

## 任务完成流程

每次完成功能开发后，必须同步更新以下文档再结束对话：

1. **TODOS.md** — 已完成的任务标记 ✅ + 完成日期
2. **CLAUDE.md** — 更新「当前状态」「V2 待办」「项目结构」「测试数量」等受影响的段落
3. **指令文档清理** — `prompts/` 下已执行完的指令文档可保留（供回溯），不删除

这样新对话一进来就能准确知道项目走到哪了、下一步该做什么。
