import { ref, computed } from 'vue'

// 用户进度状态
export interface ProgressState {
  currentStep: number              // 当前在第几屏（0-based，最大 5，共 6 屏）
  selectedRouteIds: [string, string] | null  // 用户选的 2 条路线 ID
  branchChoice: 'A' | 'B' | null   // 小分叉选了哪个
  viewedRoutes: string[]           // 已经看过详情的路线 ID
}

// 屏幕步骤枚举
export const STEPS = {
  INTRO: 0,
  INSIGHT_BRIDGE: 1,
  ROUTES_OVERVIEW: 2,
  ROUTE_DETAIL_1: 3,
  ROUTE_DETAIL_2: 4,
  BRANCH_CHOICE: 5,
  COMPARE: 6,
  RESULT: 7,
} as const

export function useProgress() {
  const state = ref<ProgressState>({
    currentStep: 0,
    selectedRouteIds: null,
    branchChoice: null,
    viewedRoutes: [],
  })

  const currentStep = computed(() => state.value.currentStep)
  const selectedRouteIds = computed(() => state.value.selectedRouteIds)
  const branchChoice = computed(() => state.value.branchChoice)
  const viewedRoutes = computed(() => state.value.viewedRoutes)

  function nextStep() {
    if (state.value.currentStep < STEPS.RESULT) {
      state.value.currentStep++
    }
  }

  function goToStep(step: number) {
    if (step >= 0 && step <= STEPS.RESULT) {
      state.value.currentStep = step
    }
  }

  function selectRoutes(ids: [string, string]) {
    // 不能选重复路线
    if (ids[0] === ids[1]) return
    state.value.selectedRouteIds = ids
  }

  function chooseBranch(choice: 'A' | 'B') {
    state.value.branchChoice = choice
  }

  function markRouteViewed(routeId: string) {
    if (!state.value.viewedRoutes.includes(routeId)) {
      state.value.viewedRoutes.push(routeId)
    }
  }

  function reset() {
    state.value = {
      currentStep: 0,
      selectedRouteIds: null,
      branchChoice: null,
      viewedRoutes: [],
    }
  }

  return {
    state,
    currentStep,
    selectedRouteIds,
    branchChoice,
    viewedRoutes,
    nextStep,
    goToStep,
    selectRoutes,
    chooseBranch,
    markRouteViewed,
    reset,
  }
}
