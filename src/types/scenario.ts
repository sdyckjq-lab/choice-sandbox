// 一个完整场景的数据结构
export interface Scenario {
  id: string                       // 场景唯一标识
  title: string                    // 场景标题，如"求稳，还是试一条更想要的新路？"
  intro: {
    userVoice: string              // 用户的原话/纠结描述
    systemInsight: string          // 系统点出的真正矛盾
    keyFactors: string[]           // 真正影响这件事的关键因素
  }
  routes: Route[]                  // 4 条主路线
  defaultSelectedRouteIds: [string, string]  // 默认推荐展开的 2 条路线 ID
  comparison: {
    dimensions: ComparisonDimension[]  // 对比维度
    keyContrast: string            // 一句最关键的对比
  }
  conditionChange: {
    question: string               // "如果我已经有 12 个月储备金呢？"
    impacts: ConditionImpact[]     // 每条路线受到的影响
    reminder: string               // 一句提醒
  }
  closing: {
    insight: string                // 收口洞察
    nextStep: string               // 最值得先验证的事
  }
}

// 单条路线
export interface Route {
  id: string
  name: string                     // 如"继续留在原路，先不动"
  oneLiner: string                 // 一句话感觉
  timeline: {
    start: string                  // 它会怎么开始
    threeMonths: string            // 3 个月后
    sixMonths: string              // 半年后（分水岭）
    oneYear: string                // 1 年后
  }
  regretMoment: string             // 最容易后悔的瞬间
  flipConditions: string[]         // 哪些条件一变，这条路就翻盘
  futureReflection: string         // 如果未来的你回头看今天
  branch?: Branch                  // 可选：关键小分叉（只有 1 条路线有）
}

// 关键小分叉
export interface Branch {
  question: string                 // "你准备怎么试？"
  optionA: BranchOption
  optionB: BranchOption
  insight: string                  // 这一按最有价值的地方
}

export interface BranchOption {
  label: string                    // "不打乱现在节奏，晚上和周末慢慢试"
  feeling: string                  // 一句感觉
  consequences: string[]           // 这条线会变成什么
}

// 对比维度（动态匹配用户选的两条路线）
export interface ComparisonDimension {
  label: string                    // 如"哪条最稳"
  scores: Record<string, string>   // key 为 routeId，value 为该路线在此维度的表现
}

// 条件变化影响
export interface ConditionImpact {
  routeId: string
  change: string                   // 这条路线会怎么变
}
