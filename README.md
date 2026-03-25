# 选择后果沙盘 / Choice Sandbox

一个可交互的网页体验：输入你的纠结，试走几条路，看看半年后的自己会怎样。

An interactive web experience: explore different life paths before you commit to one.

## 它是什么

面对"要不要换工作""要不要试新方向"这类选择时，大多数人脑子里有几条路但缠在一起。

选择后果沙盘把这些路线拆开，让你像看一部关于自己未来的短片一样，一条一条走过去，在关键节点亲手做选择，看结果怎么变。

不是冷分析，不是鸡汤，是"让你提前试走几条现实里真的会选的路"。

## 体验流程（5 分钟）

1. 看到你的纠结被精准点出
2. 4 条路线里选 2 条最纠结的
3. 看每条路线从现在到一年后会怎么展开
4. 在关键分叉亲手做一个选择
5. 并排对比，看清差别
6. 拿到一张可分享的结果卡

## 在线体验

部署后链接会放在这里。

https://sdyckjq-lab.github.io/choice-sandbox/

## 本地运行

```bash
# 克隆仓库
git clone https://github.com/sdyckjq-lab/choice-sandbox.git
cd choice-sandbox

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test

# 构建
pnpm build
```

需要 Node.js 20+ 和 pnpm 10+。

## 技术栈

- Vue 3 (Composition API) + TypeScript
- Tailwind CSS 4
- Vite
- Vitest + @vue/test-utils
- GitHub Pages 自动部署

## 项目结构

```
src/
├── components/          # 6 个页面组件 + UI 组件
├── composables/         # 状态管理（useProgress、useScenario、useShareCard）
├── data/scenarios/      # 场景数据（目前只有"求稳还是试新路"）
├── types/               # TypeScript 类型定义
└── styles/              # 过渡动画
```

## 贡献新场景

这个项目最需要的贡献是新场景。如果你有一个很多人都会纠结的选择题，欢迎提交。

详见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 许可证

[MIT](./LICENSE)

---

# Choice Sandbox (English)

An interactive web experience that lets you walk through different life paths before making a decision.

## What It Does

When facing choices like "should I switch careers" or "should I try something new", most people have several paths tangled in their head.

Choice Sandbox untangles them. You pick two paths, watch each one unfold from now to one year later, make a key decision at a fork, and compare the outcomes side by side.

## Run Locally

```bash
git clone https://github.com/sdyckjq-lab/choice-sandbox.git
cd choice-sandbox
pnpm install
pnpm dev
```

Requires Node.js 20+ and pnpm 10+.

## Contributing

The project needs more scenarios. If you have a common life dilemma that many people face, see [CONTRIBUTING.md](./CONTRIBUTING.md) for how to add it.

## License

[MIT](./LICENSE)
