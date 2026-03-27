# 贡献指南

感谢你对 Choice Sandbox 的兴趣！这个项目靠社区贡献场景来成长。

## 贡献新场景（最需要的贡献）

你不需要会写代码，只需要有一份好的人生洞察。

### 第 1 步：选一个好题材

好的场景题材有这些特点：
- **高频纠结** — 很多人都遇到过（如：要不要考研、要不要分手、要不要回老家）
- **没有标准答案** — 不是对错题，是价值观题
- **可以拆成 4 条路** — 从完全不动到全力投入，有清晰的梯度

### 第 2 步：复制模板

复制 `src/data/scenarios/scenario-template.ts`，重命名为你的场景 ID：

```
src/data/scenarios/scenario-template.ts  →  src/data/scenarios/your-scenario-id.ts
```

文件名用英文、连字符分隔，如 `big-city-or-hometown.ts`。

### 第 3 步：填写内容

打开模板，按注释提示填写每个字段。写作要点：

| 原则 | 说明 |
|------|------|
| **用"你"说话** | 像朋友聊天，不要像专家讲课 |
| **写真实的事** | timeline 里写真实会发生的事，不要鸡汤 |
| **写刺痛的瞬间** | regretMoment 要具体，不要"会后悔" |
| **写可验证的条件** | flipConditions 写具体的条件，不要抽象道理 |
| **覆盖完整光谱** | 4 条路从"完全不动"到"全力投入" |

### 第 4 步：自检清单

提交前确认：

- [ ] 4 条路线 ID 分别是 A、B、C、D
- [ ] 每条路线的 timeline 都有 start/threeMonths/sixMonths/oneYear
- [ ] comparison.dimensions 的 scores 覆盖了全部 4 个路线 ID
- [ ] conditionChange.impacts 覆盖了全部 4 个路线 ID
- [ ] defaultSelectedRouteIds 选了最容易纠结的 2 条
- [ ] 最多只有 1 条路线有 branch（关键小分叉）
- [ ] 文件能通过 TypeScript 类型检查（`pnpm build` 不报错）

### 第 5 步：提交 PR

1. Fork 本仓库
2. 创建分支：`git checkout -b scenario/your-scenario-id`
3. 把你的场景文件放到 `src/data/scenarios/` 目录
4. 提交 PR，标题格式：`feat: add scenario "你的场景标题"`

## 类型定义参考

场景的完整类型定义在 `src/types/scenario.ts`，包含以下接口：

- `Scenario` — 完整场景
- `Route` — 单条路线
- `Branch` — 关键小分叉（可选）
- `BranchOption` — 分叉选项
- `ComparisonDimension` — 对比维度
- `ConditionImpact` — 条件变化影响

## 其他贡献方式

- **Bug 反馈**：提 Issue，附上截图和复现步骤
- **体验建议**：提 Issue，描述你期望的交互和原因
- **代码贡献**：先提 Issue 讨论，确认方向后再写代码

## 开发环境

```bash
pnpm install    # 安装依赖
pnpm dev        # 启动开发服务器
pnpm build      # 类型检查 + 构建
pnpm test       # 运行测试
```
