<script lang="ts">
  import AccountTypes from '$lib/account-types'
  export let user: App.Locals['user']
  export let settings: App.Locals['settings']
</script>

<article class="plans">
  <div class="plan-info primary">
    <img src="/logo/plans/{settings.darkMode ? 'Dark' : 'Light'}-CSplan-Free-noslogan.svg" alt="CSplan Free Logo">
    <p class="price"><b>Free</b></p>

    <ul class="bullet-points">
      <li>Up to 10 lists</li>
      <li>Up to 10 items in each list</li>
      <li>Up to 10 customizable tags</li>
      <li>Up to 50 items total (across all lists)</li>
      <li>Zero knowledge (E2E) data encryption</li>
      <li>Zero ads or tracking</li>
      <li>Customizable appearance</li>
      <li>2FA login support</li>
    </ul>

    <p>Coming Q1 2023</p>
    <ul>
      <li>Desktop app (Windows, MacOS, Linux)</li>
      <li>List sharing and collaboration</li>
      <li>More features TBA, stay tuned!</li>
    </ul>
  </div>

  <div class="plan-info primary">
    <img src="/logo/plans/{settings.darkMode ? 'Dark' : 'Light'}-CSplan-Pro-noslogan.svg" alt="CSplan Pro Logo">
    <p class="price"><b>$10</b>/month</p>

    <span>Everything in CSplan Free, and...</span>
    <ul class="bullet-points">
      <li>Up to <b>100</b> lists (increasing to 250+ soon)</li>
      <li>Up to <b>100</b> items in each list</li>
      <li>Up to <b>100</b> tags</li>
      <li>No cumulative item limit</li>
      <li>Support a privacy-first, ad-free business model</li>
    </ul>
      
    <p>Coming Q1 2023</p>
    <ul class="bullet-points">
      <li>Reminders (with push notifications on Windows, MacOS, Linux, and Android)</li>
      <li>Payment via Bitcoin and Monero</li>
    </ul>

    <p>Coming Q2 2023</p>
    <ul class="bullet-points">
      <li>Reminder push notifications on iOS</li>
      <li>Calendars</li>
      <li>More features TBA, stay tuned!</li>
    </ul>
    {#if user?.accountType === AccountTypes.Pro}
      <hr>
      <b>You've already bought CSplan Pro, thank you for your support!</b>
      <a href="/payment">
        <button style:background="var(--background-alt)">Go to Payment Management</button>
      </a>
    {:else}
      <a href="/purchase" class="purchase-button">
        <button style:background="var(--success-green)">Get CSplan Pro</button>
      </a>
    {/if}
  </div>
</article>

<style lang="scss">
  article.plans {
    display: grid;
    margin-top: 25px;
    @media (min-width: $desktop-min) {
      grid-auto-flow: column;
      column-gap: 5rem;
    }
    @media (max-width: $mobile-max) {
      grid-auto-flow: row;
      row-gap: 5rem;
    }
  }
  .plan-info {
    @media (min-width: $desktop-min) and (max-width: 1800px) {
      width: 550px;
    }
    @media (min-width: $desktop-min) and (min-width: 1801px) {
      width: 800px;
    }
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid $border-normal;
    padding: $padding-m;
    height:fit-content;
    font-size: 110%;
    ul {
      width: 100%;
    }
    img {
      width: 75%;
    }
    hr {
      width: 100%;
      color: white;
      margin: 1.3rem 0;
    }
    p {
      margin: 0.8rem;
      border-bottom: 1px solid $border-alt;
      text-align: center;
      width: 100%;
      font-size: 110%;
    }
    p.price {
      font-size: 135%;
    }
  }
</style>