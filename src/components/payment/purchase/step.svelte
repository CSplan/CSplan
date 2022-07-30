<script lang="ts">
  import purchaseState from './state'

  export let step = 0 
  export let title = ''
</script>

<div class="row">
  <i class="checkbox {$purchaseState.step > step  ? 'fas fa-check-circle' : 'far fa-circle'}"></i>
  <section class="content">
    <header>{title}</header>
    <slot></slot>
  </section>
</div>

<style lang="scss">
  @import '../../lists/list.scss';
  .row {
    grid-template-rows: auto;
  }
  .content {
    width: 100% !important;
  }
</style>