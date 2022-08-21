<script lang="ts">
  import purchaseState from './state'
  import stripeCID from '$stores/stripe/customer-id'
  import stripeInvoice from '$stores/stripe/invoice'
  import stripeSubscription from '$stores/stripe/subscription'
  import type { Step } from './state'
  import { browser } from '$app/env'
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  // Steps
  import PlanType from './steps/plan-type.svelte'
  import BillingZIP from './steps/billing-zip.svelte'
  import Confirm from './steps/confirm.svelte'
  import Pay from './steps/pay-stripe.svelte'

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

  onMount(async () => {
    await stripeCID.init()
    await Promise.all([stripeSubscription.init(), stripeInvoice.init()])
  })
</script>

{#if currentStep.id === 'plan_type'}
  <PlanType/>
{:else if currentStep.id === 'billing_zip'}
  <BillingZIP/>
{:else if currentStep.id === 'confirm'}
  <Confirm/>
{:else if currentStep.id === 'pay'}
  <Pay/>
{/if}
