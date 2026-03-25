import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import ResultCard from '../ResultCard.vue'

const generateImageMock = vi.fn()
const generatingRef = ref(false)
const failedRef = ref(false)

vi.mock('../../composables/useShareCard', () => ({
  useShareCard: () => ({
    generating: generatingRef,
    failed: failedRef,
    generateImage: generateImageMock,
  }),
}))

describe('ResultCard', () => {
  const selectedRoutes = [
    {
      id: 'B',
      name: '留在原路，但低风险试水',
      oneLiner: '最稳，但也最容易拖。',
      timeline: {
        start: 'start',
        threeMonths: 'threeMonths',
        sixMonths: 'sixMonths',
        oneYear: 'oneYear',
      },
      regretMoment: 'regret',
      flipConditions: ['condition'],
      futureReflection: 'future',
    },
    {
      id: 'C',
      name: '保留退路，半切换',
      oneLiner: '最现实，也最容易累。',
      timeline: {
        start: 'start',
        threeMonths: 'threeMonths',
        sixMonths: 'sixMonths',
        oneYear: 'oneYear',
      },
      regretMoment: 'regret',
      flipConditions: ['condition'],
      futureReflection: 'future',
    },
  ]

  it('默认显示“保存图片”按钮，点击后把卡片区域交给 generateImage', async () => {
    generatingRef.value = false
    failedRef.value = false
    generateImageMock.mockReset()

    const wrapper = mount(ResultCard, {
      props: {
        title: '选择后果沙盘',
        selectedRoutes,
        closingInsight: '收口内容',
        branchChoice: null,
      },
    })

    const saveButton = wrapper.findAll('button').find((button) => button.text().includes('保存图片'))

    expect(saveButton?.exists()).toBe(true)

    await saveButton!.trigger('click')

    expect(generateImageMock).toHaveBeenCalledTimes(1)
    expect(generateImageMock.mock.calls[0]?.[0]).toBeInstanceOf(HTMLElement)
    expect(generateImageMock.mock.calls[0]?.[0]?.textContent).toContain('选择后果沙盘')
  })

  it('生成中时按钮显示“生成中…”并禁用', () => {
    generatingRef.value = true
    failedRef.value = false

    const wrapper = mount(ResultCard, {
      props: {
        title: '选择后果沙盘',
        selectedRoutes,
        closingInsight: '收口内容',
        branchChoice: null,
      },
    })

    const saveButton = wrapper.findAll('button').find((button) => button.text().includes('生成中…'))

    expect(saveButton?.attributes('disabled')).toBeDefined()
  })

  it('截图失败时显示降级提示，不再显示保存图片按钮', () => {
    generatingRef.value = false
    failedRef.value = true

    const wrapper = mount(ResultCard, {
      props: {
        title: '选择后果沙盘',
        selectedRoutes,
        closingInsight: '收口内容',
        branchChoice: null,
      },
    })

    expect(wrapper.text()).toContain('截图功能暂不可用，请直接截屏分享')
    expect(wrapper.findAll('button').some((button) => button.text().includes('保存图片'))).toBe(false)
  })
})
