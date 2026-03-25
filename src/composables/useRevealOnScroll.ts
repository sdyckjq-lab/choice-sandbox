import { ref, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * 滚动揭示 composable
 * 监听多个元素，进入视口时触发 visible = true（单次触发）
 * 支持 prefers-reduced-motion：动画关闭时直接全部可见
 */
export function useRevealOnScroll(
  elementRefs: Ref<(HTMLElement | null)[]>,
  options: { threshold?: number } = {}
) {
  const { threshold = 0.3 } = options
  const visibleItems = ref<boolean[]>([])
  let observer: IntersectionObserver | null = null

  // 检测用户是否偏好减少动画
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  onMounted(() => {
    const count = elementRefs.value.length
    visibleItems.value = new Array(count).fill(false)

    // 减少动画模式：直接全部可见
    if (prefersReducedMotion()) {
      visibleItems.value = new Array(count).fill(true)
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = elementRefs.value.indexOf(entry.target as HTMLElement)
            if (index !== -1) {
              visibleItems.value[index] = true
              observer?.unobserve(entry.target)
            }
          }
        })
      },
      { threshold }
    )

    // 监听所有元素
    elementRefs.value.forEach((el) => {
      if (el) observer?.observe(el)
    })
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return { visibleItems }
}
