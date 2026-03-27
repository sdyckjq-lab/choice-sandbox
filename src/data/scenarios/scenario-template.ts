import type { Scenario } from '../../types/scenario'

/**
 * 场景模板 — 复制此文件，填入你的场景数据
 *
 * 使用说明：
 * 1. 复制此文件，重命名为你的场景ID（如 `big-city-or-hometown.ts`）
 * 2. 按注释提示填写每个字段
 * 3. 导出变量名改为你的场景名（驼峰命名）
 * 4. 在 src/data/scenarios/ 目录下注册你的场景
 *
 * 写作要点：
 * - 用第二人称（"你"），像朋友聊天一样
 * - 每条路线的 timeline 要写真实会发生的事，不要鸡汤
 * - regretMoment 写最刺痛的那个瞬间，不要泛泛而谈
 * - flipConditions 写具体的、可验证的条件，不要抽象道理
 * - 4 条路线应该覆盖从"完全不动"到"全力投入"的完整光谱
 */
export const myScenario: Scenario = {
  // 场景唯一 ID（英文，用连字符分隔，如 'stay-or-go'）
  id: 'your-scenario-id',

  // 场景标题（一句话，带问号，如"求稳，还是试一条更想要的新路？"）
  title: '在这里写你的场景标题？',

  intro: {
    // 用户的原话 — 模拟一个真实用户会怎么描述这个纠结（2-4句话）
    userVoice: '在这里写用户的纠结描述...',

    // 系统洞察 — 点出用户没说出口的真正矛盾（1-2句话）
    systemInsight: '在这里写系统的洞察...',

    // 关键因素 — 真正影响这件事的 3 个核心变量
    keyFactors: [
      '因素1：具体的、可感知的',
      '因素2：具体的、可感知的',
      '因素3：具体的、可感知的',
    ],
  },

  // 4 条路线 — 从最保守到最激进排列
  routes: [
    {
      id: 'A',
      name: '路线A：最保守的选择',
      oneLiner: '一句话概括这条路的感觉和代价。',
      timeline: {
        start: '刚开始会怎样？（2-3句话）',
        threeMonths: '3个月后会怎样？（2-3句话）',
        sixMonths: '半年后会怎样？这是分水岭。（2-3句话）',
        oneYear: '1年后最可能的结果。（2-3句话）',
      },
      regretMoment: '最容易后悔的那个具体瞬间。',
      flipConditions: [
        '什么条件一变，这条路就会变好？',
        '什么条件一变，这条路就会变差？',
        '什么外部变化会让这条路翻盘？',
      ],
      futureReflection: '如果未来的你回头看今天，会说什么？（第一人称）',
    },
    {
      id: 'B',
      name: '路线B：稍微往前一步',
      oneLiner: '一句话概括。',
      timeline: {
        start: '...',
        threeMonths: '...',
        sixMonths: '...',
        oneYear: '...',
      },
      regretMoment: '...',
      flipConditions: ['...', '...', '...'],
      futureReflection: '...',
    },
    {
      id: 'C',
      name: '路线C：认真投入但留退路',
      oneLiner: '一句话概括。',
      timeline: {
        start: '...',
        threeMonths: '...',
        sixMonths: '...',
        oneYear: '...',
      },
      regretMoment: '...',
      flipConditions: ['...', '...', '...'],
      futureReflection: '...',
      // 可选：如果这条路线有一个关键小分叉，取消下面的注释并填写
      // branch: {
      //   question: '你准备怎么试？',
      //   optionA: {
      //     label: '选项A的名称',
      //     feeling: '一句话感觉',
      //     consequences: ['结果1', '结果2', '结果3', '结果4'],
      //   },
      //   optionB: {
      //     label: '选项B的名称',
      //     feeling: '一句话感觉',
      //     consequences: ['结果1', '结果2', '结果3', '结果4'],
      //   },
      //   insight: '这个分叉最有价值的发现是什么？',
      // },
    },
    {
      id: 'D',
      name: '路线D：最大胆的选择',
      oneLiner: '一句话概括。',
      timeline: {
        start: '...',
        threeMonths: '...',
        sixMonths: '...',
        oneYear: '...',
      },
      regretMoment: '...',
      flipConditions: ['...', '...', '...'],
      futureReflection: '...',
    },
  ],

  // 默认推荐展开的 2 条路线 ID（选用户最可能纠结的两条）
  defaultSelectedRouteIds: ['B', 'C'],

  comparison: {
    // 对比维度 — 至少 3 个，推荐 4 个
    // scores 的 key 必须对应上面 routes 的 id（A/B/C/D）
    dimensions: [
      {
        label: '维度1（如"哪条最稳"）',
        scores: {
          A: '路线A在此维度的表现',
          B: '路线B在此维度的表现',
          C: '路线C在此维度的表现',
          D: '路线D在此维度的表现',
        },
      },
      {
        label: '维度2（如"哪条最快见效"）',
        scores: { A: '...', B: '...', C: '...', D: '...' },
      },
      {
        label: '维度3（如"哪条最容易后悔"）',
        scores: { A: '...', B: '...', C: '...', D: '...' },
      },
      {
        label: '维度4（如"最适合什么样的人"）',
        scores: { A: '...', B: '...', C: '...', D: '...' },
      },
    ],
    // 一句最关键的对比（帮用户在最纠结的两条路之间做区分）
    keyContrast: '如果你最怕X，选这条；如果你最怕Y，选那条。',
  },

  conditionChange: {
    // 一个具体的条件变化假设（如"如果我已经有12个月储备金呢？"）
    question: '如果[某个具体条件变了]呢？',
    // 每条路线受到的影响
    impacts: [
      { routeId: 'A', change: '这条路会怎么变？' },
      { routeId: 'B', change: '这条路会怎么变？' },
      { routeId: 'C', change: '这条路会怎么变？' },
      { routeId: 'D', change: '这条路会怎么变？' },
    ],
    // 一句提醒
    reminder: '点出这个条件变化背后的真正启发。',
  },

  closing: {
    // 收口洞察 — 整个场景最重要的一句话
    insight: '你现在最缺的，不一定是X。更像是Y。',
    // 最值得先验证的事 — 给用户一个具体的下一步
    nextStep: '如果你现在还不想直接决定，最值得先做的一件事是...',
  },
}
