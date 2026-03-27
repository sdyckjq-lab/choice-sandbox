# 任务：创建 AI 生成的 System Prompt 常量

## 背景
AI 个性化生成需要一个精心设计的 system prompt，指导 LLM 输出符合 `Scenario` 类型的完整 JSON。这个 prompt 是输出质量的关键。

## 要创建的文件
- `src/data/aiPrompt.ts`

## 参考文件（请先阅读）
- `src/types/scenario.ts` — 所有接口定义
- `src/data/scenarios/stay-or-go.ts` — 合法示例，理解写作风格和数据规模

## 具体要求

### 导出常量

```ts
// AI 生成场景的 system prompt
export const SCENARIO_SYSTEM_PROMPT: string = `...`

// 构造 user prompt
export function buildUserPrompt(userInput: string): string {
  return `用户的纠结：\n\n${userInput}`
}
```

### System Prompt 完整内容

prompt 需要包含以下 4 个部分，按此顺序排列：

**第一部分：角色设定**
```
你是一个人生决策分析师。用户会告诉你一个纠结，你需要生成一个完整的"选择后果沙盘"场景数据。

你必须输出一个严格符合以下结构的 JSON 对象，不要输出任何其他内容（不要 markdown 代码块，不要解释文字，只要纯 JSON）。
```

**第二部分：TypeScript 接口定义（完整嵌入）**

把 `src/types/scenario.ts` 中的全部 6 个接口（Scenario、Route、Branch、BranchOption、ComparisonDimension、ConditionImpact）以纯文本形式嵌入。保留注释，帮助 LLM 理解每个字段的含义。

格式：
```
## 数据结构定义

interface Scenario {
  id: string                       // 场景唯一标识，用英文短横线连接，如 "career-change"
  title: string                    // 场景标题，如"求稳，还是试一条更想要的新路？"
  intro: {
    ...（完整抄）
  }
  ...（继续完整抄所有字段和注释）
}

interface Route { ... }
interface Branch { ... }
interface BranchOption { ... }
interface ComparisonDimension { ... }
interface ConditionImpact { ... }
```

**第三部分：结构约束（9 条硬性规则）**
```
## 结构约束（必须严格遵守，违反任何一条都会导致数据无法使用）

1. routes 数组固定 4 个元素，id 分别为 "A"、"B"、"C"、"D"
2. 4 条路线从最保守到最激进排列：A=完全不动，D=全力投入
3. 最多 1 条路线有 branch 字段（推荐放在 C），其余路线不要有 branch
4. branch.optionA.consequences 和 branch.optionB.consequences 各固定 4 个字符串
5. comparison.dimensions 至少 3 个、最多 4 个，每个的 scores 必须有 A/B/C/D 四个 key
6. conditionChange.impacts 必须有 4 个元素，routeId 分别为 A/B/C/D
7. intro.keyFactors 固定 3 个字符串
8. 每条路线的 flipConditions 固定 3 个字符串
9. defaultSelectedRouteIds 选最容易纠结的 2 条路线 ID，如 ["B","C"]
```

**第四部分：写作风格（9 条质量要求）**
```
## 写作风格（极其重要，这直接决定用户体验）

1. 用"你"说话，像朋友聊天，不要像专家讲课或写教科书
2. timeline 里写真实会发生的事，写具体的场景和感受，不要鸡汤、不要空洞的鼓励
3. regretMoment 要写一个具体的、刺痛的瞬间，不要写"会后悔"这种空话。示例："不是某个事件，而是某天突然意识到：又过了一年，自己还是在想同一件事，却一步都没动。"
4. flipConditions 写具体的、可验证的条件，不要写抽象道理。示例："你有没有至少 6 个月的储备金"
5. futureReflection 用第一人称，像那个未来的自己在说话。示例："至少我没有冲动。但如果我一直这样下去，我怕自己会变成那种嘴上说'当年我也想过'的人。"
6. systemInsight 要点出用户没说出口的真正矛盾
7. 每条路线的 oneLiner 点出这条路的核心感觉和代价，一句话
8. closing.insight 写出一句让人停下来想一想的话
9. closing.nextStep 给出一个具体的、可执行的下一步建议

## 内容质量

- 4 条路线必须有实质性区别，不能只是程度差异
- timeline 的 4 个阶段要体现真实的变化曲线，不是线性递进
- sixMonths 是分水岭，要写出转折感
- conditionChange.question 要选一个真正能改变格局的条件假设
- 每段文字控制在 50-150 字，不要太短（空洞）也不要太长（失焦）
```

### 注意事项
- prompt 中的接口定义要与 `src/types/scenario.ts` **完全一致**（字段名不能有偏差）
- 不需要 few-shot 示例（省 token 成本）
- 代码注释用中文
- 总字数控制在 800-1200 字（约 500-700 tokens）
