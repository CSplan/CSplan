<script lang="ts">
  import purchaseState, { PaymentMethods, PlanTypes } from '../state'
  import stripeInvoice from '$stores/stripe/invoice'
  import { FormStates as States } from '$lib'
  import AccountTypes from '$lib/account-types'
  import Spinner from '$components/spinner.svelte'

  import rates from '../rates'
  $: total = $purchaseState.planType === PlanTypes.Prepaid
    ? $purchaseState.prepaidMonths * rates.prepaid
    : rates.subscription

  let state = States.Resting
  let message = ''

  let paymentMethod = purchaseState.initialValue.paymentMethod
  $: console.log(paymentMethod)
  function setPaymentMethod(): void {
    console.log(paymentMethod)
    purchaseState.update((store) => {
      store.paymentMethod = paymentMethod
      return store
    })
  }

  type PaymentMethod = {
    name: string
    color: string
    icon: string
    id: PaymentMethods
    disabled?: boolean
  }
  const paymentMethods: PaymentMethod[] = [
    {
      name: 'Credit/Debit Card',
      color: '#635bff',
      icon: 'far fa-credit-card',
      id: PaymentMethods.Stripe
    },
    {
      name: 'Bitcoin',
      color: '#f7931a',
      icon: 'fab fa-bitcoin',
      id: PaymentMethods.Bitcoin,
      disabled: true
    },
    {
      name: 'Monero',
      color: '#f26822',
      icon: 'fab fa-monero',
      id: PaymentMethods.Monero,
      disabled: true
    }
  ]

  async function confirm(): Promise<void> {
    state = States.Saving
    // Create the invoice with Stripe
    try {
      switch ($purchaseState.paymentMethod) {
      case PaymentMethods.Stripe:
        message = 'Creating Stripe Invoice'
        await stripeInvoice.create({
          plan: AccountTypes.Pro,
          months: $purchaseState.prepaidMonths
        })
        break
      default: 
        throw new Error(`Unsupported payment method: ${$purchaseState.paymentMethod}`)
      }
      state = States.Saved
      message = 'Ready for payment, proceed to next step'
      // Advance to the next purchase step, the user is not able to go back from here because the invoice has been finalized
      purchaseState.update((store) => {
        store.maxStep++
        store.currentStep = store.maxStep
        store.minStep = store.maxStep
        return store
      })
    } catch (err) {
      state = States.Errored
      message = `${err}`
    }
  }
</script>

<article class="primary">
  <h2>Purchase</h2>
  
  <!--Pre-invoice table-->
  <table>
  <tr class="border-bottom">
  {#if $purchaseState.planType === PlanTypes.Prepaid}
    <td>CSplan Pro - 1 Month (Prepaid)</td>
    <td class="price">${rates.stdPrepaid}</td>
    <td class="quantity">
      <div>
        <i class="fal fa-times"></i>
        <span>{$purchaseState.prepaidMonths}</span>
      </div>
    </td>
  {:else if $purchaseState.planType === PlanTypes.Subscription}
    <td>CSplan Pro - Monthly</td>
    <td class="price">${rates.stdSubscription}</td>
    <td class="quantity">
      <div>
        <i class="fal fa-times"></i>
        <span>1</span>
      </div>
    </td>
  {/if}
  </tr>

  <tr>
  {#if $purchaseState.planType === PlanTypes.Prepaid}
    <td class="promo-text">CSplan Launch Promo</td>
    <td class="price promo-price" colspan=2>-30%</td>
  {:else if $purchaseState.planType === PlanTypes.Subscription}
    <td class="promo-text">CSplan Launch Promo</td>
    <td class="price promo-price" colspan=2>-20%</td>
  {/if}
  </tr>

  <tr>
    <td>Total</td>
    <td class="price" colspan={2}>${total}</td>
  </tr>
  </table>


  <h3>Payment Method</h3>
  <form class="payment-methods" on:submit|preventDefault>
  {#each paymentMethods as method}
    {@const selected = $purchaseState.paymentMethod === method.id}
    <label class="button transparent" title={method.disabled ? 'Coming soon' : method.name}
    style:background-color={method.color}
    aria-disabled={method.disabled}
    class:selected>
      <i class={method.icon}></i>
      {method.name}
      <input type="radio"
      disabled={method.disabled}
      title={`${method.name}${method.disabled ? '(disabled)' : ''}`}
      bind:group={paymentMethod} value={method.id} on:change={setPaymentMethod}>
    </label>
  {/each}
  </form>

  {#if $purchaseState.paymentMethod === PaymentMethods.Stripe}
    <p>The next page will ask you to enter your card information.
      This information will be processed by Stripe, Inc.
      as described in <a href="/info/payment-policy">CSplan's payment policy</a>.
      <b>No card information is ever sent to CSplan's servers.</b>
      CSplan will never ask for your name or address (other than ZIP code for tax purposes).
    </p>
  {/if}

  <p>
    Continuing to payment constitutes having read and accepted <a href="/info/payment-policy">CSplan's payment policy</a>.
  </p>

  <div class="continue-container">
    <button class="bold" on:click={confirm}>Continue</button>
  </div>

  <Spinner {state} {message}/>

</article>

<style lang="scss">
  article {
    padding: $padding-m;
    @media (min-width: $desktop-min) {
      width: 800px;
    }
    border: 1px solid $border-normal;
  }
  h2,h3 {
    grid-column: 1 / span 2;
    padding: 0.5rem 0;
    width: 100%;
    text-align: center;
  }
  h3 {
    margin-top: 1.3rem;
  }

  table {
    $border: 1px dashed $border-alt;
    width: 100%;
    tr:last-child,tr:first-child {
      border-top: 1px solid $border-alt;
    }
    tr:last-child {
      border-bottom: 1px solid $border-alt;
    }
    tr.border-bottom {
      border-bottom: $border;
    }
    td {
      padding: 0.3em;
      border-left: $border;
      vertical-align: middle;
      &:first-child {
        border-left: none;
      }
    }
    td.price {
      text-align: center;
      min-width: 3rem;
      font-weight: bold;
    }
    td.quantity {
      padding-right: 0.3rem;
      div {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        i {
          margin-top: 0.1rem;
          margin-right: 0.3rem;
          font-size: 110%;
          color: $border-alt;
        }
        span {
          font-weight: bold;
          margin-top: auto;
          margin-bottom: auto;
        }
      }
    }
  }
  .promo-text {
    font-weight: bold;
  }
  .promo-price {
    color: $success-green;
  }
  .payment-methods {
    text-align: center;
  }
  label.button {
    margin: 0 0.3rem;
    line-height: 1.5;
    transition: none; // Prevent terrible border animation from occuring for unknown reasons
    &[aria-disabled="true"] {
      filter: saturate(20%);
      pointer-events: none;
    }
    :active {
      box-shadow: none !important;
    }
    &.selected {
      border: 2px solid white;
    }
  }
  .continue-container {
    width: 100%;
    text-align: right;
  }
</style>