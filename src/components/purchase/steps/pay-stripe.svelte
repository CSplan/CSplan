<script lang="ts">
  import { loadStripe } from '@stripe/stripe-js/pure'
  import type { Stripe } from '@stripe/stripe-js'
  import { onMount } from 'svelte'
  import settings from '$stores/settings'

  // Load Stripe.js
  let stripe: Stripe
  onMount(async () => {
    const style = getComputedStyle(document.querySelector(':root')!)

    loadStripe.setLoadParameters({ advancedFraudSignals: false }) // Disable Stripe's fraud detection tracking
    stripe = await loadStripe(__STRIPE_API_KEY__) as Stripe
    const elements = stripe.elements()
    const cardEl = elements.create('card', {
      style: {
        base: {
          fontSize: '1.1rem',
          color: `${style.getPropertyValue('--text-normal')}`,
          iconColor: `${style.getPropertyValue('--text-normal')}`,
          '::placeholder': {
            color: `${style.getPropertyValue('--text-disabled')}`
          }
        }
      }
    })
    cardEl.mount('#card-element')
  })
</script>

<form class="primary" on:submit|preventDefault>
  <div id="card-element"></div>
</form>

<style lang="scss">
  form {
    min-width: 500px;
    padding: $padding-m;
    border: 1px solid $border-normal;
  }
</style>