# 任务：创建 validateScenario 运行时校验函数 + 测试

## 背景
AI 生成的场景数据是一个 JSON 对象，需要在运行时校验它是否完全符合 `Scenario` 类型定义。这个校验函数是 AI 个性化生成功能的安全网——即使 AI 输出了不完整的数据，也能在前端捕获并给出明确错误。

## 要创建的文件
- `src/utils/validateScenario.ts` — 校验函数
- `src/utils/__tests__/validateScenario.spec.ts` — 测试

## 参考文件（请先阅读）
- `src/types/scenario.ts` — 完整的类型定义
- `src/data/scenarios/stay-or-go.ts` — 一个合法的 Scenario 实例（用于理解数据规模）

## 具体要求

### 1. 函数签名

```ts
// 校验 AI 生成的数据是否符合 Scenario 接口
// 返回校验结果：成功返回类型安全的 Scenario，失败返回错误列表
export function validateScenario(data: unknown): ValidateResult

export type ValidateResult =
  | { valid: true; scenario: Scenario }
  | { valid: false; errors: string[] }
```

### 2. 校验规则（逐层检查，收集所有错误而非遇到第一个就停）

**顶层字段：**
- `id` — 非空字符串
- `title` — 非空字符串

**intro：**
- `intro.userVoice` — 非空字符串
- `intro.systemInsight` — 非空字符串
- `intro.keyFactors` — 数组，长度 === 3，每个元素是非空字符串

**routes：**
- `routes` — 数组，长度 === 4
- 每条路线的 `id` 必须分别是 `'A'`、`'B'`、`'C'`、`'D'`（顺序无关，但 4 个都要有）
- 每条路线必须有：`name`(非空字符串)、`oneLiner`(非空字符串)
- 每条路线的 `timeline` 必须有：`start`、`threeMonths`、`sixMonths`、`oneYear`（都是非空字符串）
- 每条路线必须有：`regretMoment`(非空字符串)、`futureReflection`(非空字符串)
- 每条路线的 `flipConditions` — 数组，长度 === 3，每个元素是非空字符串
- `branch` 是可选的，但**最多只有 1 条路线**可以有 `branch`

**branch（如果存在）：**
- `branch.question` — 非空字符串
- `branch.optionA` 和 `branch.optionB` 各自必须有：
  - `label` — 非空字符串
  - `feeling` — 非空字符串
  - `consequences` — 数组，长度 === 4，每个元素是非空字符串
- `branch.insight` — 非空字符串

**defaultSelectedRouteIds：**
- 长度 === 2 的数组
- 两个值必须是路线 ID 之一（'A'/'B'/'C'/'D'），且不能重复

**comparison：**
- `comparison.dimensions` — 数组，长度 >= 3 且 <= 4
- 每个维度的 `label` — 非空字符串
- 每个维度的 `scores` — 必须有 4 个 key（'A'、'B'、'C'、'D'），每个 value 是非空字符串
- `comparison.keyContrast` — 非空字符串

**conditionChange：**
- `conditionChange.question` — 非空字符串
- `conditionChange.impacts` — 数组，长度 === 4
- 每个 impact 的 `routeId` 必须覆盖 'A'、'B'、'C'、'D'（不能缺、不能重复）
- 每个 impact 的 `change` — 非空字符串
- `conditionChange.reminder` — 非空字符串

**closing：**
- `closing.insight` — 非空字符串
- `closing.nextStep` — 非空字符串

### 3. 实现提示
- 传入 `null`、`undefined`、非对象 → 直接返回 `{ valid: false, errors: ['输入不是一个对象'] }`
- 错误信息用中文，格式如：`'routes[2] 缺少 timeline.sixMonths'`、`'最多只能有 1 条路线有 branch，但发现了 2 条'`
- 不要引入 zod、ajv 等库，纯手写
- 可以写辅助函数（如 `isNonEmptyString`）来减少重复

### 4. 测试要求

用 vitest 写测试，文件放在 `src/utils/__tests__/validateScenario.spec.ts`。

**测试用例：**
1. 传入完整合法的 Scenario 对象 → `{ valid: true, scenario: ... }`（可以直接 import `stayOrGo` 做测试数据）
2. 传入 `null` → `{ valid: false, errors: ['输入不是一个对象'] }`
3. 传入 `undefined` → 同上
4. 传入 `42`（非对象） → 同上
5. 缺少 `id` 字段 → errors 包含相关错误
6. 缺少 `routes` → errors 包含相关错误
7. `routes` 长度不是 4 → errors 包含相关错误
8. routes id 不覆盖 A/B/C/D → errors 包含相关错误
9. 多于 1 条路线有 branch → errors 包含相关错误
10. `comparison.dimensions[0].scores` 缺少某个 routeId → errors 包含相关错误
11. `conditionChange.impacts` 长度不是 4 → errors 包含相关错误
12. `conditionChange.impacts` 的 routeId 不覆盖 A/B/C/D → errors 包含相关错误
13. `intro.keyFactors` 长度不是 3 → errors 包含相关错误
14. `routes[0].flipConditions` 长度不是 3 → errors 包含相关错误
15. `defaultSelectedRouteIds` 包含非法 ID → errors 包含相关错误

**测试辅助：** 可以写一个 `createValidScenario()` 工厂函数（深拷贝 `stayOrGo`），然后在每个测试中删除/修改特定字段来构造异常数据。

## 注意事项
- 不要改 `src/types/scenario.ts`
- 不要添加新的 npm 依赖
- 代码注释用中文
- 导出 `validateScenario` 和 `ValidateResult` 类型
