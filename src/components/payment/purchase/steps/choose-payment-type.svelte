<script lang="ts">
  import Dropdown from '$components/templates/_detail-dropdown.svelte'
</script>

<section class="payment-type">
  <div>
    <header>Subscription</header>
    <p>
      Automatic monthly billing. Not private.
    </p>
    <details>
      <summary class="clickable">
        <i class="fas fa-chevron-right"></i>
        <b>Privacy Notice</b>
      </summary>
      Subscribing to CSplan will result in your card information (processed by Stripe) being internally linked to your CSplan account for the duration of the subscription. Read CSplan's payment policy for a full disclosure of the privacy implications of automatic billing via Stripe. If you wish to avoid these implications, opt for a prepaid plan.
    </details>
  </div>

  <div>
    <header>Prepaid</header>
    <p>
      One-time payment for up to 12 months of CSplan Pro. Somewhat private.
    </p>
  </div>
</section>

<style lang="scss">
  section.payment-type {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(2, 1fr);
    >div {
      border: 1px solid $border-normal;
      border-radius: $br-light;
      padding: $padding-m;
      text-align: center;
      header {
        font-size: 120%;
      }
    }
    p {
      font-size: 110%;
    }
    details {
      summary {
        * {
          color: $danger-red
        }
        i.fa-chevron-right {
          margin-right: 0.25rem;
          transition: transform 200ms var(--cubic-out);
        }
      }
      &[open] i.fa-chevron-right {
        transform: rotate(90deg) translateX(1px);
      }
      text-align: left;
    }
    summary>* {
      color: $danger-red;
    }
  }
</style>