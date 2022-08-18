<script lang="ts">
  import purchaseState from '../state'
  import countryCodes from '../data/country-codes'
  import stripe from '$stores/stripe/customer-id'
  import { FormStates as States } from '$lib'
  import Spinner from '$components/spinner.svelte'

  const codes = Object.keys(countryCodes) as (keyof typeof countryCodes)[]

  let state = States.Resting
  let message = ''

  let billingCountry = purchaseState.initialValue.billingCountry
  $: zipNeeded = billingCountry === 'US' || billingCountry === 'CA'
  let billingZIP = purchaseState.initialValue.billingZIP

  async function submit(): Promise<void> {
    message = ''
    state = States.Saving
    try {
      await stripe.create({
        country: billingCountry,
        postalCode: billingZIP
      })
    } catch (err) {
      state = States.Errored
      message = err instanceof Error ? err.message : `${err}`
      return
    }
    message = 'Successfully registered billing country/ZIP with Stripe'
    state = States.Saved
    purchaseState.update((store) => {
      store.maxStep++
      store.currentStep++
      store.minStep = store.maxStep
      return store
    })
  }
</script>

<form class="primary" on:submit|preventDefault={submit}>
  <h2>Billing Country/ZIP</h2>
  <label>
    <span>Country</span>
    <select bind:value={billingCountry}>
      {#each codes as code}
        <option value={code}>{countryCodes[code]}</option>
      {/each}
    </select>
  </label>

  {#if zipNeeded}
    <label>
      <span>ZIP Code</span>
      <input type="text" bind:value={billingZIP} pattern="[0-9]{'{5}'}" placeholder="22209" required>
    </label>
  {/if}

  <label class="checkable disclaimer-text">
    <input type="checkbox" required>
    <span class="checkable">
      I consent to my country and/or ZIP code being sent to Stripe, Inc. to calculate sales tax/VAT where applicable, as described in <a href="/info/payment-policy">CSplan's payment policy</a>.
    </span>
  </label>

  <input type="submit" value="Save" disabled={[States.Saving, States.Saved].includes(state)}>
  <Spinner {state} {message}/>
</form>

<style lang="scss">
  @import '../../../scss/forms.scss';
  form {
    @include form-styles();
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 320px;
    padding: $padding-m;
    border: 1px solid $border-normal;
  }
  h2 {
    border-bottom: 2px solid $border-alt;
    padding: 0.5rem 0;
    width: 100%;
    text-align: center;
    margin-bottom: 0.6rem;
    line-height: 1.5;
  }
  .disclaimer-text {
    margin-top: 0.3rem !important;
    margin-bottom: 0.3rem !important;
    font-size: 75%;
    line-height: 1.25;
  }
</style>