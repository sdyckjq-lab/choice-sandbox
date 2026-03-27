import { describe, expect, it } from 'vitest'
import scenarioTypeSource from '../../types/scenario.ts?raw'
import { buildUserPrompt, SCENARIO_SYSTEM_PROMPT } from '../aiPrompt'

const expectedInterfaceDefinitions = scenarioTypeSource
  .trim()
  .replace(/^export /gm, '')

describe('aiPrompt', () => {
  it('把 scenario.ts 的接口定义原样嵌入到 system prompt 中', () => {
    expect(SCENARIO_SYSTEM_PROMPT).toContain(
      `## 数据结构定义\n\n${expectedInterfaceDefinitions}`,
    )
  })

  it('保留结构约束和写作风格要求', () => {
    expect(SCENARIO_SYSTEM_PROMPT).toContain('## 结构约束（必须严格遵守，违反任何一条都会导致数据无法使用）')
    expect(SCENARIO_SYSTEM_PROMPT).toContain('## 写作风格（极其重要，这直接决定用户体验）')
    expect(SCENARIO_SYSTEM_PROMPT).toContain('## 内容质量')
  })

  it('按要求构造 user prompt', () => {
    expect(buildUserPrompt('我要不要换工作')).toBe('用户的纠结：\n\n我要不要换工作')
  })
})
