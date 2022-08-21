<script lang="ts">
  import paymentStatus from '$stores/payment-status'
  import settings from '$stores/settings'
  import AccountTypes from '$lib/account-types'
  
  let isPaid = false
  let planName: string
  $: switch ($paymentStatus.accountType) {
  case AccountTypes.Pro:
    planName = 'Pro'
    isPaid = true
    break
  default:
    planName = 'Free'
    isPaid = false
    break
  }

  function formatTimestamp(timestamp: number): string {
    const d = new Date(timestamp * 1000)
    
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const pad = (s: number) => s.toString().padStart(2, '0')

    const offsetHours = Math.floor(d.getTimezoneOffset()/60)
    const offsetMinutes = Math.floor(d.getTimezoneOffset()%60)
    const offset = `UTC${offsetHours > 0 ? '+' : '-'}${Math.abs(offsetHours).toString().padStart(2, '0')}:${Math.abs(offsetMinutes).toString().padStart(2, '0')}`
    return `${pad(d.getHours())}:${pad(d.getMinutes())}, ${pad(d.getMonth())}/${pad(d.getDate())}/${d.getFullYear()} ${offset}`
  }
</script>

<article class="payment-status primary">
  <img src="/logo/plans/{$settings.darkMode ? 'Dark' : 'Light'}-CSplan-{planName}-noslogan.svg" alt="CSplan {planName} Graphic">
  <p>
    {#if $paymentStatus.accountType === AccountTypes.Free}
      You're using CSplan's free version. <a href="/payment/plans">Upgrade to CSplan Pro</a> to store more plans and unlock additional features.
    {:else}
      <span style:color="var(--success-green)">You're using CSplan {planName}.</span> Thank you for the support!
    {/if}
  </p>
  <section class="details">
    <h3>Payment Information</h3>
    <p class="detail-label">Account Type:</p>
    <p class="value">CSplan {planName}</p>

    {#if isPaid}
      {#if $paymentStatus.paidUntil != null}
        <p class="detail-label">Paid Until:</p>
        <p class="value" title="All payments are truncated to midnight UTC for privacy purposes. Payment can be completed up to 24 hours later than this time before account features will be lost.">{formatTimestamp($paymentStatus.paidUntil)}</p>
      {/if}
      <p class="detail-label">Subscription:</p>
      <p class="value">{$paymentStatus.subscribed > 0 ? 'Active' : 'None (Prepaid)'}</p>
    {/if}
  </section>

  <a href="/payment/plans">
    <button style:background="var(--background-lessdark)" style:border="1px solid var(--border-normal)">
      Plans
    </button>
  </a>
  <a href="/purchase">
    <button class="purchase-button" style:background="var(--{isPaid ? 'background-alt' : 'success-green'})">
      {isPaid ? 'Buy more Time' : 'Buy CSplan Pro'}
    </button>
  </a>
</article>

<style lang="scss">
  article.payment-status {
    @media (min-width: $desktop-min) {
      margin-top: 25px;
    }
    border: 1px solid $border-normal;
    padding: $padding-m;
    display: flex;
    flex-direction: column;
    align-items: center;
    img {
      max-width: 375px;
    }
    >p {
      font-size: 110%;
      margin: 0.8rem;
    }
    hr {
      width: 100%;
    }
  }

  section.details {
    display: grid;
    width: 100%;
    padding: $padding-m;
    grid-template-columns: repeat(2, auto);
    border-top: 1px solid $border-alt;

    h3 {
      text-align: center;
      grid-column: 1 / span 2;
    }
    p {
      margin: 0.3rem;
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