<script lang="ts">
  import Step from './step.svelte'
  import ChoosePaymentType from './steps/choose-payment-type.svelte'
</script>

<article class="card primary">
  <section class="title">
    <div class="spacer"/>
    <header class="title">Buy CSplan Pro</header>
    <div class="spacer"/>
  </section>

  <Step step={0} title="Choose Payment Type">
    <ChoosePaymentType/>
  </Step>
</article>

<style lang="scss">
  @import '../../lists/list.scss';
  .card {
    margin-top: 25px;
  }
</style>