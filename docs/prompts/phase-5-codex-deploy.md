# 阶段 5：GitHub Pages 自动部署（Codex）

生成时间：2026-03-25
状态：待执行
负责工具：Codex

---

## 你的任务

配置 GitHub Actions，让项目 push 到 main 分支后自动构建并部署到 GitHub Pages。

## 验收标准

1. `.github/workflows/deploy.yml` 文件存在且语法正确
2. `vite.config.ts` 配置了正确的 `base` 路径
3. `pnpm build` 仍然零错误
4. `pnpm test` 仍然全部通过

---

## 项目信息

- 构建工具：Vite
- 包管理器：pnpm
- 构建命令：`pnpm build`
- 构建输出目录：`dist/`
- Node 版本：用 20
- pnpm 版本：用 10

---

## 你需要创建/修改的文件

### 1. 创建 .github/workflows/deploy.yml

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 2. 修改 vite.config.ts

当前内容：

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
})
```

加上 `base` 配置。GitHub Pages 部署到 `https://<user>.github.io/<repo>/` 时需要设置 base 路径。用环境变量判断：

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/头脑风暴/' : '/',
  plugins: [vue(), tailwindcss()],
})
```

注意：仓库名是中文"头脑风暴"，base 路径需要匹配。如果后续仓库改名为英文（如 choice-sandbox），这里也要改。

---

## 注意事项

1. 只创建 deploy.yml 和修改 vite.config.ts，不动其他文件
2. `pnpm build` 和 `pnpm test` 都要通过
3. deploy.yml 用 `actions/deploy-pages@v4`（新版 Pages 部署方式），不用旧的 `gh-pages` 分支方式
