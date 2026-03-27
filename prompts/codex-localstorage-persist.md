# 任务：给 useProgress.ts 添加 localStorage 持久化

## 背景
用户在 5 分钟体验流程中途刷新页面会丢失进度，需要用 localStorage 保存状态。

## 要改的文件
- `src/composables/useProgress.ts` — 添加持久化逻辑
- `src/composables/__tests__/useProgress.spec.ts` — 补充持久化相关测试

## 具体要求

### 1. 添加版本号常量
```ts
const STORAGE_KEY = 'choice-sandbox-progress'
const STORAGE_VERSION = 1
```

### 2. 存储格式
```ts
interface StoredProgress {
  version: number
  state: ProgressState
}
```

### 3. 读取逻辑（在 useProgress 函数开头）
- 从 `localStorage.getItem(STORAGE_KEY)` 读取
- JSON.parse 后检查 `version` 是否等于 `STORAGE_VERSION`
- 版本匹配 → 用存储的 state 作为初始值
- 版本不匹配或解析失败 → 清除旧数据，用默认初始值
- 整个读取包在 try-catch 里，任何错误都 fallback 到默认值

### 4. 写入逻辑
- 用 Vue 的 `watch` 监听 `state`（deep: true）
- 状态变化时写入 `localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, state: newVal }))`
- 写入也包在 try-catch 里（隐私模式下 localStorage 可能抛错）

### 5. reset 函数
- reset 时同时调用 `localStorage.removeItem(STORAGE_KEY)`

### 6. 测试要求（补到 useProgress.spec.ts）
- 测试：初始化时从 localStorage 恢复状态
- 测试：状态变化后 localStorage 被更新
- 测试：版本号不匹配时清除旧数据，用默认值
- 测试：localStorage 数据损坏（非法 JSON）时 fallback 到默认值
- 测试：reset 后 localStorage 被清除
- 注意：测试环境用 happy-dom，localStorage 可用，每个测试前 `localStorage.clear()`

## 注意事项
- 不要改 ProgressState 接口和 STEPS 常量
- 不要改现有函数的对外签名
- 不要添加新的导出（StoredProgress 不需要导出）
- 代码注释用中文
