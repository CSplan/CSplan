<script lang="ts">
  import { loadStripe } from '@stripe/stripe-js/pure'
  import type { Stripe, StripeCardElement, StripeCardElementChangeEvent } from '@stripe/stripe-js'
  import { onMount } from 'svelte'
  import stripeInvoice from '$stores/stripe/invoice'
  import type { Invoice } from '$stores/stripe/invoice'
  import subscription, { subscriptionInvoice } from '$stores/stripe/subscription'
  import purchaseState, { PlanTypes } from '../state'
  import type { Readable } from 'svelte/store'
  import { route } from '$lib'
  import { goto, invalidateAll } from '$app/navigation'
  import { FormStates as States } from '$lib'
  import Spinner from '$components/spinner.svelte'

  let state = States.Resting
  let message = ''

  let invoice: Readable<Invoice>
  let isSubscription = false
  $: switch ($purchaseState.planType) {
  case PlanTypes.Prepaid:
    invoice = stripeInvoice
    isSubscription = false
    break
  case PlanTypes.Subscription:
    invoice = subscriptionInvoice
    isSubscription = true
  }

  // Format a price in cents for display
  function formatPrice(amount: number): string {
    const dollars = Math.floor(amount / 100)
    const cents = `${amount % 100}`.padStart(2, '0')
    return `$${dollars}.${cents}`
  }

  let cardEl: StripeCardElement
  let allowSubmit = false
  function onchange(event: StripeCardElementChangeEvent): void {
    allowSubmit = event.complete
  }

  // Handle payment event ws notification
  function onPaymentNotif(): void {
    state = States.Saved
    message = 'Thank you for supporting CSplan! Redirecting in 5 seconds.'
    setTimeout(async () => {
      // Navigate to payment status page, reset purchase state
      await invalidateAll()
      await goto('/payment', {
        replaceState: true
      })
      purchaseState.set(structuredClone(purchaseState.initialValue))
    }, 5000)
  }

  // Hande form submission
  async function submit(): Promise<void> {
    if (!$invoice.exists) {
      return
    }
    if (state === States.Saving || state === States.Saved) {
      return
    }
    state = States.Saving
    // Finalize the invoice to obtain a client secret
    if (!isSubscription) { 
      message = 'Finalizing Invoice'
      try {
        await stripeInvoice.finalize()
      } catch (err) {
        state = States.Errored
        message = err instanceof Error ? err.message : `${err}`
        return
      }
    }

    message = 'Processing Payment'
    // Open a websocket to receive payment confirmation on
    const ws = new WebSocket(route('/stripe/payment_notification', 'wss'))
    ws.onmessage = onPaymentNotif
    // Pay the invoice with Stripe
    const res = await stripe.confirmCardPayment($invoice.secret!, {
      payment_method: {
        card: cardEl
      }
    })
    if (res.error != null) {
      state = States.Errored
      message = res.error.message || 'Unknown payment failure.'
    }
  }

  async function cancel(): Promise<void> {
    if (isSubscription) {
      await subscription.cancel()
    } else {
      await stripeInvoice.delete()
    }
    purchaseState.set(structuredClone(purchaseState.initialValue))
  }

  // Load Stripe.js
  let stripe: Stripe
  onMount(async () => {
    const style = getComputedStyle(document.querySelector(':root')!)

    try {
      loadStripe.setLoadParameters({ advancedFraudSignals: false }) // Disable Stripe's fraud detection tracking
    } catch {}
    stripe = await loadStripe(__STRIPE_API_KEY__) as Stripe
    const elements = stripe.elements()
    cardEl = elements.create('card', {
      style: {
        base: {
          fontSize: '1.1rem',
          color: `${style.getPropertyValue('--text-normal')}`,
          iconColor: `${style.getPropertyValue('--text-normal')}`,
          '::placeholder': {
            color: `${style.getPropertyValue('--text-disabled')}`
          }
        }
      },
      hidePostalCode: true
    })
    cardEl.mount('#card-element')
    cardEl.on('change', onchange)
  })
</script>

<form class="primary" on:submit|preventDefault={submit}>
  <h2>Purchase</h2>
  <!--Invoice table-->
  {#if $invoice.exists}
    <table>
      {#each $invoice.items as item}
      <tr class="border-bottom">
        <td>{item.description}</td>
        <td class="price">{formatPrice(item.unitAmount)}</td>
        <td class="quantity">
          <div>
            <i class="fal fa-times"></i>
            <span>{item.quantity}</span>
          </div>
        </td>
      </tr>
      {/each}
      <tr>
        <td class="promo-text">CSplan Launch Promo</td>
        <td class="price promo-price" colspan=2>-30%</td>
      </tr>
      <tr>
        <td>Total</td>
        <td class="price" colspan=2>{formatPrice($invoice.total)}</td>
      </tr>
    </table>
  {/if}
  <div id="card-element"></div>

  <div class="submit-container" class:saving={state === States.Saving || state === States.Saved}>
    <button class="void-button" on:click|preventDefault|stopPropagation={cancel}>Cancel</button>
    <input type="submit" value="Pay" disabled={!allowSubmit}>
  </div>

  <Spinner {state} {message}/>
</form>

<style lang="scss">
  @import './invoice-table.scss';
  form {
    @media (min-width: $desktop-min) {
      width: 800px;
    }
    padding: $padding-m;
    border: 1px solid $border-normal;
    line-height: 1.5;
    height: max-content;
  }
  table {
    @include invoice-table;
  }
  div#card-element {
    margin-top: 1.3rem;
    width: auto;
    border: 1px solid $border-alt;
    padding: $padding-m;
    border-radius: $br-light;
  }
  h2 {
    text-align: center;
    padding: 0.5rem 0;
  }
  div.submit-container {
    width: 100%;
    text-align: right;
    margin-top: 1.3rem;
    input[type="submit"],button {
      min-width: 20%;
    }
    button {
      float: left;
      background: $danger-red !important;
    }
    input[type="submit"] {
      background: $success-green !important;
      &:disabled {
        background: $text-disabled !important;
      }
    }
    &.saving {
      pointer-events: none;
    }
  }
</style>