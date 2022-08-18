<script lang="ts">
  import purchaseState, { PlanTypes } from '../state'
  let total = 0
  $: total = $purchaseState.planType === PlanTypes.Prepaid ? $purchaseState.prepaidMonths * 7 : 8
</script>

<article class="primary">
  <h2>Purchase</h2>
  
  <!--Pre-invoice table-->
  <table>
  <tr class="border-bottom">
  {#if $purchaseState.planType === PlanTypes.Prepaid}
    <td>CSplan Pro - 1 Month (Prepaid)</td>
    <td class="price">$10</td>
    <td class="quantity">
      <i class="fal fa-times"></i>
      <span>{$purchaseState.prepaidMonths}</span>
    </td>
  {:else if $purchaseState.planType === PlanTypes.Subscription}
    <td>CSplan Pro - Monthly</td>
    <td class="price">$8</td>
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

</article>

<style lang="scss">
  article {
    padding: $padding-m;
    @media (min-width: $desktop-min) {
      min-width: 500px;
    }
    border: 1px solid $border-normal;
  }
  h2 {
    grid-column: 1 / span 2;
    padding: 0.5rem 0;
    width: 100%;
    text-align: center;
  }
  table {
    $border: 1px dashed $border-alt;
    width: 100%;
    tr:last-child,tr:first-child {
      border-top: 1px solid $border-alt;
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
</style>