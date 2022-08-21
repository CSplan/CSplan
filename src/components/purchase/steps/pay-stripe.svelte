<script lang="ts">
  import { loadStripe } from '@stripe/stripe-js/pure'
  import type { Stripe, StripeCardElement, StripeCardElementChangeEvent } from '@stripe/stripe-js'
  import { onMount } from 'svelte'
  import invoice from '$stores/stripe/invoice'

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
  async function submit(): Promise<void> {
    if (!$invoice.exists) {
      return
    }
    const res = await stripe.confirmCardPayment($invoice.secret, {
      payment_method: {
        card: cardEl
      }
    })
    if (res.paymentIntent?.status === 'succeeded') {
      console.log('Success')
    }
  }

  // Load Stripe.js
  let stripe: Stripe
  onMount(async () => {
    const style = getComputedStyle(document.querySelector(':root')!)

    loadStripe.setLoadParameters({ advancedFraudSignals: false }) // Disable Stripe's fraud detection tracking
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
    <a href={$invoice.invoicePDF} download>Invoice PDF</a>
  {/if}
  <div id="card-element"></div>

  <div class="submit-container">
    <input type="submit" value="Pay" disabled={!allowSubmit}>
  </div>
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
    input[type="submit"] {
      min-width: 20%;
      text-align: center;
      background: $success-green !important;
      &:disabled {
        background: $text-disabled !important;
      }
    }
  }
</style>