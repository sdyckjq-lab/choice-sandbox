<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useProgress, STEPS } from './composables/useProgress'
import { useAIGeneration } from './composables/useAIGeneration'
import { useScenario } from './composables/useScenario'
import { stayOrGo } from './data/scenarios/stay-or-go'

// Components
import ProgressBar from './components/ui/ProgressBar.vue'
import AISettingsOverlay from './components/AISettingsOverlay.vue'
import AIInputScreen from './components/AIInputScreen.vue'
import AIGeneratingScreen from './components/AIGeneratingScreen.vue'
import IntroScreen from './components/IntroScreen.vue'
import InsightBridge from './components/InsightBridge.vue'
import RoutesOverview from './components/RoutesOverview.vue'
import RouteDetail from './components/RouteDetail.vue'
import BranchChoice from './components/BranchChoice.vue'
import CompareView from './components/CompareView.vue'
import ResultCard from './components/ResultCard.vue'

const {
  currentStep,
  selectedRouteIds,
  branchChoice,
  nextStep,
  selectRoutes,
  chooseBranch,
  reset: resetProgress
} = useProgress()

const aiGen = useAIGeneration()
const restoredAIScenario = ref(aiGen.restoreLastScenario())
const useAIScenario = ref(currentStep.value !== STEPS.INTRO && restoredAIScenario.value !== null)
const settingsReturnTarget = ref<'idle' | 'inputting'>('idle')

const activeScenario = computed(() => {
  if (aiGen.generatedScenario.value) {
    return aiGen.generatedScenario.value
  }

  if (useAIScenario.value && restoredAIScenario.value) {
    return restoredAIScenario.value
  }

  return stayOrGo
})

const {
  scenario,
  getSelectedRoutes,
  getFilteredDimensions,
  hasBranch,
  getBranchRoute
} = useScenario(activeScenario)

// Computed for current step components
const selectedRoutesData = computed(() => {
  if (!selectedRouteIds.value) return null
  return getSelectedRoutes(selectedRouteIds.value as [string, string])
})

const branchRouteInfo = computed(() => {
  if (!selectedRouteIds.value) return null
  return getBranchRoute(selectedRouteIds.value as [string, string])
})

// Skip branch logic
watch(currentStep, (newStep) => {
  if (newStep === STEPS.BRANCH_CHOICE) {
    if (!selectedRouteIds.value || !hasBranch(selectedRouteIds.value as [string, string])) {
      nextStep()
    }
  }
})

watch(() => aiGen.status.value, (newStatus) => {
  if (newStatus === 'success' && aiGen.generatedScenario.value) {
    restoredAIScenario.value = aiGen.generatedScenario.value
    useAIScenario.value = true
    resetProgress()
    nextStep()
    aiGen.reset()
  }
})

const handleExampleStart = () => {
  useAIScenario.value = false
  nextStep()
}

const handleAIStart = () => {
  useAIScenario.value = true
  settingsReturnTarget.value = 'idle'
  aiGen.startAIFlow()
}

const handleOpenSettings = (fromInput = false) => {
  settingsReturnTarget.value = fromInput ? 'inputting' : 'idle'
  aiGen.openSettings()
}

const handleCloseSettings = () => {
  if (settingsReturnTarget.value === 'inputting' && aiGen.isConfigured.value) {
    aiGen.startAIFlow()
    return
  }

  aiGen.reset()
}

const handleFallbackToExample = () => {
  useAIScenario.value = false
  aiGen.reset()
}

const handleRoutesSelected = (ids: [string, string]) => {
  selectRoutes(ids)
  nextStep()
}
</script>

<template>
  <div class="bg-[#0a0f1a] min-h-screen text-[#f1f5f9] font-sans antialiased overflow-x-hidden relative">
    <AISettingsOverlay
      v-if="aiGen.status.value === 'configuring'"
      :config="aiGen.config.value"
      @save="aiGen.saveConfig"
      @close="handleCloseSettings"
    />

    <AIInputScreen
      v-else-if="aiGen.status.value === 'inputting'"
      :initial-input="aiGen.userInput.value"
      @submit="aiGen.submitInput"
      @back="aiGen.reset"
      @settings="handleOpenSettings(true)"
    />

    <AIGeneratingScreen
      v-else-if="aiGen.status.value === 'generating' || aiGen.status.value === 'error'"
      :status="aiGen.status.value as 'generating' | 'error'"
      :error="aiGen.error.value"
      @cancel="aiGen.cancelGeneration"
      @retry="aiGen.retry"
      @fallback="handleFallbackToExample"
    />

    <template v-else>
      <ProgressBar
        v-if="currentStep !== STEPS.INTRO && currentStep !== STEPS.RESULT"
        :current-step="currentStep"
        :total-steps="8"
      />

      <Transition name="fade" mode="out-in">
        <IntroScreen
          v-if="currentStep === STEPS.INTRO"
          @next="handleExampleStart"
          @ai="handleAIStart"
          @settings="handleOpenSettings()"
        />

        <InsightBridge
          v-else-if="currentStep === STEPS.INSIGHT_BRIDGE"
          :intro="scenario.intro"
          @next="nextStep"
        />

        <RoutesOverview
          v-else-if="currentStep === STEPS.ROUTES_OVERVIEW"
          :routes="scenario.routes"
          :default-selected-route-ids="scenario.defaultSelectedRouteIds"
          @select="handleRoutesSelected"
        />

        <RouteDetail
          v-else-if="currentStep === STEPS.ROUTE_DETAIL_1 && selectedRoutesData"
          key="route-detail-1"
          :route="selectedRoutesData[0]"
          :is-second="false"
          button-text="看下一条路"
          @next="nextStep"
        />

        <RouteDetail
          v-else-if="currentStep === STEPS.ROUTE_DETAIL_2 && selectedRoutesData"
          key="route-detail-2"
          :route="selectedRoutesData[1]"
          :is-second="true"
          button-text="继续"
          @next="nextStep"
        />

        <BranchChoice
          v-else-if="currentStep === STEPS.BRANCH_CHOICE && branchRouteInfo?.branch"
          :branch="branchRouteInfo.branch"
          @choose="chooseBranch"
          @next="nextStep"
        />

        <CompareView
          v-else-if="currentStep === STEPS.COMPARE && selectedRouteIds"
          :dimensions="getFilteredDimensions(selectedRouteIds as [string, string])"
          :key-contrast="scenario.comparison.keyContrast"
          :condition-change="scenario.conditionChange"
          :closing="scenario.closing"
          :selected-route-ids="selectedRouteIds as [string, string]"
          :routes="scenario.routes"
          @next="nextStep"
        />

        <ResultCard
          v-else-if="currentStep === STEPS.RESULT && selectedRoutesData"
          :title="scenario.title"
          :selected-routes="selectedRoutesData"
          :closing-insight="scenario.closing.insight"
          :branch-choice="branchChoice"
          @restart="resetProgress"
        />
      </Transition>
    </template>
  </div>
</template>
