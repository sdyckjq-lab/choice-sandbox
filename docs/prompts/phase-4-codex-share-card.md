# 阶段 4：结果卡 Canvas 截图（Codex）

生成时间：2026-03-25
状态：待执行
负责工具：Codex

---

## 你的任务

实现 `src/composables/useShareCard.ts`，让用户点击"保存图片"按钮后，把 ResultCard 的卡片区域渲染成 PNG 并下载。同时修改 ResultCard.vue 接入这个功能。

## 验收标准

1. 点击"保存图片"按钮 → 下载一张 PNG 图片（文件名 `choice-sandbox-result.png`）
2. iOS Safari 等 Canvas 截图失败时，自动降级为提示用户截屏
3. `pnpm build` 零错误
4. 已有的 `pnpm test` 仍然全部通过

---

## 技术方案

用 `html2canvas` 库把 ResultCard 的卡片 DOM 节点渲染成 Canvas，再转为 PNG 下载。

安装依赖：
```bash
pnpm add html2canvas
```

---

## 你需要修改的文件

### 1. 改写 src/composables/useShareCard.ts

当前文件是空壳：

```typescript
// 结果卡生成（Canvas → 图片）
// 阶段 4 实现
export function useShareCard() {
  // TODO: 实现 Canvas 截图功能
  return {}
}
```

改写为：

```typescript
export function useShareCard() {
  // 接收一个 DOM 元素的 ref，返回：
  // - generating: Ref<boolean>     是否正在生成中
  // - failed: Ref<boolean>         Canvas 是否失败（用于降级提示）
  // - generateImage(el: HTMLElement): Promise<void>
  //     1. 设置 generating = true
  //     2. 用 html2canvas 渲染 el 为 canvas
  //     3. canvas.toDataURL('image/png') 转为图片
  //     4. 创建 <a> 标签触发下载，文件名 choice-sandbox-result.png
  //     5. 成功后 generating = false
  //     6. 失败时 generating = false, failed = true
}
```

html2canvas 配置要点：
- `backgroundColor: '#0a0f1a'`（匹配页面底色）
- `scale: 2`（高清截图，适配 Retina 屏）
- `useCORS: true`

### 2. 修改 src/components/ResultCard.vue

当前 ResultCard 的卡片区域（class 含 `aspect-[3/4]` 的 div）需要加一个 `ref`，供 useShareCard 定位截图区域。

需要改动的地方：

1. import useShareCard
2. 给卡片容器 div 加 `ref="cardRef"`
3. 把现有的"长按图片保存"提示区域改为：
   - 默认显示"保存图片"按钮
   - 点击后调用 `generateImage(cardRef)`
   - generating 为 true 时按钮显示"生成中…"并禁用
   - failed 为 true 时显示降级提示："截图功能暂不可用，请直接截屏分享"
4. 保留"尝试其他路线"按钮不变

当前 ResultCard 的 Action Area 部分：

```html
<!-- Action Area (outside of card) -->
<div class="text-center w-full max-w-[375px]">
  <p class="text-[14px] text-[#94a3b8] mb-6 flex items-center justify-center gap-2">
    <svg ...>...</svg>
    长按图片保存，或直接截屏
  </p>

  <button @click="emit('restart')" ...>
    尝试其他路线 ↺
  </button>
</div>
```

改为：

```html
<!-- Action Area (outside of card) -->
<div class="text-center w-full max-w-[375px]">
  <!-- 保存图片按钮 -->
  <button
    v-if="!failed"
    @click="handleSave"
    :disabled="generating"
    class="保存按钮样式，用 #d4a574 背景，和其他按钮风格一致"
  >
    {{ generating ? '生成中…' : '保存图片' }}
  </button>

  <!-- Canvas 失败降级提示 -->
  <p v-else class="text-[14px] text-[#94a3b8] mb-6">
    截图功能暂不可用，请直接截屏分享
  </p>

  <!-- 重新体验按钮保持不变 -->
  <button @click="emit('restart')" ...>
    尝试其他路线 ↺
  </button>
</div>
```

---

## 注意事项

1. 只安装 `html2canvas` 一个新依赖
2. 不要修改其他组件或 composable
3. 截图区域只包含卡片本身（`aspect-[3/4]` 的 div），不包含下方的按钮区
4. 下载文件名固定为 `choice-sandbox-result.png`
5. `pnpm build` 和 `pnpm test` 都要通过
