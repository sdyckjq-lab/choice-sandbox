import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'choice-sandbox-progress'
const STORAGE_VERSION = 1

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

interface StoredProgress {
  version: number
  state: ProgressState
}

function createDefaultState(): ProgressState {
  return {
    currentStep: 0,
    selectedRouteIds: null,
    branchChoice: null,
    viewedRoutes: [],
  }
}

function readInitialState(): ProgressState {
  const defaultState = createDefaultState()

  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return defaultState
    }

    const stored = JSON.parse(raw) as StoredProgress

    if (stored.version !== STORAGE_VERSION) {
      clearStoredState()
      return defaultState
    }

    return stored.state
  }
  catch {
    clearStoredState()
    return defaultState
  }
}

function clearStoredState() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  }
  catch {
    // 忽略 localStorage 不可用或不可写的情况
  }
}

function persistState(state: ProgressState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: STORAGE_VERSION,
      state,
    } satisfies StoredProgress))
  }
  catch {
    // 忽略 localStorage 不可用或不可写的情况
  }
}

export function useProgress() {
  const state = ref<ProgressState>(readInitialState())
  let skipNextPersist = false

  const currentStep = computed(() => state.value.currentStep)
  const selectedRouteIds = computed(() => state.value.selectedRouteIds)
  const branchChoice = computed(() => state.value.branchChoice)
  const viewedRoutes = computed(() => state.value.viewedRoutes)

  watch(state, (newValue) => {
    if (skipNextPersist) {
      skipNextPersist = false
      return
    }

    persistState(newValue)
  }, { deep: true })

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
    skipNextPersist = true
    state.value = createDefaultState()
    clearStoredState()
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
