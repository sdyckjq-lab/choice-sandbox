<script setup lang="ts">
import { computed, watch } from 'vue'
import { useProgress, STEPS } from './composables/useProgress'
import { useScenario } from './composables/useScenario'
import { stayOrGo } from './data/scenarios/stay-or-go'

// Components
import ProgressBar from './components/ui/ProgressBar.vue'
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
  reset
} = useProgress()

const {
  scenario,
  getSelectedRoutes,
  getFilteredDimensions,
  hasBranch,
  getBranchRoute
} = useScenario(stayOrGo)

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

const handleRoutesSelected = (ids: [string, string]) => {
  selectRoutes(ids)
  nextStep()
}
</script>

<template>
  <div class="bg-[#0a0f1a] min-h-screen text-[#f1f5f9] font-sans antialiased overflow-x-hidden relative">
    
    <ProgressBar 
      v-if="currentStep !== STEPS.INTRO && currentStep !== STEPS.RESULT"
      :current-step="currentStep" 
      :total-steps="8" 
    />

    <Transition name="fade" mode="out-in">
      
      <IntroScreen 
        v-if="currentStep === STEPS.INTRO" 
        @next="nextStep" 
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
        @restart="reset"
      />

    </Transition>
  </div>
</template>
