<script lang="ts">
  import purchaseState, { PlanTypes } from '../state'

  let prepaidMonths = $purchaseState.prepaidMonths

  // Set the payment plan type to be purchased
  function setPlan(planType: PlanTypes): void {
    purchaseState.update((store) => {
      store.planType = planType
      return store
    })
  }
</script>

<article>
  <section class="subscription primary">
    <h2>Subscription</h2>

    <p class="price"><b>$10</b>/month</p>

    <ul>
      <li>Billed monthly</li>
    </ul>

    <i class="select-icon clickable
    { $purchaseState.planType === PlanTypes.Subscription ? 'fas fa-circle-check' : 'far fa-circle'}"
    on:click={() => {
      setPlan(PlanTypes.Subscription)
    }}></i>

    {#if $purchaseState.planType === PlanTypes.Subscription}
      <p class="total">Total: $5</p>

      <button class="bold next" on:click={() => {
        purchaseState.nextStep()
      }}>
        Next
        <i class="fas fa-chevron-right"/>
      </button>
    {/if}
  </section>

  <section class="prepaid primary">
    <h2>Prepaid</h2>

    <p class="price"><b>$10</b>/month</p>

    <ul>
      <li>One-time payment for 1-12 months</li>
      <li>Card information not linked to CSplan account</li>
    </ul>
  
    <i class="select-icon clickable
    { $purchaseState.planType === PlanTypes.Prepaid ? 'fas fa-circle-check add-pb' : 'far fa-circle'}"
    on:click={() => {
      setPlan(PlanTypes.Prepaid)
    }}></i>

    {#if $purchaseState.planType === PlanTypes.Prepaid}
      <label class="select-months">
        <p>Months</p>
        <input type="number" min=1 max=12 bind:value={prepaidMonths}
        on:change={() => {
          purchaseState.update((store) => {
            store.prepaidMonths = prepaidMonths
            return store
          })
        }}>
      </label>

      <p class="total">Total: ${prepaidMonths * 5}</p>

      <button class="bold next" on:click={() => {
        purchaseState.nextStep()
      }}>
        Next
        <i class="fas fa-chevron-right"/>
      </button>
    {/if}
  </section>
</article>

<style lang="scss">
  article {
    display: grid;
    @media (min-width: $desktop-min) {
      grid-auto-flow: column;
    }
    @media (max-width: $mobile-max) {
      grid-auto-flow: row;
    }
  }
  section {
    @media (min-width: $desktop-min) {
      width: 410px;
    }
    height: fit-content;
    text-align: center;
    padding: $padding-m;
    border: 1px solid $border-normal;
    margin: 1.5rem;
    margin-top: 0;
    @media (max-width: $mobile-max) {
      margin: 1.5rem 0;
    }
    h2,div.total {
      padding: 0.5rem 0;
    }
    ul {
      padding-right: 20px;
    }
    li {
      text-align: left;
      font-size: 110%;
      text-decoration: none;
    }

    i.select-icon {
      font-size: 2rem;
      display: block;
      &.add-pb {
        padding-bottom: 0.6rem; // Align with bottom border of adjacent section
        border-bottom: 1px solid $border-alt;
      }
    }
  }
  p.price {
    font-size: 135%;
    margin: 0;
    padding: 0.3rem 0;
    padding-bottom: 0;
    border-top: 2px solid $bg-alt;
  }

  label.select-months {
    display: block;
    margin: 0.5rem;
    text-align: center;
    font-size: 110%;
    p {
      margin: 0.6rem;
    }
    input {
      border-radius: 0;
      display: block;
      width: auto;
      margin-left: auto;
      margin-right: auto;
    }
  }
  p.total {
    font-size: 120%;
    margin: 0.3rem 0;
    margin-bottom: 0;
    font-weight: bold;
  }

  button.next {
    float: right;
  }
</style>