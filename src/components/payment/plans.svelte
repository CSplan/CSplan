<script lang="ts">
  import AccountTypes from '$lib/account-types'
  import settings from '$stores/settings'
  import user from '$stores/user'
</script>

<article class="plans">
  <div class="plan-info primary">
    <img src="/logo/plans/{$settings.darkMode ? 'Dark' : 'Light'}-CSplan-Free-noslogan.svg" alt="CSplan Free Logo">
    <hr>
    <div class="price">
      <span style="font-size: 125%">Free</span>
    </div>
    <hr>
    <ul class="bullet-points">
      <li>Up to 10 lists</li>
      <li>Up to 10 items in each list</li>
      <li>Up to 10 customizable tags</li>
      <li>Up to 50 items total (across all lists)</li>
      <li>Full zero knowledge (E2E) encryption</li>
      <li>No ads or tracking</li>
      <li>Customizable Appearance</li>
      <li>2FA login support</li>
    </ul>

    <p>Coming Fall 2022</p>
    <ul>
      <li>Electron Desktop Application for Windows, MacOS, and Linux</li>
      <li>List sharing and collaboration</li>
    </ul>
  </div>

  <div class="plan-info primary">
    <img src="/logo/plans/{$settings.darkMode ? 'Dark' : 'Light'}-CSplan-Pro-noslogan.svg" alt="CSplan Pro Logo">
    <hr>
    <div class="price">
      <span class="strikethrough">$10/month</span>
      <br>
      <span class="discount-price">$8</span>/month (monthly)
      <br>
      OR
      <br>
      <span class="discount-price">$7</span>/month (prepaid)
    </div>
    <br>
    <span class="discount-disclaimer">Offer is valid through August 31, 2022. Subscription users will receive the discounted rate for their first 3 months.</span>
    <hr>
    <span>Everything in CSplan Free, and...</span>
    <ul class="bullet-points">
      <li>Up to <b>100</b> lists (increasing to 250+ Fall 2022)</li>
      <li>Up to <b>100</b> items in each list</li>
      <li>Up to <b>100</b> tags</li>
      <li>No total item cap</li>
      <li>Support a privacy-first, ad-free business model</li>
    </ul>
      
    <p>Coming Early Fall 2022 <b>(CSplan Pro Only)</b></p>
    <ul class="bullet-points">
      <li>Reminders (with push notifications on Windows, MacOS, Linux, and Android)</li>
      <li>Calendars</li>
      <li>Payment via Bitcoin and Monero</li>
    </ul>

    <p>Coming Early 2023 <b>(CSplan Pro Only)</b></p>
    <ul class="bullet-points">
      <li>Reminder push notifications on iOS</li>
    </ul>
    {#if $user.isLoggedIn && $user.accountType === AccountTypes.Pro}
      <hr>
      <b>You've already bought CSplan Pro, thank you for your support!</b>
      <a href="/payment">
        <button style:background="var(--background-alt)">Go to Payment Management</button>
      </a>
    {:else}
      <a href="/payment/buy" class="purchase-button">
        <button style:background="var(--success-green)">Buy CSplan Pro</button>
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
      font-size: 110%;
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
    div.price {
      width: 100%;
      text-align: center;
    }
    span.strikethrough {
      text-decoration: line-through;
    }
    span.discount-price {
      font-size: 125%;
      color: $success-green;
    }
    span.discount-disclaimer {
      font-size: 75%;

    }
  }
</style>