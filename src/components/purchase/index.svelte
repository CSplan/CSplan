<script lang="ts">
  import purchaseState from './state'
  import PlanType from './steps/plan-type.svelte'
  import type { Step } from './state'
  import { browser } from '$app/env'
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import TaxLocation from './steps/tax-location.svelte'

  let currentStep: Step
  $: currentStep = $purchaseState.steps[$purchaseState.currentStep]
  $: if (browser) {
    // Display step using query param
    const params = new URLSearchParams($page.url.search)
    if (params.get('step') !== currentStep.id) {
      params.set('step', currentStep.id)
      goto(`?${params}`)
    }
  }
</script>

{#if currentStep.id === 'plan_type'}
  <PlanType/>
{:else if currentStep.id === 'billing_zip'}
  <TaxLocation/>
{/if}
