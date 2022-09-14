<script lang="ts">
  import purchaseState from './state'
  import MenuGroup from './menu-group.svelte'
  export let settings: App.Locals['settings']

  $: canMoveBack = $purchaseState.currentStep > $purchaseState.minStep
  $: canMoveForward = $purchaseState.currentStep < $purchaseState.maxStep
</script>

<article class="side-menu" class:shadow={!settings.darkMode}>
  {#each $purchaseState.steps as step, i}
    <MenuGroup
    title={step.title}
    icon={(() => {
      if (i === $purchaseState.currentStep) {
        return 'fas fa-circle-dot'
      } else if (i < $purchaseState.currentStep) {
        return 'fas fa-circle'
      } else {
        return 'far fa-circle'
      }
    })()}
    />
  {/each}
  <div class="nav-arrows">
    <i class="fas fa-arrow-left { canMoveBack ? 'clickable' : 'disabled' }"
    title={ canMoveBack ? 'Previous Step' : ''}
    on:click={() => {
      purchaseState.lastStep()
    }}></i>

    <i class="fas fa-arrow-right
    { canMoveForward ? 'clickable' : 'disabled' }"
    title={ canMoveForward ? 'Next Step' : ''}
    on:click={() => {
      purchaseState.nextStep()
    }}></i>
  </div>
</article>

<style lang="scss">
  .side-menu {
    align-self: flex-start;
    background-color: $bg-dark;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.8rem;
    border-radius: 0.2rem;
    &.shadow {
      box-shadow: 0.3rem 0.3rem 1.25rem $bg-dark;
    }
  }

  div.nav-arrows {
    width: 100%;
    margin-top: 0.8rem;
    font-size: 110%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    i {
      text-align: center;
      &.disabled {
        color: $text-disabled;
        cursor: not-allowed;
      }
    }
    i.fa-arrow-left {
      grid-column: 1;
    }
    i.fa-arrow-right {
      grid-column: 2;
    }
  }
</style>