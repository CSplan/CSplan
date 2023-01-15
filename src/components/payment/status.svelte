<script lang="ts">
  import stripeSubscription from '$stores/stripe/subscription'
  import AccountTypes from '$lib/account-types'
  import Spinner from '$components/spinner.svelte'
  import { FormStates as States } from '$lib'
  import { invalidateAll } from '$app/navigation'
  export let settings: App.Locals['settings']
  export let paymentStatus: App.Locals['paymentStatus']

  function formatTimestamp(timestamp: number): string {
    const d = new Date(timestamp * 1000)
    
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const pad = (s: number) => s.toString().padStart(2, '0')

    const offsetHours = Math.floor(d.getTimezoneOffset()/60)
    const offsetMinutes = Math.floor(d.getTimezoneOffset()%60)
    const offset = `UTC${offsetHours > 0 ? '+' : '-'}${Math.abs(offsetHours).toString().padStart(2, '0')}:${Math.abs(offsetMinutes).toString().padStart(2, '0')}`
    return `${pad(d.getHours())}:${pad(d.getMinutes())}, ${pad(d.getMonth())}/${pad(d.getDate())}/${d.getFullYear()} ${offset}`
  }
  
  let isPaid = false
  let planName: string
  $: switch (paymentStatus!.accountType) {
  case AccountTypes.Pro:
    planName = 'Pro'
    isPaid = true
    break
  default:
    planName = 'Free'
    isPaid = false
    break
  }


  // State for the 'cancel subscription' button
  let subCancelState = States.Resting
  let message = ''
  async function cancelSubscription(): Promise<void> {
    // TODO: confirm sub cancellations
    subCancelState = States.Saving
    message = 'Cancelling Subscription'
    try {
      await stripeSubscription.cancel()
      subCancelState = States.Saved
      message = 'Your CSplan Pro subscription has been canceled.'
      setTimeout(async () => {
        subCancelState = States.Resting
        message = ''
        await invalidateAll()
      }, 3000)
    } catch (err) {
      subCancelState = States.Errored
      message = err instanceof Error ? err.message : `${err}`
    }
  }
</script>

<article class="payment-status primary" class:csplan-pro={paymentStatus?.accountType === AccountTypes.Pro}>
  <img src="/logo/plans/{settings.darkMode ? 'Dark' : 'Light'}-CSplan-{planName}-noslogan.svg" alt="CSplan {planName} Graphic">
  <p>
    {#if paymentStatus?.accountType === AccountTypes.Free}
      You're using CSplan's free version. <a href="/payment/plans">Upgrade to CSplan Pro</a> to store more plans and unlock additional features.
    {:else}
      <span style:color="var(--success-green)">You're using CSplan {planName}.</span> Thank you for the support!
    {/if}
  </p>
  <section class="details">
    <h3><i class="fas fa-circle-info"></i> Plan Info</h3>
    <p class="detail-label">Current Plan:</p>
    <p class="value">CSplan {planName}</p>

    {#if isPaid && paymentStatus != null}
      {#if paymentStatus.paidUntil != null}
        <p class="detail-label">Paid Until:</p>
        <p class="value" title="All payments are truncated to midnight UTC for privacy purposes. Payment can be completed up to 24 hours later than this time before account features will be lost.">{formatTimestamp(paymentStatus.paidUntil)}</p>
      {/if}
      <p class="detail-label">Subscription:</p>
      <p class="value">{paymentStatus.subscribed > 0 ? 'Active (Monthly)' : 'None (Prepaid)'}</p>
    {/if}
  </section>

  <a href="/payment/plans">
    <button style:background="var(--{settings.darkMode ? 'background-lessdark' : 'background-dark'})"
    style:border={settings.darkMode ? '1px solid var(--border-normal)' : 'none'}>
      Plans
    </button>
  </a>
  {#if (paymentStatus != null && paymentStatus.subscribed > 0) || subCancelState === States.Saved}
    <button style:background="var(--danger-red)" on:click={cancelSubscription}>
      Cancel Subscription
    </button>
    <Spinner state={subCancelState} {message}/>
  {:else}
    <a href="/purchase">
      <button class="purchase-button" style:background="var(--{isPaid ? 'background-alt' : 'success-green'})">
        {isPaid ? 'Purchase more Time' : 'Purchase CSplan Pro'}
      </button>
    </a>
  {/if}
</article>

<style lang="scss">
  article.payment-status {
    max-width: 650px;
    @media (min-width: $desktop-min) {
      margin-top: 25px;
      img {
        max-width: 375px;
      }
    }
    @media (max-width: $mobile-max) {
      width: 100%;
      img {
        max-width: 300px;
      }
    }
    border: 1px solid $border-normal;
    padding: $padding-m;
    display: flex;
    flex-direction: column;
    align-items: center;
    >p {
      margin: 0.8rem;
    }
  }

  p {
    word-break: break-word;
  }

  section.details {
    display: grid;
    width: 100%;
    padding: $padding-m;
    grid-template-columns: repeat(2, 1fr);

    h3 {
      text-align: center;
      grid-column: 1 / span 2;
    }
    p {
      margin: 0.3rem;
      text-align: center;
    }
    p.detail-label {
      font-weight: 600;
      grid-column: 1;
    }
    p.value {
      grid-column: 2;
    }
  }
</style>